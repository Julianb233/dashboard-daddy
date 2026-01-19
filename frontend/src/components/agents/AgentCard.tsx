'use client'

import { Agent } from '@/types/agent'
import { AgentStatusBadge } from './AgentStatusBadge'
import { AgentControls } from './AgentControls'

interface AgentCardProps {
  agent: Agent;
  onAction?: (action: 'start' | 'stop' | 'restart') => void;
}

export function AgentCard({ agent, onAction }: AgentCardProps) {
  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {agent.config.name[0]}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.config.name}</h3>
            <p className="text-sm text-gray-500">{agent.config.description}</p>
          </div>
        </div>
        <AgentStatusBadge status={agent.status} />
      </div>

      {/* Current Task */}
      {agent.currentTask && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Current Task</p>
          <p className="text-sm text-gray-700 truncate">{agent.currentTask}</p>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {agent.status === 'running' ? formatUptime(agent.metrics.uptime) : '-'}
          </p>
          <p className="text-xs text-gray-500">Uptime</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{agent.metrics.tasksCompleted}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{agent.metrics.tasksFailed}</p>
          <p className="text-xs text-gray-500">Failed</p>
        </div>
      </div>

      {/* Error display */}
      {agent.lastError && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600 font-medium mb-1">Last Error</p>
          <p className="text-sm text-red-700 truncate">{agent.lastError}</p>
        </div>
      )}

      {/* Controls */}
      <AgentControls
        status={agent.status}
        onAction={onAction}
      />

      {/* Features */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex flex-wrap gap-2">
          {agent.config.features.autonomousMode && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
              Autonomous
            </span>
          )}
          {agent.config.features.gitIntegration && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              Git
            </span>
          )}
          {agent.config.features.mcpSupport && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
              MCP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
