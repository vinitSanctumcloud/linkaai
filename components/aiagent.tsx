'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { IoArrowBack } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import { TooltipContent, Tooltip, TooltipProvider, TooltipTrigger } from '@radix-ui/react-tooltip';
import { Volume2, VolumeX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API } from '@/config/api';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: { [key: number]: { transcript: string }[] };
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface Prompt {
    id: number;
    user_id: number;
    whitelabel_client_id: number;
    ai_agent_id: number;
    prompt_text: string;
    is_active: boolean;
}

interface MetaCard {
    metaId?: string;
    url?: string;
    image?: string;
    title?: string;
    description?: string;
    favicon?: string;
    brand?: string;
}

interface Message {
    text: string;
    sender: 'user' | 'assistant' | 'meta';
    image?: string;
    metaCards?: MetaCard[];
    url?: string;
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
        ai_agent: AiAgentType;
    };
}

interface AiAgentProps {
    boxStyles: { className: string; style: React.CSSProperties };
    agentSlug: string;
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

export function AiAgent({ boxStyles, agentSlug }: AiAgentProps) {
    const [agentDetails, setAgentDetails] = useState<AiAgentType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [showWelcome, setShowWelcome] = useState(true);
    const [showPrompts, setShowPrompts] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
    const [showBackButton, setShowBackButton] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [showChatArea, setShowChatArea] = useState(true);
    const router = useRouter();

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        async function fetchAgentDetails(slug: string) {
            try {
                setLoading(true);
                const activeResponse = await fetch(API.AI_AGENT_DATA_FROM_SLUG(slug), {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
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

        if (agentSlug) fetchAgentDetails(agentSlug);
    }, [agentSlug, router]);

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
                    setShowBackButton(true);
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

    useEffect(() => {
        const clearLocalStorage = () => {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('chat_history') || key.startsWith('public_id')) {
                    localStorage.removeItem(key);
                }
            });
        };

        const intervalId = setInterval(clearLocalStorage, 3 * 60 * 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const SpeechRecognitionConstructor =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        if (SpeechRecognitionConstructor) {
            const rec: SpeechRecognition = new SpeechRecognitionConstructor();
            rec.continuous = true;
            rec.interimResults = true;
            rec.lang = 'en-US';

            rec.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const transcript = event.results[current][0].transcript;
                setInput(transcript);
            };

            rec.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            rec.onend = () => {
                setIsListening(false);
            };

            setRecognition(rec);
        } else {
            console.error('SpeechRecognition API not supported in this browser.');
        }

        return () => {
            if (recognition) {
                recognition.stop();
            }
        };
    }, [setInput]);

