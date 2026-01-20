'use client';

import { formatDistanceToNow, formatUptime } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Agent, AgentType, AgentStatus } from '@/types/agent';
import {
  Play,
  Square,
  RotateCcw,
  FileText,
  Bot,
  Sparkles,
  Cpu,
  Database,
  Key,
  LayoutGrid,
} from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  onStart?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
  onRestart?: (agentId: string) => void;
  onViewLogs?: (agentId: string) => void;
  className?: string;
}

const agentTypeConfig: Record<AgentType, { icon: React.ElementType; gradient: string; label: string }> = {
  'claude-code': {
    icon: Bot,
    gradient: 'from-orange-500 to-amber-500',
    label: 'Claude Code',
  },
  'gemini-cli': {
    icon: Sparkles,
    gradient: 'from-blue-500 to-cyan-500',
    label: 'Gemini CLI',
  },
  'openai-codex': {
    icon: Cpu,
    gradient: 'from-emerald-500 to-teal-500',
    label: 'OpenAI Codex',
  },
  'vibe-kanban': {
    icon: LayoutGrid,
    gradient: 'from-purple-500 to-pink-500',
    label: 'Vibe Kanban',
  },
  'scim-bridge': {
    icon: Key,
    gradient: 'from-slate-500 to-slate-600',
    label: 'SCIM Bridge',
  },
  'redis': {
    icon: Database,
    gradient: 'from-red-500 to-red-600',
    label: 'Redis',
  },
};

const statusConfig: Record<AgentStatus, { color: string; dotColor: string; label: string }> = {
  online: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500',
    label: 'Online',
  },
  running: {
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dotColor: 'bg-green-500 animate-pulse',
    label: 'Running',
  },
  busy: {
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dotColor: 'bg-blue-500 animate-pulse',
    label: 'Busy',
  },
  idle: {
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    dotColor: 'bg-yellow-500',
    label: 'Idle',
  },
  offline: {
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
    dotColor: 'bg-gray-400',
    label: 'Offline',
  },
  error: {
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dotColor: 'bg-red-500',
    label: 'Error',
  },
};

export function AgentCard({
  agent,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
  className,
}: AgentCardProps) {
  const { icon: TypeIcon, gradient, label: typeLabel } = agentTypeConfig[agent.type];
  const { color: statusColor, dotColor, label: statusLabel } = statusConfig[agent.status];

  const isBusy = agent.status === 'busy';
  const isOffline = agent.status === 'offline';

  const handleStart = () => onStart?.(agent.id);
  const handleStop = () => onStop?.(agent.id);
  const handleRestart = () => onRestart?.(agent.id);
  const handleViewLogs = () => onViewLogs?.(agent.id);

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="pb-3">
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
                {typeLabel}
              </span>
            </div>
          </div>
          <Badge variant="secondary" className={cn('flex items-center gap-1.5', statusColor)}>
            <span className={cn('h-2 w-2 rounded-full', dotColor)} />
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Task */}
        <div className="min-h-[52px]">
          {isBusy && agent.currentTask ? (
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground mb-1">Current Task</p>
              <p className="text-sm font-medium line-clamp-1">{agent.currentTask.name}</p>
              {agent.currentTask.progress !== undefined && (
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>{agent.currentTask.progress}%</span>
                  </div>
                  <Progress value={agent.currentTask.progress} className="h-1.5" />
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-muted/30 p-3">
              <p className="text-sm text-muted-foreground">
                {isOffline ? 'Agent is offline' : 'No active task'}
              </p>
            </div>
          )}
        </div>

        {/* Resource Usage */}
        {!isOffline && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">CPU</span>
                <span className="font-medium">{agent.metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <Progress
                value={agent.metrics.cpuUsage}
                className={cn(
                  'h-1.5',
                  agent.metrics.cpuUsage > 80 && '[&>div]:bg-red-500'
                )}
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Memory</span>
                <span className="font-medium">{agent.metrics.memoryMB}MB</span>
              </div>
              <Progress
                value={agent.metrics.memoryUsage}
                className={cn(
                  'h-1.5',
                  agent.metrics.memoryUsage > 80 && '[&>div]:bg-red-500'
                )}
              />
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t">
          <div className="flex items-center gap-4">
            <span>Tasks: <span className="font-medium text-foreground">{agent.tasksCompleted}</span></span>
            {agent.errorCount > 0 && (
              <span className="text-red-500">Errors: {agent.errorCount}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isOffline && (
              <span>Uptime: <span className="font-medium text-foreground">{formatUptime(agent.metrics.uptime)}</span></span>
            )}
          </div>
        </div>

        {/* Last Seen */}
        <div className="text-xs text-muted-foreground">
          Last seen: {formatDistanceToNow(agent.lastSeen)}
        </div>
      </CardContent>

      <CardFooter className="gap-2 border-t pt-4">
        {isOffline ? (
          <Button
            variant="default"
            size="sm"
            onClick={handleStart}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-1" />
            Start
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Restart
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStop}
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-1" />
              Stop
            </Button>
          </>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewLogs}
        >
          <FileText className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AgentCard;
