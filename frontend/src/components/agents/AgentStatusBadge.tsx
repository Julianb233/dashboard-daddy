import { AgentStatus } from '@/types/agent'

interface AgentStatusBadgeProps {
  status: AgentStatus;
  showPulse?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  running: {
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-100',
    label: 'Running',
    pulse: true,
  },
  idle: {
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-100',
    label: 'Idle',
    pulse: false,
  },
  stopped: {
    color: 'bg-gray-400',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-100',
    label: 'Stopped',
    pulse: false,
  },
  error: {
    color: 'bg-red-500',
    textColor: 'text-red-700',
    bgColor: 'bg-red-100',
    label: 'Error',
    pulse: true,
  },
  offline: {
    color: 'bg-gray-400',
    textColor: 'text-gray-500',
    bgColor: 'bg-gray-100',
    label: 'Offline',
    pulse: false,
  },
};

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export function AgentStatusBadge({
  status,
  showPulse = true,
  size = 'md'
}: AgentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`
      inline-flex items-center gap-1.5 rounded-full font-medium
      ${config.bgColor} ${config.textColor} ${sizeConfig[size]}
    `}>
      <span className="relative flex h-2 w-2">
        {showPulse && config.pulse && (
          <span className={`
            animate-ping absolute inline-flex h-full w-full rounded-full opacity-75
            ${config.color}
          `} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`} />
      </span>
      {config.label}
    </span>
  );
}
