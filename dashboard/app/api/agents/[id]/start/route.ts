import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import type {
  AgentsConfigFile,
  AgentStartRequest,
  AgentStartResponse,
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
    currentJobId: jobId ?? current.currentJobId,
    startedAt: status === 'running' ? new Date().toISOString() : current.startedAt,
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

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

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

    const currentStatus = getAgentStatus(agentId);

    if (currentStatus.status === 'running') {
      const errorResponse: ApiErrorResponse = {
        error: 'Agent is already running',
        code: 'AGENT_ALREADY_RUNNING',
        details: {
          currentJobId: currentStatus.currentJobId,
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

    // Parse optional request body
    let startRequest: AgentStartRequest = {};
    try {
      const body = await request.text();
      if (body) {
        startRequest = JSON.parse(body);
      }
    } catch {
      // Body is optional, ignore parse errors
    }

    // Generate a unique job ID
    const jobId = generateJobId();

    // Set status to starting, then running (simulating async start)
    setAgentStatus(agentId, 'starting', jobId);

    // Simulate async startup delay
    // In production, this would trigger actual agent process
    setTimeout(() => {
      setAgentStatus(agentId, 'running', jobId);
    }, 100);

    const response: AgentStartResponse = {
      success: true,
      jobId,
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
