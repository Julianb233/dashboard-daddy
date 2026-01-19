import { NextRequest } from 'next/server';

// Type for agent output messages
interface AgentMessage {
  type: 'stdout' | 'stderr' | 'system' | 'error';
  data: string;
  timestamp: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
}

// Simulated agent output generator for demo purposes
// In production, this would connect to actual agent terminal output
async function* generateAgentOutput(agentId: string): AsyncGenerator<AgentMessage> {
  // Initial connection message
  yield {
    type: 'system',
    data: `Connected to agent ${agentId}`,
    timestamp: new Date().toISOString(),
    level: 'info',
  };

  // Demo: Generate sample output to show streaming works
  const sampleOutputs = [
    { type: 'stdout' as const, data: '\x1b[32m[Agent]\x1b[0m Initializing...', level: 'info' as const },
    { type: 'stdout' as const, data: '\x1b[34m[Info]\x1b[0m Loading configuration', level: 'info' as const },
    { type: 'stdout' as const, data: '\x1b[33m[Warn]\x1b[0m Cache miss, rebuilding index', level: 'warn' as const },
    { type: 'stderr' as const, data: '\x1b[31m[Error]\x1b[0m Connection timeout (retrying...)', level: 'error' as const },
    { type: 'stdout' as const, data: '\x1b[32m[Success]\x1b[0m Connected to backend', level: 'info' as const },
    { type: 'stdout' as const, data: 'Processing task queue...', level: 'info' as const },
    { type: 'stdout' as const, data: '\x1b[36m[Debug]\x1b[0m Memory usage: 128MB', level: 'debug' as const },
  ];

  let index = 0;
  while (true) {
    // Wait between messages to simulate real-time streaming
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const output = sampleOutputs[index % sampleOutputs.length];
    yield {
      ...output,
      timestamp: new Date().toISOString(),
    };

    index++;
  }
}

// SSE response helper
function createSSEResponse(stream: ReadableStream): Response {
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

// Format message as SSE event
function formatSSEMessage(message: AgentMessage): string {
  const data = JSON.stringify(message);
  return `data: ${data}\n\n`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: agentId } = await params;

  // Validate agent ID
  if (!agentId || typeof agentId !== 'string') {
    return new Response(JSON.stringify({ error: 'Invalid agent ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Create a TransformStream for SSE
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Handle client disconnect
  const abortController = new AbortController();
  request.signal.addEventListener('abort', () => {
    abortController.abort();
  });

  // Start streaming in the background
  (async () => {
    try {
      // Send initial connection event
      await writer.write(encoder.encode('event: connected\ndata: {"status":"connected"}\n\n'));

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(async () => {
        try {
          await writer.write(encoder.encode(': ping\n\n'));
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Stream agent output
      const generator = generateAgentOutput(agentId);

      for await (const message of generator) {
        if (abortController.signal.aborted) {
          break;
        }

        const sseMessage = formatSSEMessage(message);
        await writer.write(encoder.encode(sseMessage));
      }

      clearInterval(pingInterval);
    } catch (error) {
      // Send error event before closing
      const errorMessage: AgentMessage = {
        type: 'error',
        data: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        level: 'error',
      };

      try {
        await writer.write(encoder.encode(formatSSEMessage(errorMessage)));
      } catch {
        // Writer may already be closed
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // Writer may already be closed
      }
    }
  })();

  return createSSEResponse(readable);
}

// Handle POST for sending commands to the agent
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id: agentId } = await params;

  try {
    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid command' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In production, this would send the command to the agent
    // For now, just acknowledge receipt
    return new Response(JSON.stringify({
      success: true,
      agentId,
      command,
      timestamp: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
