import { NextRequest, NextResponse } from 'next/server';
import { loadAgentsConfig } from '@/lib/config-loader';
import { stopAgent, getAgentStatus } from '@/lib/process-manager';
import type {
  AgentStopRequest,
  AgentStopResponse,
  ApiErrorResponse,
} from '@/types/agent-api';

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

    // Check current status
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

    // Parse optional request body for stop options
    let stopRequest: AgentStopRequest = {};
    try {
      const body = await request.text();
      if (body) {
        stopRequest = JSON.parse(body);
      }
    } catch {
      // Body is optional, ignore parse errors
    }

    // Stop the actual process via ProcessManager
    const result = await stopAgent(agentId, {
      force: stopRequest.force,
    });

    if (!result.success) {
      const errorResponse: ApiErrorResponse = {
        error: result.error || 'Failed to stop agent',
        code: 'AGENT_STOP_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

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
