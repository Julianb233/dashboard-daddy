'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgentWithStatus, AgentsListResponse } from '@/types/agent-api';
import type { Agent, AgentStatus as UIAgentStatus, AgentType } from '@/types/agent';

export interface UseAgentsOptions {
  pollInterval?: number;
  maxRetries?: number;
}

export interface UseAgentsReturn {
  agents: Agent[];
  rawAgents: AgentWithStatus[];
  isLoading: boolean;
  error: string | null;
  isError: boolean;
  consecutiveErrors: number;
  refetch: () => Promise<void>;
}

// Map API status to UI status
function mapStatus(apiStatus: AgentWithStatus['status']): UIAgentStatus {
  switch (apiStatus) {
    case 'running':
      return 'running';
    case 'starting':
      return 'busy';
    case 'stopping':
      return 'busy';
    case 'stopped':
      return 'idle';
    case 'error':
      return 'error';
    default:
      return 'offline';
  }
}

// Derive agent type from ID
function getAgentType(id: string): AgentType {
  if (id.includes('claude')) return 'claude-code';
  if (id.includes('gemini')) return 'gemini-cli';
  if (id.includes('openai') || id.includes('codex')) return 'openai-codex';
  if (id.includes('kanban')) return 'vibe-kanban';
  if (id.includes('scim')) return 'scim-bridge';
  if (id.includes('redis')) return 'redis';
  return 'claude-code'; // default
}

// Map API agent to UI agent type
function mapAgentToUI(agent: AgentWithStatus): Agent {
  const now = new Date().toISOString();

  return {
    id: agent.id,
    name: agent.name,
    type: getAgentType(agent.id),
    status: mapStatus(agent.status),
    currentTask: agent.currentJobId ? {
      id: agent.currentJobId,
      name: `Job ${agent.currentJobId.slice(0, 8)}`,
      startedAt: agent.startedAt || now,
    } : undefined,
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      memoryMB: 0,
      uptime: agent.startedAt
        ? Math.floor((Date.now() - new Date(agent.startedAt).getTime()) / 1000)
        : 0,
    },
    lastSeen: agent.startedAt || now,
    tasksCompleted: 0,
    errorCount: agent.lastError ? 1 : 0,
  };
}

/**
 * Hook for fetching and polling agents from the API
 * Implements 5s polling with exponential backoff on errors
 */
export function useAgents(options: UseAgentsOptions = {}): UseAgentsReturn {
  const {
    pollInterval = 5000,
    maxRetries = 3,
  } = options;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [rawAgents, setRawAgents] = useState<AgentWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  const mountedRef = useRef(true);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAgents = useCallback(async () => {
    try {
      const response = await fetch('/api/agents');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: AgentsListResponse = await response.json();

      if (!mountedRef.current) return;

      // Map API agents to UI format
      const uiAgents = data.agents.map(mapAgentToUI);

      setRawAgents(data.agents);
      setAgents(uiAgents);
      setError(null);
      setConsecutiveErrors(0);
      setIsLoading(false);
    } catch (err) {
      if (!mountedRef.current) return;

      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agents';

      setConsecutiveErrors(prev => {
        const newCount = prev + 1;
        // Only show error after maxRetries consecutive failures
        if (newCount >= maxRetries) {
          setError(errorMessage);
        }
        return newCount;
      });

      setIsLoading(false);
    }
  }, [maxRetries]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setConsecutiveErrors(0);
    await fetchAgents();
  }, [fetchAgents]);

  // Start polling
  useEffect(() => {
    mountedRef.current = true;

    const poll = () => {
      fetchAgents();

      // Calculate next poll delay with backoff if there are errors
      const delay = consecutiveErrors > 0
        ? Math.min(pollInterval * Math.pow(2, consecutiveErrors), 30000)
        : pollInterval;

      pollTimeoutRef.current = setTimeout(poll, delay);
    };

    // Initial fetch
    fetchAgents();

    // Start polling after initial fetch
    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchAgents, pollInterval, consecutiveErrors]);

  return {
    agents,
    rawAgents,
    isLoading,
    error,
    isError: error !== null,
    consecutiveErrors,
    refetch,
  };
}

export default useAgents;
