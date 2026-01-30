'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { CheckCircle, DollarSign, MessageSquare, Zap } from 'lucide-react';
import { useActivityData } from '@/hooks/useApi';

interface ActivityData {
  time: string;
  messages: number;
  tasks: number;
  tokens: number;
}

interface ActivityResponse {
  data: ActivityData[];
  totals: {
    totalMessages: number;
    totalTasks: number;
    totalTokens: number;
    totalCost: number;
  };
}

export function ActivityChart() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const { data: responseData, isLoading, error } = useActivityData(timeframe);
  
  // Handle both old format (array) and new format (object with data/totals)
  const activityData = Array.isArray(responseData) ? responseData : responseData?.data || [];
  const totals = Array.isArray(responseData) ? null : responseData?.totals;

  if (isLoading) {
    return (
      <motion.div 
        className="wizard-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text">
            Activity Timeline
          </h3>
          <div className="w-20 h-8 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded shimmer"></div>
        </div>
        <div className="h-80 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded shimmer"></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        className="wizard-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">Failed to load activity data</p>
          <button className="wizard-button">Retry</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="wizard-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 
          className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Activity Timeline
        </motion.h3>
        
        <motion.div 
          className="flex bg-wizard-emerald-50 dark:bg-wizard-dark-bg-tertiary rounded-lg p-1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {(['24h', '7d', '30d'] as const).map((period, index) => (
            <motion.button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                timeframe === period
                  ? 'bg-wizard-emerald text-white'
                  : 'text-wizard-emerald-600 hover:text-wizard-emerald-800 dark:text-wizard-dark-text-muted dark:hover:text-wizard-dark-text'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              {period}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <motion.div 
        className="h-80"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData}>
            <defs>
              <linearGradient id="messagesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0A4D3C" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0A4D3C" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="tasksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D4A84B" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#D4A84B" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              className="dark:stroke-wizard-dark-border"
            />
            
            <XAxis 
              dataKey="time" 
              stroke="#6B7280"
              className="dark:stroke-wizard-dark-text-muted"
              fontSize={12}
            />
            
            <YAxis 
              stroke="#6B7280"
              className="dark:stroke-wizard-dark-text-muted"
              fontSize={12}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #D4A84B',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(10, 77, 60, 0.1)',
              }}
              labelStyle={{ color: '#0A4D3C', fontWeight: 'bold' }}
            />
            
            <Area
              type="monotone"
              dataKey="messages"
              stroke="#0A4D3C"
              strokeWidth={2}
              fill="url(#messagesGradient)"
              name="Messages"
            />
            
            <Area
              type="monotone"
              dataKey="tasks"
              stroke="#D4A84B"
              strokeWidth={2}
              fill="url(#tasksGradient)"
              name="Tasks"
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Summary Stats */}
      {totals && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-wizard-emerald-100 dark:border-wizard-dark-border"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wizard-emerald-100 dark:bg-wizard-dark-bg-tertiary rounded-lg flex items-center justify-center">
              <MessageSquare size={18} className="text-wizard-emerald" />
            </div>
            <div>
              <div className="text-lg font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
                {totals.totalMessages.toLocaleString()}
              </div>
              <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">Messages</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wizard-gold-100 dark:bg-wizard-dark-bg-tertiary rounded-lg flex items-center justify-center">
              <CheckCircle size={18} className="text-wizard-gold" />
            </div>
            <div>
              <div className="text-lg font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
                {totals.totalTasks.toLocaleString()}
              </div>
              <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">Tasks Completed</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-wizard-dark-bg-tertiary rounded-lg flex items-center justify-center">
              <Zap size={18} className="text-blue-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
                {totals.totalTokens >= 1000 ? `${(totals.totalTokens / 1000).toFixed(1)}K` : totals.totalTokens}
              </div>
              <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">Tokens Used</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-wizard-dark-bg-tertiary rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-red-500" />
            </div>
            <div>
              <div className="text-lg font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
                ${totals.totalCost.toFixed(2)}
              </div>
              <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">Est. Cost</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div 
        className="flex items-center gap-6 mt-4 text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full bg-wizard-emerald"></div>
          <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">Messages</span>
        </motion.div>
        <motion.div 
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full bg-wizard-gold"></div>
          <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">Tasks</span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}