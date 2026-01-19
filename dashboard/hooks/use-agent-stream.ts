'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types for agent messages
export interface AgentMessage {
  type: 'stdout' | 'stderr' | 'system' | 'error';
  data: string;
  timestamp: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface UseAgentStreamOptions {
  agentId: string;
  autoConnect?: boolean;
  maxMessages?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export interface UseAgentStreamReturn {
  messages: AgentMessage[];
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  error: string | null;
  connect: () => void;
  disconnect: () => void;
  clearMessages: () => void;
}

/**
 * Custom hook for managing SSE connection to agent stream
 * Handles connection, reconnection, message parsing, and state management
 */
export function useAgentStream(options: UseAgentStreamOptions): UseAgentStreamReturn {
  const {
    agentId,
    autoConnect = true,
    maxMessages = 1000,
    reconnectDelay = 2000,
    maxReconnectAttempts = 5,
  } = options;

  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Stream URL
  const streamUrl = `/api/agents/${encodeURIComponent(agentId)}/stream`;

  // Clear any pending reconnect timeout
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Disconnect from the stream
  const disconnect = useCallback(() => {
    clearReconnectTimeout();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    if (mountedRef.current) {
      setConnectionStatus('disconnected');
    }

    reconnectAttemptsRef.current = 0;
  }, [clearReconnectTimeout]);

  // Connect to the stream
  const connect = useCallback(() => {
    // Don't connect if already connected or connecting
    if (eventSourceRef.current) {
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setConnectionStatus('connecting');
    setError(null);

    try {
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      // Handle connection open
      eventSource.onopen = () => {
        if (!mountedRef.current) return;

        reconnectAttemptsRef.current = 0;
        setConnectionStatus('connected');
        setError(null);
      };

      // Handle incoming messages
      eventSource.onmessage = (event: MessageEvent) => {
        if (!mountedRef.current) return;

        try {
          const message: AgentMessage = JSON.parse(event.data);

          setMessages((prev) => {
            const updated = [...prev, message];
            // Limit the number of messages kept in state
            if (updated.length > maxMessages) {
              return updated.slice(-maxMessages);
            }
            return updated;
          });
        } catch {
          // Ignore non-JSON messages (like ping comments)
          console.debug('Received non-JSON message:', event.data);
        }
      };

      // Handle custom 'connected' event from server
      eventSource.addEventListener('connected', () => {
        if (!mountedRef.current) return;
        setConnectionStatus('connected');
      });

      // Handle errors
      eventSource.onerror = () => {
        if (!mountedRef.current) return;

        const wasConnected = connectionStatus === 'connected';

        // Check if the connection is closed
        if (eventSource.readyState === EventSource.CLOSED) {
          eventSourceRef.current = null;
          setConnectionStatus('disconnected');

          // Attempt to reconnect if we haven't exceeded max attempts
          if (reconnectAttemptsRef.current < maxReconnectAttempts) {
            reconnectAttemptsRef.current++;

            const delay = reconnectDelay * Math.pow(2, reconnectAttemptsRef.current - 1);

            reconnectTimeoutRef.current = setTimeout(() => {
              if (mountedRef.current) {
                connect();
              }
            }, delay);

            setError(`Connection lost. Reconnecting in ${Math.round(delay / 1000)}s... (attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts})`);
          } else {
            setConnectionStatus('error');
            setError(`Connection failed after ${maxReconnectAttempts} attempts. Click Connect to retry.`);
          }
        } else if (wasConnected) {
          setConnectionStatus('error');
          setError('Stream connection error');
        }
      };
    } catch (err) {
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to connect to stream');
    }
  }, [streamUrl, maxMessages, reconnectDelay, maxReconnectAttempts, connectionStatus]);

  // Clear all messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    mountedRef.current = true;

    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Reconnect if agentId changes
  useEffect(() => {
    if (eventSourceRef.current) {
      disconnect();
      setMessages([]);
      if (autoConnect) {
        connect();
      }
    }
  }, [agentId, autoConnect, connect, disconnect]);

  return {
    messages,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    error,
    connect,
    disconnect,
    clearMessages,
  };
}

export default useAgentStream;
