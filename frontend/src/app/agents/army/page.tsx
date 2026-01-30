'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  DndContext, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core'
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, 
  Shield, 
  Users, 
  Zap, 
  Activity, 
  Target, 
  Plus,
  Search,
  Filter,
  Star,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react'

import DashboardLayout from '@/components/DashboardLayout'
import { ArmyAgent, Squad, ArmyHierarchy, DragItem, SquadName, ArmyStatus } from '@/types/agent-army'
import { AgentDetailModal } from '@/components/agents/army/AgentDetailModal'
import { CreateAgentModal } from '@/components/agents/army/CreateAgentModal'
import { CommanderCard } from '@/components/agents/army/CommanderCard'
import { SquadCard } from '@/components/agents/army/SquadCard'
import { AgentCard } from '@/components/agents/army/AgentCard'
import { ArmyStats } from '@/components/agents/army/ArmyStats'
import { ParticleField } from '@/components/agents/army/ParticleField'
import { HierarchyLines } from '@/components/agents/army/HierarchyLines'
import { RealtimeProvider, useRealtime } from '@/components/agents/army/RealtimeProvider'
import { FloatingActionButton } from '@/components/agents/army/FloatingActionButton'
import { LiveActivityFeed } from '@/components/agents/army/LiveActivityFeed'

