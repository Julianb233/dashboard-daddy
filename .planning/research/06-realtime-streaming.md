# Real-Time Agent Output Streaming Research

## Executive Summary

This document researches patterns for streaming real-time output from AI coding agents running in Docker containers to a Next.js dashboard. Given the project's requirements (multiple agents, large log volumes, no page refresh), the recommended approach is a **hybrid architecture**: Server-Sent Events (SSE) for log streaming with optional WebSocket integration for bidirectional commands.

---

## 1. WebSocket vs Server-Sent Events (SSE)

### Comparison Overview

| Feature | WebSocket | SSE |
|---------|-----------|-----|
| **Direction** | Bidirectional | Server-to-client only |
| **Protocol** | Custom (ws://) | Standard HTTP |
| **Browser Support** | Universal | Universal (except IE) |
| **Reconnection** | Manual implementation | Built-in auto-reconnect |
| **Data Format** | Binary + Text | Text only (UTF-8) |
| **HTTP/2 Multiplexing** | Not applicable | Excellent support |
| **Vercel Support** | Not supported | Supported |
| **Server Resources** | Higher (bidirectional sessions) | 30-40% lower |

### Recommendation: SSE for Log Streaming

**Primary reasons:**

1. **Vercel Compatibility**: Vercel Serverless Functions do not support WebSockets. SSE works natively with Next.js Route Handlers on Vercel.

2. **Use Case Alignment**: Log streaming is fundamentally unidirectional (server-to-client). SSE is purpose-built for this.

3. **Built-in Reconnection**: EventSource API handles reconnection automatically with last-event-id tracking.

4. **HTTP/2 Benefits**: Modern browsers multiplex SSE connections efficiently, removing the old 6-connection-per-domain limit.

5. **Simpler Infrastructure**: No need for sticky sessions or special load balancer configuration.

**When to add WebSocket:**

- If bidirectional terminal interaction is needed (sending commands to agents)
- For extremely low-latency requirements (<5ms)
- If binary data streaming becomes necessary

### Sources
- [Ably: WebSockets vs SSE](https://ably.com/blog/websockets-vs-sse)
- [SystemDesignSchool: SSE vs WebSocket](https://systemdesignschool.io/blog/server-sent-events-vs-websocket)
- [Vercel: WebSocket Limitations](https://vercel.com/kb/guide/do-vercel-serverless-functions-support-websocket-connections)

---

## 2. Next.js App Router Streaming Patterns

### Route Handler for SSE

Next.js 15+ App Router supports streaming via Route Handlers using the Web Streams API:

```typescript
// app/api/agents/[agentId]/logs/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Required for streaming

export async function GET(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Subscribe to agent logs (from Docker, Redis pub/sub, etc.)
      const unsubscribe = await subscribeToAgentLogs(agentId, (log) => {
        const data = `data: ${JSON.stringify(log)}\n\n`;
        controller.enqueue(encoder.encode(data));
      });

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Prevents NGINX buffering
    },
  });
}
```

### Critical Configuration

```typescript
// Required exports for streaming routes
export const dynamic = 'force-dynamic'; // Prevent static optimization
export const runtime = 'nodejs';        // Node.js runtime for streaming
```

### Common Pitfall: Buffering

Next.js may buffer responses if async operations complete before returning the Response. Solution: return the Response immediately and stream in background:

```typescript
export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Use IIFE to avoid blocking
      (async () => {
        for await (const chunk of getLogChunks()) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        controller.close();
      })();
    },
  });

  return new Response(stream, { /* headers */ });
}
```

### Sources
- [Next.js: App Router Streaming](https://nextjs.org/learn/dashboard-app/streaming)
- [Medium: Implementing SSE in Next.js](https://medium.com/@ammarbinshakir557/implementing-server-sent-events-sse-in-node-js-with-next-js-a-complete-guide-1adcdcb814fd)
- [Fixing Slow SSE Streaming in Next.js](https://medium.com/@oyetoketoby80/fixing-slow-sse-server-sent-events-streaming-in-next-js-and-vercel-99f42fbdb996)

---

## 3. Streaming Terminal Output to Browser

### Option A: Leverage Existing ttyd (Recommended for Interactive Terminals)

The project already uses ttyd (port 7681) which provides:
- WebSocket-based terminal streaming
- xterm.js frontend integration
- Full PTY support (colors, cursor movement, etc.)
- Sixel image support
- Built on libwebsockets + libuv for high performance

**Architecture insight from docker-compose.yml:**
```yaml
terminal:
  command: ttyd -W -p 7681 -i 0.0.0.0 bash -lc 'tmux attach -t main || tmux new -s main'
```

The `-W` flag enables writable mode (bidirectional). For read-only log viewing, omit `-W`.

**Integration approach:**
- Embed ttyd iframe for full terminal access
- Or create custom xterm.js component connecting to ttyd WebSocket

### Option B: Custom Log Streaming via Dockerode

For structured log streaming without full terminal emulation:

```typescript
// lib/docker-logs.ts
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export async function* streamContainerLogs(containerId: string): AsyncGenerator<string> {
  const container = docker.getContainer(containerId);

  const stream = await container.logs({
    follow: true,
    stdout: true,
    stderr: true,
    timestamps: true,
    tail: 100, // Last 100 lines initially
  });

  // Demultiplex stdout/stderr if Tty: false
  for await (const chunk of stream) {
    yield chunk.toString('utf-8');
  }
}
```

### Option C: xterm.js Direct Integration

For custom terminal UI with WebSocket backend:

```typescript
// components/Terminal.tsx
'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

export function TerminalComponent({ agentId }: { agentId: string }) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    const terminal = new Terminal({
      cursorBlink: true,
      theme: { background: '#1a1b26' },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    // Connect to WebSocket (ttyd or custom)
    const socket = new WebSocket(`wss://terminal.dashboard-daddy.com/ws/${agentId}`);
    const attachAddon = new AttachAddon(socket);
    terminal.loadAddon(attachAddon);

    return () => {
      socket.close();
      terminal.dispose();
    };
  }, [agentId]);

  return <div ref={terminalRef} className="h-full w-full" />;
}
```

### Sources
- [ttyd GitHub](https://github.com/tsl0922/ttyd)
- [xterm.js](https://xtermjs.org/)
- [Dockerode](https://github.com/apocas/dockerode)

---

## 4. ttyd Architecture Analysis

Based on docker-compose.yml configuration:

```yaml
terminal:
  image: alpine:3.20
  command: >
    sh -lc "
      apk add --no-cache bash tmux nodejs npm git ttyd &&
      npm i -g @anthropic-ai/claude-code @google/gemini-cli @openai/codex &&
      ttyd -W -p 7681 -i 0.0.0.0 bash -lc 'tmux attach -t main || tmux new -s main'
    "
```

### Key Points

1. **WebSocket Protocol**: ttyd uses libwebsockets for persistent connections
2. **tmux Integration**: Sessions persist across disconnects
3. **Port 7681**: Exposed via Traefik at `terminal.dashboard-daddy.com`
4. **Writable Mode (-W)**: Enables bidirectional input/output

### Integration Options

| Approach | Complexity | Use Case |
|----------|------------|----------|
| Iframe embed | Low | Quick integration, full terminal |
| xterm.js + ttyd WS | Medium | Custom UI, same backend |
| Custom SSE + Dockerode | High | Structured logs, no terminal emulation |

---

## 5. Reconnection and Buffering Patterns

### SSE Auto-Reconnection (Built-in)

EventSource automatically reconnects with exponential backoff. Enhance with last-event-id:

```typescript
// Server: Include event ID
const eventId = Date.now().toString();
const data = `id: ${eventId}\ndata: ${JSON.stringify(log)}\n\n`;

// Client: EventSource sends Last-Event-ID header on reconnect
const es = new EventSource('/api/agents/123/logs');
```

### WebSocket Reconnection Pattern

```typescript
// lib/websocket-reconnect.ts
import { Websocket, WebsocketBuilder, ExponentialBackoff } from 'websocket-ts';

export function createReconnectingWebSocket(url: string) {
  return new WebsocketBuilder(url)
    .withBackoff(new ExponentialBackoff(1000, 30000)) // 1s to 30s max
    .withBuffer(new RingQueue(1000)) // Buffer 1000 messages during disconnect
    .onMessage((ws, event) => {
      // Handle incoming message
    })
    .onReconnect((ws, event) => {
      console.log('Reconnected, requesting missed logs...');
      ws.send(JSON.stringify({ type: 'sync', lastEventId: getLastEventId() }));
    })
    .build();
}
```

### Message Buffering Strategy

For handling large log volumes:

```typescript
// Client-side ring buffer for display
class LogBuffer {
  private logs: LogEntry[] = [];
  private maxSize = 10000;

  add(log: LogEntry) {
    this.logs.push(log);
    if (this.logs.length > this.maxSize) {
      this.logs.shift(); // Remove oldest
    }
  }

  getRange(start: number, end: number): LogEntry[] {
    return this.logs.slice(start, end);
  }
}
```

### Server-Side Buffering with Redis

```typescript
// lib/log-buffer.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function publishLog(agentId: string, log: LogEntry) {
  const key = `agent:${agentId}:logs`;

  // Store in list (capped at 1000 entries)
  await redis.lpush(key, JSON.stringify(log));
  await redis.ltrim(key, 0, 999);

  // Publish for real-time subscribers
  await redis.publish(`agent:${agentId}:stream`, JSON.stringify(log));
}

export async function getRecentLogs(agentId: string, count = 100): Promise<LogEntry[]> {
  const key = `agent:${agentId}:logs`;
  const logs = await redis.lrange(key, 0, count - 1);
  return logs.map(JSON.parse).reverse();
}
```

### Sources
- [websocket-ts](https://github.com/jjxxs/websocket-ts)
- [Exponential Backoff Patterns](https://dev.to/hexshift/robust-websocket-reconnection-strategies-in-javascript-with-exponential-backoff-40n1)

---

## 6. Performance Considerations

### Virtual Scrolling for Large Logs

With potentially thousands of log lines, virtual scrolling is essential:

```typescript
// components/LogViewer.tsx
'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function LogViewer({ logs }: { logs: LogEntry[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24, // Estimated row height
    overscan: 20, // Render 20 extra items for smooth scrolling
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <LogLine log={logs[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Performance Metrics

| Technique | Impact |
|-----------|--------|
| Virtual scrolling | Reduces render time from 5s+ to <100ms for 10k items |
| Message batching | Reduces React re-renders by 80-90% |
| Debounced updates | Prevents UI jank during high-frequency logging |
| Ring buffer | Caps memory at predictable levels |

### Batching High-Frequency Updates

```typescript
// hooks/useLogStream.ts
import { useEffect, useState, useCallback } from 'react';

export function useLogStream(agentId: string) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const batchRef = useRef<LogEntry[]>([]);

  const flushBatch = useCallback(() => {
    if (batchRef.current.length > 0) {
      setLogs(prev => [...prev, ...batchRef.current].slice(-10000));
      batchRef.current = [];
    }
  }, []);

  useEffect(() => {
    const es = new EventSource(`/api/agents/${agentId}/logs`);
    const flushInterval = setInterval(flushBatch, 100); // Batch every 100ms

    es.onmessage = (event) => {
      batchRef.current.push(JSON.parse(event.data));
    };

    return () => {
      es.close();
      clearInterval(flushInterval);
      flushBatch();
    };
  }, [agentId, flushBatch]);

  return logs;
}
```

### Sources
- [TanStack Virtual](https://tanstack.com/virtual/latest)
- [Virtual Scrolling Performance](https://dev.to/kohii/how-to-implement-virtual-scrolling-beyond-the-browsers-limit-16ol)

---

## 7. Libraries to Consider

### Core Dependencies

| Library | Purpose | npm |
|---------|---------|-----|
| `@tanstack/react-virtual` | Virtual scrolling for large logs | 3.13.x |
| `@xterm/xterm` | Terminal emulator UI | 6.x |
| `@xterm/addon-attach` | WebSocket attachment for xterm | 0.11.x |
| `@xterm/addon-fit` | Auto-resize terminal | 0.10.x |
| `dockerode` | Docker API client | 4.x |
| `ioredis` | Redis pub/sub for log distribution | 5.x |
| `websocket-ts` | WebSocket with reconnection (if needed) | 2.x |

### Optional Enhancements

| Library | Purpose |
|---------|---------|
| `ansi-to-html` | Convert ANSI colors to HTML |
| `react-window` | Alternative virtual list (simpler API) |
| `zod` | Runtime validation for log messages |
| `swr` | Client-side data fetching with caching |

---

## 8. Recommended Architecture

```
                                    +-------------------+
                                    |   Next.js App     |
                                    |   (Vercel Edge)   |
                                    +--------+----------+
                                             |
                    +------------------------+------------------------+
                    |                        |                        |
            +-------v-------+       +--------v--------+      +--------v--------+
            |  SSE Route    |       |  SSE Route      |      |  API Routes     |
            |  /api/agents/ |       |  /api/agents/   |      |  /api/agents    |
            |  [id]/logs    |       |  [id]/terminal  |      |  (CRUD)         |
            +-------+-------+       +--------+--------+      +-----------------+
                    |                        |
                    |                Redis Pub/Sub
                    |                        |
            +-------v------------------------v--------+
            |              Backend Service            |
            |        (Node.js on VPS/Docker)          |
            +-------+-----------------+---------------+
                    |                 |
            +-------v-------+ +-------v-------+
            |   Dockerode   | |    ttyd       |
            |   Log Streams | |   WebSocket   |
            +-------+-------+ +-------+-------+
                    |                 |
            +-------v-----------------v-------+
            |     Docker Containers           |
            |  (Claude Code, Gemini, Codex)   |
            +---------------------------------+
```

### Implementation Phases

1. **Phase 1**: SSE log streaming from backend to dashboard
2. **Phase 2**: Virtual scrolling log viewer component
3. **Phase 3**: ttyd integration for interactive terminal
4. **Phase 4**: Multi-agent concurrent streaming
5. **Phase 5**: Redis pub/sub for horizontal scaling

---

## 9. Code Examples

### Complete SSE Route Handler

```typescript
// app/api/agents/[agentId]/logs/route.ts
import { NextRequest } from 'next/server';
import { subscribeToAgentLogs, getRecentLogs } from '@/lib/agent-logs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;
  const lastEventId = request.headers.get('Last-Event-ID');
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // Send recent logs on initial connection
      const recentLogs = await getRecentLogs(agentId, lastEventId ? 0 : 100);
      for (const log of recentLogs) {
        const message = formatSSE(log);
        controller.enqueue(encoder.encode(message));
      }

      // Subscribe to new logs
      const unsubscribe = await subscribeToAgentLogs(agentId, (log) => {
        try {
          const message = formatSSE(log);
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          // Client disconnected
          unsubscribe();
          controller.close();
        }
      });

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

function formatSSE(log: LogEntry): string {
  return `id: ${log.id}\nevent: log\ndata: ${JSON.stringify(log)}\n\n`;
}
```

### Client-Side Hook

```typescript
// hooks/useAgentLogs.ts
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  agentId: string;
}

interface UseAgentLogsOptions {
  maxLogs?: number;
  batchInterval?: number;
}

export function useAgentLogs(
  agentId: string,
  options: UseAgentLogsOptions = {}
) {
  const { maxLogs = 10000, batchInterval = 100 } = options;
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const batchRef = useRef<LogEntry[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  const flushBatch = useCallback(() => {
    if (batchRef.current.length > 0) {
      setLogs((prev) => {
        const updated = [...prev, ...batchRef.current];
        return updated.slice(-maxLogs);
      });
      batchRef.current = [];
    }
  }, [maxLogs]);

  useEffect(() => {
    const es = new EventSource(`/api/agents/${agentId}/logs`);
    eventSourceRef.current = es;

    const flushInterval = setInterval(flushBatch, batchInterval);

    es.onopen = () => {
      setConnected(true);
      setError(null);
    };

    es.addEventListener('log', (event) => {
      try {
        const log = JSON.parse(event.data) as LogEntry;
        batchRef.current.push(log);
      } catch (e) {
        console.error('Failed to parse log:', e);
      }
    });

    es.onerror = (e) => {
      setConnected(false);
      if (es.readyState === EventSource.CLOSED) {
        setError(new Error('Connection closed'));
      }
    };

    return () => {
      es.close();
      clearInterval(flushInterval);
      flushBatch();
    };
  }, [agentId, batchInterval, flushBatch]);

  const clearLogs = useCallback(() => {
    setLogs([]);
    batchRef.current = [];
  }, []);

  return { logs, connected, error, clearLogs };
}
```

---

## 10. Summary

### Recommended Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| Log Streaming | SSE (EventSource) | Vercel compatible, auto-reconnect, HTTP/2 |
| Terminal UI | xterm.js + ttyd | Already deployed, full PTY support |
| Virtual Scrolling | @tanstack/react-virtual | Handles 10k+ entries efficiently |
| Message Buffering | Redis pub/sub | Horizontal scaling, persistence |
| Docker Integration | Dockerode | Native Node.js Docker API |

### Key Decisions

1. **SSE over WebSocket for logs**: Simpler, Vercel-compatible, built-in reconnection
2. **Leverage existing ttyd**: Already configured at port 7681
3. **Redis for multi-agent**: Pub/sub enables multiple dashboard instances
4. **Virtual scrolling mandatory**: Essential for large log volumes
5. **Batch updates at 100ms**: Prevents React render thrashing

### Next Steps

1. Implement SSE route handler for log streaming
2. Create `useAgentLogs` hook with batching
3. Build virtual scrolling log viewer component
4. Add ttyd iframe or xterm.js integration
5. Set up Redis pub/sub for log distribution
6. Add reconnection indicators in UI

---

*Research completed: 2026-01-19*
