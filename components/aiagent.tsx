'use client';

import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { FaMicrophone } from 'react-icons/fa';
import { FiSend } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';

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

interface AiAgentProps {
    agentDetails: AiAgent | null;
    messages: Message[];
    input: string;
    showWelcome: boolean;
    showPrompts: boolean;
    isChatOpen: boolean;
    thumbnailUrl: string;
    pageTitle: string;
    pageDescription: string;
    chatEndRef: React.RefObject<HTMLDivElement>;
    setInput: (value: string) => void;
    handleSendMessage: () => void;
    handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    toggleChat: () => void;
    boxStyles: { className: string; style: React.CSSProperties };
    cross: boolean;
}

export function AiAgent({
    agentDetails,
    messages,
    input,
    showWelcome,
    showPrompts,
    isChatOpen,
    thumbnailUrl,
    pageTitle,
    pageDescription,
    chatEndRef,
    setInput,
    handleSendMessage,
    handleKeyPress,
    toggleChat,
    boxStyles,
    cross,
}: AiAgentProps) {
    const [isMuted, setIsMuted] = useState(true);
    const cardContainerRefs = useRef<(HTMLDivElement | null)[]>([]); // Array to store refs for each card container

    const toggleMute = () => {
        setIsMuted((prev) => !prev);
    };

    // Scroll function that targets a specific card container by index
    const scrollCards = (direction: 'prev' | 'next', index: number) => {
        const container = cardContainerRefs.current[index];
        if (container) {
            const scrollAmount = direction === 'next' ? 200 : -200;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen w-full py-4 relative bg-transparent">
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={thumbnailUrl} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:type" content="website" />
                <meta
                    property="og:url"
                    content={`https://linkaai-9lgi.vercel.app/liveagent/${agentDetails?.ai_agent_slug ?? ''}`}
                />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={thumbnailUrl} />
            </Head>

            {/* Chatbox */}
            <div className={boxStyles.className} style={boxStyles.style}>
                {/* Close Button */}
                {cross && (
                    <button
                        onClick={toggleChat}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200 z-50"
                        aria-label="Close chat"
                    >
                        <IoClose className="h-5 w-5 text-gray-600" />
                    </button>
                )}

                {/* Header with Agent Info */}
                {showWelcome && (
                    <div className="flex flex-col items-center justify-center flex-shrink-0 py-2 sm:py-4">
                        <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-white shadow-md mb-2">
                            {agentDetails?.greeting_media_type === 'video' ? (
                                <video
                                    src={agentDetails?.greeting_media_url ?? ''}
                                    loop
                                    playsInline
                                    autoPlay
                                    muted={isMuted}
                                    onClick={toggleMute}
                                    className="w-full h-full object-cover object-center cursor-pointer"
                                />
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

                {/* Quick Prompts */}
                {showPrompts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 px-4 py-1">
                        {agentDetails?.prompts
                            ?.filter((prompt) => prompt.is_active)
                            .map((prompt) => (
                                <button
                                    key={prompt.id}
                                    className="w-full text-base font-semibold bg-white text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-100 transition-all duration-200 shadow-sm border border-gray-200 hover:border-gray-300"
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
                <div className="flex-1 overflow-y-auto pl-4 pr-4 pb-4 no-scrollbar bg-white">
                    {messages.map((message, index) => (
                        <React.Fragment key={index}>
                            {(message.sender === 'user' || message.sender === 'assistant') && (
                                <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
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
                                        className={`max-w-[70%] rounded-2xl p-3 shadow-md ${message.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-br-none'
                                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                                        }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <a
                                                        {...props}
                                                        className="text-blue-600 underline break-words"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    />
                                                ),
                                                ul: ({ node, ...props }) => (
                                                    <ul className="list-disc ml-[20px]" {...props} />
                                                ),
                                                ol: ({ node, ...props }) => (
                                                    <ol className="list-decimal ml-[20px]" {...props} />
                                                ),
                                                li: ({ node, ...props }) => (
                                                    <li className="mb-1" {...props} />
                                                ),
                                                h1: ({ node, ...props }) => (
                                                    <h1 className="font-bold text-lg mb-2" {...props} />
                                                ),
                                                h2: ({ node, ...props }) => (
                                                    <h2 className="font-semibold text-base mb-1" {...props} />
                                                ),
                                                p: ({ node, ...props }) => (
                                                    <p className="mb-2 break-words" {...props} />
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
                                            onClick={() => scrollCards('prev', index)} // Pass index to scroll specific container
                                            className="absolute left-0 z-10 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors duration-200"
                                            aria-label="Previous card"
                                        >
                                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <div
                                            className="flex gap-2 overflow-x-auto px-10 py-2 meta-scrollbar-hide"
                                            ref={(el) => { cardContainerRefs.current[index] = el; }} // Assign ref to specific index
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
                                                        <div className="text-xs sm:text-sm font-bold text-gray-900 text-center line-clamp-2">
                                                            {meta.title ?? 'No Title Available'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-medium mt-1 text-center line-clamp-3">
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
                                            onClick={() => scrollCards('next', index)} // Pass index to scroll specific container
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

                {/* Input Area */}
                <div className="p-4 bg-white">
                    <div className="flex flex-wrap items-center gap-2 border border-gray-200 rounded-md px-3 py-2 bg-white shadow-sm hover:shadow-md transition-all duration-200">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything..."
                            className="flex-1 min-w-0 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent outline-none focus:outline-none focus:ring-0 focus:placeholder-gray-300 transition-colors duration-150"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
                                aria-label="Voice input"
                            >
                                <FaMicrophone className="text-gray-600 h-5 w-5 hover:text-gray-800" />
                            </button>
                            <button
                                onClick={handleSendMessage}
                                className="p-2 rounded-full bg-black text-white transition-colors duration-200 outline-none focus:outline-none focus:ring-0"
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