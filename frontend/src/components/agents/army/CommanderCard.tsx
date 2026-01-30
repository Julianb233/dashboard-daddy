'use client'

import { motion } from 'framer-motion'
import { 
  Crown, 
  Activity, 
  Target, 
  TrendingUp,
  Zap,
  Star,
  Users
} from 'lucide-react'
import { ArmyAgent } from '@/types/agent-army'

interface CommanderCardProps {
  commander: ArmyAgent
  onClick: () => void
}

export function CommanderCard({ commander, onClick }: CommanderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-amber-500'
      case 'idle': return 'bg-blue-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Activity
      case 'busy': return Zap
      case 'idle': return Users
      default: return Activity
    }
  }

  const StatusIcon = getStatusIcon(commander.status)

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-2xl border border-amber-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <Crown className="w-8 h-8 text-amber-100" />
              </div>
              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-6 h-6 ${getStatusColor(commander.status)} rounded-full border-2 border-white flex items-center justify-center`}>
                <StatusIcon className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                {commander.name}
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-200 fill-current" />
                  ))}
                </div>
              </h2>
              <p className="text-amber-100 font-medium text-lg">Supreme Commander</p>
              <p className="text-white/80 text-sm mt-1">{commander.description}</p>
            </div>
          </div>

          {/* Performance Score */}
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="text-3xl font-bold text-white">{commander.performance_score}</div>
            <div className="text-amber-200 text-sm font-medium">Performance</div>
          </div>
        </div>

        {/* Current Task */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5 text-amber-200" />
            <span className="font-semibold text-amber-200">Current Mission</span>
          </div>
          <p className="text-white">{commander.current_task || 'Awaiting orders...'}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-300" />
              <span className="text-green-300 text-sm font-medium">Missions</span>
            </div>
            <div className="text-white text-xl font-bold">{commander.missions_completed}</div>
            <div className="text-white/60 text-xs">Completed</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-emerald-300" />
              <span className="text-emerald-300 text-sm font-medium">Success</span>
            </div>
            <div className="text-white text-xl font-bold">{commander.success_rate}%</div>
            <div className="text-white/60 text-xs">Rate</div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-blue-300" />
              <span className="text-blue-300 text-sm font-medium">Uptime</span>
            </div>
            <div className="text-white text-xl font-bold">{Math.round(commander.total_uptime / 60)}h</div>
            <div className="text-white/60 text-xs">Total</div>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-200" />
            <span className="font-semibold text-amber-200 text-sm">Command Skills</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {commander.skills.map((skill, index) => (
              <motion.span
                key={skill}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="px-3 py-1 bg-white/15 backdrop-blur-sm text-white text-sm rounded-full border border-white/20 font-medium"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Hover Effect Indicator */}
        <div className="mt-4 flex items-center justify-center">
          <div className="text-white/60 text-sm flex items-center gap-1">
            <span>Click to view details</span>
            <Crown className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}