function AgentArmyContent() {
  const [army, setArmy] = useState<ArmyHierarchy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<ArmyAgent | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [filter, setFilter] = useState<ArmyStatus | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedSquads, setExpandedSquads] = useState<Set<SquadName>>(new Set(['Research', 'Development', 'Communications', 'Operations']))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Refs for connection lines
  const commanderRef = useRef<HTMLDivElement>(null)
  const squadRefs = useRef<(HTMLDivElement | null)[]>([])
  
  // Real-time context
  const { isConnected, lastUpdate } = useRealtime()

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Fetch army data
  const fetchArmy = useCallback(async () => {
    try {
      setError(null)
      const response = await fetch('/api/agents/army')
      if (!response.ok) {
        throw new Error(`Failed to fetch army data: ${response.status}`)
      }
      const data = await response.json()
      setArmy(data)
    } catch (err) {
      console.error('Error fetching army:', err)
      setError(err instanceof Error ? err.message : 'Failed to load army data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Initial load and polling
  useEffect(() => {
    fetchArmy()
    const interval = setInterval(fetchArmy, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchArmy])

  // Handle real-time updates
  const handleAgentUpdate = useCallback(() => {
    fetchArmy() // Refresh army data when real-time update occurs
  }, [fetchArmy])

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
  }

  // Handle drag end - reassign agent to new squad
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !army) return

    const draggedAgentId = active.id as string
    const targetSquadName = over.id as SquadName

    // Find the dragged agent
    const draggedAgent = findAgentById(draggedAgentId, army)
    if (!draggedAgent || draggedAgent.squad === targetSquadName) return

    try {
      const response = await fetch(`/api/agents/army/${draggedAgentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ squad: targetSquadName })
      })

      if (!response.ok) throw new Error('Failed to reassign agent')

      await fetchArmy() // Refresh data
    } catch (err) {
      console.error('Error reassigning agent:', err)
      setError('Failed to reassign agent')
    }
  }

  // Helper function to find agent by ID
  const findAgentById = (id: string, army: ArmyHierarchy): ArmyAgent | null => {
    if (army.commander.id === id) return army.commander
    
    for (const squad of army.squads) {
      if (squad.leader.id === id) return squad.leader
      const agent = squad.agents.find(a => a.id === id)
      if (agent) return agent
    }
    return null
  }

  // Filter and search logic
  const filteredSquads = army ? army.squads.map(squad => ({
    ...squad,
    agents: squad.agents.filter(agent => {
      const matchesFilter = filter === 'all' || agent.status === filter
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesFilter && matchesSearch
    })
  })) : []

  // Toggle squad expansion
  const toggleSquad = (squadName: SquadName) => {
    const newExpanded = new Set(expandedSquads)
    if (newExpanded.has(squadName)) {
      newExpanded.delete(squadName)
    } else {
      newExpanded.add(squadName)
    }
    setExpandedSquads(newExpanded)
  }

  // Handle agent updates (for modal)
  const handleAgentUpdateModal = async (updates: Partial<ArmyAgent>) => {
    if (!selectedAgent) return

    try {
      const response = await fetch(`/api/agents/army/${selectedAgent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) throw new Error('Failed to update agent')

      await fetchArmy()
      setSelectedAgent(null)
    } catch (err) {
      console.error('Error updating agent:', err)
      setError('Failed to update agent')
    }
  }

  // Handle real-time agent updates
  const handleRealtimeAgentUpdate = useCallback((agent: ArmyAgent) => {
    // Optionally show a toast or update notification
    console.log('Agent updated in real-time:', agent.name)
  }, [])

  // Handle agent deletion
  const handleAgentDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/agents/army/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete agent')

      await fetchArmy()
      setSelectedAgent(null)
    } catch (err) {
      console.error('Error deleting agent:', err)
      setError('Failed to delete agent')
    }
  }

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <Sparkles className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <p className="mt-4 text-lg font-medium text-emerald-700">Assembling the Army...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 p-6">
          <div className="max-w-md mx-auto mt-20 bg-white rounded-lg border-2 border-red-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-red-700">Connection Failed</h3>
            </div>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchArmy}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!army) return null

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-emerald-100 relative overflow-hidden">
        {/* Background Particle Field */}
        <ParticleField 
          active={army?.stats.totalAgents > 0} 
          color="emerald" 
          density="low"
          className="opacity-20"
        />

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-amber-700 text-white relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="relative"
                >
                  <Crown className="w-10 sm:w-12 h-10 sm:h-12 text-amber-300" />
                  <ParticleField 
                    active={true} 
                    color="gold" 
                    density="medium"
                    className="absolute inset-0"
                  />
                </motion.div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Agent Army</h1>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-emerald-200 text-sm sm:text-lg">Command and Control Center</p>
                    <div className="flex items-center gap-1">
                      {isConnected ? (
                        <Wifi className="w-4 h-4 text-green-300" />
                      ) : (
                        <WifiOff className="w-4 h-4 text-red-300" />
                      )}
                      <span className="text-xs text-white/70">
                        {isConnected ? 'Live' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateModal(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium flex items-center gap-2 shadow-lg text-sm sm:text-base"
                >
                  <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Recruit Agent</span>
                  <span className="sm:hidden">Recruit</span>
                </motion.button>
              </div>
            </div>

            {/* Quick Stats */}
            <ArmyStats stats={army.stats} />
          </div>
        </div>

        {/* Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-md rounded-lg border border-emerald-200 p-4 mb-6 shadow-lg"
          >
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search agents, skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>

              {/* Filter and Squad Toggle */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="flex items-center gap-2 flex-1">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as ArmyStatus | 'all')}
                    className="flex-1 sm:flex-none border border-emerald-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="busy">Busy</option>
                    <option value="idle">Idle</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* Mobile Squad Controls */}
                {isMobile && (
                  <div className="flex flex-wrap gap-2">
                    {['Research', 'Development', 'Communications', 'Operations'].map((squad) => (
                      <button
                        key={squad}
                        onClick={() => toggleSquad(squad as SquadName)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          expandedSquads.has(squad as SquadName)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {squad}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Army Hierarchy */}
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="relative">
              {/* Connection Lines (Desktop Only) */}
              {!isMobile && (
                <HierarchyLines
                  commanderRef={commanderRef}
                  squadRefs={squadRefs.current.map((ref, index) => ({ current: ref }))}
                  className="opacity-70"
                />
              )}

              <div className="space-y-6 sm:space-y-8 relative z-10">
                {/* Commander Level */}
                <motion.div
                  ref={commanderRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative"
                >
                  <CommanderCard 
                    commander={army.commander}
                    onClick={() => setSelectedAgent(army.commander)}
                  />
                  {/* Active Agent Particles */}
                  {army.commander.status === 'active' && (
                    <ParticleField 
                      active={true} 
                      color="gold" 
                      density="medium"
                      className="absolute inset-0 rounded-xl"
                    />
                  )}
                </motion.div>

                {/* Squad Level */}
                <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'lg:grid-cols-2 gap-6'}`}>
                  {filteredSquads.map((squad, index) => (
                    <motion.div
                      key={squad.name}
                      ref={el => squadRefs.current[index] = el}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (index * 0.1) }}
                      className="relative"
                    >
                      <SquadCard
                        squad={squad}
                        isExpanded={isMobile ? expandedSquads.has(squad.name) : true}
                        onToggle={() => toggleSquad(squad.name)}
                        onAgentClick={setSelectedAgent}
                      />
                      {/* Squad Activity Particles */}
                      {squad.activeAgents > 0 && (
                        <ParticleField 
                          active={squad.activeAgents > 0} 
                          color={index === 0 ? 'blue' : index === 1 ? 'emerald' : index === 2 ? 'purple' : 'gold'} 
                          density="low"
                          className="absolute inset-0 rounded-xl opacity-40"
                        />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drag Overlay */}
            <DragOverlay>
              {activeId ? (
                <div className="bg-white rounded-lg border-2 border-emerald-300 p-4 shadow-2xl opacity-90">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="font-medium">Moving Agent...</span>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Live Activity Feed (Desktop) */}
        {!isMobile && <LiveActivityFeed />}

        {/* Floating Action Button (Mobile) */}
        <FloatingActionButton 
          onCreateAgent={() => setShowCreateModal(true)}
          isMobile={isMobile}
        />

        {/* Modals */}
        <AnimatePresence>
          {selectedAgent && (
            <AgentDetailModal
              agent={selectedAgent}
              onClose={() => setSelectedAgent(null)}
              onUpdate={handleAgentUpdateModal}
              onDelete={handleAgentDelete}
            />
          )}

          {showCreateModal && (
            <CreateAgentModal
              onClose={() => setShowCreateModal(false)}
              onSuccess={() => {
                setShowCreateModal(false)
                fetchArmy()
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  )
}

export default function AgentArmyPage() {
  return (
    <RealtimeProvider onAgentUpdate={(agent) => console.log('Real-time update:', agent)}>
      <AgentArmyContent />
    </RealtimeProvider>
  )
}