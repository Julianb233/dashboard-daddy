import { NextRequest, NextResponse } from 'next/server';

export interface BubbaStatusResponse {
  status: 'active' | 'thinking' | 'idle' | 'offline';
  currentTask?: string;
  lastActivity?: string;
  sessionId?: string;
  progress?: number;
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would:
    // 1. Check Clawdbot session status via API or file system
    // 2. Parse current active tasks from logs
    // 3. Get last activity timestamp
    // 4. Return real-time status
    
    // For now, simulate dynamic status based on time and random factors
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Simulate different status patterns based on time
    let status: BubbaStatusResponse['status'] = 'idle';
    let currentTask: string | undefined;
    let progress: number | undefined;
    
    // More active during business hours
    if (hour >= 9 && hour <= 18) {
      const activities = Math.random();
      if (activities > 0.7) {
        status = 'active';
        const tasks = [
          'Processing user requests',
          'Analyzing GitHub repositories', 
          'Updating project documentation',
          'Synchronizing with Linear tasks',
          'Managing email workflows',
          'Reviewing code changes',
          'Generating project reports',
          'Coordinating agent communications',
          'Monitoring system health',
          'Processing automation workflows'
        ];
        currentTask = tasks[Math.floor(Math.random() * tasks.length)];
        progress = Math.floor(Math.random() * 100);
      } else if (activities > 0.4) {
        status = 'thinking';
        currentTask = 'Extended reasoning and planning';
      } else {
        status = 'idle';
      }
    } else {
      // Less active outside business hours
      const nightActivity = Math.random();
      if (nightActivity > 0.9) {
        status = 'active';
        currentTask = 'Processing scheduled maintenance';
        progress = Math.floor(Math.random() * 100);
      } else if (nightActivity > 0.7) {
        status = 'thinking';
        currentTask = 'Background analysis';
      } else {
        status = 'idle';
      }
    }
    
    const response: BubbaStatusResponse = {
      status,
      currentTask,
      lastActivity: now.toISOString(),
      sessionId: 'main',
      progress
    };
    
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    console.error('Error fetching Bubba status:', error);
    return NextResponse.json(
      { 
        status: 'offline',
        lastActivity: new Date().toISOString(),
        sessionId: 'error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for manual status updates
export async function POST(request: NextRequest) {
  try {
    const { status, task } = await request.json();
    
    // In a real implementation, this would:
    // 1. Update Bubba's current status
    // 2. Log the status change
    // 3. Broadcast to connected clients via WebSocket
    
    console.log('Manual Bubba status update:', { status, task });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Status updated successfully' 
    });
    
  } catch (error) {
    console.error('Error updating Bubba status:', error);
    return NextResponse.json(
      { error: 'Failed to update status' },
      { status: 500 }
    );
  }
}