    const handleSendMessage = async (message?: string) => {
        const text = message?.trim() || input.trim();
        if (!text) return;
        if (!agentDetails) {
            setMessages((prev) => [
                ...prev,
                { text: 'Agent details not loaded.', sender: 'assistant' },
            ]);
            return;
        }

        const public_id = getOrCreatePublicId(agentDetails.user_id, agentDetails.id);
        const newMessage: Message = { text, sender: 'user' };
        setMessages((prev) => [...prev, newMessage]);
        setInput('');
        setShowWelcome(false);
        setShowPrompts(false);
        setShowBackButton(true);
        setShowChatArea(true);

        setMessages((prev) => [...prev, { text: '', sender: 'assistant' }]);
        try {
            const response = await fetch(`${AI_AGENT_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: text,
                    user_id: agentDetails.user_id,
                    agent_id: agentDetails.id,
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

    const handleVoiceInput = () => {
        if (!recognition) return;

        if (isListening) {
            recognition.stop();
            setIsListening(false);
        } else {
            setInput('');
            recognition.start();
            setIsListening(true);
        }
    };

    const toggleChat = () => {
        setIsChatOpen((prev) => !prev);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const scrollCards = (direction: 'prev' | 'next', index: number) => {
        const container = cardContainerRefs.current[index];
        if (container) {
            const scrollAmount = direction === 'next' ? 200 : -200;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const resetChatState = () => {
        setShowWelcome(true);
        setShowPrompts(true);
        setShowBackButton(false);
        setInput('');
        setShowChatArea(false);
    };

    if (error) {
        return (
            <div className={boxStyles.className} style={boxStyles.style}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-red-500 text-lg text-center px-4">{error}</div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className={boxStyles.className} style={boxStyles.style}>
                <div className="w-full h-full flex items-center justify-center">
                    <div className="text-gray-500 text-lg text-center px-4">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={boxStyles.className} style={boxStyles.style}>
            <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <button
                    onClick={resetChatState}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                    aria-label="Back to welcome"
                >
                    <IoArrowBack className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {showWelcome && (
                <div className="flex flex-col items-center justify-center flex-shrink-0 py-2 sm:py-4">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-4 border-white shadow-md mb-2">
                        {agentDetails?.greeting_media_type === 'video' ? (
                            <div className="relative w-full h-full">
                                <video
                                    ref={videoRef}
                                    src={agentDetails?.greeting_media_url ?? ''}
                                    loop
                                    playsInline
                                    autoPlay
                                    muted={isMuted}
                                    onClick={toggleMute}
                                    className="w-full h-full object-cover object-center cursor-pointer rounded-full"
                                />
                                <TooltipProvider>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={toggleMute}
                                                className="absolute top-2 right-2 bg-white/80 border border-orange-400 text-orange-600 rounded-full p-1.5 cursor-pointer transition-all duration-300 hover:bg-orange-400 hover:text-white shadow-sm flex items-center justify-center"
                                            >
                                                {isMuted ? (
                                                    <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                                                ) : (
                                                    <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                                                )}
                                                <span className="sr-only">{isMuted ? 'Unmute video' : 'Mute video'}</span>
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent
                                            className="bg-white text-gray-800 border border-gray-200 rounded-md p-1 text-xs shadow-sm max-w-[150px]"
                                            sideOffset={5}
                                        >
                                            <p>{isMuted ? 'Unmute the video' : 'Mute the video'}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        ) : (
                            <img
                                src={agentDetails?.greeting_media_url ?? 'https://via.placeholder.com/150'}
                                alt={agentDetails?.agent_name ?? 'Agent Avatar'}
                                className="w-full h-full object-cover object-center"
                            />
                        )}
                    </div>
                    <h2 className="mt-2 text-xl sm:text-2xl font-bold text-black text-center">
                        {agentDetails?.greeting_title ?? 'Agent'}
                    </h2>
                    <p className="text-base sm:text-lg text-gray-500 text-center">
                        {agentDetails?.welcome_greeting ?? ''}
                    </p>
                </div>
            )}

            {showPrompts && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 py-1">
                    {agentDetails?.prompts
                        ?.filter((prompt) => prompt.is_active)
                        .map((prompt) => (
                            <button
                                key={prompt.id}
                                className="w-full text-[12px] font-semibold sm:text-lg bg-white text-gray-800 py-1 px-1 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
                                aria-label={`Start chat with prompt: ${prompt.prompt_text}`}
                                onClick={() => {
                                    setInput(prompt.prompt_text);
                                    handleSendMessage(prompt.prompt_text);
                                }}
                            >
                                {prompt.prompt_text}
                            </button>
                        ))}
                </div>
            )}

            {showChatArea && (
                <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4 pt-2 no-scrollbar bg-white text-[11px]">
                    {messages.map((message, index) => (
                        <React.Fragment key={index}>
                            {(message.sender === 'user' || message.sender === 'assistant') && (
                                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 pt-2`}>
                                    {message.sender === 'assistant' && (
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden mr-2">
                                            <img
                                                src={agentDetails?.avatar_image_url ?? 'https://via.placeholder.com/150'}
                                                alt="Assistant"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 shadow-md text-[16px] ${message.sender === 'user'
                                            ? 'bg-gray-200 text-white rounded-br-none'
                                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="
                                                            text-blue-600 hover:text-blue-800 
                                                            underline underline-offset-[3px]
                                                            transition-colors duration-200
                                                            break-words
                                                            "
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ wordBreak: 'break-word' }}
                                                    />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul
                                                        className="
                                                            list-disc ml-6 
                                                            my-3 space-y-2
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol
                                                        className="
                                                            list-decimal ml-6 
                                                            my-3 space-y-2
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li
                                                        className="
                                                            pl-1.5 
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                h1: ({ node, ...props }) => (
                                                    <h1
                                                        className="
                                                            text-2xl font-bold 
                                                            mt-8 mb-4 pb-2 
                                                            border-b border-gray-200
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2
                                                        className="
                                                            text-xl font-bold 
                                                            mt-7 mb-3
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                h3: ({ node, ...props }) => (
                                                    <h3
                                                        className="
                                                            text-lg font-semibold 
                                                            mt-6 mb-2
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                h4: ({ node, ...props }) => (
                                                    <h4
                                                        className="
                                                            text-base font-semibold 
                                                            mt-5 mb-2
                                                            break-words
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                p: ({ node, ...props }) => (
                                                    <p
                                                        className="
                                                            mb-0
                                                            text-gray-800 
                                                            leading-relaxed
                                                            break-words
                                                            text-[13px] md:text-[15px]
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                blockquote: ({ node, ...props }) => (
                                                    <blockquote
                                                        className="
                                                            border-l-4 border-gray-300 
                                                            pl-4 italic text-gray-600 
                                                            my-4
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                code: ({ node, ...props }, { inline }: { inline?: boolean } = {}) =>
                                                    inline ? (
                                                        <code
                                                            className="
                                                                bg-gray-100 px-1.5 py-0.5 
                                                                rounded text-sm 
                                                                font-mono text-gray-800
                                                                "
                                                            {...props}
                                                        />
                                                    ) : (
                                                        <div className="my-3 overflow-hidden rounded">
                                                            <code
                                                                className="
                                                                    block bg-gray-100 p-4 
                                                                    overflow-x-auto
                                                                    font-mono text-sm
                                                                "
                                                                {...props}
                                                            />
                                                        </div>
                                                    ),
                                                table: ({ node, ...props }) => (
                                                    <div className="my-4 overflow-x-auto">
                                                        <table
                                                            className="w-full border-collapse"
                                                            {...props}
                                                        />
                                                    </div>
                                                ),
                                                th: ({ node, ...props }) => (
                                                    <th
                                                        className="
                                                            border border-gray-300 
                                                            px-4 py-2 text-left 
                                                            bg-gray-100 font-semibold
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                td: ({ node, ...props }) => (
                                                    <td
                                                        className="
                                                            border border-gray-300 
                                                            px-4 py-2
                                                            "
                                                        {...props}
                                                    />
                                                ),
                                                img: ({ node, ...props }) => (
                                                    <img
                                                        {...props}
                                                        className="
                                                            my-4 max-w-full 
                                                            rounded border 
                                                            border-gray-200
                                                            "
                                                        loading="lazy"
                                                    />
                                                ),
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            )}
                            {message.sender === 'meta' && message.metaCards && (
                                <div className="w-full py-2 relative">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => scrollCards('prev', index)}
                                            className="absolute left-0 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                            aria-label="Previous card"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div
                                            className="flex gap-2 overflow-x-auto px-10 py-2 meta-scrollbar-hide"
                                            ref={(el) => {
                                                cardContainerRefs.current[index] = el;
                                            }}
                                        >
                                            {message.metaCards.map((meta, idx) => (
                                                <a
                                                    key={meta.metaId ?? idx}
                                                    href={meta.url ?? '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="min-w-[140px] max-w-[160px] sm:min-w-[170px] sm:max-w-[190px] bg-white rounded-xl shadow border border-gray-200 flex flex-col items-center p-0 hover:shadow-lg transition-shadow duration-200"
                                                    style={{ flex: '0 0 auto', textDecoration: 'none' }}
                                                >
                                                    <div className="w-full h-[110px] sm:h-[130px] rounded-t-xl overflow-hidden flex items-center justify-center bg-gray-100">
                                                        <img
                                                            src={meta.image ?? 'https://via.placeholder.com/160'}
                                                            alt={meta.title ?? 'Image'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="px-2 py-2 w-full flex flex-col items-center">
                                                        <div className="text-xs sm:text-sm font-bold text-gray-900 text-center line-clamp-2 break-words">
                                                            {meta.title ?? 'No Title Available'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium mt-1 text-center line-clamp-3 break-words">
                                                            {meta.description ?? 'No description available.'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {meta.favicon ? (
                                                                <img src={meta.favicon} alt={meta.brand ?? 'Brand'} className="w-4 h-4" />
                                                            ) : (
                                                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                                            )}
                                                            <span className="text-xs text-gray-600 font-medium">{meta.brand ?? 'Unknown Brand'}</span>
                                                        </div>
                                                    </div>
                                                </a>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => scrollCards('next', index)}
                                            className="absolute right-0 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                            aria-label="Next card"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            )}

            <div className="flex items-center gap-2 p-4 bg-white rounded-lg shadow-sm mt-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full p-3 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 placeholder-gray-400 text-[13px] md:text-[15px]"
                        placeholder="Speak or type here..."
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                        <button
                            onClick={handleVoiceInput}
                            className={`p-2 transition-colors rounded-full ${isListening ? 'bg-red-50' : 'hover:bg-gray-100'} `}
                            aria-label="Voice input"
                        >
                            <FaMicrophone className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : 'text-gray-600 hover:text-gray-800'}`} />
                        </button>
                        <button
                            onClick={() => handleSendMessage()}
                            disabled={input.length === 0}
                            className={`p-2 transition-colors rounded-full ${input.length === 0 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
                            aria-label="Send message"
                        >
                            <FiSend className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <p className="text-[9px] sm:text-sm text-gray-500 text-center font-medium px-2 py-1">
                Type your question or tap the microphone
            </p>

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
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                }
                .meta-scrollbar-hide::-webkit-scrollbar {
                    display: none;
                    width: 0;
                    height: 0;
                }
                .break-words {
                    word-break: break-all;
                    overflow-wrap: break-word;
                }
            `}</style>
        </div>
    );
}