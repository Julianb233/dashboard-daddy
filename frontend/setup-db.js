#!/usr/bin/env node

require('dotenv').config({ path: './.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
      console.log('⚠️  Connection test via information_schema failed, trying direct table access...');
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Try to access/create tasks table
    console.log('📋 Setting up tasks table...');
    
    // First, try to select from tasks to see if it exists
    let { data: existingTasks, error: selectError } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (selectError && selectError.code === '42P01') {
      console.log('📝 Tasks table does not exist, creating via SQL...');
      
      // Try using the SQL RPC function if available, otherwise we'll need to create via SQL editor
      console.log('ℹ️  Table creation requires SQL editor access in Supabase dashboard.');
      console.log('   Please run this SQL in your Supabase SQL Editor:');
      console.log('   ');
      console.log(`   CREATE TABLE tasks (
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
      );`);
      console.log('   ');
    } else {
      console.log('✅ Tasks table accessible');
    }
    
    // Try to access/create agent_activity_log table
    console.log('🤖 Setting up agent_activity_log table...');
    
    let { data: existingLogs, error: logSelectError } = await supabase
      .from('agent_activity_log')
      .select('id')
      .limit(1);
    
    if (logSelectError && logSelectError.code === '42P01') {
      console.log('📝 Agent activity log table does not exist, showing creation SQL...');
      console.log('   Please run this SQL in your Supabase SQL Editor:');
      console.log('   ');
      console.log(`   CREATE TABLE agent_activity_log (
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
      );`);
      console.log('   ');
    } else {
      console.log('✅ Agent activity log table accessible');
    }
    
    // Insert sample data if we can access the tables
    if (!selectError) {
      console.log('📊 Checking tasks data...');
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
            },
            {
              title: 'Optimize API Performance',
              description: 'Improve API response times and caching',
              status: 'in_progress',
              priority: 'medium',
              assigned_to: 'Bubba'
            }
          ]);
        
        if (insertError) {
          console.log('⚠️  Error inserting sample tasks:', insertError.message);
        } else {
          console.log('✅ Sample tasks inserted');
        }
      } else {
        console.log(`✅ Found ${tasks.length} existing tasks`);
      }
    }
    
    if (!logSelectError) {
      console.log('📊 Checking agent activity data...');
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
              timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
              token_count: 1200,
              cost_usd: 0.0036
            },
            {
              agent_id: 'bubba-main',
              activity_type: 'task_created',
              status: 'completed',
              details: { task_id: 'task_001', task_type: 'code_generation' },
              timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
              token_count: 800,
              cost_usd: 0.0024
            },
            {
              agent_id: 'system-monitor',
              activity_type: 'health_check',
              status: 'completed',
              details: { system_status: 'healthy', response_time_ms: 45 },
              timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
              token_count: 100,
              cost_usd: 0.0003
            },
            {
              agent_id: 'bubba-main',
              activity_type: 'dashboard_update',
              status: 'completed',
              details: { updated_component: 'DashboardStats', metrics_count: 6 },
              timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
              token_count: 500,
              cost_usd: 0.0015
            },
            {
              agent_id: 'linear-sync',
              activity_type: 'data_sync',
              status: 'completed',
              details: { synced_items: 25, sync_duration_ms: 2300 },
              timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
              token_count: 300,
              cost_usd: 0.0009
            }
          ]);
        
        if (insertError) {
          console.log('⚠️  Error inserting sample activities:', insertError.message);
        } else {
          console.log('✅ Sample agent activities inserted');
        }
      } else {
        console.log(`✅ Found ${activities.length} existing activity records`);
      }
    }
    
    console.log('📊 Database setup complete!');
    console.log('🌐 You can now test the dashboard with real data');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Open http://localhost:3000 in your browser');
    console.log('3. Check the dashboard stats for real data');
    console.log('');
    console.log('🧪 To test the API directly: curl http://localhost:3000/api/dashboard/stats');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('');
    console.log('If you get permission errors, make sure:');
    console.log('1. Your Supabase service role key is correct in .env.local');
    console.log('2. RLS policies allow the operations (or disable RLS for testing)');
    console.log('3. The database URL is accessible');
    
    process.exit(1);
  }
}

// Run setup
setupDatabase();