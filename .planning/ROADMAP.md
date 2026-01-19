# Dashboard Daddy Roadmap

## Milestone 1: MVP Dashboard

**Goal**: Replace Vibe Kanban with custom Next.js dashboard for agent orchestration

### Phases

- [x] **Phase 1: Foundation** — Next.js project structure, Tailwind, Docker integration
- [x] **Phase 2: Authentication** — NextAuth v5, protected routes, session management
- [ ] **Phase 3: Agent API** — REST endpoints for agent control, status polling
- [ ] **Phase 4: Dashboard UI** — Project list, agent status cards, job queue view
- [ ] **Phase 5: Terminal Integration** — Embed ttyd terminal, split-pane layout
- [ ] **Phase 6: Polish & Deploy** — Mobile optimization, error handling, Vercel/Docker deployment

---

### Phase 1: Foundation
**Goal**: Scaffolded Next.js app running in Docker alongside existing services
**Depends on**: None
**Plans:** 1 plan

**Status:** Next.js 16 app with App Router, Tailwind CSS 4, and full dashboard UI already exist in `dashboard/`. Remaining work is Docker integration.

Plans:
- [ ] 01-01-PLAN.md — Docker integration (Dockerfile + compose + Traefik)

**Deliverables:**
- Next.js 14 app with App Router (DONE - using Next.js 16)
- Tailwind CSS configured (DONE)
- Docker service added to compose (PLANNED)
- Traefik routing configured (PLANNED)
- Basic landing page (DONE - full dashboard UI exists)

---

### Phase 2: Authentication
**Goal**: Secure access with login/logout, session management
**Depends on**: Phase 1

**Deliverables:**
- Auth provider setup (Supabase or NextAuth)
- Login/logout pages
- Protected route middleware
- User session in UI

---

### Phase 3: Agent API
**Goal**: Backend endpoints to spawn, monitor, and stop agents
**Depends on**: Phase 1

**Deliverables:**
- POST /api/agents/spawn - Start agent on project
- GET /api/agents/status - List running agents
- POST /api/agents/stop - Terminate agent
- WebSocket or polling for real-time status

---

### Phase 4: Dashboard UI
**Goal**: Visual interface for managing projects and agents
**Depends on**: Phase 2, Phase 3

**Deliverables:**
- Project cards with agent status
- Job queue table
- Agent output viewer
- Start/stop controls

---

### Phase 5: Terminal Integration
**Goal**: Embedded terminal for direct agent interaction
**Depends on**: Phase 4

**Deliverables:**
- ttyd iframe or xterm.js integration
- Split-pane layout (dashboard + terminal)
- Terminal session management

---

### Phase 6: Polish & Deploy
**Goal**: Production-ready deployment
**Depends on**: Phase 5

**Deliverables:**
- Mobile-responsive design
- Error boundaries and toasts
- Docker production build
- Vercel deployment option
- Documentation update
