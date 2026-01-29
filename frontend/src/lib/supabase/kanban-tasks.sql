-- Create kanban_tasks table for Bubba Dashboard
CREATE TABLE IF NOT EXISTS kanban_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'done', 'archived')),
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')),
  assignee VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  metadata JSONB
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_status ON kanban_tasks(status);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_created_at ON kanban_tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_kanban_tasks_priority ON kanban_tasks(priority);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_kanban_tasks_updated_at 
    BEFORE UPDATE ON kanban_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO kanban_tasks (title, description, status, priority, assignee) VALUES
('Review client email responses', 'Check and respond to pending client emails', 'todo', 'high', 'Bubba'),
('Update Linear project status', 'Sync GitHub activity with Linear issues', 'todo', 'medium', 'Bubba'),
('Schedule team meeting', 'Find available slots for next week', 'in_progress', 'medium', 'Bubba'),
('Draft proposal for new client', 'Create comprehensive project proposal', 'in_progress', 'high', 'Bubba'),
('Update documentation', 'Add new API endpoints to docs', 'done', 'low', 'Bubba'),
('Backup database', 'Weekly database backup completed', 'archived', 'low', 'Bubba')
ON CONFLICT DO NOTHING;