-- Enable real-time for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE agents, messages, memory_items, message_reactions;

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL,
    description TEXT,
    status VARCHAR DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    avatar_url TEXT,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    thread_id UUID,
    mentions JSONB DEFAULT '[]',
    attachments JSONB DEFAULT '[]',
    is_code BOOLEAN DEFAULT FALSE,
    code_language VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Message reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    emoji VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, agent_id, emoji)
);

-- Memory items table for search
CREATE TABLE IF NOT EXISTS memory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    topics JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typing indicators table
CREATE TABLE IF NOT EXISTS typing_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    channel VARCHAR DEFAULT 'general',
    is_typing BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(agent_id, channel)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_memory_items_agent_id ON memory_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_memory_items_created_at ON memory_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_agent_id ON typing_indicators(agent_id);

-- Full text search index for memory content
CREATE INDEX IF NOT EXISTS idx_memory_items_content_fts 
ON memory_items USING gin(to_tsvector('english', content));

-- RLS (Row Level Security) policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you may want to restrict this later)
CREATE POLICY "Allow all for agents" ON agents FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for messages" ON messages FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for message_reactions" ON message_reactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for memory_items" ON memory_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for typing_indicators" ON typing_indicators FOR ALL TO authenticated USING (true);

-- Insert some sample agents
INSERT INTO agents (name, description, status) VALUES 
('Bubba', 'Primary AI Assistant - Life OS Orchestrator', 'online'),
('Quinn', 'Life Manager - Daily briefings and task delegation', 'online'),
('Sam', 'Personal Assistant - Schedule and appointment management', 'away'),
('Riley', 'CRM Operations - Contact and pipeline management', 'offline'),
('Taylor', 'Finance Manager - Invoicing and payment tracking', 'offline')
ON CONFLICT DO NOTHING;

-- Insert some sample memory items
INSERT INTO memory_items (title, content, topics, agent_id) VALUES 
('Project Setup Guidelines', 'Always create comprehensive documentation and follow TypeScript best practices. Use proper error handling and loading states.', '["development", "guidelines", "typescript"]', (SELECT id FROM agents WHERE name = 'Bubba' LIMIT 1)),
('Client Communication Protocol', 'Weekly check-ins every Tuesday. Send project updates via email. Always CC julian@aiacrobatics.com on important communications.', '["communication", "clients", "protocols"]', (SELECT id FROM agents WHERE name = 'Quinn' LIMIT 1)),
('Database Backup Schedule', 'Automated backups run daily at 2 AM EST. Manual backups before major deployments. Store in encrypted S3 bucket.', '["database", "backups", "maintenance"]', (SELECT id FROM agents WHERE name = 'Riley' LIMIT 1))
ON CONFLICT DO NOTHING;