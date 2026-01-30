import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

export async function GET() {
  try {
    const supabase = await createClient()
    const activities: any[] = []
    
    // Get agent execution logs
    try {
      const { data: execLogs } = await supabase
        .from('agent_execution_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (execLogs && execLogs.length > 0) {
        execLogs.forEach(log => {
          activities.push({
            id: `exec-${log.id}`,
            type: log.status === 'completed' ? 'task_completed' : 'task_started',
            title: log.action_type || 'Agent Execution',
            description: log.details || log.result || 'Agent task executed',
            timestamp: getRelativeTime(log.created_at),
            agent: log.agent_id || 'Bubba',
            priority: 'medium'
          })
        })
      }
    } catch (e) {
      console.log('agent_execution_log error:', e)
    }
    
    // Get communication logs
    try {
      const { data: commLogs } = await supabase
        .from('communication_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (commLogs && commLogs.length > 0) {
        commLogs.forEach(log => {
          activities.push({
            id: `comm-${log.id}`,
            type: 'message_received',
            title: `Message via ${log.channel || 'System'}`,
            description: log.summary || log.content?.substring(0, 100) || 'Communication logged',
            timestamp: getRelativeTime(log.created_at),
            agent: 'System',
            priority: 'low'
          })
        })
      }
    } catch (e) {
      console.log('communication_logs error:', e)
    }

    // Get recent tasks
    try {
      const { data: tasks } = await supabase
        .from('kanban_tasks')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10)
      
      if (tasks && tasks.length > 0) {
        tasks.forEach(task => {
          activities.push({
            id: `task-${task.id}`,
            type: task.status === 'done' ? 'task_completed' : 'task_started',
            title: task.title || 'Task',
            description: task.description || '',
            timestamp: getRelativeTime(task.updated_at || task.created_at),
            agent: task.assignee || 'Unassigned',
            priority: task.priority || 'medium'
          })
        })
      }
    } catch (e) {
      console.log('tasks error:', e)
    }

    // Sort by timestamp (most recent first) and limit
    activities.sort((a, b) => {
      const aTime = a.timestamp.includes('just now') ? 0 : 
                   a.timestamp.includes('minute') ? parseInt(a.timestamp) : 
                   a.timestamp.includes('hour') ? parseInt(a.timestamp) * 60 :
                   parseInt(a.timestamp) * 1440
      const bTime = b.timestamp.includes('just now') ? 0 : 
                   b.timestamp.includes('minute') ? parseInt(b.timestamp) : 
                   b.timestamp.includes('hour') ? parseInt(b.timestamp) * 60 :
                   parseInt(b.timestamp) * 1440
      return aTime - bTime
    })

    if (activities.length > 0) {
      return NextResponse.json(activities.slice(0, 20))
    }
    
    // Return empty array if no data (not demo data)
    return NextResponse.json([])
    
  } catch (error) {
    console.error('Error fetching recent activity:', error)
    return NextResponse.json([])
  }
}
