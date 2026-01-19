'use client';

import { useEffect, useRef, useMemo, useCallback, useState } from 'react';
import { useAgentStream, AgentMessage, ConnectionStatus } from '@/hooks/use-agent-stream';
import { cn } from '@/lib/utils';

interface AgentTerminalProps {
  agentId: string;
  className?: string;
  maxLines?: number;
}

// ANSI escape code regex pattern
const ANSI_REGEX = /\x1b\[[0-9;]*m/g;

// Map ANSI color codes to Tailwind-compatible CSS colors
const ANSI_COLOR_MAP: Record<string, string> = {
  '30': '#1e1e1e',  // black
  '31': '#f87171',  // red
  '32': '#4ade80',  // green
  '33': '#fbbf24',  // yellow
  '34': '#60a5fa',  // blue
  '35': '#c084fc',  // magenta
  '36': '#22d3ee',  // cyan
  '37': '#e5e5e5',  // white
  '90': '#6b7280',  // bright black (gray)
  '91': '#fca5a5',  // bright red
  '92': '#86efac',  // bright green
  '93': '#fde047',  // bright yellow
  '94': '#93c5fd',  // bright blue
  '95': '#d8b4fe',  // bright magenta
  '96': '#67e8f9',  // bright cyan
  '97': '#ffffff',  // bright white
};

interface TextSegment {
  text: string;
  color?: string;
  bold?: boolean;
}

/**
 * Parse ANSI escape codes and convert to styled segments
 */
function parseAnsiText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let currentColor: string | undefined;
  let isBold = false;
  let lastIndex = 0;

  const regex = /\x1b\[([0-9;]*)m/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before this escape code
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        color: currentColor,
        bold: isBold,
      });
    }

    // Parse the escape code
    const codes = match[1].split(';').filter(Boolean);

    for (const code of codes) {
      if (code === '0') {
        // Reset
        currentColor = undefined;
        isBold = false;
      } else if (code === '1') {
        // Bold
        isBold = true;
      } else if (ANSI_COLOR_MAP[code]) {
        // Color code
        currentColor = ANSI_COLOR_MAP[code];
      }
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      color: currentColor,
      bold: isBold,
    });
  }

  return segments.length > 0 ? segments : [{ text }];
}

/**
 * Strip ANSI codes from text (fallback)
 */
function stripAnsi(text: string): string {
  return text.replace(ANSI_REGEX, '');
}

// Connection status indicator component
function ConnectionIndicator({ status }: { status: ConnectionStatus }) {
  const config = {
    connected: {
      color: 'bg-green-500',
      pulse: false,
      text: 'Connected',
    },
    connecting: {
      color: 'bg-yellow-500',
      pulse: true,
      text: 'Connecting...',
    },
    disconnected: {
      color: 'bg-gray-500',
      pulse: false,
      text: 'Disconnected',
    },
    error: {
      color: 'bg-red-500',
      pulse: false,
      text: 'Error',
    },
  };

  const { color, pulse, text } = config[status];

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          color,
          pulse && 'animate-pulse'
        )}
      />
      <span className="text-xs text-gray-400">{text}</span>
    </div>
  );
}

// Single terminal line with ANSI color support
function TerminalLine({ message }: { message: AgentMessage }) {
  const segments = useMemo(() => parseAnsiText(message.data), [message.data]);

  // Determine line style based on message type
  const lineClasses = cn(
    'font-mono text-sm leading-relaxed px-3 py-0.5 hover:bg-white/5 transition-colors',
    message.type === 'stderr' && 'bg-red-500/10',
    message.type === 'system' && 'text-blue-400 italic',
    message.type === 'error' && 'bg-red-500/20 text-red-400'
  );

  return (
    <div className={lineClasses}>
      <span className="text-gray-600 text-xs mr-3 select-none">
        {new Date(message.timestamp).toLocaleTimeString()}
      </span>
      {segments.map((segment, idx) => (
        <span
          key={idx}
          style={{ color: segment.color }}
          className={cn(
            'whitespace-pre-wrap break-all',
            segment.bold && 'font-bold',
            !segment.color && 'text-gray-200'
          )}
        >
          {segment.text}
        </span>
      ))}
    </div>
  );
}

/**
 * Terminal-like output display component
 * Dark background, monospace font, ANSI color support
 */
export default function AgentTerminal({
  agentId,
  className = '',
  maxLines = 1000,
}: AgentTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const {
    messages,
    connectionStatus,
    isConnected,
    error,
    connect,
    disconnect,
    clearMessages,
  } = useAgentStream({
    agentId,
    autoConnect: true,
    maxMessages: maxLines,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (shouldAutoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, shouldAutoScroll]);

  // Handle scroll to detect if user has scrolled up
  const handleScroll = useCallback(() => {
    if (!terminalRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setShouldAutoScroll(isAtBottom);
  }, []);

  // Scroll to bottom manually
  const scrollToBottom = useCallback(() => {
    setShouldAutoScroll(true);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Toggle connection
  const handleToggleConnection = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  return (
    <div
      className={cn(
        'flex flex-col h-full rounded-lg overflow-hidden border border-gray-800',
        'bg-[#0d1117] dark:bg-[#0d1117]',
        className
      )}
    >
      {/* Terminal header / toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-gray-800">
        <div className="flex items-center gap-4">
          {/* macOS-style window controls (decorative) */}
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f56]" />
            <div className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
            <div className="h-3 w-3 rounded-full bg-[#27c93f]" />
          </div>

          <span className="text-sm font-medium text-gray-300">
            Agent Terminal
          </span>

          <ConnectionIndicator status={connectionStatus} />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearMessages}
            className="px-3 py-1 text-xs font-medium rounded transition-colors bg-gray-700 hover:bg-gray-600 text-gray-200"
          >
            Clear
          </button>

          <button
            onClick={handleToggleConnection}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded transition-colors',
              isConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            )}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-4 py-2 bg-red-900/30 border-b border-red-800 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Terminal output area */}
      <div
        ref={terminalRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto font-mono text-sm text-gray-200 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {isConnected ? 'Waiting for output...' : 'Not connected'}
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <TerminalLine key={`${message.timestamp}-${index}`} message={message} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#161b22] border-t border-gray-800 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>Lines: {messages.length}</span>
          {messages.length >= maxLines && (
            <span className="text-yellow-500">Buffer full (oldest lines removed)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!shouldAutoScroll && messages.length > 0 && (
            <button
              onClick={scrollToBottom}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Scroll to bottom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { AgentTerminal, stripAnsi, parseAnsiText };
