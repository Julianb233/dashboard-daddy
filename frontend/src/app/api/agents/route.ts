import { NextResponse } from 'next/server'
import { Agent, AgentConfig, AgentType } from '@/types/agent'

// Agent configuration (matches /config/agents.json)
const agentsConfig = {
  agents: {
    'claude-code': {
      name: 'Claude Code',
      enabled: true,
      command: 'claude',
      args: ['--dangerously-skip-permissions'],
      description: "Anthropic's autonomous coding agent",
      envRequired: ['ANTHROPIC_API_KEY'],
      features: {
        parallelExecution: true,
        autonomousMode: true,
        gitIntegration: true,
        mcpSupport: true,
      },
    },
    'gemini-cli': {
      name: 'Gemini CLI',
      enabled: true,
      command: 'gemini',
      args: ['--yolo'],
      description: "Google's Gemini coding agent",
      envRequired: ['GOOGLE_API_KEY'],
      features: {
        parallelExecution: true,
        autonomousMode: true,
        gitIntegration: true,
      },
    },
    'openai-codex': {
      name: 'OpenAI Codex',
      enabled: true,
      command: 'codex',
      args: ['--approval-mode', 'full-auto'],
      description: "OpenAI's Codex coding agent",
      envRequired: ['OPENAI_API_KEY'],
      features: {
        parallelExecution: true,
        autonomousMode: true,
        gitIntegration: true,
      },
    },
  },
}

// Simulated agent states (in production, this would query Docker)
const agentStates: Record<AgentType, { status: 'running' | 'idle' | 'stopped' | 'error', currentTask?: string, startedAt?: string }> = {
  'claude-code': { status: 'running', currentTask: 'Implementing user dashboard', startedAt: new Date(Date.now() - 3600000).toISOString() },
  'gemini-cli': { status: 'idle', startedAt: new Date(Date.now() - 7200000).toISOString() },
  'openai-codex': { status: 'stopped' },
}

export async function GET() {
  const agents: Agent[] = Object.entries(agentsConfig.agents).map(([id, config]) => {
    const state = agentStates[id as AgentType] || { status: 'stopped' };
    const uptime = state.startedAt
      ? Math.floor((Date.now() - new Date(state.startedAt).getTime()) / 1000)
      : 0;

    return {
      id,
      type: id as AgentType,
      config: config as AgentConfig,
      status: state.status,
      currentTask: state.currentTask,
      startedAt: state.startedAt,
      updatedAt: new Date().toISOString(),
      metrics: {
        uptime,
        tasksCompleted: Math.floor(Math.random() * 50),
        tasksFailed: Math.floor(Math.random() * 5),
      },
    };
  });

  return NextResponse.json({ agents, timestamp: new Date().toISOString() });
}
