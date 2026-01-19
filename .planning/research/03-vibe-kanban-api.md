# Vibe Kanban API Research

## API Endpoints

**Base URL:** `http://vibe-kanban:3000/api`

### Task Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/projects/:project_id/tasks` | Fetch all tasks with attempt status |
| POST | `/projects/:project_id/tasks` | Create new task |
| GET | `/projects/:project_id/tasks/:task_id` | Get specific task |
| PUT | `/projects/:project_id/tasks/:task_id` | Update task |
| DELETE | `/projects/:project_id/tasks/:task_id` | Delete task (202 Accepted) |
| POST | `/projects/:project_id/tasks/:task_id/share` | Share task |
| POST | `/projects/:project_id/tasks/create-and-start` | Create and start execution |

### Real-time Endpoints
| Type | Endpoint | Description |
|------|----------|-------------|
| WebSocket | `/projects/:project_id/tasks/stream/ws` | Real-time task updates via JSON Patch |
| SSE | `/events` | Server-Sent Events for system events |

## Data Models

### Task
```typescript
interface Task {
  id: string;           // UUID
  project_id: string;   // UUID
  title: string;
  description?: string;
  status: TaskStatus;
  parent_workspace_id?: string;
  shared_task_id?: string;
  created_at: string;   // DateTime
  updated_at: string;   // DateTime
}

interface TaskWithAttemptStatus extends Task {
  has_in_progress_attempt: boolean;
  last_attempt_failed: boolean;
  executor: string;
}

type TaskStatus = "todo" | "inprogress" | "inreview" | "done" | "cancelled";
```

### CreateTask / UpdateTask
```typescript
interface CreateTask {
  project_id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  parent_workspace_id?: string;
  image_ids?: string[];
  shared_task_id?: string;
}

interface UpdateTask {
  title?: string;
  description?: string;
  status?: TaskStatus;
  parent_workspace_id?: string;
  image_ids?: string[];
}
```

## WebSocket Real-time Pattern

1. **Connect:** `ws://vibe-kanban:3000/api/projects/${projectId}/tasks/stream/ws`
2. **Initial:** Receive full task list as JSON Patch snapshot
3. **Updates:** Incremental JSON Patch operations:
   - `"op": "add"` — New task
   - `"op": "replace"` — Task updated
   - `"op": "remove"` — Task deleted

### Client Example
```typescript
const ws = new WebSocket(
  `ws://vibe-kanban:3000/api/projects/${projectId}/tasks/stream/ws`
);

ws.onmessage = (event) => {
  const patch = JSON.parse(event.data);
  // Apply JSON Patch to local state
  jsonpatch.applyPatch(tasks, patch);
};
```

## Integration Approach

### Backend (Next.js API Routes)
```
/app/api/kanban/
├── projects/route.ts          # GET all projects
├── projects/[id]/tasks/route.ts  # GET/POST tasks
└── projects/[id]/tasks/[taskId]/route.ts  # GET/PUT/DELETE task
```

Proxy pattern: Dashboard → Next.js Backend → Vibe Kanban (internal network)

### Frontend Components
- KanbanBoard (columns for each status)
- TaskCard (draggable)
- TaskDetailModal
- TaskFilters

### State Management
- React state/context for tasks
- WebSocket connection manager with reconnect logic
- JSON Patch library for efficient updates

## Docker Configuration

From `docker-compose.yml`:
```yaml
vibe-kanban:
  image: node:20-alpine
  command: sh -lc "HOST=0.0.0.0 PORT=3000 npx -y vibe-kanban"
  networks:
    - root_default
```

Accessible as `http://vibe-kanban:3000` from other containers.

## Key Source Files

- **Models:** `vibe-kanban/crates/db/src/models/task.rs`
- **API Routes:** `vibe-kanban/crates/server/src/routes/tasks.rs`
- **Events:** `vibe-kanban/crates/services/src/services/events.rs`
- **Streams:** `vibe-kanban/crates/services/src/services/events/streams.rs`

---
*Research completed: 2026-01-19*
