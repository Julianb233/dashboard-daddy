-- ============================================
-- MESSAGING & MEMORY SEARCH SCHEMA ADDITIONS
-- ============================================
-- Add these tables to the existing Dashboard Daddy schema

-- ============================================
-- AGENTS TABLE (for messaging)
-- ============================================

CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    avatar_url TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    thread_id UUID,
    mentions JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    is_code BOOLEAN DEFAULT FALSE,
    code_language VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGE REACTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    emoji VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, agent_id, emoji)
);

-- ============================================
-- MEMORY ITEMS TABLE (for search)
-- ============================================

CREATE TABLE IF NOT EXISTS public.memory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR,
    agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
    topics JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TYPING INDICATORS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    channel VARCHAR DEFAULT 'general',
    is_typing BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, channel)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON public.messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_memory_items_agent_id ON public.memory_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_memory_items_created_at ON public.memory_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_agent_id ON public.typing_indicators(agent_id);

-- Full text search index for memory content
CREATE INDEX IF NOT EXISTS idx_memory_items_content_fts 
ON public.memory_items USING gin(to_tsvector('english', content));

-- ============================================
-- UPDATE TIMESTAMP TRIGGERS
-- ============================================

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER memory_items_updated_at
  BEFORE UPDATE ON public.memory_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users (adjust as needed)
CREATE POLICY "Allow all for agents" ON public.agents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for messages" ON public.messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for message_reactions" ON public.message_reactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for memory_items" ON public.memory_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for typing_indicators" ON public.typing_indicators FOR ALL TO authenticated USING (true);

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert sample agents
INSERT INTO public.agents (name, description, status) VALUES 
('Bubba', 'Primary AI Assistant - Life OS Orchestrator', 'online'),
('Quinn', 'Life Manager - Daily briefings and task delegation', 'online'),
('Sam', 'Personal Assistant - Schedule and appointment management', 'away'),
('Riley', 'CRM Operations - Contact and pipeline management', 'offline'),
('Taylor', 'Finance Manager - Invoicing and payment tracking', 'offline')
ON CONFLICT DO NOTHING;

-- Insert sample memory items
INSERT INTO public.memory_items (title, content, topics, agent_id) VALUES 
('Project Setup Guidelines', 'Always create comprehensive documentation and follow TypeScript best practices. Use proper error handling and loading states.', '["development", "guidelines", "typescript"]', (SELECT id FROM public.agents WHERE name = 'Bubba' LIMIT 1)),
('Client Communication Protocol', 'Weekly check-ins every Tuesday. Send project updates via email. Always CC julian@aiacrobatics.com on important communications.', '["communication", "clients", "protocols"]', (SELECT id FROM public.agents WHERE name = 'Quinn' LIMIT 1)),
('Database Backup Schedule', 'Automated backups run daily at 2 AM EST. Manual backups before major deployments. Store in encrypted S3 bucket.', '["database", "backups", "maintenance"]', (SELECT id FROM public.agents WHERE name = 'Riley' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO public.messages (content, agent_id, created_at) VALUES 
('Hey team! Just finished setting up the new deployment pipeline.', (SELECT id FROM public.agents WHERE name = 'Bubba' LIMIT 1), NOW() - INTERVAL '2 hours'),
('Great work @Bubba! Can you share the documentation?', (SELECT id FROM public.agents WHERE name = 'Quinn' LIMIT 1), NOW() - INTERVAL '1 hour'),
('Sure! Here it is: ```bash\nnpm run deploy\n```', (SELECT id FROM public.agents WHERE name = 'Bubba' LIMIT 1), NOW() - INTERVAL '30 minutes')
ON CONFLICT DO NOTHING;

-- ============================================
-- ENABLE REAL-TIME
-- ============================================

-- Enable real-time for all new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents, public.messages, public.memory_items, public.message_reactions;

-- ============================================
-- DONE
-- ============================================
-- Run this SQL in Supabase SQL Editor to add messaging and memory search features