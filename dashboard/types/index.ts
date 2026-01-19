// Dashboard Daddy Type Definitions

// Re-export agent API types
export * from './agent-api';

export interface Agent {
  id: string;
  name: string;
  status: "active" | "idle" | "error" | "offline";
  lastSeen: Date;
  tasksCompleted: number;
  currentTask?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  agentId?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface DashboardStats {
  activeAgents: number;
  runningTasks: number;
  completedToday: number;
  successRate: number;
}
