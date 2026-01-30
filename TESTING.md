# Dashboard Daddy - Testing Requirements

## Pre-Deployment Checklist

### 1. API Verification
Before any deploy, verify ALL APIs return correct data:

```bash
# Stats
curl -s https://dashboard-daddy.vercel.app/api/stats | jq '.tasks.active'

# Tasks (must return array)
curl -s https://dashboard-daddy.vercel.app/api/tasks | jq 'length'

# Agents (must return { agents: [...] })
curl -s https://dashboard-daddy.vercel.app/api/agents | jq '.agents | length'

# Agent Army (must return { commander, squads, unassigned })
curl -s https://dashboard-daddy.vercel.app/api/agents/army | jq '.commander.name'
```

### 2. Client-Side Rendering Verification
After deploy, MUST verify these pages render data (not "Loading..."):

| Page | Expected Content | Test |
|------|------------------|------|
| `/` | Agent cards, Task list | NOT "Loading agents..." |
| `/tasks` | Task cards with statuses | NOT "Loading tasks..." |
| `/agents` | Agent stats > 0 | Total Agents > 0 |
| `/agents/army` | Commander name "Bubba" | Bubba visible |

### 3. Browser Console Check
Must open DevTools and check for:
- [ ] No red errors in Console
- [ ] Network tab shows 200 on all API calls
- [ ] No CORS errors
- [ ] No hydration errors

## Type Requirements

### API Response Types MUST Match Components

```typescript
// /api/agents returns:
{ agents: Agent[], timestamp: string }

// Component must use:
useSWR<AgentListResponse>  // NOT useSWR<Agent[]>

// /api/tasks returns:
Task[]  // Direct array

// Task status values from API:
"pending" | "active" | "ongoing" | "completed"
// NOT: "in_progress" | "failed"
```

## Testing Protocol

### Manual Testing (Required before "Done")
1. Open https://dashboard-daddy.vercel.app in browser
2. Check each page loads data (not loading spinners)
3. Open DevTools → Console → No errors
4. Open DevTools → Network → All 200s
5. Screenshot any failures

### Automated Testing (TODO)
- [ ] Add Playwright E2E tests
- [ ] Add API contract tests
- [ ] Add Vitest unit tests for components

## Known Issues Log

| Date | Issue | Root Cause | Fix |
|------|-------|-----------|-----|
| 2026-01-30 | AgentGrid stuck on "Loading" | Type mismatch - expected Agent[], got {agents:[]} | Changed to AgentListResponse |
| 2026-01-30 | TaskList no icons | Status mismatch - API uses "active", component expected "in_progress" | Added all status types |
| 2026-01-30 | Client not hydrating | Unknown | INVESTIGATING |

## Definition of "Done"

A feature is DONE when:
1. ✅ Code compiles without errors
2. ✅ API endpoints return correct data format
3. ✅ **UI renders data in browser** (not loading state)
4. ✅ No console errors
5. ✅ Tested on production URL
6. ✅ Screenshot proof attached to PR/commit
