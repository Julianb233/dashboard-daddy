'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AgentStreamClient,
  ConnectionState,
  AgentMessage,
  LogEntry,
  createLogEntry,
} from '@/lib/streaming';

export interface UseAgentStreamOptions {
  agentId: string;
  autoConnect?: boolean;
  maxLogEntries?: number;
  onMessage?: (message: AgentMessage) => void;
  onError?: (error: Event) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseAgentStreamReturn {
  // Connection state
  connectionState: ConnectionState;
  isConnected: boolean;
  isPaused: boolean;

  // Log data
  logs: LogEntry[];
  latestMessage: AgentMessage | null;

  // Actions
  connect: () => void;
  disconnect: () => void;
  pause: () => void;
  resume: () => void;
  clearLogs: () => void;

  // Error state
  error: string | null;
}

/**
 * React hook for consuming agent SSE streams
 */
export function useAgentStream(options: UseAgentStreamOptions): UseAgentStreamReturn {
  const {
    agentId,
    autoConnect = true,
    maxLogEntries = 10000,
    onMessage,
    onError,
    onConnect,
    onDisconnect,
  } = options;

  // State
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [latestMessage, setLatestMessage] = useState<AgentMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs to keep callbacks stable
  const clientRef = useRef<AgentStreamClient | null>(null);
  const onMessageRef = useRef(onMessage);
  const onErrorRef = useRef(onError);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);

  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onErrorRef.current = onError;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
  }, [onMessage, onError, onConnect, onDisconnect]);

  // Create stream URL
  const streamUrl = `/api/agents/${encodeURIComponent(agentId)}/stream`;

  // Initialize client
  useEffect(() => {
    const client = new AgentStreamClient({
      url: streamUrl,
      onMessage: (message) => {
        setLatestMessage(message);

        // Add to logs with limit
        setLogs((prevLogs) => {
          const newLog = createLogEntry(message);
          const updatedLogs = [...prevLogs, newLog];

          // Trim old entries if exceeding max
          if (updatedLogs.length > maxLogEntries) {
            return updatedLogs.slice(-maxLogEntries);
          }

          return updatedLogs;
        });

        // Call user callback
        onMessageRef.current?.(message);
      },
      onStateChange: (state) => {
        setConnectionState(state);

        if (state === 'error') {
          setError('Connection error occurred');
        } else {
          setError(null);
        }
      },
      onConnect: () => {
        setError(null);
        onConnectRef.current?.();
      },
      onDisconnect: () => {
        onDisconnectRef.current?.();
      },
      onError: (errorEvent) => {
        setError('Stream connection error');
        onErrorRef.current?.(errorEvent);
      },
    });

    clientRef.current = client;

    // Auto-connect if enabled
    if (autoConnect) {
      client.connect();
    }

    // Cleanup on unmount
    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [streamUrl, autoConnect, maxLogEntries]);

  // Connect action
  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.connect();
    }
  }, []);

  // Disconnect action
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  // Pause action
  const pause = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  // Resume action
  const resume = useCallback(() => {
    if (clientRef.current) {
      const bufferedMessages = clientRef.current.resume();
      setIsPaused(false);

      // Process buffered messages
      if (bufferedMessages.length > 0) {
        setLogs((prevLogs) => {
          const newLogs = bufferedMessages.map(createLogEntry);
          const updatedLogs = [...prevLogs, ...newLogs];

          if (updatedLogs.length > maxLogEntries) {
            return updatedLogs.slice(-maxLogEntries);
          }

          return updatedLogs;
        });

        // Update latest message
        setLatestMessage(bufferedMessages[bufferedMessages.length - 1]);
      }
    }
  }, [maxLogEntries]);

  // Clear logs action
  const clearLogs = useCallback(() => {
    setLogs([]);
    setLatestMessage(null);
  }, []);

  return {
    // Connection state
    connectionState,
    isConnected: connectionState === 'connected',
    isPaused,

    // Log data
    logs,
    latestMessage,

    // Actions
    connect,
    disconnect,
    pause,
    resume,
    clearLogs,

    // Error state
    error,
  };
}

export default useAgentStream;
