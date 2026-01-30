'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Users, 
  Crown, 
  Shield, 
  Sparkles,
  X
} from 'lucide-react'

interface FloatingActionButtonProps {
  onCreateAgent: () => void
  isMobile?: boolean
}

export function FloatingActionButton({ onCreateAgent, isMobile = false }: FloatingActionButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const quickActions = [
    {
      icon: Users,
      label: 'Recruit Agent',
      color: 'bg-emerald-500',
      action: onCreateAgent
    },
    {
      icon: Shield,
      label: 'Squad Leader',
      color: 'bg-blue-500',
      action: () => console.log('Create Squad Leader')
    },
    {
      icon: Crown,
      label: 'Commander',
      color: 'bg-amber-500',
      action: () => console.log('Create Commander')
    }
  ]

  if (!isMobile) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col gap-3"
          >
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <motion.button
                  key={action.label}
                  initial={{ scale: 0, x: 20 }}
                  animate={{ scale: 1, x: 0 }}
                  exit={{ scale: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  className={`${action.color} text-white p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center gap-2`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="text-sm font-medium whitespace-nowrap pr-1">
                    {action.label}
                  </span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white p-4 rounded-full shadow-xl relative overflow-hidden"
      >
        {/* Spinning background effect */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-amber-400 rounded-full opacity-50"
        />
        
        {/* Button content */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                className="flex items-center gap-1"
              >
                <Plus className="w-6 h-6" />
                <Sparkles className="w-4 h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.button>
    </div>
  )
}