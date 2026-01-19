import { NextRequest, NextResponse } from 'next/server';
import { loadAgentsConfig } from '@/lib/config-loader';
import { spawnAgent, getAgentStatus } from '@/lib/process-manager';
import type {
  AgentStartRequest,
  AgentStartResponse,
  ApiErrorResponse,
} from '@/types/agent-api';

// POST /api/agents/[id]/start - Start an agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<AgentStartResponse | ApiErrorResponse>> {
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

    if (!agentConfig.enabled) {
      const errorResponse: ApiErrorResponse = {
        error: 'Cannot start disabled agent',
        code: 'AGENT_DISABLED',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Check current status
    const currentStatus = getAgentStatus(agentId);

    if (currentStatus.status === 'running') {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent is already running',
        code: 'AGENT_ALREADY_RUNNING',
        details: {
          currentJobId: currentStatus.jobId,
          startedAt: currentStatus.startedAt,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    if (currentStatus.status === 'starting') {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent is already starting',
        code: 'AGENT_STARTING',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }

    // Parse optional request body for spawn options
    let startRequest: AgentStartRequest = {};
    try {
      const body = await request.text();
      if (body) {
        startRequest = JSON.parse(body);
      }
    } catch {
      // Body is optional, ignore parse errors
    }

    // Spawn the actual process via ProcessManager
    const result = await spawnAgent(agentId, {
      workingDirectory: startRequest.workingDirectory,
      prompt: startRequest.taskId, // Use taskId as the prompt for now
      environment: startRequest.environment,
    });

    if (!result.success) {
      const errorResponse: ApiErrorResponse = {
        error: result.error || 'Failed to start agent',
        code: 'AGENT_START_ERROR',
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const response: AgentStartResponse = {
      success: true,
      jobId: result.jobId!,
      agentId,
      message: `Agent ${agentConfig.name} is starting`,
      timestamp: new Date().toISOString(),
    };

    // Log start request details (for debugging)
    if (startRequest.taskId) {
      console.log(`Starting agent ${agentId} with task: ${startRequest.taskId}`);
    }
    if (startRequest.workingDirectory) {
      console.log(`Working directory: ${startRequest.workingDirectory}`);
    }

    return NextResponse.json(response, { status: 202 }); // 202 Accepted
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to start agent',
      code: 'AGENT_START_ERROR',
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
