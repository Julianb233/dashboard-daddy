'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useDroppable } from '@dnd-kit/core'
import { 
  Shield, 
  ChevronDown, 
  ChevronUp,
  Users, 
  Activity, 
  Target,
  TrendingUp,
  Plus,
  Search,
  Code,
  MessageSquare,
  Cog,
  Star,
  Zap
} from 'lucide-react'
import { Squad, ArmyAgent } from '@/types/agent-army'
import { AgentCard } from './AgentCard'

interface SquadCardProps {
  squad: Squad
  isExpanded: boolean
  onToggle: () => void
  onAgentClick: (agent: ArmyAgent) => void
}

export function SquadCard({ squad, isExpanded, onToggle, onAgentClick }: SquadCardProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: squad.name
  })

  const getSquadIcon = (squadName: string) => {
    switch (squadName) {
      case 'Research': return Search
      case 'Development': return Code
      case 'Communications': return MessageSquare
      case 'Operations': return Cog
      default: return Shield
    }
  }

  const getSquadColor = (squadName: string) => {
    switch (squadName) {
      case 'Research': return {
        primary: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        accent: 'blue'
      }
      case 'Development': return {
        primary: 'from-green-500 to-emerald-600',
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        accent: 'green'
      }
      case 'Communications': return {
        primary: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        accent: 'purple'
      }
      case 'Operations': return {
        primary: 'from-orange-500 to-red-600',
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        accent: 'orange'
      }
      default: return {
        primary: 'from-gray-500 to-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-700',
        accent: 'gray'
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-amber-500'
      case 'idle': return 'bg-blue-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const SquadIcon = getSquadIcon(squad.name)
  const colors = getSquadColor(squad.name)

  return (
    <motion.div
      layout
      className={`${colors.bg} rounded-xl border-2 ${isOver ? 'border-emerald-400 bg-emerald-50' : colors.border} overflow-hidden shadow-lg`}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300 }}
      ref={setNodeRef}
    >
      {/* Squad Header */}
      <div className={`bg-gradient-to-r ${colors.primary} text-white p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
              <SquadIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                {squad.name} Squad
                <Shield className="w-5 h-5 text-white/80" />
              </h3>
              <p className="text-white/80 text-sm">
                {squad.activeAgents} of {squad.totalAgents} agents active
              </p>
            </div>
          </div>

          <button
            onClick={onToggle}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Squad Leader */}
        <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 ${getStatusColor(squad.leader.status)} rounded-full border border-white`}></div>
              </div>
              <div>
                <p className="font-semibold text-white">{squad.leader.name}</p>
                <p className="text-white/80 text-sm">Squad Leader</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold">{squad.leader.performance_score}%</div>
              <div className="text-white/80 text-xs">Performance</div>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Current Task</span>
            </div>
            <p className="text-white text-sm">{squad.leader.current_task || 'Managing squad operations'}</p>
          </div>
        </div>

        {/* Squad Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Performance</span>
            </div>
            <div className="text-white text-lg font-bold">{squad.averagePerformance}%</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Tasks</span>
            </div>
            <div className="text-white text-lg font-bold">{squad.currentTasks}</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">Agents</span>
            </div>
            <div className="text-white text-lg font-bold">{squad.totalAgents}</div>
          </div>
        </div>
      </div>

      {/* Drop Zone Indicator */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-100 border-2 border-dashed border-emerald-400 p-4 m-4 rounded-lg"
        >
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Drop agent here to reassign to {squad.name}</span>
          </div>
        </motion.div>
      )}

      {/* Squad Agents */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {squad.agents.length > 0 ? (
                squad.agents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AgentCard
                      agent={agent}
                      onClick={() => onAgentClick(agent)}
                      compact
                    />
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className={`w-12 h-12 mx-auto mb-3 ${colors.text} opacity-50`} />
                  <p className={`${colors.text} text-sm opacity-70`}>
                    No agents assigned to this squad
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}