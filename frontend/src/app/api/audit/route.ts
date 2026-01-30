import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';

const DATA_FILE = '/home/dev/dashboard-daddy/data/audit_log.json';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const limitParam = Number(searchParams.get('limit') || 100);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 500) : 100;
    
    // Read real data from file
    let logs = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      logs = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet - return empty
      return NextResponse.json([]);
    }
    
    // Sort by created_at descending
    logs.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    // Filter by action if specified
    if (action && action !== 'all') {
      logs = logs.filter((log: any) => log.action === action);
    }
    
    // Limit results
    logs = logs.slice(0, limit);
    
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Read existing data
    let logs = [];
    try {
      const data = await fs.readFile(DATA_FILE, 'utf-8');
      logs = JSON.parse(data);
    } catch (e) {
      // File doesn't exist yet
    }
    
    // Add new log entry
    const newLog = {
      id: String(Date.now()),
      action: body.action || 'unknown',
      actor: body.actor || 'Bubba',
      actor_role: body.actor_role || 'agent',
      details: body.details || '',
      metadata: body.metadata || {},
      created_at: new Date().toISOString()
    };
    
    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 1000 entries
    logs = logs.slice(0, 1000);
    
    // Save
    await fs.writeFile(DATA_FILE, JSON.stringify(logs, null, 2));
    
    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: 'Failed to create audit log' }, { status: 500 });
  }
}
