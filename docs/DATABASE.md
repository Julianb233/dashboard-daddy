# Dashboard Daddy - Database Schema

## Supabase Tables (25 total)

### Core Tables
- `profiles` - User accounts
- `agent_configs` - AI agent configurations
- `task_history` - Task execution logs

### Memory & Knowledge
- `memory_items` - Long-term memory storage
- `documents` - Knowledge base / SOPs

### Scheduling
- `scheduled_tasks` - Reminders & scheduled items
- `calendar_events` - Calendar integration

### People & Pets
- `contacts` - Contact management
- `pets` - Pet health records (e.g., Faith)

### Finance
- `expenses` - AI/tool expense tracking
- `api_usage` - API usage/billing

### Communication
- `communications` - SMS/email logs
- `notifications` - Alert settings

### Projects & Goals
- `projects` - Project tracking
- `goals` - Goals & objectives
- `workflows` - Automation workflows
- `workflow_runs` - Workflow execution history

### Organization
- `tags` - Tag definitions
- `entity_tags` - Many-to-many tag associations
- `attachments` - File attachments

### Tracking
- `audit_logs` - Change tracking
- `ai_sessions` - AI session tracking
- `daily_summaries` - Daily reports
- `integrations` - Connected services

### Config
- `settings` - System settings

## Migrations
Located in `/supabase/migrations/`:
- `001_init.sql` - Core tables
- `002_full_schema.sql` - Extended schema
- `003_complete_schema.sql` - Full Life OS schema
