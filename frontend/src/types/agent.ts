// Agent status enum
export type AgentStatus = 'running' | 'idle' | 'stopped' | 'error';

// Agent type enum
export type AgentType = 'claude-code' | 'gemini-cli' | 'openai-codex';

// Agent features
export interface AgentFeatures {
  parallelExecution: boolean;
  autonomousMode: boolean;
  gitIntegration: boolean;
  mcpSupport?: boolean;
}

// Agent configuration (from agents.json)
export interface AgentConfig {
  name: string;
  enabled: boolean;
  command: string;
  args: string[];
  description: string;
  envRequired: string[];
  features: AgentFeatures;
}

// Runtime agent state
export interface Agent {
  id: string;
  type: AgentType;
  config: AgentConfig;
  status: AgentStatus;
  containerId?: string;
  currentTask?: string;
  metrics: AgentMetrics;
  lastError?: string;
  startedAt?: string;
  updatedAt: string;
}

// Agent metrics
export interface AgentMetrics {
  uptime: number; // seconds
  tasksCompleted: number;
  tasksFailed: number;
  cpuUsage?: number;
  memoryUsage?: number;
}

// API response types
export interface AgentListResponse {
  agents: Agent[];
  timestamp: string;
}

export interface AgentActionResponse {
  success: boolean;
  message: string;
  agent?: Agent;
}

// Action types for controls
export type AgentAction = 'start' | 'stop' | 'restart';
