'use client';

import { useState, use } from 'react';
import AgentTerminal from '@/components/agents/agent-terminal';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

// Mock agent data - in production this would come from an API
const mockAgents: Record<string, {
  name: string;
  status: 'running' | 'stopped' | 'error' | 'starting';
  type: 'assistant' | 'worker' | 'orchestrator' | 'monitor';
  description: string;
  config: Record<string, string | number | boolean>;
}> = {
  'agent-1': {
    name: 'Code Assistant',
    status: 'running',
    type: 'assistant',
    description: 'AI-powered coding assistant for development tasks',
    config: {
      model: 'claude-3-opus',
      maxTokens: 4096,
      temperature: 0.7,
      autoRetry: true,
      timeout: 30000,
    },
  },
  'agent-2': {
    name: 'Data Processor',
    status: 'stopped',
    type: 'worker',
    description: 'Background worker for processing data pipelines',
    config: {
      batchSize: 100,
      parallelism: 4,
      retryAttempts: 3,
      logLevel: 'info',
    },
  },
  'agent-3': {
    name: 'Task Orchestrator',
    status: 'running',
    type: 'orchestrator',
    description: 'Coordinates and manages multiple agent workflows',
    config: {
      maxConcurrent: 10,
      queueSize: 1000,
      healthCheckInterval: 60000,
    },
  },
};

// Type icon mapping
const typeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  assistant: Bot,
  worker: Cpu,
  orchestrator: Workflow,
  monitor: CircleDot,
};

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
};

interface AgentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id: agentId } = use(params);
  const [configOpen, setConfigOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get agent data (mock for now)
  const agent = mockAgents[agentId] || {
    name: `Agent ${agentId}`,
    status: 'stopped' as const,
    type: 'worker' as const,
    description: 'No description available',
    config: {},
  };

  const TypeIcon = typeIcons[agent.type] || Bot;
  const status = statusStyles[agent.status] || statusStyles.stopped;

  // Handle agent control actions
  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    setActionLoading(action);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would call an API endpoint
    console.log(`Agent ${agentId}: ${action}`);

    setActionLoading(null);
  };

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
                </div>
                <p className="text-muted-foreground">{agent.description}</p>
                <p className="text-sm text-muted-foreground">
                  Type: <span className="font-medium capitalize">{agent.type}</span>
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
                disabled={agent.status === 'running' || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'start' ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Start
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('stop')}
                disabled={agent.status === 'stopped' || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'stop' ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                Stop
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('restart')}
                disabled={agent.status === 'stopped' || actionLoading !== null}
                className="gap-2"
              >
                {actionLoading === 'restart' ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCw className="h-4 w-4" />
                )}
                Restart
              </Button>
            </div>
          </div>
        </div>
      </div>

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
                Agent settings and parameters
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
              {Object.entries(agent.config).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border bg-muted/30 p-3 space-y-1"
                >
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <div className="font-mono text-sm">
                    {typeof value === 'boolean' ? (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          value
                            ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                            : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                        )}
                      >
                        {value ? 'Enabled' : 'Disabled'}
                      </span>
                    ) : (
                      <code className="text-foreground">{String(value)}</code>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              <Button variant="outline" size="sm">
                Reset to Defaults
              </Button>
              <Button size="sm">Save Changes</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
