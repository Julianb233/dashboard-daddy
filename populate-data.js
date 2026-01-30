#!/usr/bin/env node

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

async function populateData() {
  console.log('🚀 Populating Dashboard Daddy with sample data...');
  
  try {
    const client = await pool.connect();
    
    // Insert sample tasks
    console.log('📋 Inserting sample tasks...');
    await client.query(`
      INSERT INTO tasks (title, description, status, priority, assigned_to) VALUES
      ('Setup Dashboard Authentication', 'Implement user authentication for the dashboard', 'completed', 'high', 'Bubba'),
      ('Connect Real Database', 'Replace mock data with real database connections', 'completed', 'high', 'Bubba'),
      ('Add System Health Monitoring', 'Show real-time system health metrics', 'completed', 'medium', 'System'),
      ('Implement Task Management', 'Build task creation and management features', 'pending', 'medium', 'Bubba'),
      ('Setup Automated Backups', 'Configure daily database backups', 'pending', 'low', 'System'),
      ('Optimize API Performance', 'Improve API response times and caching', 'in_progress', 'medium', 'Bubba')
      ON CONFLICT DO NOTHING
    `);
    
    // Insert sample agent activities
    console.log('🤖 Inserting sample agent activities...');
    const now = new Date();
    await client.query(`
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
    
    // Verify data was inserted
    const taskCount = await client.query('SELECT COUNT(*) FROM tasks');
    const activityCount = await client.query('SELECT COUNT(*) FROM agent_activity_log');
    
    console.log(`✅ Inserted ${taskCount.rows[0].count} tasks`);
    console.log(`✅ Inserted ${activityCount.rows[0].count} agent activities`);
    
    client.release();
    await pool.end();
    
    console.log('📊 Sample data inserted successfully!');
    console.log('🧪 Test the API: curl http://localhost:3003/api/dashboard/stats');
    
  } catch (error) {
    console.error('❌ Error populating data:', error.message);
    process.exit(1);
  }
}

populateData();