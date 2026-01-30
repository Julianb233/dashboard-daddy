'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Brain, Clock, WifiOff, Activity, Zap } from 'lucide-react';

interface BubbaStatusData {
  status: 'active' | 'thinking' | 'idle' | 'offline';
  currentTask?: string;
  lastActivity?: string;
  sessionId?: string;
  progress?: number;
}

export function BubbaStatus() {
  const [statusData, setStatusData] = useState<BubbaStatusData>({
    status: 'idle',
    lastActivity: new Date().toISOString()
  });

  const [expanded, setExpanded] = useState(false);

  // Poll for Bubba status updates
  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch('/api/bubba/status');
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        
        const data = await response.json();
        setStatusData(data);
      } catch (error) {
        console.error('Failed to fetch Bubba status:', error);
        setStatusData(prev => ({ ...prev, status: 'offline' }));
      }
    };

    // Initial poll
    pollStatus();

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(pollStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: BubbaStatusData['status']) => {
    switch (status) {
      case 'active':
        return {
          color: 'emerald',
          icon: Activity,
          label: 'Active',
          description: 'Processing request',
          bgClass: 'bg-emerald-500/20 border-emerald-500/30',
          textClass: 'text-emerald-400',
          pulseClass: 'bg-emerald-500',
          glowClass: 'shadow-emerald-500/25'
        };
      case 'thinking':
        return {
          color: 'gold',
          icon: Brain,
          label: 'Thinking',
          description: 'Extended reasoning',
          bgClass: 'bg-yellow-500/20 border-yellow-500/30',
          textClass: 'text-yellow-400',
          pulseClass: 'bg-yellow-500',
          glowClass: 'shadow-yellow-500/25'
        };
      case 'idle':
        return {
          color: 'slate',
          icon: Clock,
          label: 'Idle',
          description: 'Waiting for input',
          bgClass: 'bg-slate-500/20 border-slate-500/30',
          textClass: 'text-slate-400',
          pulseClass: 'bg-slate-500',
          glowClass: 'shadow-slate-500/25'
        };
      case 'offline':
        return {
          color: 'red',
          icon: WifiOff,
          label: 'Offline',
          description: 'Not connected',
          bgClass: 'bg-red-500/20 border-red-500/30',
          textClass: 'text-red-400',
          pulseClass: 'bg-red-500',
          glowClass: 'shadow-red-500/25'
        };
    }
  };

  const config = getStatusConfig(statusData.status);
  const Icon = config.icon;

  const formatLastActivity = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const truncateTask = (task: string, maxLength: number = 35) => {
    return task.length > maxLength ? `${task.substring(0, maxLength)}...` : task;
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border backdrop-blur-sm
          transition-all duration-300 hover:scale-105
          ${config.bgClass} ${config.glowClass}
          shadow-lg hover:shadow-xl
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Status Indicator Dot with Pulse Animation */}
        <div className="relative">
          <div className={`w-3 h-3 rounded-full ${config.pulseClass}`} />
          {(statusData.status === 'active' || statusData.status === 'thinking') && (
            <motion.div
              className={`absolute inset-0 w-3 h-3 rounded-full ${config.pulseClass}`}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </div>

        {/* Icon */}
        <Icon size={16} className={config.textClass} />

        {/* Status Label */}
        <span className={`text-sm font-medium font-brier ${config.textClass}`}>
          {config.label}
        </span>

        {/* Wizard-style magical sparkle for active status */}
        {statusData.status === 'active' && (
          <motion.div
            className="text-emerald-400"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Zap size={12} />
          </motion.div>
        )}
      </motion.button>

      {/* Expanded Status Panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 p-4 rounded-xl border bg-wizard-dark-bg/95 border-wizard-gold/30 backdrop-blur-md shadow-2xl z-50"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center gap-3">
                <Bot size={20} className="text-wizard-gold" />
                <h3 className="font-brier font-bold text-wizard-cream text-lg">
                  Bubba Status
                </h3>
              </div>

              {/* Current Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wizard-cream/70">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${config.pulseClass}`} />
                    <span className={`text-sm font-medium ${config.textClass}`}>
                      {config.label}
                    </span>
                  </div>
                </div>

                {statusData.currentTask && (
                  <div className="space-y-1">
                    <span className="text-sm text-wizard-cream/70">Current Task:</span>
                    <p className="text-sm text-wizard-cream bg-wizard-emerald-900/30 p-2 rounded border border-wizard-emerald-600/20">
                      {statusData.currentTask}
                    </p>
                    {statusData.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-wizard-cream/50">
                          <span>Progress</span>
                          <span>{statusData.progress}%</span>
                        </div>
                        <div className="w-full bg-wizard-emerald-900/30 rounded-full h-1">
                          <motion.div
                            className="h-1 bg-gradient-to-r from-wizard-emerald to-wizard-gold rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${statusData.progress}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-wizard-cream/50">
                  <span>Last Activity:</span>
                  <span>{formatLastActivity(statusData.lastActivity || '')}</span>
                </div>

                {statusData.sessionId && (
                  <div className="flex items-center justify-between text-xs text-wizard-cream/50">
                    <span>Session:</span>
                    <span className="font-mono text-wizard-gold/70">{statusData.sessionId}</span>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="border-t border-wizard-gold/20 pt-2">
                <div className="flex gap-2">
                  <button className="flex-1 px-2 py-1 text-xs bg-wizard-emerald-800/50 hover:bg-wizard-emerald-700/50 text-wizard-cream rounded border border-wizard-emerald-600/30 transition-colors">
                    View Logs
                  </button>
                  <button className="flex-1 px-2 py-1 text-xs bg-wizard-gold/20 hover:bg-wizard-gold/30 text-wizard-gold rounded border border-wizard-gold/40 transition-colors">
                    Send Message
                  </button>
                </div>
              </div>
            </div>

            {/* Magical corner decoration */}
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-wizard-gold rounded-full opacity-60 animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BubbaStatus;