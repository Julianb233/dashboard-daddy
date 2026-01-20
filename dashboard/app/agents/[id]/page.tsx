'use client';

import { useState, useEffect, useCallback, use } from 'react';
import AgentTerminal from '@/components/agents/agent-terminal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  Play,
  Square,
  RotateCw,
  Settings,
  ChevronDown,
  ChevronUp,
  Bot,
  Cpu,
  Workflow,
  CircleDot,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AgentWithStatus, AgentDetailResponse, ApiErrorResponse } from '@/types/agent-api';

// Type icon mapping based on agent id
function getTypeIcon(agentId: string): React.ComponentType<{ className?: string }> {
  if (agentId.includes('claude')) return Bot;
  if (agentId.includes('gemini')) return Cpu;
  if (agentId.includes('codex') || agentId.includes('openai')) return Workflow;
  return CircleDot;
}

// Status badge styles
const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  running: {
    bg: 'bg-green-500/10 dark:bg-green-500/20',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
  },
  stopped: {
    bg: 'bg-gray-500/10 dark:bg-gray-500/20',
    text: 'text-gray-700 dark:text-gray-400',
    dot: 'bg-gray-500',
  },
  error: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
  starting: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500 animate-pulse',
  },
  stopping: {
    bg: 'bg-orange-500/10 dark:bg-orange-500/20',
    text: 'text-orange-700 dark:text-orange-400',
    dot: 'bg-orange-500 animate-pulse',
  },
};

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id: agentId } = use(params);
  const [agent, setAgent] = useState<AgentWithStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configOpen, setConfigOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch agent data
  const fetchAgent = useCallback(async () => {
    try {
      const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}`);

      if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data: AgentDetailResponse = await response.json();
      setAgent(data.agent);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch agent');
    } finally {
      setIsLoading(false);
    }
  }, [agentId]);

  // Initial fetch and polling
  useEffect(() => {
    fetchAgent();

    // Poll for status updates every 3 seconds
    const interval = setInterval(fetchAgent, 3000);
    return () => clearInterval(interval);
  }, [fetchAgent]);

  // Handle agent control actions
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!agent) return;

    setActionLoading(action);

    try {
      if (action === 'restart') {
        // Restart = stop then start
        await fetch(`/api/agents/${encodeURIComponent(agentId)}/stop`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        // Wait a moment for the process to stop
        await new Promise(resolve => setTimeout(resolve, 1000));

        await fetch(`/api/agents/${encodeURIComponent(agentId)}/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        toast.success('Agent restarted', {
          description: `${agent.name} has been restarted`,
        });
      } else {
        const endpoint = action === 'start' ? 'start' : 'stop';
        const response = await fetch(`/api/agents/${encodeURIComponent(agentId)}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        if (!response.ok) {
          const errorData: ApiErrorResponse = await response.json();
          throw new Error(errorData.error || `Failed to ${action} agent`);
        }

        toast.success(`Agent ${action}${action === 'stop' ? 'ped' : 'ed'}`, {
          description: `${agent.name} has been ${action}${action === 'stop' ? 'ped' : 'ed'}`,
        });
      }

      // Refresh agent data
      await fetchAgent();
    } catch (err) {
      const message = err instanceof Error ? err.message : `Failed to ${action} agent`;
      toast.error(`Failed to ${action} agent`, { description: message });
      console.error(`Failed to ${action} agent:`, err);
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg border bg-card shadow-sm h-[400px]">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error && !agent) {
    return (
      <div className="container py-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <div className="text-center">
                <p className="font-medium text-destructive">Failed to load agent</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={fetchAgent} variant="outline" className="gap-2">
                <RotateCw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!agent) return null;

  const TypeIcon = getTypeIcon(agentId);
  const status = statusStyles[agent.status] || statusStyles.stopped;
  const canStart = agent.status === 'stopped' && agent.enabled;
  const canStop = agent.status === 'running' || agent.status === 'starting';

  return (
    <div className="container py-6 space-y-6">
      {/* Agent Header */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Type Icon */}
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
                <TypeIcon className="h-6 w-6 text-primary" />
              </div>

              {/* Agent Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">{agent.name}</h1>
                  {/* Status Badge */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
                      status.bg,
                      status.text
                    )}
                  >
                    <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} />
                    {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                  </span>
                  {!agent.enabled && (
                    <span className="text-xs text-muted-foreground">(Disabled)</span>
                  )}
                </div>
                <p className="text-muted-foreground">{agent.description}</p>
                <p className="text-sm text-muted-foreground">
                  Command: <code className="rounded bg-muted px-1 py-0.5 text-xs">{agent.command} {agent.args.join(' ')}</code>
                  <span className="mx-2">|</span>
                  ID: <code className="rounded bg-muted px-1 py-0.5 text-xs">{agentId}</code>
                </p>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('start')}
                disabled={!canStart || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'start' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('stop')}
                disabled={!canStop || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'stop' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Stop
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('restart')}
                disabled={!canStop || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'restart' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
                )}
                Restart
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error banner for action failures */}
      {error && agent && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-xs underline hover:no-underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Live Terminal Output Panel */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Live Output</h2>
          <p className="text-sm text-muted-foreground">
            Real-time terminal output from the agent
          </p>
        </div>
        <div className="p-4">
          <AgentTerminal agentId={agentId} className="h-[400px]" />
        </div>
      </div>

      {/* Configuration Panel (collapsed by default) */}
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <button
          onClick={() => setConfigOpen(!configOpen)}
          className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="text-lg font-semibold">Configuration</h2>
              <p className="text-sm text-muted-foreground">
                Agent settings and features
              </p>
            </div>
          </div>
          {configOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        {configOpen && (
          <div className="border-t p-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Features */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Parallel Execution
                </label>
                <div className="font-mono text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      agent.features.parallelExecution
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                    )}
                  >
                    {agent.features.parallelExecution ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Autonomous Mode
                </label>
                <div className="font-mono text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      agent.features.autonomousMode
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                    )}
                  >
                    {agent.features.autonomousMode ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Git Integration
                </label>
                <div className="font-mono text-sm">
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                      agent.features.gitIntegration
                        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                        : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                    )}
                  >
                    {agent.features.gitIntegration ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {agent.features.mcpSupport !== undefined && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    MCP Support
                  </label>
                  <div className="font-mono text-sm">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                        agent.features.mcpSupport
                          ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                          : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                      )}
                    >
                      {agent.features.mcpSupport ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              )}

              {/* Environment Variables Required */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Required Environment Variables
                </label>
                <div className="font-mono text-sm flex flex-wrap gap-2">
                  {agent.envRequired.map((env) => (
                    <code key={env} className="rounded bg-muted px-2 py-0.5 text-xs">
                      {env}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
