# Plan 03-01 Summary: ProcessManager Singleton

## Completed: 2026-01-19

## What Was Built

### 1. Config Loader (`dashboard/lib/config-loader.ts`)

A centralized configuration loader for agents.json with:

- **loadAgentsConfig()**: Loads and parses the agents.json configuration file
- **invalidateConfigCache()**: Clears the configuration cache for testing/reloading
- **getAgentConfig(agentId)**: Convenience function to get a single agent's config

**Key Features:**
- 30-second TTL caching to reduce filesystem reads
- Multiple path fallbacks for different execution contexts:
  - `../config/agents.json` (dashboard cwd)
  - `./config/agents.json` (root cwd)
  - Absolute Docker path fallback

### 2. Process Manager (`dashboard/lib/process-manager.ts`)

A singleton service for spawning and managing CLI agent processes:

**Core Methods:**
- `spawnAgent(agentId, options)`: Spawns a child process using config from agents.json
- `stopAgent(agentId, options)`: Terminates processes with graceful shutdown
- `getAgentStatus(agentId)`: Returns current status, jobId, startedAt, pid
- `getAllStatuses()`: Returns status map for all tracked processes
- `subscribeToOutput(agentId, callback)`: EventEmitter pattern for real-time streaming
- `getOutputBuffer(agentId, limit)`: Access buffered output (last 1000 messages)
- `sendInput(agentId, input)`: Write to process stdin for interactive agents

### 3. Process Management Types (`dashboard/types/agent-api.ts`)

Added TypeScript interfaces:
- `SpawnAgentOptions`, `SpawnAgentResult`
- `StopAgentOptions`, `StopAgentResult`
- `ProcessStatus`
- `AgentOutputMessage`

## Architecture Decisions

### Singleton Pattern

The ProcessManager uses a module-level singleton pattern:

```typescript
class ProcessManager {
  private static instance: ProcessManager;
  static getInstance(): ProcessManager {
    if (!ProcessManager.instance) {
      ProcessManager.instance = new ProcessManager();
    }
    return ProcessManager.instance;
  }
}

export const processManager = ProcessManager.getInstance();
```

**Why:** In Next.js, module-level variables persist across API route invocations within the same Node.js process. This ensures all routes share the same process state.

### Event Flow for Output Streaming

```
┌─────────────────────┐
│   Child Process     │
│  (claude/gemini)    │
└──────────┬──────────┘
           │ stdout/stderr
           ▼
┌─────────────────────┐
│   ProcessManager    │
│  - outputBuffer[]   │  ◄── Stores last 1000 messages
│  - eventEmitter     │
└──────────┬──────────┘
           │ emit('output', message)
           ▼
┌─────────────────────┐
│   Subscribers       │
│  (SSE routes, etc)  │
└─────────────────────┘
```

### Graceful Shutdown

The stopAgent method implements a two-phase shutdown:

1. **SIGTERM**: Politely ask process to terminate
2. **5-second timeout**: Wait for graceful exit
3. **SIGKILL**: Force kill if still running

### Shell Mode

Uses `shell: true` in spawn options because:
- CLI commands (claude, gemini, codex) need PATH resolution
- Works across different installation methods (npm global, homebrew, etc.)

**Note:** Node.js v23+ shows a deprecation warning about shell escaping. This is acceptable for now since arguments come from trusted config.

## Config Loader Caching Strategy

```
Request 1: Cache miss → Read file → Store in memory → Return config
Request 2: Cache hit (< 30s) → Return cached config
Request 3: Cache hit (< 30s) → Return cached config
...
Request N: Cache expired (> 30s) → Read file → Store in memory → Return config
```

**TTL of 30 seconds** balances:
- Reduced filesystem I/O
- Config changes reflected within reasonable time
- Can be manually invalidated with `invalidateConfigCache()`

## Known Limitations

1. **Process state doesn't survive server restarts**: The singleton lives in Node.js memory. If the server restarts, all process tracking is lost (though the actual processes may still be running orphaned).

2. **Single-agent limitation**: Currently only one instance of each agent type can run. Multiple parallel agents would need different agentIds.

3. **No process recovery**: If a process was started before server restart, it cannot be re-attached.

4. **Shell escaping warning**: Node.js v23+ warns about `shell: true` with args. Consider escaping args in future if user-provided input is allowed.

## Verification Results

All tests passed:
- Config loader finds and parses agents.json
- ProcessManager correctly tracks status (stopped → starting → running → stopped)
- Output buffer captures system messages
- Stop command terminates processes correctly
- Type checking passes with no errors

## Files Created/Modified

| File | Action |
|------|--------|
| `dashboard/lib/config-loader.ts` | Created |
| `dashboard/lib/process-manager.ts` | Created |
| `dashboard/types/agent-api.ts` | Modified (added types) |

## Next Steps

Plan 03-02 will wire these modules into the API routes:
- Update `/api/agents/[id]/start/route.ts` to use `processManager.spawnAgent()`
- Update `/api/agents/[id]/stop/route.ts` to use `processManager.stopAgent()`
- Create `/api/agents/[id]/stream/route.ts` using `subscribeToOutput()` for SSE
