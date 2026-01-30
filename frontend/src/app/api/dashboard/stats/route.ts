import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import path from 'path';

// Initialize the server start time to track uptime
const serverStartTime = Date.now();

// Cache for dashboard stats (30 second TTL)
let statsCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL = 30000; // 30 seconds

// Direct PostgreSQL connection for better reliability
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:Oceanfront3381$@db.jrirksdiklqwsaatbhvg.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// Supabase client as fallback
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Track API response times
let apiResponseTimes: number[] = [];

async function testDatabaseConnection(): Promise<{ connected: boolean; responseTime: number; error?: string }> {
  const startTime = Date.now();
  
  try {
    // Test direct PostgreSQL connection
    const client = await pool.connect();
    const result = await client.query('SELECT 1 as test');
    client.release();
    
    const responseTime = Date.now() - startTime;
    
    // Update response times tracking
    apiResponseTimes.push(responseTime);
    if (apiResponseTimes.length > 100) {
      apiResponseTimes = apiResponseTimes.slice(-50); // Keep last 50 measurements
    }
    
    return { connected: true, responseTime };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Database connection test failed:', error);
    return { 
      connected: false, 
      responseTime, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

async function getRealTaskCounts(): Promise<{ total: number; pending: number; completed: number; inProgress: number }> {
  try {
    // Query actual tasks table using direct PostgreSQL connection
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN status IN ('completed', 'done') THEN 1 END) as completed,
        COUNT(CASE WHEN status IN ('in_progress', 'running', 'active') THEN 1 END) as in_progress
      FROM tasks
    `);
    
    client.release();
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        total: parseInt(row.total) || 0,
        pending: parseInt(row.pending) || 0,
        completed: parseInt(row.completed) || 0,
        inProgress: parseInt(row.in_progress) || 0
      };
    }
    
    return { total: 0, pending: 0, completed: 0, inProgress: 0 };
  } catch (error) {
    console.error('Error in getRealTaskCounts:', error);
    return { total: 0, pending: 0, completed: 0, inProgress: 0 };
  }
}

async function getRealAgentCounts(): Promise<{ total: number; active: number; lastActivity?: string }> {
  try {
    // Query agent_activity_log table using direct PostgreSQL connection
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(DISTINCT agent_id) as total_agents,
        COUNT(DISTINCT CASE 
          WHEN timestamp > NOW() - INTERVAL '1 hour' 
          THEN agent_id 
        END) as active_agents,
        MAX(timestamp) as last_activity
      FROM agent_activity_log
    `);
    
    client.release();
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        total: parseInt(row.total_agents) || 0,
        active: parseInt(row.active_agents) || 0,
        lastActivity: row.last_activity ? row.last_activity.toISOString() : undefined
      };
    }
    
    return { total: 0, active: 0 };
  } catch (error) {
    console.error('Error in getRealAgentCounts:', error);
    return { total: 0, active: 0 };
  }
}

