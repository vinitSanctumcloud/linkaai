'use client';
import { DashboardLayout } from '@/components/dashboard-layout';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { fetchAgentDetails } from '@/store/slices/agentSlice';

const ComingSoon = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [countdown, setCountdown] = useState({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  // Fetch agent details from the Redux store
  const { agent: agentDetails, status, error } = useSelector((state: RootState) => state.agents);
  // console.log('Agent Details:', agentDetails);
  // console.log('Status:', status);
  // console.log('Error:', error);

  // Dispatch fetchAgentDetails on component mount
  useEffect(() => {
    dispatch(fetchAgentDetails());
  }, [dispatch]);


  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-5 text-center">
        <h1>Coming Soon</h1>
        <div>
          <p>Countdown to Launch:</p>
          <p>
            {countdown.days} days, {countdown.hours} hours, {countdown.minutes} minutes,{' '}
            {countdown.seconds} seconds
          </p>
        </div>
        <div>
          <h2>Agent Details</h2>
          {status === 'loading' && <p>Loading agent details...</p>}
          {status === 'failed' && <p>Error: {error || 'Failed to load agent details'}</p>}
          {status === 'succeeded' && agentDetails ? (
            <div>
              <p>Name: {agentDetails.agent_name || 'N/A'}</p>
              <p>ID: {agentDetails.id || 'N/A'}</p>
              <p>Greeting Title: {agentDetails.greeting_title || 'N/A'}</p>
              <p>Slug: {agentDetails.ai_agent_slug || 'N/A'}</p>
              <p>Prompts: {agentDetails.prompts?.length || 0} available</p>
            </div>
          ) : (
            status !== 'loading' && <p>No agent details available.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComingSoon;