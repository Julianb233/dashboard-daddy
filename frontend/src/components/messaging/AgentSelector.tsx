'use client';

import { useMessagingStore } from '@/store/messaging';
import { Agent } from '@/lib/supabase/types';

interface AgentSelectorProps {
  onAgentSelected: () => void;
}

export function AgentSelector({ onAgentSelected }: AgentSelectorProps) {
  const { agents, setCurrentAgent, updateAgentStatus } = useMessagingStore();

  const handleSelectAgent = async (agent: Agent) => {
    setCurrentAgent(agent);
    await updateAgentStatus('online');
    onAgentSelected();
  };

  return (
    <div className="space-y-3">
      {agents.map((agent) => (
        <button
          key={agent.id}
          onClick={() => handleSelectAgent(agent)}
          className="w-full p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 hover:border-blue-500 transition-all duration-200 text-left group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-lg font-bold">
              {agent.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                {agent.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {agent.description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${
                  agent.status === 'online' ? 'bg-green-400' :
                  agent.status === 'away' ? 'bg-yellow-400' :
                  agent.status === 'busy' ? 'bg-red-400' : 'bg-gray-500'
                }`}></div>
                <span className="text-xs text-gray-500 capitalize">
                  {agent.status}
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
      
      {agents.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>No agents available</p>
          <p className="text-sm mt-2">Please contact your administrator</p>
        </div>
      )}
    </div>
  );
}