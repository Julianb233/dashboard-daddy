# Dashboard Daddy

## Vision

**Autonomous AI Coding Agent Platform** - A unified dashboard to orchestrate multiple AI coding agents (Claude Code, Gemini CLI, OpenAI Codex) on your VPS with secure remote access.

## Core Value Proposition

Run AI coding agents from any device (iPhone, iPad, Mac, PC) through your custom domain. Agents run autonomously with permission-skipping for hands-off parallel coding across multiple projects.

## Current State

**What exists:**
- Docker Compose stack with Vibe Kanban, web terminal (ttyd), 1Password SCIM bridge
- Cloudflare Tunnel integration for secure remote access
- Agent configuration (agents.json) for Claude/Gemini/Codex
- Traefik routing for multiple subdomains (claude.*, terminal.*, scim.*)
- Install scripts and systemd service

**What's missing:**
- Custom Next.js dashboard UI (currently uses Vibe Kanban directly)
- Authentication layer
- Agent orchestration API
- Job queue and status tracking
- Multi-project parallel execution UI

## Architecture

```
Devices → Cloudflare Tunnel → VPS Docker Stack
  │
  ├── Dashboard UI (Next.js) - to be built
  ├── Web Terminal (ttyd/tmux)
  ├── AI Agents (Claude/Gemini/Codex)
  └── 1Password SCIM Bridge
```

## Tech Stack

- **Runtime**: Node.js 20 (Alpine)
- **Container**: Docker Compose
- **Frontend**: Next.js (to be built)
- **Auth**: Supabase or NextAuth (TBD)
- **Tunnel**: Cloudflare (cloudflared)
- **Agents**: Claude Code, Gemini CLI, OpenAI Codex
- **Terminal**: ttyd with tmux
- **Routing**: Traefik

## Key Features (Target)

1. **Multi-Agent Dashboard**: View and control all agents from one UI
2. **Parallel Execution**: Run agents on multiple projects simultaneously
3. **Job Queue**: Track agent tasks, status, and outputs
4. **Git Integration**: Automatic worktrees, PR creation
5. **Mobile-First**: Access from any device via Cloudflare Tunnel
6. **Auto-Start**: Systemd service ensures uptime

## Constraints

- Must work on low-resource VPS (2GB RAM minimum)
- No exposed ports - Cloudflare Tunnel only
- API keys stored in .env, never committed
- Agents run with elevated permissions - secure VPS required

## User

Solo developer managing multiple projects who wants AI agents working in parallel while mobile.
