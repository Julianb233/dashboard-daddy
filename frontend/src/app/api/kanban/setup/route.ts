import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST() {
  try {
    const supabase = await createClient()

    // Use existing kanban_tasks table for kanban functionality
    const { data: existingData, error: countError } = await supabase
      .from('kanban_tasks')
      .select('id')

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    // If no data exists, add demo data
    if (!existingData || existingData.length === 0) {
      const demoTasks = [
        {
          title: 'Review client requirements',
          description: 'Analyze new project requirements from client',
          status: 'todo',
          priority: 'high',
          assignee: 'Quinn'
        },
        {
          title: 'Update dashboard UI',
          description: 'Apply new Wizard of AI theme across all pages',
          status: 'in_progress',
          priority: 'high',
          assignee: 'Jordan'
        },
        {
          title: 'Setup API monitoring',
          description: 'Implement health checks for all services',
          status: 'todo',
          priority: 'medium',
          assignee: 'Alex'
        },
        {
          title: 'Generate weekly report',
          description: 'Compile performance metrics and insights',
          status: 'in_progress',
          priority: 'medium',
          assignee: 'Taylor'
        },
        {
          title: 'Fix memory leak',
          description: 'Investigate and resolve agent memory issues',
          status: 'todo',
          priority: 'high',
          assignee: 'Maya'
        },
        {
          title: 'Deploy new features',
          description: 'Push latest updates to production',
          status: 'completed',
          priority: 'medium',
          assignee: 'Riley'
        },
        {
          title: 'Client onboarding call',
          description: 'Walk through platform features with new client',
          status: 'completed',
          priority: 'high',
          assignee: 'Sam'
        },
        {
          title: 'Update documentation',
          description: 'Refresh API docs and user guides',
          status: 'archived',
          priority: 'low',
          assignee: 'Jordan'
        }
      ]

      const { error: insertError } = await supabase
        .from('kanban_tasks')
        .insert(demoTasks)

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 })
      }

      return NextResponse.json({ message: 'Demo kanban data added successfully!' })
    }

    return NextResponse.json({ message: 'Tasks table already has data for kanban' })

  } catch (error) {
    console.error('Error setting up kanban:', error)
    return NextResponse.json({ error: 'Failed to setup kanban' }, { status: 500 })
  }
}