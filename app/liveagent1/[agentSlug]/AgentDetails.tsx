'use client';

import { AiAgent } from '@/components/aiagent';
import React from 'react';

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