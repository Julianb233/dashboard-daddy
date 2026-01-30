-- Agent Army table for hierarchical agent organization
-- Supports Commander -> Squad Leader -> Agent hierarchy

CREATE TABLE IF NOT EXISTS agent_army (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('commander', 'squad_leader', 'agent')),
    squad VARCHAR(50), -- Squad name for squad_leaders and agents
    parent_id UUID REFERENCES agent_army(id), -- For hierarchical relationships
    skills TEXT[], -- Array of skill names
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('active', 'idle', 'busy', 'offline')),
    current_task TEXT,
    performance_score INTEGER DEFAULT 100 CHECK (performance_score >= 0 AND performance_score <= 100),
    missions_completed INTEGER DEFAULT 0,
    missions_failed INTEGER DEFAULT 0,
    total_uptime INTEGER DEFAULT 0, -- in minutes
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    avatar_url TEXT, -- Optional avatar image
    description TEXT,
    
    -- Additional metrics
    success_rate DECIMAL(5,2) GENERATED ALWAYS AS (
        CASE 
            WHEN (missions_completed + missions_failed) = 0 THEN 100.0
            ELSE ROUND((missions_completed::DECIMAL / (missions_completed + missions_failed)) * 100, 2)
        END
    ) STORED
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agent_army_role ON agent_army(role);
CREATE INDEX IF NOT EXISTS idx_agent_army_squad ON agent_army(squad);
CREATE INDEX IF NOT EXISTS idx_agent_army_status ON agent_army(status);
CREATE INDEX IF NOT EXISTS idx_agent_army_parent_id ON agent_army(parent_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_agent_army_updated_at 
    BEFORE UPDATE ON agent_army 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data: Commander Bubba
INSERT INTO agent_army (name, role, squad, skills, status, current_task, description, performance_score, missions_completed) 
VALUES (
    'Bubba', 
    'commander', 
    NULL, 
    ARRAY['Strategic Planning', 'Team Coordination', 'Decision Making', 'AI Orchestration', 'Problem Solving'],
    'active',
    'Overseeing Agent Army Operations',
    'Main AI Commander responsible for strategic planning and agent coordination across all squads.',
    98,
    157
) ON CONFLICT (id) DO NOTHING;

-- Get Bubba's ID for parent relationships
DO $$
DECLARE
    bubba_id UUID;
BEGIN
    SELECT id INTO bubba_id FROM agent_army WHERE name = 'Bubba' AND role = 'commander';
    
    -- Insert Squad Leaders
    INSERT INTO agent_army (name, role, squad, parent_id, skills, status, current_task, description, performance_score, missions_completed) VALUES
    ('Alpha', 'squad_leader', 'Research', bubba_id, ARRAY['Data Analysis', 'Research Methodology', 'Report Generation', 'Information Synthesis'], 'active', 'Market Research Initiative', 'Research Squad Leader specializing in data analysis and competitive intelligence.', 94, 89),
    ('Beta', 'squad_leader', 'Development', bubba_id, ARRAY['Code Architecture', 'Project Management', 'Quality Assurance', 'Technical Leadership'], 'busy', 'Dashboard Daddy Enhancement', 'Development Squad Leader overseeing all coding and software projects.', 96, 112),
    ('Gamma', 'squad_leader', 'Communications', bubba_id, ARRAY['Content Creation', 'Social Media', 'Customer Relations', 'Brand Management'], 'active', 'Content Calendar Planning', 'Communications Squad Leader managing all external and internal communications.', 92, 76),
    ('Delta', 'squad_leader', 'Operations', bubba_id, ARRAY['Process Optimization', 'Workflow Management', 'System Administration', 'Performance Monitoring'], 'idle', 'System Health Monitoring', 'Operations Squad Leader ensuring smooth daily operations and system performance.', 97, 134);
    
    -- Insert Research Squad Agents
    INSERT INTO agent_army (name, role, squad, skills, status, current_task, description, performance_score, missions_completed) VALUES
    ('Scout', 'agent', 'Research', ARRAY['Web Scraping', 'Competitive Analysis', 'Trend Identification'], 'busy', 'Competitor Analysis', 'Research agent focused on competitive intelligence and market trends.', 91, 45),
    ('Analyst', 'agent', 'Research', ARRAY['Data Mining', 'Statistical Analysis', 'Report Writing'], 'active', 'Q1 Performance Report', 'Research agent specializing in data analysis and reporting.', 89, 38),
    ('Oracle', 'agent', 'Research', ARRAY['Predictive Analytics', 'Market Forecasting', 'Pattern Recognition'], 'active', 'Market Trend Prediction', 'Research agent using AI to predict market trends and opportunities.', 93, 52);
    
    -- Insert Development Squad Agents
    INSERT INTO agent_army (name, role, squad, skills, status, current_task, description, performance_score, missions_completed) VALUES
    ('Forge', 'agent', 'Development', ARRAY['Frontend Development', 'React/Next.js', 'UI/UX Design'], 'busy', 'Agent Army UI Development', 'Development agent specializing in frontend technologies and user interfaces.', 95, 67),
    ('Builder', 'agent', 'Development', ARRAY['Backend Development', 'Database Design', 'API Development'], 'active', 'Database Optimization', 'Development agent focused on backend systems and database architecture.', 94, 71),
    ('Tester', 'agent', 'Development', ARRAY['Quality Assurance', 'Test Automation', 'Bug Detection'], 'active', 'Agent Army Testing', 'Development agent ensuring code quality and system reliability.', 92, 59);
    
    -- Insert Communications Squad Agents  
    INSERT INTO agent_army (name, role, squad, skills, status, current_task, description, performance_score, missions_completed) VALUES
    ('Herald', 'agent', 'Communications', ARRAY['Content Writing', 'Social Media', 'Press Relations'], 'active', 'Blog Post Creation', 'Communications agent managing content creation and social media presence.', 90, 43),
    ('Diplomat', 'agent', 'Communications', ARRAY['Customer Support', 'Client Relations', 'Conflict Resolution'], 'idle', 'Standby for Customer Issues', 'Communications agent handling customer relations and support.', 88, 31),
    ('Broadcaster', 'agent', 'Communications', ARRAY['Email Marketing', 'Newsletter Management', 'Campaign Automation'], 'busy', 'Weekly Newsletter', 'Communications agent managing email marketing and automated campaigns.', 91, 48);
    
    -- Insert Operations Squad Agents
    INSERT INTO agent_army (name, role, squad, skills, status, current_task, description, performance_score, missions_completed) VALUES
    ('Monitor', 'agent', 'Operations', ARRAY['System Monitoring', 'Performance Analytics', 'Alert Management'], 'active', 'Live System Monitoring', 'Operations agent continuously monitoring system health and performance.', 96, 82),
    ('Optimizer', 'agent', 'Operations', ARRAY['Process Improvement', 'Workflow Automation', 'Efficiency Analysis'], 'busy', 'Workflow Optimization', 'Operations agent focused on improving processes and automation.', 94, 65),
    ('Guardian', 'agent', 'Operations', ARRAY['Security Monitoring', 'Backup Management', 'Incident Response'], 'active', 'Security Audit', 'Operations agent ensuring system security and data protection.', 95, 73);
    
END $$;

-- Add some sample performance history (optional)
COMMENT ON TABLE agent_army IS 'Hierarchical agent organization system for Dashboard Daddy AI platform';