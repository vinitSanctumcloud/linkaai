import { AiAgent } from '@/components/aiagent';
import { API } from '@/config/api';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// Import metadata from server component
export { generateMetadata } from './server';

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function fetchAgentDetails(agentSlug: string) {
  if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables.');
  }

  try {
    const activeResponse = await fetch(API.AI_AGENT_DATA_FROM_SLUG(agentSlug), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });
    if (!activeResponse.ok) {
      throw new Error(`Failed to check agent status: ${activeResponse.status} ${activeResponse.statusText}`);
    }
    const activeData: ActiveAgentResponse = await activeResponse.json();
    const activeSlug = activeData.data.active_slug;
    if (activeSlug !== agentSlug) {
      redirect(`/liveagent/${activeSlug}`);
    }

    const response = await fetch(
      `${API_BASE_URL}/v4/ai-agent/get-agent/details/${activeSlug}`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' }, next: { revalidate: 3600 } }
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch agent details: ${response.status} ${response.statusText}`);
    }
    const data: ApiResponse = await response.json();
    return data.data.ai_agent;
  } catch (err: any) {
    throw new Error(err.message || 'Error fetching agent details.');
  }
}

export default async function AgentDetails({ params }: { params: { agentSlug: string } }) {
  let agentDetails: AiAgentType | null = null;
  let error: string | null = null;

  try {
    agentDetails = await fetchAgentDetails(params.agentSlug);
  } catch (err: any) {
    console.error('Error fetching agent details:', {
      message: err.message,
      agentSlug: params.agentSlug,
      apiUrl: `${API_BASE_URL}/v4/ai-agent/get-agent/details/${params.agentSlug}`,
    });
    error = err.message || 'Error fetching agent details.';
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

  const boxStyles = {
    className: `
      fixed top-1/2 left-1/2
      -translate-x-1/2 -translate-y-1/2
      w-[90vw] max-w-[400px]
      sm:max-w-[500px]
      lg:max-w-[500px]
      bg-white
      rounded-2xl
      shadow-2xl
      border border-gray-200
      flex flex-col
      overflow-hidden
      z-40
      lg:h-[700px] xl:h-[800px]
    `,
    style: {
      minHeight: '80vh',
      maxHeight: '100vh',
      height: 'auto',
    },
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AiAgent
        agentDetails={agentDetails}
        boxStyles={boxStyles}
        cross={false}
      />
    </Suspense>
  );
}