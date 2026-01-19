// Agent API Types for Dashboard Daddy

// Agent configuration from agents.json
export interface AgentFeatures {
  parallelExecution: boolean;
  autonomousMode: boolean;
  gitIntegration: boolean;
  mcpSupport?: boolean;
}

export interface AgentConfig {
  name: string;
  enabled: boolean;
  command: string;
  args: string[];
  description: string;
  envRequired: string[];
  features: AgentFeatures;
}

export interface AgentsConfigFile {
  agents: Record<string, AgentConfig>;
  defaults: {
    preferredAgent: string;
    parallelLimit: number;
    autoCreatePR: boolean;
    worktreeEnabled: boolean;
    worktreeCleanupHours: number;
  };
  remote: {
    sshEnabled: boolean;
    sshHost: string;
    sshUser: string;
    editorUrlScheme: string;
  };
}

// Agent status types
export type AgentStatus = 'running' | 'stopped' | 'starting' | 'stopping' | 'error';

// API Response types
export interface AgentWithStatus {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  status: AgentStatus;
  command: string;
  args: string[];
  envRequired: string[];
  features: AgentFeatures;
  currentJobId?: string;
  startedAt?: string;
  lastError?: string;
}

export interface AgentsListResponse {
  agents: AgentWithStatus[];
  defaults: AgentsConfigFile['defaults'];
  timestamp: string;
}

export interface AgentDetailResponse {
  agent: AgentWithStatus;
  timestamp: string;
}

export interface AgentUpdateRequest {
  action: 'start' | 'stop';
}

export interface AgentUpdateResponse {
  agent: AgentWithStatus;
  message: string;
  timestamp: string;
}

export interface AgentStartRequest {
  taskId?: string;
  workingDirectory?: string;
  environment?: Record<string, string>;
}

export interface AgentStartResponse {
  success: boolean;
  jobId: string;
  agentId: string;
  message: string;
  timestamp: string;
}

export interface AgentStopRequest {
  force?: boolean;
}

export interface AgentStopResponse {
  success: boolean;
  agentId: string;
  message: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// Process management types (used by ProcessManager)
export interface SpawnAgentOptions {
  workingDirectory?: string;
  prompt?: string;
  environment?: Record<string, string>;
}

export interface SpawnAgentResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

export interface StopAgentOptions {
  force?: boolean;
}

export interface StopAgentResult {
  success: boolean;
  error?: string;
}

export interface ProcessStatus {
  status: AgentStatus;
  jobId?: string;
  startedAt?: string;
  pid?: number;
}

export interface AgentOutputMessage {
  type: 'stdout' | 'stderr' | 'system' | 'exit';
  data: string;
  timestamp: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}
