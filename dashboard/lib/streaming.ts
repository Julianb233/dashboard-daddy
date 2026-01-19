/**
 * Client-side streaming utilities for Server-Sent Events
 */

// Connection states
export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error';

// Message types from the agent
export interface AgentMessage {
  type: 'stdout' | 'stderr' | 'system' | 'error';
  data: string;
  timestamp: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

// Parsed log entry for display
export interface LogEntry extends AgentMessage {
  id: string;
  parsed: boolean;
}

// Configuration for the EventSource wrapper
export interface StreamConfig {
  url: string;
  onMessage?: (message: AgentMessage) => void;
  onError?: (error: Event) => void;
  onStateChange?: (state: ConnectionState) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

/**
 * EventSource wrapper with automatic reconnection and message parsing
 */
export class AgentStreamClient {
  private eventSource: EventSource | null = null;
  private config: Required<StreamConfig>;
  private reconnectAttempts: number = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _state: ConnectionState = 'disconnected';
  private _isPaused: boolean = false;
  private messageBuffer: AgentMessage[] = [];

  constructor(config: StreamConfig) {
    this.config = {
      url: config.url,
      onMessage: config.onMessage || (() => {}),
      onError: config.onError || (() => {}),
      onStateChange: config.onStateChange || (() => {}),
      onConnect: config.onConnect || (() => {}),
      onDisconnect: config.onDisconnect || (() => {}),
      reconnectDelay: config.reconnectDelay ?? 1000,
      maxReconnectAttempts: config.maxReconnectAttempts ?? 5,
    };
  }

  get state(): ConnectionState {
    return this._state;
  }

  get isPaused(): boolean {
    return this._isPaused;
  }

  private setState(state: ConnectionState): void {
    this._state = state;
    this.config.onStateChange(state);
  }

  /**
   * Connect to the SSE stream
   */
  connect(): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.setState('connecting');

    try {
      this.eventSource = new EventSource(this.config.url);

      this.eventSource.onopen = () => {
        this.reconnectAttempts = 0;
        this.setState('connected');
        this.config.onConnect();
      };

      this.eventSource.onmessage = (event: MessageEvent) => {
        this.handleMessage(event);
      };

      // Handle custom 'connected' event
      this.eventSource.addEventListener('connected', () => {
        this.setState('connected');
      });

      this.eventSource.onerror = (error: Event) => {
        this.handleError(error);
      };
    } catch (error) {
      this.setState('error');
      this.config.onError(error as Event);
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.setState('disconnected');
    this.config.onDisconnect();
  }

  /**
   * Pause receiving messages (buffers them instead)
   */
  pause(): void {
    this._isPaused = true;
  }

  /**
   * Resume receiving messages and flush buffer
   */
  resume(): AgentMessage[] {
    this._isPaused = false;
    const buffered = [...this.messageBuffer];
    this.messageBuffer = [];
    return buffered;
  }

  /**
   * Parse and handle incoming SSE message
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: AgentMessage = JSON.parse(event.data);

      if (this._isPaused) {
        this.messageBuffer.push(message);
      } else {
        this.config.onMessage(message);
      }
    } catch {
      // Handle non-JSON messages (like ping comments)
      console.debug('Non-JSON SSE message:', event.data);
    }
  }

  /**
   * Handle SSE errors and attempt reconnection
   */
  private handleError(error: Event): void {
    this.config.onError(error);

    if (this.eventSource?.readyState === EventSource.CLOSED) {
      this.setState('disconnected');
      this.attemptReconnect();
    } else {
      this.setState('error');
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setState('error');
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    const delay = this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }
}

/**
 * Parse ANSI escape codes from a string
 * Returns an array of segments with their styles
 */
export interface AnsiSegment {
  text: string;
  styles: {
    color?: string;
    background?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
  };
}

/**
 * Parse log level from message content
 */
export function parseLogLevel(data: string): 'info' | 'warn' | 'error' | 'debug' {
  const lowerData = data.toLowerCase();
  if (lowerData.includes('[error]') || lowerData.includes('error:')) return 'error';
  if (lowerData.includes('[warn]') || lowerData.includes('warning:')) return 'warn';
  if (lowerData.includes('[debug]') || lowerData.includes('debug:')) return 'debug';
  return 'info';
}

/**
 * Generate unique ID for log entries
 */
export function generateLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a log entry from an agent message
 */
export function createLogEntry(message: AgentMessage): LogEntry {
  return {
    ...message,
    id: generateLogId(),
    level: message.level || parseLogLevel(message.data),
    parsed: true,
  };
}

/**
 * Filter log entries by level
 */
export function filterLogsByLevel(
  logs: LogEntry[],
  levels: Set<'info' | 'warn' | 'error' | 'debug'>
): LogEntry[] {
  if (levels.size === 0) return logs;
  return logs.filter(log => log.level && levels.has(log.level));
}

/**
 * Search log entries by text content
 */
export function searchLogs(logs: LogEntry[], query: string): LogEntry[] {
  if (!query.trim()) return logs;
  const lowerQuery = query.toLowerCase();
  return logs.filter(log => log.data.toLowerCase().includes(lowerQuery));
}

/**
 * Export logs to a downloadable file
 */
export function exportLogsToFile(logs: LogEntry[], filename: string = 'agent-logs.txt'): void {
  const content = logs
    .map(log => `[${log.timestamp}] [${log.level?.toUpperCase() || 'INFO'}] ${log.data}`)
    .join('\n');

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export logs as JSON
 */
export function exportLogsAsJson(logs: LogEntry[], filename: string = 'agent-logs.json'): void {
  const content = JSON.stringify(logs, null, 2);

  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
