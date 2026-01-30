import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown', message: '' },
      doordash_config: { status: 'unknown', message: '' },
      vapi_config: { status: 'unknown', message: '' },
      tables: { status: 'unknown', message: '', details: {} }
    },
    summary: {
      healthy: 0,
      warning: 0,
      error: 0
    }
  };

  // Check database connectivity
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('id')
      .limit(1);
    
    if (error) {
      healthCheck.checks.database = {
        status: 'error',
        message: `Database connection failed: ${error.message}`
      };
    } else {
      healthCheck.checks.database = {
        status: 'healthy',
        message: 'Database connection successful'
      };
    }
  } catch (error) {
    healthCheck.checks.database = {
      status: 'error',
      message: `Database connection exception: ${error}`
    };
  }

  // Check DoorDash configuration
  const doordashEnvVars = [
    'DOORDASH_DEVELOPER_ID',
    'DOORDASH_KEY_ID', 
    'DOORDASH_SIGNING_SECRET'
  ];
  
  const missingDoorDash = doordashEnvVars.filter(env => !process.env[env]);
  if (missingDoorDash.length > 0) {
    healthCheck.checks.doordash_config = {
      status: 'warning',
      message: `Missing DoorDash environment variables: ${missingDoorDash.join(', ')}`
    };
  } else {
    healthCheck.checks.doordash_config = {
      status: 'healthy',
      message: 'DoorDash API configuration complete'
    };
  }

  // Check Vapi configuration
  const vapiEnvVars = [
    'VAPI_API_KEY',
    'VAPI_ASSISTANT_ID',
    'VAPI_PHONE_NUMBER_ID'
  ];
  
  const missingVapi = vapiEnvVars.filter(env => !process.env[env]);
  if (missingVapi.length > 0) {
    healthCheck.checks.vapi_config = {
      status: 'warning',
      message: `Missing Vapi environment variables: ${missingVapi.join(', ')}`
    };
  } else {
    healthCheck.checks.vapi_config = {
      status: 'healthy',
      message: 'Vapi AI configuration complete'
    };
  }

  // Check required tables
  const requiredTables = [
    'food_orders',
    'restaurant_favorites',
    'restaurant_call_logs', 
    'user_food_preferences'
  ];

  const tableChecks: Record<string, any> = {};
  
  for (const table of requiredTables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') { // Table doesn't exist
          tableChecks[table] = { status: 'error', message: 'Table does not exist' };
        } else {
          tableChecks[table] = { status: 'warning', message: error.message };
        }
      } else {
        tableChecks[table] = { status: 'healthy', message: 'Table exists and accessible' };
      }
    } catch (error) {
      tableChecks[table] = { status: 'error', message: `Exception: ${error}` };
    }
  }

  const tableStatuses = Object.values(tableChecks).map((check: any) => check.status);
  const healthyTables = tableStatuses.filter(status => status === 'healthy').length;
  const errorTables = tableStatuses.filter(status => status === 'error').length;

  if (errorTables > 0) {
    healthCheck.checks.tables = {
      status: 'error',
      message: `${errorTables} tables missing or inaccessible`,
      details: tableChecks
    };
  } else if (healthyTables === requiredTables.length) {
    healthCheck.checks.tables = {
      status: 'healthy',
      message: 'All required tables exist and accessible',
      details: tableChecks
    };
  } else {
    healthCheck.checks.tables = {
      status: 'warning',
      message: 'Some tables have issues',
      details: tableChecks
    };
  }

  // Calculate summary
  Object.values(healthCheck.checks).forEach((check: any) => {
    switch (check.status) {
      case 'healthy':
        healthCheck.summary.healthy++;
        break;
      case 'warning':
        healthCheck.summary.warning++;
        break;
      case 'error':
        healthCheck.summary.error++;
        break;
    }
  });

  // Overall status
  if (healthCheck.summary.error > 0) {
    healthCheck.status = 'unhealthy';
  } else if (healthCheck.summary.warning > 0) {
    healthCheck.status = 'warning';
  }

  // Additional system info
  const systemInfo = {
    node_version: process.version,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory_usage: process.memoryUsage(),
    concierge_version: '1.0.0'
  };

  const response = {
    ...healthCheck,
    system: systemInfo,
    recommendations: generateRecommendations(healthCheck)
  };

  const statusCode = healthCheck.status === 'unhealthy' ? 503 : 200;
  
  return NextResponse.json(response, { status: statusCode });
}

function generateRecommendations(healthCheck: any): string[] {
  const recommendations: string[] = [];

  if (healthCheck.checks.database.status === 'error') {
    recommendations.push('Check database connection and credentials');
  }

  if (healthCheck.checks.doordash_config.status === 'warning') {
    recommendations.push('Set up DoorDash API credentials or enable browser automation fallback');
  }

  if (healthCheck.checks.vapi_config.status === 'warning') {
    recommendations.push('Configure Vapi AI credentials for restaurant calling features');
  }

  if (healthCheck.checks.tables.status === 'error') {
    recommendations.push('Run the database setup SQL to create required tables');
  }

  if (recommendations.length === 0) {
    recommendations.push('System is healthy - personal concierge is ready to use!');
  }

  return recommendations;
}