# Dashboard Daddy Development Roadmap

This roadmap outlines the phased development of the Next.js frontend dashboard for Dashboard Daddy - an autonomous AI coding agent platform.

## Current State

- Docker Compose stack is fully operational with Vibe Kanban, terminal, SCIM bridge, and Redis
- Cloudflare Tunnel configured for secure remote access
- Web terminal available via ttyd on port 7681
- **Next.js dashboard frontend has NOT been built yet**

---

## Phase 1: Foundation

**Goal:** Establish the Next.js project scaffold with Tailwind CSS styling and basic routing structure.

**Delivers:**
- Next.js 14+ project initialized with App Router
- Tailwind CSS configured with custom theme matching agency standards
- Basic layout components (header, sidebar, main content area)
- Routing structure for dashboard pages (`/`, `/agents`, `/tasks`, `/logs`)
- Environment configuration for development and production
- TypeScript setup with strict mode enabled
- ESLint and Prettier configuration

**Dependencies:** None - this is the foundation phase

---

## Phase 2: Authentication

**Goal:** Implement secure authentication using Supabase to protect all dashboard routes.

**Delivers:**
- Supabase project integration with environment variables
- Authentication UI (login, logout, password reset)
- Protected route middleware
- Session management and persistence
- User profile display in dashboard header
- Redirect unauthenticated users to login
- Basic role-based access (admin vs viewer)

**Dependencies:** Phase 1 (Foundation) must be complete

---

## Phase 3: Agent Dashboard

**Goal:** Create the primary interface for viewing and controlling AI coding agents.

**Delivers:**
- Agent status cards showing current state (running, idle, stopped, error)
- Start/stop/restart controls for each agent (Claude Code, Gemini CLI, OpenAI Codex)
- Basic metrics display (uptime, tasks completed, current task)
- Agent health indicators with visual status
- Configuration viewer for agent settings
- Docker API integration for container management
- Error state handling and display

**Dependencies:** Phase 2 (Authentication) must be complete

---

## Phase 4: Vibe Kanban Integration

**Goal:** Display and manage the task queue from the existing Vibe Kanban service.

**Delivers:**
- Task queue visualization from Vibe Kanban API
- Kanban board view (To Do, In Progress, Done columns)
- Task detail modal with full information
- Task assignment to specific agents
- Task priority management
- Filter and search functionality
- Integration with Vibe Kanban on port 3000 (internal network)
- Deep linking to full Vibe Kanban interface

**Dependencies:** Phase 3 (Agent Dashboard) must be complete

---

## Phase 5: Real-time Features

**Goal:** Add live updates and log streaming for real-time agent monitoring.

**Delivers:**
- WebSocket connection for live status updates
- Agent log streaming with color-coded output
- Real-time task progress indicators
- Live terminal output preview (from ttyd integration)
- Push notifications for task completion/failure
- Auto-refresh with configurable intervals
- Connection status indicator with reconnection logic
- Server-Sent Events (SSE) fallback option

**Dependencies:** Phase 4 (Vibe Kanban Integration) must be complete

---

## Phase 6: Polish & Deploy

**Goal:** Prepare the dashboard for production deployment on Vercel with optimizations.

**Delivers:**
- Vercel deployment configuration
- Production environment variables setup
- Performance optimization (code splitting, lazy loading)
- Comprehensive error boundaries and fallback UI
- Loading states and skeleton screens
- Responsive design validation (mobile, tablet, desktop)
- Lighthouse performance audit and fixes
- Error logging integration (Sentry or similar)
- Documentation for deployment and configuration
- CI/CD pipeline with preview deployments

**Dependencies:** Phase 5 (Real-time Features) must be complete

---

## Architecture Notes

### Tech Stack
- **Framework:** Next.js 14+ with App Router
- **Styling:** Tailwind CSS
- **Auth:** Supabase
- **Deployment:** Vercel
- **State Management:** React Server Components + minimal client state

### Integration Points
- **Vibe Kanban:** `http://vibe-kanban:3000` (Docker internal network)
- **Terminal:** `http://terminal:7681` (ttyd web terminal)
- **Redis:** `redis://redis:6379` (session caching if needed)

### Security Considerations
- All traffic through Cloudflare Tunnel
- Supabase Row Level Security for data access
- Environment variables for all secrets
- No direct port exposure to internet

---

*Last updated: 2026-01-19*