function getRealUptime(): { uptimeMs: number; uptimeFormatted: string } {
  const uptimeMs = Date.now() - serverStartTime;
  
  const days = Math.floor(uptimeMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((uptimeMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((uptimeMs % (60 * 60 * 1000)) / (60 * 1000));
  
  let formatted = '';
  if (days > 0) formatted += `${days}d `;
  if (hours > 0) formatted += `${hours}h `;
  formatted += `${minutes}m`;
  
  return {
    uptimeMs,
    uptimeFormatted: formatted.trim()
  };
}

function getRealMemoryUsage(): { used: number; total: number; percentage: number; formatted: string } {
  const memUsage = process.memoryUsage();
  
  // Convert from bytes to MB
  const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
  const percentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
  
  return {
    used: usedMB,
    total: totalMB,
    percentage,
    formatted: `${usedMB}MB / ${totalMB}MB (${percentage}%)`
  };
}

function getAverageResponseTime(): number {
  if (apiResponseTimes.length === 0) return 0;
  const sum = apiResponseTimes.reduce((a, b) => a + b, 0);
  return Math.round(sum / apiResponseTimes.length);
}

async function getRealMessageCounts(): Promise<{ today: number; thisWeek: number; total: number }> {
  try {
    // Query agent_activity_log for message-related activities using direct PostgreSQL connection
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        COUNT(CASE 
          WHEN timestamp >= CURRENT_DATE 
          AND (activity_type ILIKE '%message%' OR activity_type ILIKE '%chat%' OR activity_type ILIKE '%response%')
          THEN 1 
        END) as today_count,
        COUNT(CASE 
          WHEN timestamp >= CURRENT_DATE - INTERVAL '7 days'
          AND (activity_type ILIKE '%message%' OR activity_type ILIKE '%chat%' OR activity_type ILIKE '%response%')
          THEN 1 
        END) as week_count,
        COUNT(CASE 
          WHEN (activity_type ILIKE '%message%' OR activity_type ILIKE '%chat%' OR activity_type ILIKE '%response%')
          THEN 1 
        END) as total_count
      FROM agent_activity_log
    `);
    
    client.release();
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        today: parseInt(row.today_count) || 0,
        thisWeek: parseInt(row.week_count) || 0,
        total: parseInt(row.total_count) || 0
      };
    }
    
    return { today: 0, thisWeek: 0, total: 0 };
  } catch (error) {
    console.error('Error in getRealMessageCounts:', error);
    return { today: 0, thisWeek: 0, total: 0 };
  }
}

async function getRealTokenUsage(): Promise<{ total: number; thisMonth: number; estimated: boolean }> {
  try {
    // Query token usage from agent_activity_log using direct PostgreSQL connection
    const client = await pool.connect();
    
    const result = await client.query(`
      SELECT 
        COALESCE(SUM(token_count), 0) as total_tokens,
        COALESCE(SUM(CASE 
          WHEN timestamp >= DATE_TRUNC('month', CURRENT_DATE)
          THEN token_count 
        END), 0) as month_tokens
      FROM agent_activity_log
      WHERE token_count IS NOT NULL AND token_count > 0
    `);
    
    client.release();
    
    if (result.rows.length > 0) {
      const row = result.rows[0];
      return {
        total: parseInt(row.total_tokens) || 0,
        thisMonth: parseInt(row.month_tokens) || 0,
        estimated: false
      };
    }
    
    return { total: 0, thisMonth: 0, estimated: true };
  } catch (error) {
    console.error('Error in getRealTokenUsage:', error);
    return { total: 0, thisMonth: 0, estimated: true };
  }
}

async function calculateRealMonthlyCost(tokensUsed: number, estimated: boolean): Promise<number> {
  if (estimated || tokensUsed === 0) {
    // Basic estimation for Claude usage
    const pricePerInputToken = 0.000003;
    const pricePerOutputToken = 0.000015;
    
    const inputTokens = tokensUsed * 0.7; // Assume 70% input, 30% output
    const outputTokens = tokensUsed * 0.3;
    
    const cost = (inputTokens * pricePerInputToken) + (outputTokens * pricePerOutputToken);
    return Math.round(cost * 100) / 100;
  }
  
  // For real token data, we'd need actual cost tracking
  // For now, use the same estimation
  return calculateRealMonthlyCost(tokensUsed, true);
}

export async function GET() {
  const requestStart = Date.now();
  
  // Return cached stats if still fresh
  if (statsCache && (Date.now() - statsCache.timestamp) < CACHE_TTL) {
    return NextResponse.json({
      ...statsCache.data,
      cached: true,
      cacheAge: Date.now() - statsCache.timestamp
    });
  }
  
  try {
    // Test database connection first
    const connectionTest = await testDatabaseConnection();
    
    // Fetch all real data in parallel
    const [
      taskCounts,
      agentCounts,
      messageCounts,
      tokenUsage
    ] = await Promise.all([
      getRealTaskCounts(),
      getRealAgentCounts(),
      getRealMessageCounts(),
      getRealTokenUsage()
    ]);

    // Get system metrics
    const uptime = getRealUptime();
    const memory = getRealMemoryUsage();
    const averageResponseTime = getAverageResponseTime();
    const monthlyCost = await calculateRealMonthlyCost(tokenUsage.thisMonth, tokenUsage.estimated);

    // Calculate total request time
    const totalRequestTime = Date.now() - requestStart;

    const stats = {
      // Main dashboard metrics
      activeAgents: agentCounts.active,
      totalMessages: messageCounts.today,
      completedTasks: taskCounts.completed,
      pendingApprovals: taskCounts.pending, // Using pending tasks as approvals for now
      tokensUsed: tokenUsage.thisMonth,
      monthlyCost,
      lastUpdated: new Date().toISOString(),
      
      // System health data
      systemHealth: {
        database: {
          connected: connectionTest.connected,
          responseTime: connectionTest.responseTime,
          error: connectionTest.error
        },
        uptime: {
          milliseconds: uptime.uptimeMs,
          formatted: uptime.uptimeFormatted
        },
        memory: {
          used: memory.used,
          total: memory.total,
          percentage: memory.percentage,
          formatted: memory.formatted
        },
        performance: {
          averageResponseTime,
          currentRequestTime: totalRequestTime,
          requestCount: apiResponseTimes.length
        }
      },
      
      // Detailed breakdowns
      details: {
        tasks: {
          total: taskCounts.total,
          pending: taskCounts.pending,
          completed: taskCounts.completed,
          inProgress: taskCounts.inProgress
        },
        agents: {
          total: agentCounts.total,
          active: agentCounts.active,
          lastActivity: agentCounts.lastActivity
        },
        messages: {
          today: messageCounts.today,
          thisWeek: messageCounts.thisWeek,
          total: messageCounts.total
        },
        tokens: {
          total: tokenUsage.total,
          thisMonth: tokenUsage.thisMonth,
          estimated: tokenUsage.estimated
        }
      }
    };

    console.log('Dashboard stats generated:', {
      dbConnected: connectionTest.connected,
      tasksFound: taskCounts.total,
      agentsFound: agentCounts.total,
      requestTime: totalRequestTime
    });

    // Cache the stats
    statsCache = { data: stats, timestamp: Date.now() };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching real dashboard stats:', error);
    
    // Return minimal real data even on error
    const uptime = getRealUptime();
    const memory = getRealMemoryUsage();
    
    return NextResponse.json({
      activeAgents: 0,
      totalMessages: 0,
      completedTasks: 0,
      pendingApprovals: 0,
      tokensUsed: 0,
      monthlyCost: 0,
      lastUpdated: new Date().toISOString(),
      error: 'Error fetching dashboard data',
      
      systemHealth: {
        database: { connected: false, responseTime: 0, error: 'Database error' },
        uptime: { milliseconds: uptime.uptimeMs, formatted: uptime.uptimeFormatted },
        memory: { ...memory },
        performance: { averageResponseTime: 0, currentRequestTime: Date.now() - requestStart, requestCount: 0 }
      },
      
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}