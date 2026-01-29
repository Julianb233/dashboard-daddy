import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  
  // Get real task counts
  const { data: tasks } = await supabase
    .from('scheduled_tasks')
    .select('status')
  
  const { data: contacts } = await supabase
    .from('contacts')
    .select('id')
  
  const { data: radar } = await supabase
    .from('radar_items')
    .select('*')
    .eq('status', 'active')
  
  const { data: orangeSales } = await supabase
    .from('orange_sales')
    .select('total_cents, amount_paid_cents')
  
  // Calculate stats
  const tasksByStatus = {
    active: tasks?.filter(t => t.status === 'active').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
    pending: tasks?.filter(t => t.status === 'pending').length || 0,
  }
  
  const receivables = orangeSales?.reduce((sum, s) => 
    sum + (s.total_cents - s.amount_paid_cents), 0) || 0
  
  return NextResponse.json({
    tasks: tasksByStatus,
    contacts: contacts?.length || 0,
    radarItems: radar?.length || 0,
    receivables: receivables / 100,
    lastUpdated: new Date().toISOString()
  })
}
