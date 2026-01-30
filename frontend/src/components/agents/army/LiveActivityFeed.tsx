'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  Clock, 
  Target,
  TrendingUp,
  Users,
  Zap,
  X
} from 'lucide-react'
import { useRealtime } from './RealtimeProvider'
import { ArmyAgent } from '@/types/agent-army'

interface ActivityItem {
  id: string
  type: 'agent_created' | 'agent_updated' | 'task_completed' | 'status_changed'
  agent: string
  message: string
  timestamp: Date
}

interface LiveActivityFeedProps {
  className?: string
}

export function LiveActivityFeed({ className = '' }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isVisible, setIsVisible] = useState(true)
  const { agentUpdates, lastUpdate } = useRealtime()

  // Generate activity from real-time updates
  useEffect(() => {
    if (agentUpdates.length === 0) return

    const latestAgent = agentUpdates[agentUpdates.length - 1]
    const newActivity: ActivityItem = {
      id: `${latestAgent.id}-${Date.now()}`,
      type: 'agent_updated',
      agent: latestAgent.name,
      message: getUpdateMessage(latestAgent),
      timestamp: new Date()
    }

    setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep last 10
  }, [agentUpdates])

  // Simulate some activity for demo purposes
  useEffect(() => {
    const simulateActivity = () => {
      const activities = [
        { type: 'task_completed', message: 'completed mission analysis' },
        { type: 'status_changed', message: 'went from idle to active' },
        { type: 'agent_updated', message: 'updated skill set' },
        { type: 'task_completed', message: 'finished data processing' }
      ]

      const agents = ['Scout', 'Analyst', 'Forge', 'Builder', 'Herald', 'Monitor']
      const randomActivity = activities[Math.floor(Math.random() * activities.length)]
      const randomAgent = agents[Math.floor(Math.random() * agents.length)]

      const newActivity: ActivityItem = {
        id: `sim-${Date.now()}`,
        type: randomActivity.type as any,
        agent: randomAgent,
        message: randomActivity.message,
        timestamp: new Date()
      }

      setActivities(prev => [newActivity, ...prev.slice(0, 9)])
    }

    const interval = setInterval(simulateActivity, 15000) // Every 15 seconds
    return () => clearInterval(interval)
  }, [])

  const getUpdateMessage = (agent: ArmyAgent): string => {
    return `updated status to ${agent.status}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed': return Target
      case 'status_changed': return Activity
      case 'agent_updated': return Zap
      case 'agent_created': return Users
      default: return Clock
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'task_completed': return 'text-green-600 bg-green-50'
      case 'status_changed': return 'text-blue-600 bg-blue-50'
      case 'agent_updated': return 'text-purple-600 bg-purple-50'
      case 'agent_created': return 'text-amber-600 bg-amber-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  if (!isVisible || activities.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className={`fixed top-20 right-4 w-80 max-h-96 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-emerald-200 z-40 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-emerald-100">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Activity className="w-5 h-5 text-emerald-600" />
          </motion.div>
          <h3 className="font-medium text-gray-900">Live Activity</h3>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Activity List */}
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {activities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.type)
            const colorClasses = getActivityColor(activity.type)
            
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${colorClasses}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.agent}</span>{' '}
                      <span className="text-gray-600">{activity.message}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-emerald-100 bg-emerald-50/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-medium">
            Real-time updates active
          </span>
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  )
}