'use client'

import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  User, 
  Activity, 
  Target,
  TrendingUp,
  Clock,
  Zap,
  GripVertical,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { ArmyAgent } from '@/types/agent-army'

interface AgentCardProps {
  agent: ArmyAgent
  onClick: () => void
  compact?: boolean
}

export function AgentCard({ agent, onClick, compact = false }: AgentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: agent.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        dot: 'bg-green-500'
      }
      case 'busy': return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-200',
        dot: 'bg-amber-500'
      }
      case 'idle': return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500'
      }
      case 'offline': return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500'
      }
      default: return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        dot: 'bg-gray-500'
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'busy': return Activity
      case 'idle': return Clock
      case 'offline': return AlertCircle
      default: return Activity
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-amber-600'
    return 'text-red-600'
  }

  const colors = getStatusColor(agent.status)
  const StatusIcon = getStatusIcon(agent.status)

  if (compact) {
    return (
      <motion.div
        ref={setNodeRef}
        style={style}
        {...attributes}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`bg-white rounded-lg border ${colors.border} p-4 cursor-pointer ${
          isDragging ? 'opacity-50 shadow-2xl' : 'hover:shadow-md'
        } transition-all`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          {/* Agent Info */}
          <div className="flex items-center gap-3 flex-1">
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="relative">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className={`absolute -top-1 -right-1 w-3 h-3 ${colors.dot} rounded-full border border-white`}></div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900 truncate">{agent.name}</h4>
                <div className="flex items-center">
                  {[...Array(Math.floor(agent.performance_score / 20))].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 truncate">{agent.current_task || 'Awaiting assignment'}</p>
            </div>
          </div>

          {/* Performance */}
          <div className="text-right">
            <div className={`text-sm font-medium ${getPerformanceColor(agent.performance_score)}`}>
              {agent.performance_score}%
            </div>
            <div className="flex items-center gap-1">
              <StatusIcon className={`w-3 h-3 ${colors.text}`} />
              <span className={`text-xs ${colors.text} capitalize`}>{agent.status}</span>
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className={`bg-white rounded-xl border-2 ${colors.border} p-6 cursor-pointer ${
        isDragging ? 'opacity-50 shadow-2xl' : 'hover:shadow-lg'
      } transition-all`}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="relative">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            <div className={`absolute -top-1 -right-1 w-4 h-4 ${colors.dot} rounded-full border-2 border-white flex items-center justify-center`}>
              <StatusIcon className="w-2 h-2 text-white" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {agent.name}
              <div className="flex items-center">
                {[...Array(Math.floor(agent.performance_score / 20))].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-400 fill-current" />
                ))}
              </div>
            </h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
              <StatusIcon className="w-3 h-3" />
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Performance Score */}
        <div className="text-center">
          <div className={`text-2xl font-bold ${getPerformanceColor(agent.performance_score)}`}>
            {agent.performance_score}%
          </div>
          <div className="text-sm text-gray-500">Performance</div>
        </div>
      </div>

      {/* Current Task */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Target className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Current Task</span>
        </div>
        <p className="text-gray-900 text-sm">{agent.current_task || 'Awaiting assignment...'}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{agent.missions_completed}</div>
          <div className="text-xs text-gray-500">Missions</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{agent.success_rate}%</div>
          <div className="text-xs text-gray-500">Success</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{Math.round(agent.total_uptime / 60)}h</div>
          <div className="text-xs text-gray-500">Uptime</div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Skills</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {agent.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full border border-emerald-200"
            >
              {skill}
            </span>
          ))}
          {agent.skills.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
              +{agent.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Drag Hint */}
      <div className="mt-4 text-center">
        <div className="text-gray-400 text-xs flex items-center justify-center gap-1">
          <GripVertical className="w-3 h-3" />
          <span>Drag to reassign squad</span>
        </div>
      </div>
    </motion.div>
  )
}