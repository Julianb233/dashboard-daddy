'use client'

import { useState } from 'react'
import { AgentStatus, AgentAction } from '@/types/agent'

interface AgentControlsProps {
  status: AgentStatus;
  onAction?: (action: AgentAction) => void;
  disabled?: boolean;
}

export function AgentControls({ status, onAction, disabled }: AgentControlsProps) {
  const [loading, setLoading] = useState<AgentAction | null>(null);

  const handleAction = async (action: AgentAction) => {
    if (disabled || loading) return;

    setLoading(action);
    try {
      await onAction?.(action);
    } finally {
      setLoading(null);
    }
  };

  const canStart = status === 'stopped' || status === 'error';
  const canStop = status === 'running' || status === 'idle';
  const canRestart = status === 'running' || status === 'idle';

  return (
    <div className="flex gap-2">
      {/* Start Button */}
      <button
        onClick={() => handleAction('start')}
        disabled={!canStart || disabled || loading !== null}
        className={`
          flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-colors
          ${canStart && !disabled
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {loading === 'start' ? (
          <Spinner />
        ) : (
          <PlayIcon />
        )}
        Start
      </button>

      {/* Stop Button */}
      <button
        onClick={() => handleAction('stop')}
        disabled={!canStop || disabled || loading !== null}
        className={`
          flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-colors
          ${canStop && !disabled
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {loading === 'stop' ? (
          <Spinner />
        ) : (
          <StopIcon />
        )}
        Stop
      </button>

      {/* Restart Button */}
      <button
        onClick={() => handleAction('restart')}
        disabled={!canRestart || disabled || loading !== null}
        className={`
          flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg
          font-medium text-sm transition-colors
          ${canRestart && !disabled
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
      >
        {loading === 'restart' ? (
          <Spinner />
        ) : (
          <RestartIcon />
        )}
        Restart
      </button>
    </div>
  );
}

// Icon components
function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}

function RestartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
