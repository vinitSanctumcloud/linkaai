'use client';
import { API } from '@/config/api';
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

export const fetchAgentDetails = createAsyncThunk<AiAgent, void, { rejectValue: string }>(
  'agent/fetchAgentDetails',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        return rejectWithValue('No access token found');
      }
      const response = await fetch(API.AGENT_DETAILS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || `HTTP error! Status: ${response.status}`);
      }
      if (!data.data?.ai_agent) {
        return rejectWithValue('No agent data in response');
      }
      return data.data.ai_agent;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch agent details');
    }
  }
);

const agentSlice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    resetAgent: () => initialState, // Reset to initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAgentDetails.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAgentDetails.fulfilled, (state, action: PayloadAction<AiAgent>) => {
        state.status = 'succeeded';
        state.agent = action.payload;
        state.error = null;
      })
      .addCase(fetchAgentDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch agent details';
      });
  },
});

export const { resetAgent } = agentSlice.actions;
export default agentSlice.reducer;