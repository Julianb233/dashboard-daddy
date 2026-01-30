import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Get agent execution logs
    const { data: execLogs, error: execError } = await supabase
      .from('agent_execution_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    // Calculate metrics
    const logs = execLogs || [];
    const totalTasks = logs.length;
    const successfulTasks = logs.filter((l: any) => l.status === 'success' || l.status === 'completed').length;
    const failedTasks = logs.filter((l: any) => l.status === 'failed' || l.status === 'error').length;
    const pendingTasks = logs.filter((l: any) => l.status === 'pending' || l.status === 'running').length;

    const successRate = totalTasks > 0 ? (successfulTasks / totalTasks) * 100 : 0;

    // Group by day for trend
    const dailyStats: Record<string, { success: number; failed: number; total: number }> = {};
    logs.forEach((log: any) => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { success: 0, failed: 0, total: 0 };
      }
      dailyStats[date].total++;
      if (log.status === 'success' || log.status === 'completed') {
        dailyStats[date].success++;
      } else if (log.status === 'failed' || log.status === 'error') {
        dailyStats[date].failed++;
      }
    });

    // Get error patterns
    const errorPatterns: Record<string, number> = {};
    logs
      .filter((l: any) => l.status === 'failed' || l.status === 'error')
      .forEach((log: any) => {
        const errorType = log.error_message?.split(':')[0] || 'Unknown';
        errorPatterns[errorType] = (errorPatterns[errorType] || 0) + 1;
      });

    // Recent failures for review
    const recentFailures = logs
      .filter((l: any) => l.status === 'failed' || l.status === 'error')
      .slice(0, 10)
      .map((l: any) => ({
        id: l.id,
        task: l.task_name || l.action,
        error: l.error_message,
        timestamp: l.created_at,
        agent: l.agent_name || 'bubba'
      }));

    return NextResponse.json({
      summary: {
        totalTasks,
        successfulTasks,
        failedTasks,
        pendingTasks,
        successRate: Math.round(successRate * 10) / 10
      },
      dailyTrend: Object.entries(dailyStats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14) // Last 14 days
        .map(([date, stats]) => ({
          date,
          ...stats,
          successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
        })),
      errorPatterns: Object.entries(errorPatterns)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([error, count]) => ({ error, count })),
      recentFailures,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching agent analytics:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch analytics',
      summary: {
        totalTasks: 0,
        successfulTasks: 0,
        failedTasks: 0,
        pendingTasks: 0,
        successRate: 0
      },
      dailyTrend: [],
      errorPatterns: [],
      recentFailures: []
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log an agent action
    const { data, error } = await supabase
      .from('agent_execution_log')
      .insert({
        agent_name: body.agent || 'bubba',
        task_name: body.task,
        action: body.action,
        status: body.status || 'pending',
        input_data: body.input,
        output_data: body.output,
        error_message: body.error,
        duration_ms: body.duration,
        verified: body.verified || false,
        verification_method: body.verificationMethod
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, log: data });
  } catch (error) {
    console.error('Error logging agent action:', error);
    return NextResponse.json({ error: 'Failed to log action' }, { status: 500 });
  }
}
