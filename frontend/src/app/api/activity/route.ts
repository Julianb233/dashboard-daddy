import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: tasks } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  const { data: radar } = await supabase
    .from('radar_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  
  const activities = [
    ...(tasks?.map(t => ({ type: 'task', ...t })) || []),
    ...(radar?.map(r => ({ type: 'radar', ...r })) || []),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  .slice(0, 20)
  
  return NextResponse.json({ activities })
}
