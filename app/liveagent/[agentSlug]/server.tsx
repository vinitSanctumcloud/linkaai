import { Metadata } from 'next';

interface ApiResponse {
  message: string;
  data: {
    ai_agent: {
      avatar_image_url: string | null;
      greeting_title: string;
      welcome_greeting: string;
      ai_agent_slug: string;
    };
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export async function generateMetadata({ params }: { params: { agentSlug: string } }): Promise<Metadata> {
  const defaultMetadata: Metadata = {
    title: 'AI Agent',
    description: 'Interact with our AI agent on LinkaAI',
    openGraph: {
      title: 'AI Agent',
      description: 'Interact with our AI agent on LinkaAI',
      images: [
        {
          url: 'https://linkaai-9lgi.vercel.app/thumbnail.jpg',
          secureUrl: 'https://linkaai-9lgi.vercel.app/thumbnail.jpg',
          type: 'image/jpeg',
          width: 1200,
          height: 630,
          alt: 'AI Agent thumbnail',
        },
      ],
      type: 'website',
      url: `https://linkaai-9lgi.vercel.app/liveagent/default`,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'AI Agent',
      description: 'Interact with our AI agent on LinkaAI',
      images: ['https://linkaai-9lgi.vercel.app/thumbnail.jpg'],
    },
  };

  if (!API_BASE_URL) {
    console.error('API_BASE_URL is not defined in environment variables.');
    return defaultMetadata;
  }

  const agentSlug = params.agentSlug;
  if (!agentSlug || agentSlug === 'undefined') {
    console.error('Invalid or undefined agentSlug:', { agentSlug, params });
    return defaultMetadata;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/v4/ai-agent/get-agent/details/${agentSlug}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch agent details: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();
    const agentDetails = data.data.ai_agent;

    const thumbnailUrl = agentDetails?.avatar_image_url || 'https://linkaai-9lgi.vercel.app/thumbnail.jpg';
    const pageTitle = agentDetails?.greeting_title || 'AI Agent';
    const pageDescription = agentDetails?.welcome_greeting || 'Interact with our AI agent on LinkaAI';

    return {
      title: pageTitle,
      description: pageDescription,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        images: [
          {
            url: thumbnailUrl,
            secureUrl: thumbnailUrl,
            type: 'image/jpeg',
            width: 1200,
            height: 630,
            alt: `${pageTitle} thumbnail`,
          },
        ],
        type: 'website',
        url: `https://linkaai-9lgi.vercel.app/liveagent/${agentSlug}`,
      },
      twitter: {
        card: 'summary_large_image',
        title: pageTitle,
        description: pageDescription,
        images: [thumbnailUrl],
      },
    };
  } catch (error: any) {
    console.error('Error generating metadata:', {
      message: error.message,
      agentSlug,
      apiUrl: `${API_BASE_URL}/v4/ai-agent/get-agent/details/${agentSlug}`,
    });
    return defaultMetadata;
  }
}