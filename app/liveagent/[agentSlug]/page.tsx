'use client';

import { AiAgent } from '@/components/aiagent';
import React, { useState, useEffect } from 'react';
import { API } from '@/config/api';
import { Metadata } from 'next';

// Define the interface for agent details (simplified for metadata purposes)
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
  prompts: any[];
}

// Define the metadata generation function
export async function generateMetadata({ params }: { params: { agentSlug: string } }): Promise<Metadata> {
  try {
    // Fetch agent details to get metadata
    const response = await fetch(API.AI_AGENT_DATA_FROM_SLUG(params.agentSlug), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch agent details');
    }

    const data = await response.json();
    const agentDetails: AiAgentType = data.data.ai_agent;

    const thumbnailUrl = agentDetails?.avatar_image_url || 'https://via.placeholder.com/1200x630';
    const pageTitle = agentDetails?.greeting_title || 'AI Agent';
    const pageDescription = agentDetails?.welcome_greeting || 'Interact with our AI agent on LinkaAI';
    const pageUrl = `https://linkaai-9lgi.vercel.app/liveagent/${agentDetails?.ai_agent_slug ?? ''}`;

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: [
          {
            url: thumbnailUrl,
            width: 1200,
            height: 630,
            alt: pageTitle,
          },
        ],
        url: pageUrl,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [thumbnailUrl],
      },
    };
  } catch (error) {
    // Fallback metadata in case of error
    return {
      title: 'AI Agent',
      description: 'Interact with our AI agent on LinkaAI',
      openGraph: {
        title: 'AI Agent',
        description: 'Interact with our AI agent on LinkaAI',
        images: [
          {
            url: 'https://via.placeholder.com/1200x630',
            width: 1200,
            height: 630,
            alt: 'AI Agent',
          },
        ],
        url: `https://linkaai-9lgi.vercel.app/liveagent/${params.agentSlug}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AI Agent',
        description: 'Interact with our AI agent on LinkaAI',
        images: ['https://via.placeholder.com/1200x630'],
      },
    };
  }
}

export default function AgentDetails({ params }: { params: { agentSlug: string } }) {
  const { agentSlug } = params;

  const boxStyles = {
    className: `
      fixed top-1/2 left-1/2
      -translate-x-1/2 -translate-y-1/2
      w-[95vw] max-w-[600px]
      sm:max-w-[600px]
      lg:max-w-[650px]
      bg-white
      rounded-2xl
      border border-gray-200
      flex flex-col
      overflow-hidden
      z-40
      lg:h-[700px] xl:h-[800px]
    `,
    style: {
      minHeight: '85vh',
      maxHeight: '85vh',
      height: 'auto',
    },
  };

  return <AiAgent boxStyles={boxStyles} agentSlug={agentSlug} />;
}