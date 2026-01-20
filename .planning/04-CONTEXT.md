# Phase 4: Dashboard UI — Context

## Phase Scope

From ROADMAP.md:
- Project cards with agent status
- Job queue table
- Agent output viewer
- Start/stop controls

**Actual work:** Wire existing UI components to Phase 3's real API, replacing mock data.

## Decisions

### Agent List → API Integration

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data refresh method | Polling at 5s intervals | Simple, reliable, consistent behavior |
| Error handling | Silent retry with exponential backoff | Show error only after 3 consecutive failures. Dashboard stays open long-term; don't annoy user with transient issues |
| API endpoint | `GET /api/agents` | Already built in Phase 3, returns real ProcessManager state |

### Terminal Output UX

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auto-scroll behavior | Smart auto-scroll | Auto-scroll when at bottom. Pause when user scrolls up. Resume when user scrolls back to bottom |
| Connection handling | Silent auto-reconnect with backoff | Show small indicator while disconnected. Resume streaming automatically |
| Buffer size | Unlimited (until page refresh) | Users want full history for post-mortem analysis |
| Data source | `GET /api/agents/[id]/stream` (SSE) | Already built in Phase 3 |

### Start/Stop Controls UX

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Stop confirmation | No confirmation required | Quick action. Graceful shutdown (SIGTERM + 5s timeout) gives agent time to clean up. Matches CLI behavior |
| Button state during operations | Disable + spinner | Button shows spinner and is disabled until operation completes or times out (10s) |
| API endpoints | `POST /api/agents/[id]/start`, `POST /api/agents/[id]/stop` | Already built in Phase 3 |

### Projects Page Data Source

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Data source | Derive from agents.json | Each agent has a project path. Aggregate unique projects from agent configs. No separate projects.json needed |
| Card content | Both agent status and git info | Show agent count + status summary AND git branch + last commit. Richer cards for managing multiple repos |
| Git info API | New endpoint needed | `GET /api/projects` that reads agents.json, groups by project, and fetches git state from filesystem |

## Technical Constraints

- **Existing UI:** Components exist in `dashboard/` — AgentCard, AgentTerminal, AgentGrid, ProjectCard, etc.
- **Existing API:** Phase 3 built agent control endpoints (start/stop/stream/list)
- **Mock data locations:** `lib/agents.ts`, `lib/tasks.ts`, `app/page.tsx`, `app/projects/page.tsx`
- **Styling:** Tailwind CSS 4, shadcn/ui, dark mode support already configured

## New API Endpoint Needed

### GET /api/projects

Returns projects derived from agents.json with git info:

```typescript
interface Project {
  path: string;           // Unique identifier (project directory)
  name: string;           // Directory name or derived from path
  agents: {
    total: number;
    running: number;
    idle: number;
    offline: number;
  };
  git?: {
    branch: string;
    lastCommit: {
      hash: string;
      message: string;
      date: string;
    };
  };
}
```

## Out of Scope

- Task/job queue improvements (existing TaskBoard can stay with mock data for MVP)
- New agent configuration UI (agents.json is source of truth)
- Metrics page changes (can stay with mock data for MVP)

## Next Steps

Run `/gsd:plan-phase 4` to create the implementation plan.
