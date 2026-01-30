'use client'

import { motion } from 'framer-motion'
import { 
  Users, 
  Target, 
  TrendingUp, 
  Activity,
  Crown,
  Shield,
  Zap
} from 'lucide-react'
import { ArmyStats as ArmyStatsType } from '@/types/agent-army'

interface ArmyStatsProps {
  stats: ArmyStatsType
}

export function ArmyStats({ stats }: ArmyStatsProps) {
  const statItems = [
    {
      label: 'Total Agents',
      value: stats.totalAgents,
      icon: Users,
      color: 'emerald',
      bgColor: 'bg-emerald-500/20',
      iconColor: 'text-emerald-300'
    },
    {
      label: 'Active Missions',
      value: stats.activeMissions,
      icon: Target,
      color: 'amber',
      bgColor: 'bg-amber-500/20',
      iconColor: 'text-amber-300'
    },
    {
      label: 'Success Rate',
      value: `${stats.overallSuccessRate}%`,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-500/20',
      iconColor: 'text-green-300'
    },
    {
      label: 'Avg Performance',
      value: `${stats.averagePerformance}%`,
      icon: Activity,
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      iconColor: 'text-blue-300'
    }
  ]

  return (
    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const IconComponent = item.icon
        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={`${item.bgColor} backdrop-blur-sm rounded-lg p-4 border border-white/20`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm font-medium">{item.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{item.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <IconComponent className={`w-6 h-6 ${item.iconColor}`} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}