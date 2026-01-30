-- Dashboard Daddy Tables for Life OS Supabase
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/jrirksdiklqwsaatbhvg/sql

-- ============================================
-- RELATIONSHIPS / PEOPLE CONTEXT TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.relationships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  relationship_type TEXT DEFAULT 'unknown',  -- family, business, friend, client
  priority TEXT DEFAULT 'medium',  -- high, medium, low
  status TEXT DEFAULT 'active',
  notes TEXT,
  last_contact TIMESTAMPTZ,
  contact_count INTEGER DEFAULT 0,
  sentiment TEXT DEFAULT 'neutral',  -- positive, neutral, negative
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(name)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_relationships_name ON public.relationships(name);
CREATE INDEX IF NOT EXISTS idx_relationships_type ON public.relationships(relationship_type);

-- ============================================
-- AGENT EXECUTION LOG (Audit Trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.agent_execution_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT DEFAULT 'Bubba',
  actor_role TEXT DEFAULT 'agent',
  details TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for recent logs
CREATE INDEX IF NOT EXISTS idx_agent_log_created ON public.agent_execution_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_log_action ON public.agent_execution_log(action);

-- ============================================
-- KANBAN TASKS
-- ============================================

CREATE TABLE IF NOT EXISTS public.kanban_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',  -- pending, in_progress, done, completed
  priority TEXT DEFAULT 'medium',
  agent TEXT DEFAULT 'Bubba',
  due_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kanban_status ON public.kanban_tasks(status);

-- ============================================
-- COMMUNICATION LOGS
-- ============================================

CREATE TABLE IF NOT EXISTS public.communication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT,  -- telegram, email, sms
  direction TEXT,  -- inbound, outbound
  contact_name TEXT,
  summary TEXT,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comm_logs_created ON public.communication_logs(created_at DESC);

-- ============================================
-- AGENT STATUS
-- ============================================

CREATE TABLE IF NOT EXISTS public.agent_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'idle',  -- active, running, idle, error
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  tasks_completed INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'
);

-- ============================================
-- APPROVAL QUEUE
-- ============================================

CREATE TABLE IF NOT EXISTS public.approval_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  agent TEXT DEFAULT 'Bubba',
  status TEXT DEFAULT 'pending',  -- pending, approved, rejected
  priority TEXT DEFAULT 'medium',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_approval_status ON public.approval_queue(status);

-- ============================================
-- RLS POLICIES (Allow public access for now - tighten later)
-- ============================================

ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_execution_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kanban_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can tighten this later with user auth)
CREATE POLICY "Allow all for relationships" ON public.relationships FOR ALL USING (true);
CREATE POLICY "Allow all for agent_execution_log" ON public.agent_execution_log FOR ALL USING (true);
CREATE POLICY "Allow all for kanban_tasks" ON public.kanban_tasks FOR ALL USING (true);
CREATE POLICY "Allow all for communication_logs" ON public.communication_logs FOR ALL USING (true);
CREATE POLICY "Allow all for agent_status" ON public.agent_status FOR ALL USING (true);
CREATE POLICY "Allow all for approval_queue" ON public.approval_queue FOR ALL USING (true);

-- ============================================
-- SEED INITIAL DATA
-- ============================================

-- Add Bubba as active agent
INSERT INTO public.agent_status (agent_name, status, tasks_completed, tokens_used)
VALUES ('Bubba', 'active', 0, 0)
ON CONFLICT (agent_name) DO NOTHING;

COMMIT;
