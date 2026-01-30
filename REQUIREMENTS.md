# Dashboard Daddy - Requirements

## Core Features

### 1. Homepage (`/`)
**Must display:**
- [ ] Active agents grid with real-time status
- [ ] Task queue with recent tasks
- [ ] Stats overview (agents running, tasks pending/completed)

**Data sources:**
- `/api/agents` → Agent list with status
- `/api/tasks` → Task queue
- `/api/stats` → Dashboard metrics

### 2. Tasks Page (`/tasks`)
**Must display:**
- [ ] All tasks from Supabase `tasks` table
- [ ] Filter tabs: All, Pending, Active, Done
- [ ] Task cards with: title, description, status, priority, assigned agent
- [ ] Swipe actions (complete/delete)
- [ ] Create new task button + modal

**Data sources:**
- `/api/tasks` → All tasks
- `/api/tasks?status=X` → Filtered tasks

**Actions:**
- POST `/api/tasks` → Create task
- PATCH `/api/tasks/[id]` → Update task
- DELETE `/api/tasks/[id]` → Delete task

### 3. Agents Page (`/agents`)
**Must display:**
- [ ] Agent cards with status (running/idle/stopped)
- [ ] Start/Stop/Restart controls
- [ ] Metrics: uptime, completed, failed
- [ ] Filter by status

**Data sources:**
- `/api/agents` → Agent list with status

### 4. Agent Army Page (`/agents/army`)
**Must display:**
- [ ] Commander card (Bubba) at top
- [ ] Squad sections with squad leaders
- [ ] Agent cards within each squad
- [ ] Performance scores, mission counts
- [ ] Unassigned agents section

**Data sources:**
- `/api/agents/army` → Full hierarchy (commander, squads, unassigned)

### 5. Activity Log (`/activity`)
**Must display:**
- [ ] Chronological list of agent actions
- [ ] Filter by agent, action type, date
- [ ] Real-time updates

### 6. Approvals (`/approvals`)
**Must display:**
- [ ] Pending approval requests
- [ ] Approve/Reject actions
- [ ] History of past approvals

### 7. Terminal (`/terminal`)
**Must provide:**
- [ ] Interactive terminal interface
- [ ] Command input
- [ ] Output display

## API Response Formats

### `/api/agents`
```json
{
  "agents": [
    {
      "id": "string",
      "type": "claude-code|gemini-cli|openai-codex",
      "config": { "name": "string", ... },
      "status": "running|idle|stopped|error",
      "metrics": { "uptime": number, "tasksCompleted": number, "tasksFailed": number }
    }
  ],
  "timestamp": "ISO date"
}
```

### `/api/tasks`
```json
[
  {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "status": "pending|active|ongoing|completed",
    "priority": "low|medium|high|critical",
    "assignedAgent": "string",
    "createdAt": "ISO date",
    "completedAt": "ISO date|null"
  }
]
```

### `/api/agents/army`
```json
{
  "commander": { "id", "name", "role", "skills", "performance_score", ... },
  "squads": [
    {
      "name": "Research Squad",
      "leader": { ... },
      "members": [ ... ]
    }
  ],
  "unassigned": [ ... ],
  "stats": { "total", "active", "successRate", "avgPerformance" }
}
```

## Database Schema (Supabase)

### `tasks` table
| Column | Type | Required |
|--------|------|----------|
| id | uuid | ✅ |
| title | text | ✅ |
| description | text | |
| status | text | ✅ |
| priority | text | ✅ |
| assigned_agent | text | |
| created_at | timestamptz | ✅ |
| completed_at | timestamptz | |

### `agent_army` table
| Column | Type | Required |
|--------|------|----------|
| id | uuid | ✅ |
| name | text | ✅ |
| role | text | ✅ |
| squad | text | |
| parent_id | uuid | |
| skills | jsonb | |
| status | text | ✅ |
| performance_score | int | |
| missions_completed | int | |

## Non-Functional Requirements

### Performance
- Page load: < 2 seconds
- API response: < 500ms
- Real-time updates: < 1 second delay

### Reliability
- 99.9% uptime target
- Graceful error handling
- Fallback UI for loading states

### Security
- Environment variables for secrets
- No client-side secret exposure
- Supabase RLS policies (future)
