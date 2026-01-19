import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type {
  AgentsConfigFile,
  AgentWithStatus,
  AgentsListResponse,
  AgentStatus,
  ApiErrorResponse,
} from '@/types/agent-api';

// In-memory mock status store (in production, use Redis or similar)
// This simulates agent status tracking
const agentStatusStore: Map<string, {
  status: AgentStatus;
  currentJobId?: string;
  startedAt?: string;
  lastError?: string;
}> = new Map();

// Initialize default statuses
function initializeAgentStatus(agentId: string, enabled: boolean): void {
  if (!agentStatusStore.has(agentId)) {
    agentStatusStore.set(agentId, {
      status: enabled ? 'stopped' : 'stopped',
    });
  }
}

// Export for use by other routes
export function getAgentStatus(agentId: string): {
  status: AgentStatus;
  currentJobId?: string;
  startedAt?: string;
  lastError?: string;
} {
  return agentStatusStore.get(agentId) || { status: 'stopped' };
}

export function setAgentStatus(
  agentId: string,
  status: AgentStatus,
  jobId?: string,
  error?: string
): void {
  const current = agentStatusStore.get(agentId) || { status: 'stopped' };
  agentStatusStore.set(agentId, {
    ...current,
    status,
    currentJobId: jobId ?? current.currentJobId,
    startedAt: status === 'running' ? new Date().toISOString() : current.startedAt,
    lastError: error ?? current.lastError,
  });
}

async function loadAgentsConfig(): Promise<AgentsConfigFile> {
  // Config is in the parent directory of the dashboard
  const configPath = join(process.cwd(), '..', 'config', 'agents.json');

  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as AgentsConfigFile;
  } catch (error) {
    // Fallback: try alternative path in case cwd is different
    const altConfigPath = join(process.cwd(), 'config', 'agents.json');
    try {
      const content = await readFile(altConfigPath, 'utf-8');
      return JSON.parse(content) as AgentsConfigFile;
    } catch {
      throw new Error(`Failed to load agents config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export async function GET(): Promise<NextResponse<AgentsListResponse | ApiErrorResponse>> {
  try {
    const config = await loadAgentsConfig();

    // Convert config agents to array with status
    const agents: AgentWithStatus[] = Object.entries(config.agents).map(([id, agent]) => {
      // Initialize status if not present
      initializeAgentStatus(id, agent.enabled);
      const statusInfo = getAgentStatus(id);

      return {
        id,
        name: agent.name,
        description: agent.description,
        enabled: agent.enabled,
        status: statusInfo.status,
        command: agent.command,
        args: agent.args,
        envRequired: agent.envRequired,
        features: agent.features,
        currentJobId: statusInfo.currentJobId,
        startedAt: statusInfo.startedAt,
        lastError: statusInfo.lastError,
      };
    });

    const response: AgentsListResponse = {
      agents,
      defaults: config.defaults,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to load agents',
      code: 'AGENTS_LOAD_ERROR',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
