-- Dashboard Daddy Database Setup
-- Run this in your Supabase SQL editor to create the required tables

-- Create tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    priority VARCHAR(20) DEFAULT 'medium',
    assigned_to VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP NULL,
    metadata JSONB,
    tags TEXT[]
);

-- Create agent_activity_log table if it doesn't exist
CREATE TABLE IF NOT EXISTS agent_activity_log (
    id SERIAL PRIMARY KEY,
    agent_id VARCHAR(100) NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'completed',
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW(),
    session_id VARCHAR(255),
    user_id VARCHAR(100),
    duration_ms INTEGER,
    token_count INTEGER,
    cost_usd DECIMAL(10,4)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_id ON agent_activity_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_timestamp ON agent_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_agent_activity_type ON agent_activity_log(activity_type);

-- Insert some sample data for tasks if table is empty
INSERT INTO tasks (title, description, status, priority, assigned_to)
SELECT * FROM (VALUES
    ('Setup Dashboard Authentication', 'Implement user authentication for the dashboard', 'completed', 'high', 'Bubba'),
    ('Connect Real Database', 'Replace mock data with real database connections', 'in_progress', 'high', 'Bubba'),
    ('Add System Health Monitoring', 'Show real-time system health metrics', 'completed', 'medium', 'System'),
    ('Implement Task Management', 'Build task creation and management features', 'pending', 'medium', 'Bubba'),
    ('Setup Automated Backups', 'Configure daily database backups', 'pending', 'low', 'System'),
    ('Optimize API Performance', 'Improve API response times and caching', 'pending', 'medium', 'Bubba')
) AS v(title, description, status, priority, assigned_to)
WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);

-- Insert some sample agent activity data if table is empty
INSERT INTO agent_activity_log (agent_id, activity_type, status, details, timestamp, token_count, cost_usd)
SELECT * FROM (VALUES
    ('bubba-main', 'message_processed', 'completed', '{"message_type": "user_query", "response_length": 150}', NOW() - INTERVAL '1 hour', 1200, 0.0036),
    ('bubba-main', 'task_created', 'completed', '{"task_id": "task_001", "task_type": "code_generation"}', NOW() - INTERVAL '2 hours', 800, 0.0024),
    ('system-monitor', 'health_check', 'completed', '{"system_status": "healthy", "response_time_ms": 45}', NOW() - INTERVAL '30 minutes', 100, 0.0003),
    ('bubba-main', 'message_processed', 'completed', '{"message_type": "command", "command": "dashboard_stats"}', NOW() - INTERVAL '15 minutes', 500, 0.0015),
    ('linear-sync', 'data_sync', 'completed', '{"synced_items": 25, "sync_duration_ms": 2300}', NOW() - INTERVAL '1 hour', 300, 0.0009),
    ('bubba-main', 'file_analysis', 'completed', '{"files_analyzed": 3, "lines_of_code": 450}', NOW() - INTERVAL '45 minutes', 1500, 0.0045)
) AS v(agent_id, activity_type, status, details, timestamp, token_count, cost_usd)
WHERE NOT EXISTS (SELECT 1 FROM agent_activity_log LIMIT 1);

-- Create a trigger to update the updated_at column for tasks
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update completed_at when task status changes to completed
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'completed' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_task_completed_at ON tasks;
CREATE TRIGGER update_task_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completed_at();

-- Grant appropriate permissions (adjust as needed for your setup)
-- These commands might need to be run separately depending on your Supabase setup

-- Enable Row Level Security (RLS) if needed
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity_log ENABLE ROW LEVEL SECURITY;

-- Create basic policies (you may want to customize these)
CREATE POLICY "Enable read access for all users" ON tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON tasks FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON agent_activity_log FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON agent_activity_log FOR INSERT WITH CHECK (true);