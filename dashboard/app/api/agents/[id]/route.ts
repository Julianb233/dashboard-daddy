import { NextRequest, NextResponse } from 'next/server';
import { loadAgentsConfig } from '@/lib/config-loader';
import { getAgentStatus, spawnAgent, stopAgent } from '@/lib/process-manager';
import type {
  AgentWithStatus,
  AgentDetailResponse,
  AgentUpdateRequest,
  AgentUpdateResponse,
  ApiErrorResponse,
} from '@/types/agent-api';

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
      currentJobId: statusInfo.jobId,
      startedAt: statusInfo.startedAt,
      lastError: undefined,
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

    let message: string;

    if (body.action === 'start') {
      if (!agentConfig.enabled) {
        const errorResponse: ApiErrorResponse = {
          error: 'Cannot start disabled agent',
          code: 'AGENT_DISABLED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }

      const result = await spawnAgent(agentId);

      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          error: result.error || 'Failed to start agent',
          code: 'AGENT_START_FAILED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 409 });
      }

      message = `Agent ${agentConfig.name} started successfully`;
    } else {
      const result = await stopAgent(agentId);

      if (!result.success) {
        const errorResponse: ApiErrorResponse = {
          error: result.error || 'Failed to stop agent',
          code: 'AGENT_STOP_FAILED',
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(errorResponse, { status: 409 });
      }

      message = `Agent ${agentConfig.name} stopped successfully`;
    }

    // Get updated status after action
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
      currentJobId: statusInfo.jobId,
      startedAt: statusInfo.startedAt,
      lastError: undefined,
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
