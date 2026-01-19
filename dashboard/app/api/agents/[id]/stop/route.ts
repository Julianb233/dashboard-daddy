import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type {
  AgentsConfigFile,
  AgentStopRequest,
  AgentStopResponse,
  AgentStatus,
  ApiErrorResponse,
} from '@/types/agent-api';

// In-memory mock status store (shared state simulation)
// In production, this would be a shared store like Redis
const agentStatusStore: Map<string, {
  status: AgentStatus;
  currentJobId?: string;
  startedAt?: string;
  lastError?: string;
}> = new Map();

function getAgentStatus(agentId: string): {
  status: AgentStatus;
  currentJobId?: string;
  startedAt?: string;
  lastError?: string;
} {
  return agentStatusStore.get(agentId) || { status: 'stopped' };
}

function setAgentStatus(
  agentId: string,
  status: AgentStatus,
  jobId?: string,
  error?: string
): void {
  const current = agentStatusStore.get(agentId) || { status: 'stopped' };
  agentStatusStore.set(agentId, {
    ...current,
    status,
    currentJobId: status === 'stopped' ? undefined : (jobId ?? current.currentJobId),
    startedAt: status === 'stopped' ? undefined : current.startedAt,
    lastError: error ?? current.lastError,
  });
}

async function loadAgentsConfig(): Promise<AgentsConfigFile> {
  const configPath = join(process.cwd(), '..', 'config', 'agents.json');

  try {
    const content = await readFile(configPath, 'utf-8');
    return JSON.parse(content) as AgentsConfigFile;
  } catch (error) {
    const altConfigPath = join(process.cwd(), 'config', 'agents.json');
    try {
      const content = await readFile(altConfigPath, 'utf-8');
      return JSON.parse(content) as AgentsConfigFile;
    } catch {
      throw new Error(`Failed to load agents config: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// POST /api/agents/[id]/stop - Stop an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AgentStopResponse | ApiErrorResponse>> {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent ID is required',
        code: 'INVALID_AGENT_ID',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const config = await loadAgentsConfig();
    const agentConfig = config.agents[agentId];

    if (!agentConfig) {
      const errorResponse: ApiErrorResponse = {
        error: `Agent not found: ${agentId}`,
        code: 'AGENT_NOT_FOUND',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const currentStatus = getAgentStatus(agentId);

    if (currentStatus.status === 'stopped') {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent is already stopped',
        code: 'AGENT_ALREADY_STOPPED',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    if (currentStatus.status === 'stopping') {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent is already stopping',
        code: 'AGENT_STOPPING',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Parse optional request body
    let stopRequest: AgentStopRequest = {};
    try {
      const body = await request.text();
      if (body) {
        stopRequest = JSON.parse(body);
      }
    } catch {
      // Body is optional, ignore parse errors
    }

    // Set status to stopping
    setAgentStatus(agentId, 'stopping');

    // Simulate async stop process
    // In production, this would send termination signal to actual agent process
    const stopDelay = stopRequest.force ? 50 : 200;

    setTimeout(() => {
      setAgentStatus(agentId, 'stopped');
    }, stopDelay);

    const response: AgentStopResponse = {
      success: true,
      agentId,
      message: stopRequest.force
        ? `Agent ${agentConfig.name} is being force stopped`
        : `Agent ${agentConfig.name} is stopping gracefully`,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 202 }); // 202 Accepted
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to stop agent',
      code: 'AGENT_STOP_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
