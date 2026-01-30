import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get real task data
    try {
      const { data: tasks } = await supabase
        .from('kanban_tasks')
        .select('status')
      
      if (tasks && tasks.length > 0) {
        const summary = {
          total: tasks.length,
          completed: tasks.filter(t => t.status === 'done').length,
          inProgress: tasks.filter(t => t.status === 'in_progress').length,
          pending: tasks.filter(t => t.status === 'todo').length,
          overdue: tasks.filter(t => t.status === 'archived').length,
        };
        
        return NextResponse.json(summary);
      }
    } catch (e) {
      console.log('kanban_tasks table not found, using demo data')
    }
    
    // Return demo data
    const demoSummary = {
      total: 47,
      completed: 28,
      inProgress: 12,
      pending: 5,
      overdue: 2,
    };
    
    return NextResponse.json(demoSummary);
  } catch (error) {
    console.error('Error fetching task summary:', error)
    return NextResponse.json({ error: 'Failed to fetch task summary' }, { status: 500 })
  }
}