// Terminal message types
export type TerminalMessageType = 'stdout' | 'stderr' | 'stdin' | 'system';

export interface TerminalMessage {
  id: string;
  type: TerminalMessageType;
  content: string;
  timestamp: string;
  agentId?: string;
  sessionId?: string;
}

// Terminal session
export interface TerminalSession {
  id: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'inactive' | 'disconnected';
  startedAt: string;
  lastActivity: string;
  messages: TerminalMessage[];
  scrollback: number; // Max messages to keep
  isConnected: boolean;
}

// WebSocket message types
export interface TerminalWebSocketMessage {
  type: 'message' | 'session_start' | 'session_end' | 'agent_status' | 'ping' | 'pong';
  payload: any;
  timestamp: string;
}

// Terminal connection state
export interface TerminalConnectionState {
  isConnected: boolean;
  lastPing?: string;
  reconnectAttempts: number;
  error?: string;
}

// Terminal preferences
export interface TerminalPreferences {
  fontSize: number;
  fontFamily: 'geist-mono' | 'jetbrains-mono' | 'source-code-pro';
  theme: 'dark' | 'light' | 'cyberpunk';
  scrollback: number;
  autoScroll: boolean;
  showTimestamps: boolean;
}

// API response types
export interface TerminalSessionResponse {
  sessions: TerminalSession[];
  timestamp: string;
}