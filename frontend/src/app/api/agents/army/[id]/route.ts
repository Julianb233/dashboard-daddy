import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ArmyAgent } from '@/types/agent-army'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Fetch single agent
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    const { data: agent, error } = await supabase
      .from('agent_army')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
    }

    // Calculate success_rate
    const successRate = agent.missions_completed + agent.missions_failed > 0
      ? Math.round((agent.missions_completed / (agent.missions_completed + agent.missions_failed)) * 100)
      : 100

    return NextResponse.json({
      ...agent,
      success_rate: successRate
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH - Update agent
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate allowed fields
    const allowedFields = [
      'name', 'squad', 'skills', 'status', 'current_task', 
      'performance_score', 'description', 'avatar_url'
    ]
    
    const updates: Record<string, any> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Validate squad if provided
    if (updates.squad && !['Research', 'Development', 'Communications', 'Operations', null].includes(updates.squad)) {
      return NextResponse.json({ error: 'Invalid squad' }, { status: 400 })
    }

    // Validate status if provided
    if (updates.status && !['active', 'idle', 'busy', 'offline'].includes(updates.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Validate performance_score if provided
    if (updates.performance_score !== undefined) {
      if (updates.performance_score < 0 || updates.performance_score > 100) {
        return NextResponse.json({ error: 'Performance score must be between 0 and 100' }, { status: 400 })
      }
    }

    // Update parent_id if squad changed (for agents only)
    if (updates.squad) {
      // Get current agent to check role
      const { data: currentAgent } = await supabase
        .from('agent_army')
        .select('role')
        .eq('id', id)
        .single()

      if (currentAgent?.role === 'agent') {
        // Find the squad leader for the new squad
        const { data: squadLeader } = await supabase
          .from('agent_army')
          .select('id')
          .eq('role', 'squad_leader')
          .eq('squad', updates.squad)
          .single()

        if (squadLeader) {
          updates.parent_id = squadLeader.id
        }
      }
    }

    // Update last_active if status is changing to active
    if (updates.status === 'active') {
      updates.last_active = new Date().toISOString()
    }

    const { data: updatedAgent, error } = await supabase
      .from('agent_army')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 })
    }

    // Calculate success_rate
    const successRate = updatedAgent.missions_completed + updatedAgent.missions_failed > 0
      ? Math.round((updatedAgent.missions_completed / (updatedAgent.missions_completed + updatedAgent.missions_failed)) * 100)
      : 100

    return NextResponse.json({
      agent: {
        ...updatedAgent,
        success_rate: successRate
      }
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete agent
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params

    // Check if agent exists and get role
    const { data: agent, error: fetchError } = await supabase
      .from('agent_army')
      .select('role, name')
      .eq('id', id)
      .single()

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
      }
      console.error('Database error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch agent' }, { status: 500 })
    }

    // Prevent deletion of commander
    if (agent.role === 'commander') {
      return NextResponse.json({ error: 'Cannot delete the commander' }, { status: 403 })
    }

    // Prevent deletion of squad leaders with agents
    if (agent.role === 'squad_leader') {
      const { data: subordinates } = await supabase
        .from('agent_army')
        .select('id')
        .eq('parent_id', id)

      if (subordinates && subordinates.length > 0) {
        return NextResponse.json({ 
          error: 'Cannot delete squad leader with assigned agents. Reassign agents first.' 
        }, { status: 400 })
      }
    }

    // Delete the agent
    const { error: deleteError } = await supabase
      .from('agent_army')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Database error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete agent' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Agent "${agent.name}" has been deleted` 
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
