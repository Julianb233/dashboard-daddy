'use client';

import { cn } from '@/lib/utils';
import type { AgentStatus } from '@/types/agent';

interface AgentStatusBadgeProps {
  status: AgentStatus;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const statusConfig: Record<AgentStatus, { label: string; dotClass: string; bgClass: string }> = {
  online: {
    label: 'Online',
    dotClass: 'bg-green-500',
    bgClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  busy: {
    label: 'Busy',
    dotClass: 'bg-amber-500 animate-pulse',
    bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  running: {
    label: 'Running',
    dotClass: 'bg-blue-500 animate-pulse',
    bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  idle: {
    label: 'Idle',
    dotClass: 'bg-gray-400 dark:bg-gray-500',
    bgClass: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  offline: {
    label: 'Offline',
    dotClass: 'bg-gray-300 dark:bg-gray-600',
    bgClass: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
  },
};

const sizeConfig = {
  sm: {
    dot: 'h-1.5 w-1.5',
    badge: 'px-1.5 py-0.5 text-xs gap-1',
  },
  md: {
    dot: 'h-2 w-2',
    badge: 'px-2 py-1 text-xs gap-1.5',
  },
  lg: {
    dot: 'h-2.5 w-2.5',
    badge: 'px-2.5 py-1 text-sm gap-2',
  },
};

export function AgentStatusBadge({
  status,
  size = 'md',
  showLabel = true,
  className,
}: AgentStatusBadgeProps) {
  const { label, dotClass, bgClass } = statusConfig[status];
  const { dot, badge } = sizeConfig[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        badge,
        showLabel ? bgClass : '',
        className
      )}
    >
      <span className={cn('rounded-full', dot, dotClass)} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}

export function AgentStatusDot({
  status,
  size = 'md',
  className,
}: Omit<AgentStatusBadgeProps, 'showLabel'>) {
  const { dotClass } = statusConfig[status];
  const { dot } = sizeConfig[size];

  return <span className={cn('rounded-full', dot, dotClass, className)} />;
}
