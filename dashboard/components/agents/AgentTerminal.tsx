'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import AnsiToHtml from 'ansi-to-html';
import { useAgentStream } from '@/hooks/useAgentStream';
import { LogEntry, searchLogs } from '@/lib/streaming';

interface AgentTerminalProps {
  agentId: string;
  className?: string;
  maxLines?: number;
}

// Create ANSI converter instance
const ansiConverter = new AnsiToHtml({
  fg: '#e5e5e5',
  bg: 'transparent',
  newline: false,
  escapeXML: true,
  stream: false,
  colors: {
    0: '#1e1e1e',  // black
    1: '#f87171',  // red
    2: '#4ade80',  // green
    3: '#fbbf24',  // yellow
    4: '#60a5fa',  // blue
    5: '#c084fc',  // magenta
    6: '#22d3ee',  // cyan
    7: '#e5e5e5',  // white
    8: '#6b7280',  // bright black (gray)
    9: '#fca5a5',  // bright red
    10: '#86efac', // bright green
    11: '#fde047', // bright yellow
    12: '#93c5fd', // bright blue
    13: '#d8b4fe', // bright magenta
    14: '#67e8f9', // bright cyan
    15: '#ffffff', // bright white
  },
});

// Connection status indicator
function ConnectionStatus({ state }: { state: string }) {
  const statusConfig = {
    connected: { color: 'bg-green-500', text: 'Connected' },
    connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
    disconnected: { color: 'bg-gray-500', text: 'Disconnected' },
    error: { color: 'bg-red-500', text: 'Error' },
  };

  const config = statusConfig[state as keyof typeof statusConfig] || statusConfig.disconnected;

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full ${config.color} ${state === 'connecting' ? 'animate-pulse' : ''}`} />
      <span className="text-xs text-gray-400">{config.text}</span>
    </div>
  );
}

// Terminal line component with ANSI support
function TerminalLine({ log, converter }: { log: LogEntry; converter: AnsiToHtml }) {
  const htmlContent = useMemo(() => {
    try {
      return converter.toHtml(log.data);
    } catch {
      return log.data;
    }
  }, [log.data, converter]);

  return (
    <div className="font-mono text-sm leading-relaxed hover:bg-white/5 px-2 py-0.5 transition-colors">
      <span
        className="whitespace-pre-wrap break-all"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}

export default function AgentTerminal({
  agentId,
  className = '',
  maxLines = 5000,
}: AgentTerminalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    connectionState,
    isConnected,
    isPaused,
    logs,
    connect,
    disconnect,
    pause,
    resume,
    clearLogs,
  } = useAgentStream({
    agentId,
    autoConnect: true,
    maxLogEntries: maxLines,
  });

  // Filter logs based on search
  const filteredLogs = useMemo(() => {
    return searchLogs(logs, searchQuery);
  }, [logs, searchQuery]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs.length, autoScroll]);

  // Handle scroll to detect if user scrolled up
  const handleScroll = useCallback(() => {
    if (!terminalRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = terminalRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setAutoScroll(isAtBottom);
  }, []);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  // Toggle connection
  const toggleConnection = useCallback(() => {
    if (isConnected) {
      disconnect();
    } else {
      connect();
    }
  }, [isConnected, connect, disconnect]);

  return (
    <div className={`flex flex-col h-full bg-[#1e1e1e] rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700">
        <div className="flex items-center gap-4">
          {/* Window controls (decorative) */}
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>

          <span className="text-sm text-gray-300 font-medium">
            Agent Terminal - {agentId}
          </span>

          <ConnectionStatus state={connectionState} />
        </div>

        <div className="flex items-center gap-2">
          {/* Search input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 px-3 py-1 text-sm bg-[#3d3d3d] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
              >
                x
              </button>
            )}
          </div>

          {/* Action buttons */}
          <button
            onClick={togglePause}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              isPaused
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-yellow-600 hover:bg-yellow-700 text-white'
            }`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>

          <button
            onClick={clearLogs}
            className="px-3 py-1 text-xs font-medium bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
          >
            Clear
          </button>

          <button
            onClick={toggleConnection}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              isConnected
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Terminal content */}
      <div
        ref={terminalRef}
        onScroll={handleScroll}
        className="flex-1 overflow-auto p-2 font-mono text-sm text-gray-200 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
      >
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {searchQuery
              ? 'No matching logs found'
              : isConnected
              ? 'Waiting for output...'
              : 'Not connected'}
          </div>
        ) : (
          <>
            {filteredLogs.map((log) => (
              <TerminalLine key={log.id} log={log} converter={ansiConverter} />
            ))}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#2d2d2d] border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>Lines: {filteredLogs.length}</span>
          {searchQuery && <span>Filtered from {logs.length}</span>}
          {isPaused && <span className="text-yellow-500">Paused</span>}
        </div>

        <div className="flex items-center gap-2">
          {!autoScroll && (
            <button
              onClick={() => {
                setAutoScroll(true);
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Scroll to bottom
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
