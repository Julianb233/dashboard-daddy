import { Agent, AgentStatus, AgentType, AgentWithStats, AgentPerformanceData, AgentHistoricalMetrics } from '@/types/agent';

/**
 * Mock agent data for development - based on docker-compose.yml services
 */
const mockAgents: AgentWithStats[] = [
  {
    id: 'agent-claude-code',
    name: 'Claude Code',
    type: 'claude-code',
    status: 'busy',
    container: 'terminal',
    currentTask: {
      id: 'task-1',
      name: 'Building agent monitoring dashboard',
      startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      progress: 67,
    },
    metrics: {
      cpuUsage: 45.2,
      memoryUsage: 62.5,
      memoryMB: 512,
      uptime: 86400,
    },
    lastSeen: new Date().toISOString(),
    tasksCompleted: 147,
    errorCount: 3,
    successRate: 97.9,
    avgResponseTime: 1250,
  },
  {
    id: 'agent-gemini-cli',
    name: 'Gemini CLI',
    type: 'gemini-cli',
    status: 'online',
    container: 'terminal',
    metrics: {
      cpuUsage: 12.8,
      memoryUsage: 35.2,
      memoryMB: 288,
      uptime: 86400,
    },
    lastSeen: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    tasksCompleted: 89,
    errorCount: 5,
    successRate: 94.4,
    avgResponseTime: 980,
  },
  {
    id: 'agent-openai-codex',
    name: 'OpenAI Codex',
    type: 'openai-codex',
    status: 'offline',
    container: 'terminal',
    metrics: {
      cpuUsage: 0,
      memoryUsage: 0,
      memoryMB: 0,
      uptime: 0,
    },
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    tasksCompleted: 256,
    errorCount: 12,
    successRate: 95.3,
    avgResponseTime: 1100,
  },
  {
    id: 'agent-vibe-kanban',
    name: 'Vibe Kanban',
    type: 'vibe-kanban',
    status: 'online',
    container: 'vibe-kanban',
    metrics: {
      cpuUsage: 5.4,
      memoryUsage: 28.6,
      memoryMB: 156,
      uptime: 172800,
    },
    lastSeen: new Date().toISOString(),
    tasksCompleted: 0,
    errorCount: 0,
    successRate: 100,
    avgResponseTime: 45,
  },
  {
    id: 'agent-scim-bridge',
    name: 'SCIM Bridge',
    type: 'scim-bridge',
    status: 'online',
    container: 'scim-bridge',
    metrics: {
      cpuUsage: 2.1,
      memoryUsage: 18.4,
      memoryMB: 96,
      uptime: 259200,
    },
    lastSeen: new Date().toISOString(),
    tasksCompleted: 0,
    errorCount: 0,
    successRate: 100,
    avgResponseTime: 32,
  },
  {
    id: 'agent-redis',
    name: 'Redis',
    type: 'redis',
    status: 'online',
    container: 'redis',
    metrics: {
      cpuUsage: 1.2,
      memoryUsage: 8.5,
      memoryMB: 64,
      uptime: 345600,
    },
    lastSeen: new Date().toISOString(),
    tasksCompleted: 0,
    errorCount: 0,
    successRate: 100,
    avgResponseTime: 5,
  },
];

/**
 * Generate mock historical performance data
 */
function generateHistoricalData(agentId: string, days: number = 7): AgentPerformanceData[] {
  const data: AgentPerformanceData[] = [];
  const now = new Date();

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      tasksCompleted: Math.floor(Math.random() * 10) + (agentId.includes('claude') ? 5 : 2),
      responseTimeMs: Math.floor(Math.random() * 500) + 500,
      errorRate: Math.random() * 5,
    });
  }

  return data;
}

/**
 * Fetch all agents with optional status filter
 */
export async function getAgents(status?: AgentStatus): Promise<AgentWithStats[]> {
  // Simulate async fetch delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  if (status) {
    return mockAgents.filter((agent) => agent.status === status);
  }

  return mockAgents;
}

/**
 * Fetch a single agent by ID
 */
export async function getAgentById(id: string): Promise<AgentWithStats | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockAgents.find((agent) => agent.id === id) || null;
}

/**
 * Get historical metrics for an agent
 */
export async function getAgentMetrics(agentId: string, days: number = 7): Promise<AgentHistoricalMetrics> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return {
    agentId,
    data: generateHistoricalData(agentId, days),
  };
}

/**
 * Get aggregated metrics for all agents
 */
export async function getAggregatedMetrics(days: number = 7): Promise<AgentPerformanceData[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const data: AgentPerformanceData[] = [];
  const now = new Date();

  for (let i = days * 24; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      timestamp: timestamp.toISOString(),
      tasksCompleted: Math.floor(Math.random() * 25) + 10,
      responseTimeMs: Math.floor(Math.random() * 300) + 800,
      errorRate: Math.random() * 3,
    });
  }

  return data;
}

/**
 * Get status badge color classes for an agent status
 */
export function getStatusColor(status: AgentStatus): string {
  const colors: Record<AgentStatus, string> = {
    online: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    busy: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    running: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    idle: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    offline: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };
  return colors[status];
}

/**
 * Get status indicator dot color
 */
export function getStatusDotColor(status: AgentStatus): string {
  const colors: Record<AgentStatus, string> = {
    online: 'bg-green-500',
    busy: 'bg-amber-500',
    running: 'bg-blue-500',
    idle: 'bg-gray-400',
    error: 'bg-red-500',
    offline: 'bg-gray-300',
  };
  return colors[status];
}

/**
 * Get status display label
 */
export function getStatusLabel(status: AgentStatus): string {
  const labels: Record<AgentStatus, string> = {
    online: 'Online',
    busy: 'Busy',
    running: 'Running',
    idle: 'Idle',
    error: 'Error',
    offline: 'Offline',
  };
  return labels[status];
}

/**
 * Get icon/emoji for agent type
 */
export function getAgentTypeIcon(type: AgentType): string {
  const icons: Record<AgentType, string> = {
    'claude-code': 'C',
    'gemini-cli': 'G',
    'openai-codex': 'O',
    'vibe-kanban': 'K',
    'scim-bridge': 'S',
    'redis': 'R',
  };
  return icons[type];
}

/**
 * Get full display name for agent type
 */
export function getAgentTypeName(type: AgentType): string {
  const names: Record<AgentType, string> = {
    'claude-code': 'Claude Code',
    'gemini-cli': 'Gemini CLI',
    'openai-codex': 'OpenAI Codex',
    'vibe-kanban': 'Vibe Kanban',
    'scim-bridge': 'SCIM Bridge',
    'redis': 'Redis',
  };
  return names[type];
}

/**
 * Format last activity time as relative string
 */
export function formatLastSeen(dateString?: string): string {
  if (!dateString) return 'Never';

  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Format uptime in human readable format
 */
export function formatUptime(seconds: number): string {
  if (seconds === 0) return '-';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Restart an agent
 */
export async function restartAgent(agentId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Restarting agent: ${agentId}`);
  return true;
}

/**
 * Stop an agent
 */
export async function stopAgent(agentId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Stopping agent: ${agentId}`);
  return true;
}

/**
 * Start an agent
 */
export async function startAgent(agentId: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  console.log(`Starting agent: ${agentId}`);
  return true;
}
