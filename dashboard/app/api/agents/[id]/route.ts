import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type {
  AgentsConfigFile,
  AgentWithStatus,
  AgentDetailResponse,
  AgentUpdateRequest,
  AgentUpdateResponse,
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
    startedAt: status === 'running' ? new Date().toISOString() : (status === 'stopped' ? undefined : current.startedAt),
    lastError: error ?? (status === 'running' ? undefined : current.lastError),
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

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// GET /api/agents/[id] - Get single agent details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AgentDetailResponse | ApiErrorResponse>> {
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

    const statusInfo = getAgentStatus(agentId);

    const agent: AgentWithStatus = {
      id: agentId,
      name: agentConfig.name,
      description: agentConfig.description,
      enabled: agentConfig.enabled,
      status: statusInfo.status,
      command: agentConfig.command,
      args: agentConfig.args,
      envRequired: agentConfig.envRequired,
      features: agentConfig.features,
      currentJobId: statusInfo.currentJobId,
      startedAt: statusInfo.startedAt,
      lastError: statusInfo.lastError,
    };

    const response: AgentDetailResponse = {
      agent,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to get agent details',
      code: 'AGENT_FETCH_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// PATCH /api/agents/[id] - Update agent (start/stop)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AgentUpdateResponse | ApiErrorResponse>> {
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

    // Parse request body
    let body: AgentUpdateRequest;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid request body',
        code: 'INVALID_REQUEST_BODY',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!body.action || !['start', 'stop'].includes(body.action)) {
      const errorResponse: ApiErrorResponse = {
        error: 'Invalid action. Must be "start" or "stop"',
        code: 'INVALID_ACTION',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const currentStatus = getAgentStatus(agentId);
    let message: string;
    let newStatus: AgentStatus;
    let jobId: string | undefined;

    if (body.action === 'start') {
      if (!agentConfig.enabled) {
        const errorResponse: ApiErrorResponse = {
          error: 'Cannot start disabled agent',
          code: 'AGENT_DISABLED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      if (currentStatus.status === 'running') {
        const errorResponse: ApiErrorResponse = {
          error: 'Agent is already running',
          code: 'AGENT_ALREADY_RUNNING',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 409 });
      }

      jobId = generateJobId();
      newStatus = 'running';
      message = `Agent ${agentConfig.name} started successfully`;
      setAgentStatus(agentId, newStatus, jobId);
    } else {
      if (currentStatus.status === 'stopped') {
        const errorResponse: ApiErrorResponse = {
          error: 'Agent is already stopped',
          code: 'AGENT_ALREADY_STOPPED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 409 });
      }

      newStatus = 'stopped';
      message = `Agent ${agentConfig.name} stopped successfully`;
      setAgentStatus(agentId, newStatus);
    }

    const updatedStatus = getAgentStatus(agentId);

    const agent: AgentWithStatus = {
      id: agentId,
      name: agentConfig.name,
      description: agentConfig.description,
      enabled: agentConfig.enabled,
      status: updatedStatus.status,
      command: agentConfig.command,
      args: agentConfig.args,
      envRequired: agentConfig.envRequired,
      features: agentConfig.features,
      currentJobId: updatedStatus.currentJobId,
      startedAt: updatedStatus.startedAt,
      lastError: updatedStatus.lastError,
    };

    const response: AgentUpdateResponse = {
      agent,
      message,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to update agent',
      code: 'AGENT_UPDATE_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
