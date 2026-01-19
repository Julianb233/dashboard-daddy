'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAgentStream } from '@/hooks/useAgentStream';
import { LogEntry, filterLogsByLevel, searchLogs, exportLogsToFile, exportLogsAsJson } from '@/lib/streaming';

interface AgentLogsProps {
  agentId: string;
  className?: string;
  maxLogs?: number;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

// Log level badge component
function LogLevelBadge({ level }: { level: LogLevel }) {
  const config = {
    info: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
    warn: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    error: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
    debug: { bg: 'bg-gray-500/20', text: 'text-gray-400', border: 'border-gray-500/30' },
  };

  const { bg, text, border } = config[level];

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded border ${bg} ${text} ${border}`}>
      {level.toUpperCase()}
    </span>
  );
}

// Format timestamp for display
function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
}

// Format full timestamp for tooltip
function formatFullTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
}

// Single log entry row
function LogRow({ log }: { log: LogEntry }) {
  const level = log.level || 'info';

  return (
    <div className="flex items-start gap-3 px-4 py-2 hover:bg-gray-800/50 transition-colors border-b border-gray-800 last:border-b-0">
      {/* Timestamp */}
      <span
        className="text-xs text-gray-500 font-mono whitespace-nowrap pt-0.5"
        title={formatFullTimestamp(log.timestamp)}
      >
        {formatTimestamp(log.timestamp)}
      </span>

      {/* Level badge */}
      <div className="pt-0.5">
        <LogLevelBadge level={level} />
      </div>

      {/* Message */}
      <span className="flex-1 text-sm text-gray-200 font-mono break-all">
        {/* Strip ANSI codes for log view */}
        {log.data.replace(/\x1b\[[0-9;]*m/g, '')}
      </span>
    </div>
  );
}

// Filter toggle button
function FilterButton({
  level,
  active,
  count,
  onClick,
}: {
  level: LogLevel;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  const config = {
    info: { activeColor: 'bg-blue-600', hoverColor: 'hover:bg-blue-600/50' },
    warn: { activeColor: 'bg-yellow-600', hoverColor: 'hover:bg-yellow-600/50' },
    error: { activeColor: 'bg-red-600', hoverColor: 'hover:bg-red-600/50' },
    debug: { activeColor: 'bg-gray-600', hoverColor: 'hover:bg-gray-600/50' },
  };

  const { activeColor, hoverColor } = config[level];

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${
        active
          ? `${activeColor} text-white`
          : `bg-gray-700/50 text-gray-400 ${hoverColor}`
      }`}
    >
      {level.charAt(0).toUpperCase() + level.slice(1)}
      <span className={`${active ? 'bg-white/20' : 'bg-gray-600'} px-1.5 py-0.5 rounded text-xs`}>
        {count}
      </span>
    </button>
  );
}

export default function AgentLogs({
  agentId,
  className = '',
  maxLogs = 10000,
}: AgentLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(
    new Set(['info', 'warn', 'error', 'debug'])
  );
  const [showExportMenu, setShowExportMenu] = useState(false);

  const {
    connectionState,
    isConnected,
    logs,
    connect,
    disconnect,
    clearLogs,
  } = useAgentStream({
    agentId,
    autoConnect: true,
    maxLogEntries: maxLogs,
  });

  // Count logs by level
  const logCounts = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        const level = log.level || 'info';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      { info: 0, warn: 0, error: 0, debug: 0 } as Record<LogLevel, number>
    );
  }, [logs]);

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    let result = filterLogsByLevel(logs, activeFilters);
    result = searchLogs(result, searchQuery);
    return result;
  }, [logs, activeFilters, searchQuery]);

  // Toggle filter
  const toggleFilter = useCallback((level: LogLevel) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(level)) {
        next.delete(level);
      } else {
        next.add(level);
      }
      return next;
    });
  }, []);

  // Export handlers
  const handleExportText = useCallback(() => {
    exportLogsToFile(filteredLogs, `agent-${agentId}-logs.txt`);
    setShowExportMenu(false);
  }, [filteredLogs, agentId]);

  const handleExportJson = useCallback(() => {
    exportLogsAsJson(filteredLogs, `agent-${agentId}-logs.json`);
    setShowExportMenu(false);
  }, [filteredLogs, agentId]);

  // Connection status color
  const connectionColor = {
    connected: 'text-green-400',
    connecting: 'text-yellow-400',
    disconnected: 'text-gray-400',
    error: 'text-red-400',
  }[connectionState];

  return (
    <div className={`flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">Agent Logs</h3>
            <span className={`text-sm ${connectionColor}`}>
              {connectionState === 'connected' ? 'Live' : connectionState}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Export dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-1 py-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10">
                  <button
                    onClick={handleExportText}
                    className="w-full px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-700"
                  >
                    Export as Text
                  </button>
                  <button
                    onClick={handleExportJson}
                    className="w-full px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-700"
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={clearLogs}
              className="px-3 py-1.5 text-xs font-medium bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Clear
            </button>

            <button
              onClick={isConnected ? disconnect : connect}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                isConnected
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Filters and search */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FilterButton
              level="info"
              active={activeFilters.has('info')}
              count={logCounts.info}
              onClick={() => toggleFilter('info')}
            />
            <FilterButton
              level="warn"
              active={activeFilters.has('warn')}
              count={logCounts.warn}
              onClick={() => toggleFilter('warn')}
            />
            <FilterButton
              level="error"
              active={activeFilters.has('error')}
              count={logCounts.error}
              onClick={() => toggleFilter('error')}
            />
            <FilterButton
              level="debug"
              active={activeFilters.has('debug')}
              count={logCounts.debug}
              onClick={() => toggleFilter('debug')}
            />
          </div>

          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 text-sm bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
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
        </div>
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-auto">
        {filteredLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            {logs.length === 0
              ? isConnected
                ? 'Waiting for logs...'
                : 'Not connected'
              : 'No logs match your filters'}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filteredLogs.map((log) => (
              <LogRow key={log.id} log={log} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800 border-t border-gray-700 text-xs text-gray-400">
        <div className="flex items-center justify-between">
          <span>
            Showing {filteredLogs.length} of {logs.length} logs
          </span>
          <span>
            Agent: {agentId}
          </span>
        </div>
      </div>
    </div>
  );
}
