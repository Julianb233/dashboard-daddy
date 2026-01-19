import { NextResponse } from 'next/server';
import { loadAgentsConfig } from '@/lib/config-loader';
import { getAgentStatus } from '@/lib/process-manager';
import type {
  AgentWithStatus,
  AgentsListResponse,
  ApiErrorResponse,
} from '@/types/agent-api';

export async function GET(): Promise<NextResponse<AgentsListResponse | ApiErrorResponse>> {
  try {
    const config = await loadAgentsConfig();

    // Convert config agents to array with real-time status from ProcessManager
    const agents: AgentWithStatus[] = Object.entries(config.agents).map(([id, agent]) => {
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
        currentJobId: statusInfo.jobId,
        startedAt: statusInfo.startedAt,
        lastError: undefined, // TODO: Track errors in ProcessManager
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
