/**
 * Agent type definitions for Dashboard Daddy
 */

export type AgentType = 'claude-code' | 'gemini-cli' | 'openai-codex' | 'vibe-kanban' | 'scim-bridge' | 'redis';

export type AgentStatus = 'online' | 'offline' | 'busy' | 'running' | 'idle' | 'error';

export interface AgentMetrics {
  cpuUsage: number;      // Percentage (0-100)
  memoryUsage: number;   // Percentage (0-100)
  memoryMB: number;      // Actual MB used
  uptime: number;        // Seconds since start
}

export interface AgentTask {
  id: string;
  name: string;
  startedAt: string;
  progress?: number;     // Optional progress percentage
}

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  container?: string;    // Docker container name
  currentTask?: AgentTask;
  metrics: AgentMetrics;
  lastSeen: string;      // ISO date string
  tasksCompleted: number;
  errorCount: number;
}

export interface AgentWithStats extends Agent {
  successRate?: number;
  avgResponseTime?: number;
}

export interface AgentPerformanceData {
  timestamp: string;
  tasksCompleted: number;
  responseTimeMs: number;
  errorRate: number;     // Percentage (0-100)
}

export interface AgentHistoricalMetrics {
  agentId: string;
  data: AgentPerformanceData[];
}

export interface AgentAction {
  type: 'restart' | 'stop' | 'start' | 'viewLogs';
  agentId: string;
}

export interface AgentGridFilter {
  status?: AgentStatus;
  type?: AgentType;
  searchQuery?: string;
}
