import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Try to get real task data
    try {
      const { data: tasks } = await supabase
        .from('kanban_tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (tasks && tasks.length > 0) {
        const formattedTasks = tasks.map(task => ({
          id: task.id,
          title: task.title || 'Untitled Task',
          status: normalizeStatus(task.status),
          assignedTo: task.assignee || 'Unassigned',
          dueDate: formatDueDate(task.due_date),
          priority: task.priority || 'medium'
        }));
        
        return NextResponse.json(formattedTasks);
      }
    } catch (e) {
      console.log('kanban_tasks table not found, using demo data')
    }
    
    // Return demo data
    const demoTasks = [
      {
        id: '1',
        title: 'Update customer database schema',
        status: 'in_progress',
        assignedTo: 'Riley',
        dueDate: 'Today',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Generate monthly financial report',
        status: 'completed',
        assignedTo: 'Taylor',
        dueDate: 'Yesterday',
        priority: 'medium'
      },
      {
        id: '3',
        title: 'Schedule client calls for next week',
        status: 'pending',
        assignedTo: 'Sam',
        dueDate: 'Tomorrow',
        priority: 'medium'
      },
      {
        id: '4',
        title: 'Research market trends for Q1',
        status: 'overdue',
        assignedTo: 'Maya',
        dueDate: '2 days ago',
        priority: 'low'
      },
      {
        id: '5',
        title: 'Draft blog post about AI automation',
        status: 'in_progress',
        assignedTo: 'Jordan',
        dueDate: 'This week',
        priority: 'medium'
      },
      {
        id: '6',
        title: 'Process invoice batch for clients',
        status: 'completed',
        assignedTo: 'Taylor',
        dueDate: 'Yesterday',
        priority: 'high'
      },
      {
        id: '7',
        title: 'Update website copy for new features',
        status: 'pending',
        assignedTo: 'Jordan',
        dueDate: 'Next week',
        priority: 'low'
      }
    ];
    
    return NextResponse.json(demoTasks);
  } catch (error) {
    console.error('Error fetching recent tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch recent tasks' }, { status: 500 })
  }
}

function normalizeStatus(status: string): 'completed' | 'in_progress' | 'pending' | 'overdue' {
  const normalized = status?.toLowerCase();
  if (['completed', 'done', 'finished'].includes(normalized)) return 'completed';
  if (['in_progress', 'active', 'working', 'started'].includes(normalized)) return 'in_progress';
  if (['overdue', 'late', 'archived'].includes(normalized)) return 'overdue';
  if (['todo', 'pending'].includes(normalized)) return 'pending';
  return 'pending';
}

function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return 'No due date';
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}