import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { ArmyAgent, Squad, ArmyHierarchy, CreateAgentData } from '@/types/agent-army'

// Helper function to calculate success rate
function calculateSuccessRate(missionsCompleted: number, missionsFailed: number): number {
  const total = missionsCompleted + missionsFailed
  return total > 0 ? Math.round((missionsCompleted / total) * 100) : 100
}

// Helper function to add success_rate to an agent
function withSuccessRate(agent: any): ArmyAgent {
  return {
    ...agent,
    success_rate: calculateSuccessRate(agent.missions_completed, agent.missions_failed)
  }
}

// GET - Fetch army hierarchy
export async function GET() {
  try {
    // Fetch all agents from the database
    const { data: agents, error } = await supabase
      .from('agent_army')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    if (!agents || agents.length === 0) {
      // Return empty hierarchy if no agents
      return NextResponse.json({
        commander: null,
        squads: [],
        stats: {
          totalAgents: 0,
          activeMissions: 0,
          overallSuccessRate: 0,
          averagePerformance: 0,
          squads: []
        }
      })
    }

    // Add success_rate to all agents
    const agentsWithRate = agents.map(withSuccessRate)

    // Find commander
    const commander = agentsWithRate.find(agent => agent.role === 'commander')
    if (!commander) {
      return NextResponse.json({ error: 'No commander found' }, { status: 404 })
    }

    // Group agents by squad
    const squadNames = ['Research', 'Development', 'Communications', 'Operations'] as const
    const squads: Squad[] = []

    for (const squadName of squadNames) {
      const squadAgents = agentsWithRate.filter(agent => 
        agent.squad === squadName && agent.role === 'agent'
      )
      
      const squadLeader = agentsWithRate.find(agent => 
        agent.squad === squadName && agent.role === 'squad_leader'
      )

      if (squadLeader) {
        const activeAgents = squadAgents.filter(agent => 
          agent.status === 'active' || agent.status === 'busy'
        ).length

        const averagePerformance = squadAgents.length > 0
          ? Math.round(squadAgents.reduce((sum, agent) => sum + agent.performance_score, 0) / squadAgents.length)
          : 0

        const currentTasks = squadAgents.filter(agent => agent.current_task).length

        squads.push({
          name: squadName,
          leader: squadLeader,
          agents: squadAgents,
          totalAgents: squadAgents.length,
          activeAgents,
          averagePerformance,
          currentTasks
        })
      }
    }

    // Calculate overall stats
    const allAgents = agentsWithRate.filter(agent => agent.role !== 'commander')
    const totalAgents = allAgents.length
    const activeMissions = allAgents.filter(agent => agent.current_task).length
    
    const totalMissions = allAgents.reduce((sum, agent) => 
      sum + agent.missions_completed + agent.missions_failed, 0
    )
    const totalCompleted = allAgents.reduce((sum, agent) => 
      sum + agent.missions_completed, 0
    )
    
    const overallSuccessRate = totalMissions > 0 
      ? Math.round((totalCompleted / totalMissions) * 100) 
      : 100

    const averagePerformance = totalAgents > 0
      ? Math.round(allAgents.reduce((sum, agent) => sum + agent.performance_score, 0) / totalAgents)
      : 0

    const hierarchy: ArmyHierarchy = {
      commander,
      squads,
      stats: {
        totalAgents,
        activeMissions,
        overallSuccessRate,
        averagePerformance,
        squads
      }
    }

    return NextResponse.json(hierarchy)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new agent
export async function POST(request: NextRequest) {
  try {
    const body: CreateAgentData = await request.json()

    // Validation
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Agent name is required' }, { status: 400 })
    }

    if (!body.skills || body.skills.length === 0) {
      return NextResponse.json({ error: 'At least one skill is required' }, { status: 400 })
    }

    if (!['commander', 'squad_leader', 'agent'].includes(body.role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // For squad leaders and agents, validate squad assignment
    if ((body.role === 'squad_leader' || body.role === 'agent') && body.squad) {
      if (!['Research', 'Development', 'Communications', 'Operations'].includes(body.squad)) {
        return NextResponse.json({ error: 'Invalid squad' }, { status: 400 })
      }
    }

    // Check if commander already exists (only one commander allowed)
    if (body.role === 'commander') {
      const { data: existingCommander } = await supabase
        .from('agent_army')
        .select('id')
        .eq('role', 'commander')
        .single()

      if (existingCommander) {
        return NextResponse.json({ error: 'Commander already exists' }, { status: 400 })
      }
    }

    // Find parent_id if needed
    let parent_id = null
    if (body.role === 'agent' && body.squad) {
      // Find the squad leader for this squad
      const { data: squadLeader } = await supabase
        .from('agent_army')
        .select('id')
        .eq('role', 'squad_leader')
        .eq('squad', body.squad)
        .single()

      if (squadLeader) {
        parent_id = squadLeader.id
      }
    } else if (body.role === 'squad_leader') {
      // Find the commander
      const { data: commander } = await supabase
        .from('agent_army')
        .select('id')
        .eq('role', 'commander')
        .single()

      if (commander) {
        parent_id = commander.id
      }
    }

    // Create the agent
    const { data: newAgent, error } = await supabase
      .from('agent_army')
      .insert({
        name: body.name.trim(),
        role: body.role,
        squad: body.squad || null,
        parent_id,
        skills: body.skills,
        description: body.description?.trim() || null,
        status: 'idle',
        performance_score: 100, // Start with perfect score
        missions_completed: 0,
        missions_failed: 0,
        total_uptime: 0
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create agent' }, { status: 500 })
    }

    return NextResponse.json({ agent: newAgent }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}