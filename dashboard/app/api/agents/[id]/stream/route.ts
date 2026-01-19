import { NextRequest } from 'next/server';
import {
  subscribeToOutput,
  getOutputBuffer,
  getAgentStatus,
  sendInput,
} from '@/lib/process-manager';
import type { AgentOutputMessage } from '@/lib/process-manager';

// Format message as SSE event
function formatSSEMessage(message: AgentOutputMessage): string {
  const data = JSON.stringify(message);
  return `data: ${data}\n\n`;
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

  // Check if agent has any state in ProcessManager
  const status = getAgentStatus(agentId);

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
      // Send initial connection event with current status
      await writer.write(
        encoder.encode(
          `event: connected\ndata: ${JSON.stringify({
            status: 'connected',
            agentStatus: status.status,
            jobId: status.jobId,
          })}\n\n`
        )
      );

      // Send buffered output history first (last 100 messages)
      const bufferedOutput = getOutputBuffer(agentId, 100);
      for (const message of bufferedOutput) {
        if (abortController.signal.aborted) break;
        await writer.write(encoder.encode(formatSSEMessage(message)));
      }

      // If agent is not running, send a system message and keep connection for future output
      if (status.status === 'stopped') {
        await writer.write(
          encoder.encode(
            formatSSEMessage({
              type: 'system',
              data: `Agent ${agentId} is not running. Waiting for agent to start...`,
              timestamp: new Date().toISOString(),
              level: 'info',
            })
          )
        );
      }

      // Keep-alive ping every 30 seconds
      const pingInterval = setInterval(async () => {
        try {
          if (!abortController.signal.aborted) {
            await writer.write(encoder.encode(': ping\n\n'));
          } else {
            clearInterval(pingInterval);
          }
        } catch {
          clearInterval(pingInterval);
        }
      }, 30000);

      // Subscribe to real-time output from ProcessManager
      const unsubscribe = subscribeToOutput(agentId, async (message) => {
        if (abortController.signal.aborted) {
          unsubscribe();
          return;
        }

        try {
          await writer.write(encoder.encode(formatSSEMessage(message)));
        } catch {
          unsubscribe();
        }
      });

      // Wait for abort signal (client disconnect)
      await new Promise<void>((resolve) => {
        abortController.signal.addEventListener('abort', () => {
          resolve();
        });
      });

      // Cleanup
      clearInterval(pingInterval);
      unsubscribe();
    } catch (error) {
      // Send error event before closing
      const errorMessage: AgentOutputMessage = {
        type: 'system',
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

// Handle POST for sending input to the agent
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

    // Send input to the actual running process
    const success = sendInput(agentId, command);

    if (!success) {
      return new Response(
        JSON.stringify({
          error: 'Failed to send input. Agent may not be running.',
          agentId,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        agentId,
        command,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
