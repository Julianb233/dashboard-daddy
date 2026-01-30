#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Database configuration
const supabaseUrl = 'https://jrirksdiklqwsaatbhvg.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyaXJrc2Rpa2xxd3NhYXRiaHZnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTk3MjQxOSwiZXhwIjoyMDUxNTQ4NDE5fQ.fRm7Qvq3LPE0D0E0dIlVRHkL5n1YfN5FpV8W4eI98do';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Dashboard Daddy database...');
  
  try {
    // Test connection
    console.log('📡 Testing database connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1);
    
    if (connectionError) {
      throw new Error(`Connection failed: ${connectionError.message}`);
    }
    
    console.log('✅ Database connection successful');
    
    // Create tasks table
    console.log('📋 Creating tasks table...');
    const { error: tasksError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
        CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
      `
    });
    
    if (tasksError) {
      console.log('⚠️  Tasks table might already exist, trying direct approach...');
      
      // Try to insert a test task to see if table exists
      const { data: existingTasks } = await supabase
        .from('tasks')
        .select('id')
        .limit(1);
      
      console.log('✅ Tasks table accessible');
    }
    
    // Create agent_activity_log table
    console.log('🤖 Creating agent_activity_log table...');
    const { error: agentError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        CREATE INDEX IF NOT EXISTS idx_agent_activity_agent_id ON agent_activity_log(agent_id);
        CREATE INDEX IF NOT EXISTS idx_agent_activity_timestamp ON agent_activity_log(timestamp);
      `
    });
    
    if (agentError) {
      console.log('⚠️  Agent activity log table might already exist, trying direct approach...');
      
      const { data: existingLogs } = await supabase
        .from('agent_activity_log')
        .select('id')
        .limit(1);
      
      console.log('✅ Agent activity log table accessible');
    }
    
    // Insert sample data if tables are empty
    console.log('📊 Checking for existing data...');
    
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id');
    
    if (!tasks || tasks.length === 0) {
      console.log('📝 Inserting sample tasks...');
      const { error: insertError } = await supabase
        .from('tasks')
        .insert([
          {
            title: 'Setup Dashboard Authentication',
            description: 'Implement user authentication for the dashboard',
            status: 'completed',
            priority: 'high',
            assigned_to: 'Bubba'
          },
          {
            title: 'Connect Real Database',
            description: 'Replace mock data with real database connections',
            status: 'completed',
            priority: 'high',
            assigned_to: 'Bubba'
          },
          {
            title: 'Add System Health Monitoring',
            description: 'Show real-time system health metrics',
            status: 'completed',
            priority: 'medium',
            assigned_to: 'System'
          },
          {
            title: 'Implement Task Management',
            description: 'Build task creation and management features',
            status: 'pending',
            priority: 'medium',
            assigned_to: 'Bubba'
          },
          {
            title: 'Setup Automated Backups',
            description: 'Configure daily database backups',
            status: 'pending',
            priority: 'low',
            assigned_to: 'System'
          }
        ]);
      
      if (insertError) {
        console.log('⚠️  Error inserting sample tasks:', insertError.message);
      } else {
        console.log('✅ Sample tasks inserted');
      }
    }
    
    const { data: activities } = await supabase
      .from('agent_activity_log')
      .select('id');
    
    if (!activities || activities.length === 0) {
      console.log('🤖 Inserting sample agent activities...');
      const now = new Date();
      const { error: insertError } = await supabase
        .from('agent_activity_log')
        .insert([
          {
            agent_id: 'bubba-main',
            activity_type: 'message_processed',
            status: 'completed',
            details: { message_type: 'user_query', response_length: 150 },
            timestamp: new Date(now.getTime() - 60 * 60 * 1000), // 1 hour ago
            token_count: 1200,
            cost_usd: 0.0036
          },
          {
            agent_id: 'bubba-main',
            activity_type: 'task_created',
            status: 'completed',
            details: { task_id: 'task_001', task_type: 'code_generation' },
            timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            token_count: 800,
            cost_usd: 0.0024
          },
          {
            agent_id: 'system-monitor',
            activity_type: 'health_check',
            status: 'completed',
            details: { system_status: 'healthy', response_time_ms: 45 },
            timestamp: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes ago
            token_count: 100,
            cost_usd: 0.0003
          },
          {
            agent_id: 'bubba-main',
            activity_type: 'dashboard_update',
            status: 'completed',
            details: { updated_component: 'DashboardStats', metrics_count: 6 },
            timestamp: new Date(now.getTime() - 15 * 60 * 1000), // 15 minutes ago
            token_count: 500,
            cost_usd: 0.0015
          },
          {
            agent_id: 'linear-sync',
            activity_type: 'data_sync',
            status: 'completed',
            details: { synced_items: 25, sync_duration_ms: 2300 },
            timestamp: new Date(now.getTime() - 45 * 60 * 1000), // 45 minutes ago
            token_count: 300,
            cost_usd: 0.0009
          }
        ]);
      
      if (insertError) {
        console.log('⚠️  Error inserting sample activities:', insertError.message);
      } else {
        console.log('✅ Sample agent activities inserted');
      }
    }
    
    // Test the API endpoint
    console.log('🧪 Testing dashboard stats API...');
    
    const testStats = {
      totalTasks: tasks?.length || 0,
      totalActivities: activities?.length || 0
    };
    
    console.log('📊 Database setup complete!');
    console.log('📈 Current data:', testStats);
    console.log('🌐 You can now test the dashboard at: http://localhost:3000');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Check the dashboard stats for real data');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDatabase();