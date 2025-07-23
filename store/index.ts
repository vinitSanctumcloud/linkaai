'use client';
import { configureStore } from '@reduxjs/toolkit';
import agentReducer from './slices/agentSlice';

export const store = configureStore({
  reducer: {
    agents: agentReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;