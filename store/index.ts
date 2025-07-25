'use client';
import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';
import authReducer from './slices/authSlice'

export const store = configureStore({
  reducer: {
    agents: agentReducer,
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;