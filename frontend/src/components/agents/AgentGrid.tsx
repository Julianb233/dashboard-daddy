'use client';

import { AgentCard } from './AgentCard';
import { Agent } from '@/types/agent';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function AgentGrid() {
  const { data: agents, error } = useSWR<Agent[]>('/api/agents', fetcher, {
    refreshInterval: 5000,
  });

  if (error) return <div className="text-red-400">Failed to load agents</div>;
  if (!agents) return <div className="text-gray-400">Loading agents...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}
