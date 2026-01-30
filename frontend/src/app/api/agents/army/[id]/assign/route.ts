import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const body = await request.json()
    
    const { task, priority = 'medium', estimatedDuration } = body
    
    if (!task?.trim()) {
      return NextResponse.json(
        { error: 'Task description is required' },
        { status: 400 }
      )
    }
    
    // Get the agent to check current status
    const { data: agent, error: fetchError } = await supabase
      .from('agent_army')
      .select('*')
      .eq('id', agentId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching agent:', fetchError)
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Check if agent is available
    if (agent.status === 'busy' && agent.current_task) {
      return NextResponse.json(
        { 
          error: 'Agent is already busy',
          currentTask: agent.current_task,
          agentStatus: agent.status
        },
        { status: 409 }
      )
    }
    
    // Update agent with new task
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agent_army')
      .update({
        current_task: task.trim(),
        status: 'busy',
        last_active: new Date().toISOString()
      })
      .eq('id', agentId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating agent:', updateError)
      return NextResponse.json(
        { error: 'Failed to assign task' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Task assigned to ${updatedAgent.name}`,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        squad: updatedAgent.squad,
        currentTask: updatedAgent.current_task,
        status: updatedAgent.status
      },
      task: {
        description: task.trim(),
        assignedAt: new Date().toISOString(),
        priority,
        estimatedDuration
      }
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Complete a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const body = await request.json()
    
    const { success = true, result, missionDuration } = body
    
    // Get the agent
    const { data: agent, error: fetchError } = await supabase
      .from('agent_army')
      .select('*')
      .eq('id', agentId)
      .single()
    
    if (fetchError) {
      console.error('Error fetching agent:', fetchError)
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    if (!agent.current_task) {
      return NextResponse.json(
        { error: 'Agent has no active task' },
        { status: 400 }
      )
    }
    
    const updates: Record<string, unknown> = {
      current_task: null,
      status: 'active',
      last_active: new Date().toISOString()
    }
    
    // Update mission stats
    if (success) {
      updates.missions_completed = (agent.missions_completed || 0) + 1
      updates.performance_score = Math.min(100, (agent.performance_score || 100) + 1)
    } else {
      updates.missions_failed = (agent.missions_failed || 0) + 1
      updates.performance_score = Math.max(0, (agent.performance_score || 100) - 2)
    }
    
    if (missionDuration) {
      updates.total_uptime = (agent.total_uptime || 0) + missionDuration
    }
    
    const { data: updatedAgent, error: updateError } = await supabase
      .from('agent_army')
      .update(updates)
      .eq('id', agentId)
      .select()
      .single()
    
    if (updateError) {
      console.error('Error updating agent:', updateError)
      return NextResponse.json(
        { error: 'Failed to complete task' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Task ${success ? 'completed' : 'failed'} by ${updatedAgent.name}`,
      agent: {
        id: updatedAgent.id,
        name: updatedAgent.name,
        missionsCompleted: updatedAgent.missions_completed,
        missionsFailed: updatedAgent.missions_failed,
        performanceScore: updatedAgent.performance_score,
        status: updatedAgent.status
      },
      result
    })
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
