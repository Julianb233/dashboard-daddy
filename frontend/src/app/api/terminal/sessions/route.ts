import { NextRequest, NextResponse } from 'next/server';
import { TerminalSession } from '@/types/terminal';

// Mock terminal sessions data
const mockSessions: TerminalSession[] = [
  {
    id: 'term_001',
    agentId: 'claude-code-agent-01',
    agentName: 'Claude Code Agent',
    status: 'active',
    startedAt: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    lastActivity: new Date(Date.now() - 10000).toISOString(), // 10 seconds ago
    messages: [
      {
        id: 'msg_001',
        type: 'system',
        content: 'Terminal session started',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_002',
        type: 'stdout',
        content: '$ npm install',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_003',
        type: 'stdout',
        content: 'added 1247 packages from 742 contributors in 23.456s',
        timestamp: new Date(Date.now() - 24 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_004',
        type: 'stdout',
        content: '$ npm run build',
        timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_005',
        type: 'stdout',
        content: '> dashboard-daddy@1.0.0 build\n> next build',
        timestamp: new Date(Date.now() - 19 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_006',
        type: 'stdout',
        content: 'info  - Checking validity of types...\ninfo  - Creating an optimized production build...',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_007',
        type: 'stdout',
        content: '✓ Compiled successfully',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      },
      {
        id: 'msg_008',
        type: 'stdout',
        content: '$ git add .',
        timestamp: new Date(Date.now() - 10000).toISOString(),
        sessionId: 'term_001',
        agentId: 'claude-code-agent-01'
      }
    ],
    scrollback: 1000,
    isConnected: true
  },
  {
    id: 'term_002',
    agentId: 'gemini-cleanup-agent',
    agentName: 'Gemini Cleanup Agent',
    status: 'active',
    startedAt: new Date(Date.now() - 15 * 60000).toISOString(), // 15 minutes ago
    lastActivity: new Date(Date.now() - 5000).toISOString(), // 5 seconds ago
    messages: [
      {
        id: 'msg_009',
        type: 'system',
        content: 'Terminal session started',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      },
      {
        id: 'msg_010',
        type: 'stdout',
        content: '$ find . -name "*.tmp" -type f',
        timestamp: new Date(Date.now() - 14 * 60000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      },
      {
        id: 'msg_011',
        type: 'stdout',
        content: './temp/build_123.tmp\n./cache/session_456.tmp\n./logs/debug_789.tmp',
        timestamp: new Date(Date.now() - 13 * 60000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      },
      {
        id: 'msg_012',
        type: 'stdout',
        content: '$ rm -f ./temp/build_123.tmp ./cache/session_456.tmp ./logs/debug_789.tmp',
        timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      },
      {
        id: 'msg_013',
        type: 'stdout',
        content: 'Cleaned up 3 temporary files (2.3 MB freed)',
        timestamp: new Date(Date.now() - 9 * 60000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      },
      {
        id: 'msg_014',
        type: 'stdout',
        content: '$ df -h',
        timestamp: new Date(Date.now() - 5000).toISOString(),
        sessionId: 'term_002',
        agentId: 'gemini-cleanup-agent'
      }
    ],
    scrollback: 1000,
    isConnected: true
  },
  {
    id: 'term_003',
    agentId: 'system-monitor-agent',
    agentName: 'System Monitor',
    status: 'inactive',
    startedAt: new Date(Date.now() - 60 * 60000).toISOString(), // 1 hour ago
    lastActivity: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
    messages: [
      {
        id: 'msg_015',
        type: 'system',
        content: 'Terminal session started',
        timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
        sessionId: 'term_003',
        agentId: 'system-monitor-agent'
      },
      {
        id: 'msg_016',
        type: 'stdout',
        content: '$ top -b -n1 | grep "load average"',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        sessionId: 'term_003',
        agentId: 'system-monitor-agent'
      },
      {
        id: 'msg_017',
        type: 'stdout',
        content: 'load average: 0.45, 0.32, 0.28',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        sessionId: 'term_003',
        agentId: 'system-monitor-agent'
      },
      {
        id: 'msg_018',
        type: 'system',
        content: 'Session ended - agent stopped',
        timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
        sessionId: 'term_003',
        agentId: 'system-monitor-agent'
      }
    ],
    scrollback: 1000,
    isConnected: false
  }
];

export async function GET(request: NextRequest) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 150));

  return NextResponse.json({
    sessions: mockSessions,
    timestamp: new Date().toISOString()
  });
}