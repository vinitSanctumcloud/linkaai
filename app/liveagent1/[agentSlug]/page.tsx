'use client';

import { AiAgent } from '@/components/aiagent';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
// Adjust the import path based on your file structure

interface Prompt {
  id: number;
  user_id: number;
  whitelabel_client_id: number;
  ai_agent_id: number;
  prompt_text: string;
  is_active: boolean;
}

interface ActiveAgentResponse {
  message: string;
  data: {
    is_active: boolean;
    active_slug: string;
  };
}

interface ApiResponse {
  message: string;
  data: {
    ai_agent: any;
  };
}

interface AiAgentType {
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

interface Message {
  text: string;
  sender: 'user' | 'assistant' | 'meta';
  image?: string;
  metaCards?: any[];
  url?: string;
}

function getOrCreatePublicId(user_id: number, agent_id: number) {
  const key = `public_id_${user_id}_${agent_id}`;
  let publicId = localStorage.getItem(key);
  if (!publicId) {
    const uuid = crypto.randomUUID();
    publicId = `${user_id}-${agent_id}-${uuid}`;
    localStorage.setItem(key, publicId);
  }
  return publicId;
}

function getChatHistoryKey(public_id: string) {
  return `chat_history_${public_id}`;
}

const AI_AGENT_URL = process.env.NEXT_PUBLIC_AI_AGENT_URL;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function AgentDetails() {
  const [agentDetails, setAgentDetails] = useState<AiAgentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showPrompts, setShowPrompts] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[pathParts.length - 1];

    async function fetchAgentDetails(slug: string) {
      try {
        setLoading(true);
        const activeResponse = await fetch(
          `https://api.tagwell.co/api/v4/ai-agent/get/active/slug?ai_agent_slug=${slug}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!activeResponse.ok) throw new Error('Failed to check agent status');
        const activeData: ActiveAgentResponse = await activeResponse.json();
        const activeSlug = activeData.data.active_slug;
        if (activeSlug !== slug) router.push(`/liveagent/${activeSlug}`);

        const response = await fetch(
          `${API_BASE_URL}/v4/ai-agent/get-agent/details/${activeSlug}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );
        if (!response.ok) throw new Error('Failed to fetch agent details');
        const data: ApiResponse = await response.json();
        setAgentDetails(data.data.ai_agent);
      } catch (err: any) {
        setError(err.message || 'Error fetching agent details.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgentDetails(slug);
  }, [router]);

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
      } catch { }
    }
  }, [agentDetails]);

  useEffect(() => {
    if (!agentDetails) return;
    const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);
    const key = getChatHistoryKey(public_id);
    localStorage.setItem(key, JSON.stringify(messages));
  }, [messages, agentDetails]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    if (!agentDetails) {
      setMessages((prev) => [
        ...prev,
        { text: 'Agent details not loaded.', sender: 'assistant' },
      ]);
      return;
    }

    const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);
    const newMessage: Message = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
    setShowWelcome(false);
    setShowPrompts(false);

    setMessages((prev) => [...prev, { text: '', sender: 'assistant' }]);
    try {
      const response = await fetch(`${AI_AGENT_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: input,
          user_id: agentDetails?.user_id,
          agent_id: agentDetails?.id,
          public_id,
        }),
      });

      if (!response.ok || !response.body) throw new Error('API request failed');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let assistantText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          assistantText += decoder.decode(value);
          let cleanedText = assistantText
            .replace(/[\s\-•]*\[METAID:[^\]]+\]/g, '')
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
          .replace(/[\s\-•]*\[METAID:[^\]]+\]/g, '')
            .trim();
        updated[updated.length - 1] = { text: cleanedText, sender: 'assistant' };
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
          if (metaRes.ok) metaResults.push((await metaRes.json()).data);
        } catch (err) { }
      }
      if (metaResults.length > 0) {
        setMessages((prev) => [
          ...prev,
          { text: '', sender: 'meta', metaCards: metaResults },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: 'Error fetching response.', sender: 'assistant' },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  const toggleChat = () => {
    setIsChatOpen((prev) => !prev);
  };

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
        <div className="w-[90vw] max-w-[400px] h-[80vh] max-h-[600px] sm:max-w-[450px] sm:max-h-[700px] lg:max-w-[500px] lg:max-h-[800px] bg-white rounded-2xl shadow-2xl flex items-center justify-center">
          <div className="text-red-500 text-lg text-center px-4">{error}</div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = agentDetails?.avatar_image_url || '/thumbnail.jpg';
  const pageTitle = agentDetails?.greeting_title || 'AI Agent';
  const pageDescription = agentDetails?.welcome_greeting || 'Interact with our AI agent on LinkaAI';

  const boxStyles = {
    className: `
            fixed bottom-12 right-4
            w-[90vw] max-w-[400px]
            sm:max-w-[450px]
            lg:max-w-[500px]
            bg-white
            rounded-2xl
            shadow-2xl
            border border-gray-200
            flex flex-col
            overflow-hidden
            z-40
            overflow-y-auto
            lg:h-[700px] xl:h-[800px]
          `,
    style: {
      minHeight: '80vh',
      maxHeight: '80vh',
      height: 'auto',
    }
  }
  return (
    <>
      {!isChatOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 w-44 h-44 rounded-full shadow-lg overflow-hidden z-50 hover:shadow-xl transition-all duration-300 focus:outline-none"
          aria-label="Toggle chat"
        >
          {agentDetails?.greeting_media_type === 'video' ? (
            <video
              src={agentDetails?.greeting_media_url}
              loop
              playsInline
              autoPlay
              muted
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${thumbnailUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Chat</span>
          </div>
        </button>
      )}
      {
        isChatOpen && (
          <AiAgent
            agentDetails={agentDetails}
            messages={messages}
            input={input}
            showWelcome={showWelcome}
            showPrompts={showPrompts}
            isChatOpen={isChatOpen}
            thumbnailUrl={thumbnailUrl}
            pageTitle={pageTitle}
            pageDescription={pageDescription}
            chatEndRef={chatEndRef}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            handleKeyPress={handleKeyPress}
            toggleChat={toggleChat}
            boxStyles={boxStyles}
            cross={true}
          />)
      }

    </>
  );
}