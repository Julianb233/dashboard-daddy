import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'task' | 'contact' | 'sale' | 'system';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '10')
  
  const supabase = await createClient()
  
  const activities: Activity[] = []
  
  // Get recent tasks
  const { data: tasks } = await supabase
    .from('scheduled_tasks')
    .select('id, name, status, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)
  
  if (tasks) {
    tasks.forEach(t => {
      activities.push({
        id: `task-${t.id}`,
        action: t.status === 'completed' ? 'Task Completed' : t.status === 'active' ? 'Task Started' : 'Task Created',
        details: t.name || 'Unnamed task',
        timestamp: t.updated_at || t.created_at,
        type: 'task'
      })
    })
  }
  
  // Get recent radar items
  const { data: radar } = await supabase
    .from('radar_items')
    .select('id, title, description, status, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (radar) {
    radar.forEach(r => {
      activities.push({
        id: `radar-${r.id}`,
        action: 'Radar Item Added',
        details: r.title || r.description || 'New radar item',
        timestamp: r.created_at,
        type: 'system'
      })
    })
  }
  
  // Get recent contacts
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id, name, relationship_type, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (contacts) {
    contacts.forEach(c => {
      activities.push({
        id: `contact-${c.id}`,
        action: 'Contact Added',
        details: `${c.name}${c.relationship_type ? ` (${c.relationship_type})` : ''}`,
        timestamp: c.created_at,
        type: 'contact'
      })
    })
  }
  
  // Get recent orange sales
  const { data: sales } = await supabase
    .from('orange_sales')
    .select('id, customer_name, total_cents, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (sales) {
    sales.forEach(s => {
      activities.push({
        id: `sale-${s.id}`,
        action: 'Sale Recorded',
        details: `${s.customer_name} - $${(s.total_cents / 100).toFixed(2)}`,
        timestamp: s.created_at,
        type: 'sale'
      })
    })
  }
  
  // Sort all activities by timestamp and limit
  const sortedActivities = activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
  
  return NextResponse.json({ 
    items: sortedActivities,
    total: sortedActivities.length,
    limit
  })
}
