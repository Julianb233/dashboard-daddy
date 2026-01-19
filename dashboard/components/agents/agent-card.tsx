'use client';

import { formatDistanceToNow } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AgentStatusBadge } from './agent-status-badge';
import type { Agent, AgentType } from '@/types/agent';
import {
  Play,
  Square,
  FileText,
  Bot,
  Sparkles,
  Cpu,
  LayoutGrid,
  Database,
  Link,
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onStart?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
  onViewLogs?: (agentId: string) => void;
  className?: string;
}

const agentTypeConfig: Record<AgentType, { icon: React.ElementType; gradient: string; displayName: string }> = {
  'claude-code': {
    icon: Bot,
    gradient: 'from-orange-500 to-amber-500',
    displayName: 'Claude Code',
  },
  'gemini-cli': {
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    displayName: 'Gemini CLI',
  },
  'openai-codex': {
    icon: Cpu,
    gradient: 'from-emerald-500 to-teal-500',
    displayName: 'OpenAI Codex',
  },
  'vibe-kanban': {
    icon: LayoutGrid,
    gradient: 'from-purple-500 to-pink-500',
    displayName: 'Vibe Kanban',
  },
  'scim-bridge': {
    icon: Link,
    gradient: 'from-indigo-500 to-violet-500',
    displayName: 'SCIM Bridge',
  },
  'redis': {
    icon: Database,
    gradient: 'from-red-500 to-rose-500',
    displayName: 'Redis',
  },
};

export function AgentCard({
  agent,
  onStart,
  onStop,
  onViewLogs,
  className,
}: AgentCardProps) {
  const { icon: TypeIcon, gradient, displayName } = agentTypeConfig[agent.type];
  const isActive = agent.status === 'busy' || agent.status === 'running';
  const isOffline = agent.status === 'offline';
  const hasError = agent.status === 'error';
  const canStart = agent.status === 'online' || agent.status === 'idle' || agent.status === 'error';
  const canStop = agent.status === 'busy' || agent.status === 'running';

  const handleStart = () => {
    onStart?.(agent.id);
  };

  const handleStop = () => {
    onStop?.(agent.id);
  };

  const handleViewLogs = () => {
    onViewLogs?.(agent.id);
  };

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                gradient
              )}
            >
              <TypeIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base">{agent.name}</CardTitle>
              <span className="text-xs text-muted-foreground">
                {displayName}
              </span>
            </div>
          </div>
          <AgentStatusBadge status={agent.status} size="sm" />
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        {/* Current Task */}
        <div className="mb-4 min-h-[40px]">
          {isActive && agent.currentTask ? (
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground mb-1">Current Task</p>
              <p className="text-sm line-clamp-2">{agent.currentTask.name}</p>
              {agent.currentTask.progress !== undefined && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all"
                      style={{ width: `${agent.currentTask.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {agent.currentTask.progress}% complete
                  </p>
                </div>
              )}
            </div>
          ) : hasError ? (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-2">
              <p className="text-sm text-red-700 dark:text-red-400">
                Agent encountered an error
              </p>
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 p-2">
              <p className="text-sm text-muted-foreground">
                {isOffline ? 'Agent is offline' : 'No active task'}
              </p>
            </div>
          )}
        </div>

        {/* Last Activity */}
        {agent.lastSeen && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Last seen:</span>
            <span>{formatDistanceToNow(agent.lastSeen)}</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="gap-2 border-t pt-4">
        {canStart && !canStop && (
          <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            disabled={isOffline}
            className="flex-1"
          >
            <Play className="h-4 w-4" />
            Start
          </Button>
        )}
        {canStop && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleStop}
            className="flex-1"
          >
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewLogs}
          className={cn((!canStart || canStop) && !canStop ? 'flex-1' : '')}
        >
          <FileText className="h-4 w-4" />
          Logs
        </Button>
      </CardFooter>
    </Card>
  );
}
