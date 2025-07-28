'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface Prompt {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  ai_agent_id: number;
  prompt_text: string;
  is_active: boolean;
}

interface AiAgent {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  agent_name: string;
  ai_agent_slug: string;
  avatar_image_url: string | null;
  greeting_media_url: string;
  greeting_media_type: string;
  greeting_title: string;
  welcome_greeting: string;
  training_instructions: string;
  last_trained_at: string;
  prompts: Prompt[];
}

interface ApiResponse {
  message: string;
  data: {
    ai_agent: AiAgent;
  };
}

interface Message {
  text: string;
  sender: 'user' | 'assistant' | 'meta';
  image?: string;
  metaCards?: any[];
}

function getOrCreatePublicId(user_id: number, agent_id: number) {
  const key = `public_id_${user_id}_${agent_id}`;
  let publicId = localStorage.getItem(key);
  if (!publicId) {
    // Generate a browser-unique ID
    const uuid = crypto.randomUUID();
    publicId = `${user_id}-${agent_id}-${uuid}`;
    localStorage.setItem(key, publicId);
  }
  return publicId;
}

// Helper to get localStorage key for chat history
function getChatHistoryKey(public_id: string) {
  return `chat_history_${public_id}`;
}

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AgentDetails() {
  const [agentDetails, setAgentDetails] = useState<AiAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPrompts, setShowPrompts] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [metaCards, setMetaCards] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, showConfirmation]);

  // Fetch agent details from API
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    if (!slug) {
      setError('No agent slug found in URL');
      setLoading(false);
      return;
    }

    async function fetchAgentDetails() {
      try {
        const response = await fetch(
          `${API_BASE_URL}/v4/ai-agent/get-agent/details/${slug}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              // 'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch agent details: ${response.statusText}`);
        }

        const data: ApiResponse = await response.json();
        setAgentDetails(data.data.ai_agent);
      } catch (err: any) {
        console.error('Fetch error:', err.message || err);
        setError('Error fetching agent details. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgentDetails();
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (!agentDetails) return;
    const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);
    const key = getChatHistoryKey(public_id);
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
        if (parsed.length > 0) {
          setShowWelcome(false);
          setShowPrompts(false);
        }
      } catch {}
    }
  }, [agentDetails]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!agentDetails) return;
    const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);
    const key = getChatHistoryKey(public_id);
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, agentDetails]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    if (!agentDetails) {
      setMessages((prev) => [
        ...prev,
        { text: 'Agent details are not loaded yet. Please try again.', sender: 'assistant' },
      ]);
      return;
    }

    const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setShowWelcome(false);
    setShowPrompts(false);

    // Add a placeholder for the assistant's streaming response
    let assistantText = '';
    setMessages((prev) => [...prev, { text: '', sender: 'assistant' }]);

    try {
      const response = await fetch(`${AI_AGENT_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: input,
          user_id: agentDetails?.user_id,
          agent_id: agentDetails?.id,
          public_id,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('API request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          let chunk = decoder.decode(value);
          assistantText += chunk;

          let cleanedText = assistantText
            .replace(/\[METAID:[^\]]+\]/g, '')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '')
            .replace(/Check\s?them\s?out\s?here/gi, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/(\d+\.\s[^\n]*)/g, '$1\n\n') // Match each numbered point and add double newlines
            .trim();

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              text: cleanedText + (done ? '' : '▍'),
              sender: 'assistant',
            };
            return updated;
          });
        }
      }

      setMessages((prev) => {
        const updated = [...prev];
        let cleanedText = assistantText
            .replace(/\[METAID:[^\]]+\]/g, '')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '')
            .replace(/Check\s?them\s?out\s?here/gi, '')
            .replace(/\s{2,}/g, ' ')
            .replace(/(\d+\.\s[^\n]*)/g, '$1\n\n') // Match each numbered point and add double newlines
            .trim();
        updated[updated.length - 1] = {
          text: cleanedText,
          sender: 'assistant',
        };
        return updated;
      });

      const metaIdMatches = Array.from(assistantText.matchAll(/\[METAID:([^\]]+)\]/g));
      const metaResults: any[] = [];
      for (const match of metaIdMatches) {
        const metaId = match[1];
        try {
          const metaRes = await fetch(`${AI_AGENT_URL}/api/get-meta?id=${metaId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          if (metaRes.ok) {
            const metaData = await metaRes.json();
            const meta = metaData.data;
            metaResults.push(meta);
            console.log("metaResults", metaResults);
          }
        } catch (err) {
          // Optionally handle error
        }
      }
      if (metaResults.length > 0) {
        setMessages((prev) => [
          ...prev,
          { text: '', sender: 'meta', metaCards: metaResults }
        ]);
      }
      
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: 'Error fetching response. Please try again.', sender: 'assistant' },
      ]);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] sm:max-w-[450px] sm:max-h-[700px] lg:max-w-[500px] lg:max-h-[800px] bg-white rounded-2xl shadow-2xl flex items-center justify-center">
          <div className="text-gray-600 text-lg animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] sm:max-w-[450px] sm:max-h-[700px] lg:max-w-[500px] lg:max-h-[800px] bg-white rounded-2xl shadow-2xl flex items-center justify-center">
          <div className="text-red-500 text-lg text-center px-4">{error}</div>
        </div>
      </div>
    );
  }

  if (!agentDetails) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] sm:max-w-[450px] sm:max-h-[700px] lg:max-w-[500px] lg:max-h-[800px] bg-white rounded-2xl shadow-2xl flex items-center justify-center">
          <div className="text-gray-600 text-lg text-center px-4">No agent details found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50  bg-opacity-50">
      <div className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] sm:max-w-[450px] sm:max-h-[700px] lg:max-w-[500px] lg:max-h-[800px]">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 h-full flex flex-col overflow-hidden">
          {/* Header with Agent Info */}
          {showWelcome && (
            <div className="bg-gradient-to-r  p-4 rounded-t-2xl">
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-md">
                  {agentDetails.greeting_media_type === 'video' ? (
                    <video
                      src={agentDetails.greeting_media_url}
                      autoPlay
                      muted={false} // Enable audio
                      loop // Play video in a loop
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                      onError={(e) => console.error('Video error:', e)} // Log errors
                    />
                  ) : (
                    <img
                      src={agentDetails.greeting_media_url || 'https://via.placeholder.com/150'}
                      alt={agentDetails.agent_name || 'Agent Avatar'}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <h2 className="mt-2 text-lg sm:text-xl font-semibold text-black">
                  {agentDetails.agent_name || `Agent`}
                </h2>
                <p className="text-sm text-gray-500">{agentDetails.welcome_greeting}</p>
              </div>
            </div>
          )}

          {/* Quick Prompts */}
          {showPrompts && (
            <div className="p-4 flex flex-wrap gap-3"> {/* Flexbox with wrapping */}
              {agentDetails.prompts
                .filter((prompt) => prompt.is_active)
                .map((prompt) => (
                  <button
                    key={prompt.id}
                    className="flex-1 min-w-[calc(50%-6px)] text-sm sm:text-base font-medium bg-white text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
                    onClick={() => {
                      setInput(prompt.prompt_text);
                      setTimeout(handleSendMessage, 100);
                    }}
                  >
                    {prompt.prompt_text}
                  </button>
                ))}
            </div>
          )}

          {/* Chat Messages Area */}
          <div className="flex-grow overflow-y-auto p-4 no-scrollbar">
            {messages.map((message, index) => (
              <React.Fragment key={index}>
                {/* Normal chat message */}
                {(message.sender === 'user' || message.sender === 'assistant') && (
                  <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                    {message.sender === 'assistant' && (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2">
                        <img
                          src={agentDetails.avatar_image_url || 'https://via.placeholder.com/150'}
                          alt="Assistant"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl p-3 shadow-md ${message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                        }`}
                    >
                      <ReactMarkdown
                        components={{
                          li: ({ node, ...props }) => (
                            <li style={{ marginBottom: '1em' }} {...props} /> // Add spacing between list items
                          ),
                          p: ({ node, ...props }) => (
                            <p style={{ marginBottom: '1em' }} {...props} /> // Add spacing between paragraphs
                          ),
                          a: ({ node, ...props }) => (
                            <a
                              href={props.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 500 }}
                            >
                              {props.children}
                            </a>
                          ),
                        }}
                      >
                        {message.text.replace(/(\d+\.\s)/g, '\n$1')}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
                {/* Meta cards slider */}
                {message.sender === 'meta' && message.metaCards && (
                  <div className="w-full py-2">
                    <div className="flex gap-2 overflow-x-auto px-1 meta-scrollbar-hide">
                      {message.metaCards.map((meta, idx) => (
                        <a
                          key={meta.metaId || idx}
                          href={meta.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="min-w-[140px] max-w-[160px] sm:min-w-[170px] sm:max-w-[190px] bg-white rounded-xl shadow border border-gray-200 flex flex-col items-center p-0 hover:shadow-lg transition-shadow duration-200"
                          style={{ flex: '0 0 auto', textDecoration: 'none' }}
                        >
                          {/* Image */}
                          <div className="w-full h-[110px] sm:h-[130px] rounded-t-xl overflow-hidden flex items-center justify-center bg-gray-100">
                            <img
                              src={meta.image || 'https://via.placeholder.com/160'}
                              alt={meta.title || 'Image'}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Title */}
                          <div className="px-2 py-2 w-full flex flex-col items-center">
                            <div className="text-xs sm:text-sm font-bold text-gray-900 text-center line-clamp-2">
                              {meta.title || 'No Title Available'}
                            </div>

                            {/* Description */}
                            <div className="text-xs text-gray-500 font-medium mt-1 text-center line-clamp-3">
                              {meta.description || 'No description available.'}
                            </div>

                            {/* Brand Name with Favicon */}
                            <div className="flex items-center gap-2 mt-2">
                              {meta.favicon ? (
                                <img
                                  src={meta.favicon}
                                  alt={meta.brand || 'Brand'}
                                  className="w-4 h-4"
                                />
                              ) : (
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div> // Placeholder for missing favicon
                              )}
                              <span className="text-xs text-gray-600 font-medium">{meta.brand || 'Unknown Brand'}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}

            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white ">
            <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm hover:shadow-md transition-all duration-200 ">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-grow text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none focus:outline-none focus:ring-0 focus:placeholder-gray-300 transition-colors duration-150"
              />
              <div className="flex items-center gap-2">
                <button
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
                  aria-label="Voice input"
                >
                  <FaMicrophone className="text-gray-600 h-5 w-5 hover:text-gray-800" />
                </button>
                <button
                  onClick={handleSendMessage}
                  className="p-1.5 rounded-full bg-black text-white  transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
                  aria-label="Send message"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center font-medium">
              Type your question or tap the microphone
            </p>
          </div>
        </div>

        <style jsx>{`
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .no-scrollbar::-webkit-scrollbar {
            width: 0;
            height: 0;
            display: none;
          }
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        @media (max-width: 640px) {
          .line-clamp-2 {
            font-size: 0.85rem;
          }
        }
        @media (min-width: 641px) {
          .line-clamp-2 {
            font-size: 1rem;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 11px;
          text-align: left;
        }
        .meta-scrollbar-hide {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE 10+ */
        }
        .meta-scrollbar-hide::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
          width: 0;
          height: 0;
        }
        .meta-scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .meta-scrollbar-hide::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-size: 12px;
        }
        `}</style>
      </div>
    </div>
  );
}