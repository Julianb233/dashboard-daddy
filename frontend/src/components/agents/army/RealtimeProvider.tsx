'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { ArmyAgent } from '@/types/agent-army'

interface RealtimeContextType {
  isConnected: boolean
  lastUpdate: Date | null
  agentUpdates: ArmyAgent[]
}

const RealtimeContext = createContext<RealtimeContextType>({
  isConnected: false,
  lastUpdate: null,
  agentUpdates: []
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

interface RealtimeProviderProps {
  children: ReactNode
  onAgentUpdate?: (agent: ArmyAgent) => void
}

export function RealtimeProvider({ children, onAgentUpdate }: RealtimeProviderProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [agentUpdates, setAgentUpdates] = useState<ArmyAgent[]>([])

  useEffect(() => {
    // Subscribe to all changes in the agent_army table
    const channel = supabase
      .channel('agent_army_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_army'
        },
        (payload) => {
          console.log('Real-time update:', payload)
          setLastUpdate(new Date())
          
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const updatedAgent = payload.new as ArmyAgent
            setAgentUpdates(prev => {
              const filtered = prev.filter(a => a.id !== updatedAgent.id)
              return [...filtered, updatedAgent].slice(-10) // Keep last 10 updates
            })
            
            if (onAgentUpdate) {
              onAgentUpdate(updatedAgent)
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Connection status monitoring
    const handleOnline = () => setIsConnected(true)
    const handleOffline = () => setIsConnected(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      supabase.removeChannel(channel)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onAgentUpdate])

  return (
    <RealtimeContext.Provider value={{ isConnected, lastUpdate, agentUpdates }}>
      {children}
    </RealtimeContext.Provider>
  )
}