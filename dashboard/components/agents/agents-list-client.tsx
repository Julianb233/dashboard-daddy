'use client';

import { useAgents } from '@/hooks/use-agents';
import { AgentCard } from './agent-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import type { AgentStatus } from '@/types/agent';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface AgentsListClientProps {
  statusFilter?: AgentStatus;
}

export function AgentsListClient({ statusFilter }: AgentsListClientProps) {
  const router = useRouter();
  const { agents, isLoading, error, isError, refetch, consecutiveErrors } = useAgents({
    pollInterval: 5000,
    maxRetries: 3,
  });

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter agents by status
  const filteredAgents = statusFilter
    ? agents.filter(agent => agent.status === statusFilter)
    : agents;

  const handleStart = useCallback(async (agentId: string) => {
    setActionLoading(agentId);
    try {
      const response = await fetch(`/api/agents/${agentId}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start agent');
      }

      toast.success('Agent started', {
        description: `Agent ${agentId} is now running`,
      });

      // Refetch to get updated status
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start agent';
      toast.error('Failed to start agent', { description: message });
      console.error('Failed to start agent:', err);
    } finally {
      setActionLoading(null);
    }
  }, [refetch]);

  const handleStop = useCallback(async (agentId: string) => {
    setActionLoading(agentId);
    try {
      const response = await fetch(`/api/agents/${agentId}/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to stop agent');
      }

      toast.success('Agent stopped', {
        description: `Agent ${agentId} has been stopped`,
      });

      // Refetch to get updated status
      await refetch();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stop agent';
      toast.error('Failed to stop agent', { description: message });
      console.error('Failed to stop agent:', err);
    } finally {
      setActionLoading(null);
    }
  }, [refetch]);

  const handleViewLogs = useCallback((agentId: string) => {
    router.push(`/agents/${agentId}`);
  }, [router]);

  // Initial loading state
  if (isLoading && agents.length === 0) {
    return <AgentsGridSkeleton />;
  }

  // Error state after max retries
  if (isError && agents.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <div className="text-center">
              <p className="font-medium text-destructive">Failed to load agents</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={refetch} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredAgents.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <p className="text-muted-foreground text-center py-8">
            {statusFilter
              ? `No agents with status "${statusFilter}" found.`
              : 'No agents configured yet. Add agents to agents.json to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Connection status indicator */}
      {consecutiveErrors > 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Reconnecting...</span>
        </div>
      )}

      {/* Agents grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            onStart={handleStart}
            onStop={handleStop}
            onViewLogs={handleViewLogs}
            className={actionLoading === agent.id ? 'opacity-75 pointer-events-none' : ''}
          />
        ))}
      </div>
    </div>
  );
}

export function AgentStatsClient() {
  const { agents, isLoading } = useAgents({ pollInterval: 5000 });

  if (isLoading && agents.length === 0) {
    return <span className="text-muted-foreground">Loading stats...</span>;
  }

  const running = agents.filter((a) => a.status === 'running' || a.status === 'busy').length;
  const idle = agents.filter((a) => a.status === 'idle' || a.status === 'online').length;
  const offline = agents.filter((a) => a.status === 'offline' || a.status === 'error').length;

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
          {running} Running
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
          {idle} Idle
        </Badge>
      </div>
      {offline > 0 && (
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0">
            {offline} Offline
          </Badge>
        </div>
      )}
      <span className="text-muted-foreground">
        {agents.length} total agents
      </span>
    </>
  );
}

function AgentsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border bg-card shadow-sm p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <div className="h-5 w-24 bg-muted rounded mb-2" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default AgentsListClient;
