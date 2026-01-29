import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  const supabase = await createClient()
  
  let query = supabase
    .from('scheduled_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
  
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  
  const { data: tasks, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Format tasks for frontend
  const formattedTasks = (tasks || []).map(task => ({
    id: task.id,
    title: task.name || 'Unnamed task',
    description: task.description,
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assignedAgent: task.assigned_agent || 'system',
    createdAt: task.created_at,
    updatedAt: task.updated_at,
    dueDate: task.due_date,
    completedAt: task.completed_at,
    result: task.result
  }))
  
  return NextResponse.json(formattedTasks)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('scheduled_tasks')
    .insert([{
      name: body.title,
      description: body.description,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      assigned_agent: body.assignedAgent || 'bubba',
      due_date: body.dueDate,
      created_at: new Date().toISOString()
    }])
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data?.[0])
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { id, ...updates } = body
  
  if (!id) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
  }
  
  const { data, error } = await supabase
    .from('scheduled_tasks')
    .update(updates)
    .eq('id', id)
    .select()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json(data?.[0])
}
