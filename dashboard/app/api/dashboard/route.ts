import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get today's date
    const today = new Date().toISOString().split('T')[0]

    // Fetch multiple data points
    const [tasksRes, contactsRes, summaryRes, upcomingRes] = await Promise.all([
      supabase.from('scheduled_tasks').select('id, status').eq('status', 'pending'),
      supabase.from('contacts').select('id'),
      supabase.from('daily_summaries').select('*').eq('date', today).single(),
      supabase.from('scheduled_tasks')
        .select('*')
        .gte('scheduled_for', new Date().toISOString())
        .order('scheduled_for')
        .limit(5)
    ])

    return NextResponse.json({
      stats: {
        pending_tasks: tasksRes.data?.length || 0,
        contacts: contactsRes.data?.length || 0,
        today_summary: summaryRes.data || null
      },
      upcoming_tasks: upcomingRes.data || []
    })
  } catch (error) {
    console.error('Error fetching dashboard:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 })
  }
}
