const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data to insert
const sampleUsageData = [
  {
    model_name: 'gpt-4o',
    tokens_used: 1500,
    cost_per_token: 0.0000025,
    total_cost: 0.00375,
    request_type: 'input',
    endpoint: '/api/chat',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    model_name: 'gpt-4o',
    tokens_used: 800,
    cost_per_token: 0.00001,
    total_cost: 0.008,
    request_type: 'output',
    endpoint: '/api/chat',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    model_name: 'claude-3-sonnet',
    tokens_used: 2200,
    cost_per_token: 0.000003,
    total_cost: 0.0066,
    request_type: 'input',
    endpoint: '/api/agents',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    model_name: 'claude-3-sonnet',
    tokens_used: 1200,
    cost_per_token: 0.000015,
    total_cost: 0.018,
    request_type: 'output',
    endpoint: '/api/agents',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    model_name: 'gpt-4o-mini',
    tokens_used: 3000,
    cost_per_token: 0.00000015,
    total_cost: 0.00045,
    request_type: 'input',
    endpoint: '/api/tasks',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
];

const sampleErrorData = [
  {
    error_type: 'API_RATE_LIMIT',
    error_message: 'Rate limit exceeded for model gpt-4o',
    error_code: '429',
    endpoint: '/api/chat',
    severity: 'medium',
    status: 'resolved',
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    error_type: 'TOKEN_LIMIT_ERROR',
    error_message: 'Input exceeds maximum context length of 128k tokens',
    error_code: '400',
    endpoint: '/api/agents',
    severity: 'high',
    status: 'resolved',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    error_type: 'AUTH_ERROR',
    error_message: 'Invalid API key provided',
    error_code: '401',
    endpoint: '/api/tasks',
    severity: 'critical',
    status: 'resolved',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    error_type: 'REQUEST_TIMEOUT',
    error_message: 'Request timed out after 30 seconds',
    error_code: '408',
    endpoint: '/api/chat',
    severity: 'medium',
    status: 'open',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
];

const sampleModelCosts = [
  { model_name: 'gpt-4o', input_cost_per_token: 0.0000025, output_cost_per_token: 0.00001 },
  { model_name: 'gpt-4o-mini', input_cost_per_token: 0.00000015, output_cost_per_token: 0.0000006 },
  { model_name: 'claude-3-opus', input_cost_per_token: 0.000015, output_cost_per_token: 0.000075 },
  { model_name: 'claude-3-sonnet', input_cost_per_token: 0.000003, output_cost_per_token: 0.000015 },
  { model_name: 'claude-3-haiku', input_cost_per_token: 0.00000025, output_cost_per_token: 0.00000125 },
];

const sampleErrorPatterns = [
  {
    pattern_name: 'Rate Limit Exceeded',
    error_type: 'API_RATE_LIMIT',
    description: 'API requests exceeding rate limits',
    suggested_fix: 'Implement exponential backoff and request queuing',
    frequency: 15
  },
  {
    pattern_name: 'Model Context Length',
    error_type: 'TOKEN_LIMIT_ERROR',
    description: 'Input exceeds model context window',
    suggested_fix: 'Truncate input or use summarization before sending',
    frequency: 8
  },
  {
    pattern_name: 'Authentication Failed',
    error_type: 'AUTH_ERROR',
    description: 'Invalid or expired API keys',
    suggested_fix: 'Refresh API tokens and validate credentials',
    frequency: 5
  },
];

async function setupTables() {
  console.log('Setting up analytics tables...');
  
  try {
    // Test connection
    console.log('Testing connection...');
    const { data: testData, error: testError } = await supabase.from('kanban_tasks').select('count', { count: 'exact', head: true });
    if (testError) {
      console.error('Failed to connect to Supabase:', testError);
      return;
    }
    console.log('✅ Connected to Supabase successfully');

    // Check if tables exist and create sample data
    console.log('Checking for existing tables...');
    
    // Try to insert sample usage data (table will need to exist)
    const { error: usageError } = await supabase
      .from('token_usage')
      .upsert(sampleUsageData, { onConflict: 'id' });
    
    if (usageError) {
      console.log('⚠️ token_usage table may not exist. Please create it manually in Supabase dashboard.');
      console.log('Error:', usageError.message);
    } else {
      console.log('✅ Sample usage data inserted');
    }

    // Try to insert model costs
    const { error: costsError } = await supabase
      .from('model_costs')
      .upsert(sampleModelCosts, { onConflict: 'model_name' });
    
    if (costsError) {
      console.log('⚠️ model_costs table may not exist. Please create it manually in Supabase dashboard.');
      console.log('Error:', costsError.message);
    } else {
      console.log('✅ Sample model costs inserted');
    }

    // Try to insert error logs
    const { error: errorLogsError } = await supabase
      .from('error_logs')
      .upsert(sampleErrorData, { onConflict: 'id' });
    
    if (errorLogsError) {
      console.log('⚠️ error_logs table may not exist. Please create it manually in Supabase dashboard.');
      console.log('Error:', errorLogsError.message);
    } else {
      console.log('✅ Sample error logs inserted');
    }

    // Try to insert error patterns
    const { error: patternsError } = await supabase
      .from('error_patterns')
      .upsert(sampleErrorPatterns, { onConflict: 'id' });
    
    if (patternsError) {
      console.log('⚠️ error_patterns table may not exist. Please create it manually in Supabase dashboard.');
      console.log('Error:', patternsError.message);
    } else {
      console.log('✅ Sample error patterns inserted');
    }

    console.log('\n🎉 Setup complete!');
    console.log('\nIf tables don\'t exist, please create them manually in Supabase dashboard using the SQL files:');
    console.log('- src/lib/supabase/usage-tracking.sql');
    console.log('- src/lib/supabase/error-analysis.sql');
    
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setupTables().catch(console.error);