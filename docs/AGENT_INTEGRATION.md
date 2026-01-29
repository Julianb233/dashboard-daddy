# Agent Integration Guide - Shared Memory & Context System

This document explains how Claude agents can work together using the shared memory and context system.

## Overview

Multiple Claude agents (Bubba, Claude Code, etc.) can collaborate by reading from and writing to shared storage systems. This creates a unified knowledge base that persists across sessions and agents.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SHARED CONTEXT LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐      │
│   │   Bubba     │   │ Claude Code │   │  Agent N    │      │
│   │  (Telegram) │   │   (CLI)     │   │  (Future)   │      │
│   └──────┬──────┘   └──────┬──────┘   └──────┬──────┘      │
│          │                 │                  │              │
│          └────────────┬────┴─────────────────┘              │
│                       │                                      │
│          ┌────────────▼────────────┐                        │
│          │   TRIPLE STORAGE LAYER   │                        │
│          ├──────────────────────────┤                        │
│          │ 1. Local Files (MD)      │                        │
│          │ 2. Pinecone (Vectors)    │                        │
│          │ 3. Supabase (Structured) │                        │
│          └──────────────────────────┘                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Storage Systems

### 1. Local Memory Files (Primary Context)

**Location:** `/home/dev/clawd/memory/`

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `MEMORY.md` | Long-term curated memories | Weekly |
| `memory/YYYY-MM-DD.md` | Daily logs and events | Daily |
| `memory/faith.md` | Pet health records | As needed |
| `memory/*.md` | Topic-specific notes | As needed |

**Reading:**
```bash
cat /home/dev/clawd/memory/2026-01-28.md
cat /home/dev/clawd/MEMORY.md
```

**Writing:**
```bash
echo "## New Entry" >> /home/dev/clawd/memory/$(date +%Y-%m-%d).md
```

### 2. Pinecone (Semantic Search)

**Index:** `lifeos`
**Dimensions:** 1536 (Gemini gemini-embedding-001)
**Host:** `lifeos-nfds4af.svc.aped-4627-b74a.pinecone.io`

**Namespaces:**
- `personal` - Personal info, pets, preferences
- `business` - Work tasks, projects, clients
- `learning` - Knowledge, skills, documentation

**Tool:** `/home/dev/clawd/tools/pinecone_tool.py`

```bash
# Store
python3 tools/pinecone_tool.py store \
  --namespace personal \
  --text "Faith is Julian's dog, 10.6 lbs..."

# Query
python3 tools/pinecone_tool.py query \
  --text "What medication does Faith take?" \
  --namespace personal \
  --top 3

# Stats
python3 tools/pinecone_tool.py stats
```

### 3. Supabase (Structured Data)

**Project:** `jrirksdiklqwsaatbhvg`
**URL:** `https://jrirksdiklqwsaatbhvg.supabase.co`

**Key Tables for Agents:**

| Table | Use Case |
|-------|----------|
| `scheduled_tasks` | Tasks, reminders, action items |
| `memory_items` | Structured memory entries |
| `contacts` | People and relationships |
| `pets` | Pet health records |
| `projects` | Project tracking |
| `audit_logs` | Track all changes |

**API Access:**
```bash
SERVICE_KEY="..." # From 1Password
curl -s "https://jrirksdiklqwsaatbhvg.supabase.co/rest/v1/pets" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY"
```

## Context Generation Protocol

When an agent needs context, follow this order:

### Step 1: Load Core Files
```bash
# Always read these first
cat /home/dev/clawd/SOUL.md      # Agent identity
cat /home/dev/clawd/USER.md      # User info
cat /home/dev/clawd/TOOLS.md     # Available tools
cat /home/dev/clawd/MEMORY.md    # Long-term memory
```

### Step 2: Load Daily Context
```bash
# Today and yesterday's logs
cat /home/dev/clawd/memory/$(date +%Y-%m-%d).md
cat /home/dev/clawd/memory/$(date -d yesterday +%Y-%m-%d).md
```

### Step 3: Query Specific Context
```bash
# If task mentions a person/pet/project, query Supabase
# If task needs semantic search, query Pinecone
```

## Writing Back (Synchronization)

### Rule: Write to All Three Systems

When storing important information:

```python
# 1. Append to daily log
with open(f"memory/{date}.md", "a") as f:
    f.write(f"\n## {title}\n{content}\n")

# 2. Store in Pinecone for semantic search
os.system(f'python3 tools/pinecone_tool.py store --namespace {ns} --text "{content}"')

# 3. Insert into Supabase for structured queries
requests.post(f"{SUPABASE_URL}/rest/v1/memory_items", 
    headers={"apikey": KEY},
    json={"category": cat, "title": title, "content": content})
```

## Agent Communication Protocol

### Handoff Format

When one agent hands off to another:

```markdown
## Agent Handoff: [Source] → [Target]
**Date:** YYYY-MM-DD HH:MM
**Task:** Brief description
**Status:** In Progress / Blocked / Complete
**Context Files:**
- memory/2026-01-28.md (lines 50-75)
- Supabase: scheduled_tasks WHERE id = '...'

**Next Steps:**
1. Step one
2. Step two

**Blockers:**
- Waiting for X
```

### Conflict Resolution

If multiple agents write to the same resource:
1. Check `audit_logs` for recent changes
2. Timestamp your writes
3. Use Supabase transactions for atomic updates

## Example: How Bubba Stores Faith's Vet Info

```python
# When Julian tells Bubba about Faith's vet visit:

# 1. Daily log (immediate)
append_to_file("memory/2026-01-28.md", """
## Faith Vet Visit
- Diagnosis: Ear infection
- Treatment: Mometamax 8 drops daily
- Follow-up: Feb 11
""")

# 2. Dedicated file (persistent)
write_file("memory/faith.md", full_content)

# 3. Pinecone (searchable)
store_pinecone("personal", "Faith ear infection diagnosed 1/28...")

# 4. Supabase (structured)
upsert_supabase("pets", {
    "name": "Faith",
    "medical_notes": "...",
    "medications": [...],
    "upcoming_appointments": [...]
})
```

## Credentials Location

All credentials are in 1Password (vault: API-Keys) and cached locally:

| Service | Local Path |
|---------|------------|
| Pinecone | `~/.config/pinecone/api_key` |
| Supabase | `~/.config/supabase/service_key` |
| Google | `~/.config/google-cloud/api_key` |

## Quick Reference

```bash
# Get today's context
cat ~/clawd/memory/$(date +%Y-%m-%d).md

# Search memory semantically
python3 ~/clawd/tools/pinecone_tool.py query --text "your query"

# Get structured data
curl -s "$SUPABASE_URL/rest/v1/TABLE" -H "apikey: $KEY"

# Write to memory
echo "content" >> ~/clawd/memory/$(date +%Y-%m-%d).md
```

---

**Maintained by:** Bubba (Julian's Life OS Agent)
**Last Updated:** 2026-01-28
