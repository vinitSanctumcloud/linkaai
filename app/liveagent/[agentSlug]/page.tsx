'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';

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
  sender: 'user' | 'assistant';
  image?: string;
}

export default function AgentDetails() {
  const [agentDetails, setAgentDetails] = useState<AiAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPrompts, setShowPrompts] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
          `https://api.tagwell.co/api/v4/ai-agent/get-agent/details/${slug}`,
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

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { text: input, sender: 'user' };
    setMessages([...messages, newMessage]);
    setInput('');
    setShowWelcome(false);
    setShowPrompts(false);

    setTimeout(() => {
      setShowConfirmation(true);
      const assistantResponse: Message = {
        text: "Is this the reel you're asking about?",
        sender: 'assistant',
        image: 'https://via.placeholder.com/180x320',
      };
      setMessages((prev) => [...prev, assistantResponse]);
    }, 1000);
  };

  // Handle confirmation buttons
  const handleConfirmation = (response: 'yes' | 'no') => {
    const confirmationMessage: Message = {
      text: response === 'yes' ? "Great! I'll provide details about this reel." : "Okay, let me find another reel for you.",
      sender: 'assistant',
    };
    setMessages((prev) => [...prev, confirmationMessage]);
    setShowConfirmation(false);
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
                <div className="w-20 h-20 sm:w-48 sm:h-48 rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={agentDetails.greeting_media_url || 'https://via.placeholder.com/150'}
                    alt={agentDetails.greeting_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="mt-2 text-lg sm:text-xl font-semibold text-black">
                  {agentDetails.greeting_title || `Hi, I'm ${agentDetails.agent_name}`}
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
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
              >
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
                  <p className="text-sm sm:text-base leading-relaxed">{message.text}</p>
                  {message.image && (
                    <div className="mt-2 w-full max-w-[120px] sm:max-w-[150px] aspect-[9/16] rounded-lg overflow-hidden">
                      <img src={message.image} alt="Chat Image" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Confirmation Message */}
            {showConfirmation && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2">
                  <img
                    src={agentDetails.avatar_image_url || 'https://via.placeholder.com/150'}
                    alt="Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="max-w-[70%] bg-white rounded-2xl p-3 shadow-md rounded-bl-none border border-gray-200">
                  <p className="text-sm sm:text-base leading-relaxed">
                    Sure! Just to confirm, is this the reel you're asking about?
                  </p>
                  <div className="mt-2 w-full max-w-[120px] sm:max-w-[150px] aspect-[9/16] rounded-lg overflow-hidden">
                    <img
                      src="https://via.placeholder.com/180x320"
                      alt="Confirmation Reel"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleConfirmation('yes')}
                      className="bg-blue-600 text-white py-1.5 px-4 rounded-full hover:bg-blue-700 text-sm font-semibold transition-colors duration-200"
                    >
                      Yes, that's the one
                    </button>
                    <button
                      onClick={() => handleConfirmation('no')}
                      className="bg-gray-200 text-gray-900 py-1.5 px-4 rounded-full hover:bg-gray-300 text-sm font-semibold transition-colors duration-200"
                    >
                      No, show me others
                    </button>
                  </div>
                </div>
              </div>
            )}
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
        `}</style>
      </div>
    </div>
  );
}