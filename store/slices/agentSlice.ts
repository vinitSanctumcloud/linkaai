'use client';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

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
  score_threshold: number;
  temperature: number;
  last_trained_at: string;
  prompts: Prompt[];
}

interface AgentState {
  agent: AiAgent | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: AgentState = {
  agent: null,
  status: 'idle',
  error: null,
};

export const fetchAgentDetails = createAsyncThunk('agent/fetchAgentDetails', async () => {
  const token = localStorage.getItem("accessToken")
  console.log('Token:', token);
  const response = await fetch('https://api.tagwell.co/api/v4/ai-agent/get-agent/details', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  console.log('API Response:', data);
  if (!response.ok) {
    throw new Error('Failed to fetch agent details');
  }
  return data.data.ai_agent;
});

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAgentDetails.fulfilled, (state, action: PayloadAction<AiAgent>) => {
        state.status = 'succeeded';
        state.agent = action.payload;
      })
      .addCase(fetchAgentDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch agent details';
      });
  },
});

export default agentSlice.reducer;