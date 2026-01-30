#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createTables() {
  console.log('🚀 Creating Dashboard Daddy database tables...');
  
  try {
    const client = await pool.connect();
    
    // Create tasks table
    console.log('📋 Creating tasks table...');
    await client.query(`
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
      )
    `);
    
    // Create agent_activity_log table
    console.log('🤖 Creating agent_activity_log table...');
    await client.query(`
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
      )
    `);
    
    // Create indexes
    console.log('📊 Creating indexes...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_id ON agent_activity_log(agent_id);
      CREATE INDEX IF NOT EXISTS idx_agent_activity_timestamp ON agent_activity_log(timestamp);
      CREATE INDEX IF NOT EXISTS idx_agent_activity_type ON agent_activity_log(activity_type);
    `);
    
    client.release();
    console.log('✅ Tables created successfully!');
    
    // Now populate with sample data
    console.log('📊 Populating with sample data...');
    
    const client2 = await pool.connect();
    
    // Insert sample tasks
    await client2.query(`
      INSERT INTO tasks (title, description, status, priority, assigned_to) VALUES
      ('Setup Dashboard Authentication', 'Implement user authentication for the dashboard', 'completed', 'high', 'Bubba'),
      ('Connect Real Database', 'Replace mock data with real database connections', 'completed', 'high', 'Bubba'),
      ('Add System Health Monitoring', 'Show real-time system health metrics', 'completed', 'medium', 'System'),
      ('Implement Task Management', 'Build task creation and management features', 'pending', 'medium', 'Bubba'),
      ('Setup Automated Backups', 'Configure daily database backups', 'pending', 'low', 'System'),
      ('Optimize API Performance', 'Improve API response times and caching', 'in_progress', 'medium', 'Bubba')
    `);
    
    // Insert sample agent activities
    const now = new Date();
    await client2.query(`
      INSERT INTO agent_activity_log (agent_id, activity_type, status, details, timestamp, token_count, cost_usd) VALUES
      ('bubba-main', 'message_processed', 'completed', '{"message_type": "user_query", "response_length": 150}', $1, 1200, 0.0036),
      ('bubba-main', 'task_created', 'completed', '{"task_id": "task_001", "task_type": "code_generation"}', $2, 800, 0.0024),
      ('system-monitor', 'health_check', 'completed', '{"system_status": "healthy", "response_time_ms": 45}', $3, 100, 0.0003),
      ('bubba-main', 'message_response', 'completed', '{"updated_component": "DashboardStats", "metrics_count": 6}', $4, 500, 0.0015),
      ('linear-sync', 'data_sync', 'completed', '{"synced_items": 25, "sync_duration_ms": 2300}', $5, 300, 0.0009),
      ('bubba-subagent', 'chat_completion', 'completed', '{"prompt_tokens": 450, "completion_tokens": 200}', $6, 650, 0.0019),
      ('bubba-main', 'file_analysis', 'completed', '{"files_analyzed": 3, "lines_of_code": 450}', $7, 1100, 0.0033)
    `, [
      new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
      new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
      new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
      new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
      new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      new Date(now.getTime() - 90 * 60 * 1000) // 90 minutes ago
    ]);
    
    // Verify data
    const taskCount = await client2.query('SELECT COUNT(*) FROM tasks');
    const activityCount = await client2.query('SELECT COUNT(*) FROM agent_activity_log');
    
    console.log(`✅ Created and populated tables:`);
    console.log(`   📋 Tasks: ${taskCount.rows[0].count}`);
    console.log(`   🤖 Agent activities: ${activityCount.rows[0].count}`);
    
    client2.release();
    await pool.end();
    
    console.log('🎉 Database setup complete!');
    console.log('🧪 Test the API: curl http://localhost:3003/api/dashboard/stats');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error.message);
    process.exit(1);
  }
}

createTables();