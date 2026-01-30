'use client';

import { motion } from 'framer-motion';
import { Bot, MessageSquare, CheckCircle, Clock, Zap, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useApi';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface StatsData {
  activeAgents: number;
  totalMessages: number;
  completedTasks: number;
  pendingApprovals: number;
  tokensUsed: number;
  monthlyCost: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'emerald' | 'gold' | 'red' | 'emerald-dark';
  href?: string;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon: Icon, trend, trendValue, color = 'emerald', href, onClick }: StatCardProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const colorClasses = {
    emerald: 'from-wizard-emerald to-wizard-emerald-600',
    gold: 'from-wizard-gold to-wizard-gold-600', 
    red: 'from-red-500 to-red-600',
    'emerald-dark': 'from-wizard-emerald-dark to-wizard-emerald-deep'
  };

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;
  
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      window.open(href, '_blank');
    }
  };

  const isClickable = !!(href || onClick);

  return (
    <motion.div 
      className={`stats-card p-6 transition-wizard ${isClickable ? 'cursor-pointer hover:shadow-lg' : ''}`}
      initial={mounted ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -4, scale: isClickable ? 1.02 : 1, transition: { duration: 0.2 } }}
      whileTap={isClickable ? { scale: 0.98 } : {}}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div 
          className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}
        >
          <Icon size={24} className="text-white" />
        </div>
        {trend && trendValue && (
          <div 
            className={`flex items-center gap-1 text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}
          >
            {TrendIcon && <TrendIcon size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      
      <div>
        <div 
          className="text-2xl font-bold text-wizard-emerald-900 dark:text-wizard-dark-text mb-1"
        >
          {value}
        </div>
        <div className="text-sm font-medium text-wizard-emerald-700 dark:text-wizard-dark-text-muted mb-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-wizard-emerald-500 dark:text-wizard-dark-text-muted opacity-70">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function DashboardStats() {
  const router = useRouter();
  const { data: stats, isLoading, error } = useDashboardStats();
  const [isMounted, setIsMounted] = useState(false);
  
  // Track mount state for animations
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Only use real data, no fallbacks
  const displayStats = stats;

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="stats-card p-6 animate-pulse"
          >
            <div className="w-12 h-12 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded-xl mb-4"></div>
            <div className="h-8 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded mb-2"></div>
            <div className="h-4 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div 
        className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
      >
        <p className="text-red-700 dark:text-red-300">
          Failed to load dashboard stats. {error?.message || 'No data available.'}
        </p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">
          Check database connection and ensure tables exist.
        </p>
      </div>
    );
  }

  // Extract system health info
  const { systemHealth, details } = displayStats;
  const dbConnected = systemHealth?.database?.connected;
  const dbResponseTime = systemHealth?.database?.responseTime || 0;
  const uptime = systemHealth?.uptime?.formatted || 'Unknown';
  const memoryUsage = systemHealth?.memory?.formatted || 'Unknown';
  const avgResponseTime = systemHealth?.performance?.averageResponseTime || 0;

  return (
    <div className="space-y-6">
      {/* System Health Banner */}
      {systemHealth && (
        <div 
          className={`p-4 rounded-lg border ${
            dbConnected 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className={`font-medium ${dbConnected ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              🗄️ Database: {dbConnected ? 'Connected' : 'Disconnected'} ({dbResponseTime}ms)
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              ⏱️ Uptime: {uptime}
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              💾 Memory: {memoryUsage}
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              ⚡ Avg Response: {avgResponseTime}ms
            </div>
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
        initial={isMounted ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <StatCard
          title="Active Agents"
          value={displayStats.activeAgents || 0}
          subtitle={`${details?.agents?.total || 0} total agents`}
          icon={Bot}
          color={displayStats.activeAgents > 0 ? "emerald" : "red"}
          onClick={() => router.push('/agents')}
        />
        
        <StatCard
          title="Messages Today"
          value={formatNumber(displayStats.totalMessages || 0)}
          subtitle={`${details?.messages?.thisWeek || 0} this week`}
          icon={MessageSquare}
          color="emerald-dark"
          onClick={() => router.push('/activity')}
        />
        
        <StatCard
          title="Tasks Completed"
          value={displayStats.completedTasks || 0}
          subtitle={`${details?.tasks?.inProgress || 0} in progress`}
          icon={CheckCircle}
          color="emerald"
          href="https://linear.app/ai-acrobatics"
        />
        
        <StatCard
          title="Pending Tasks"
          value={displayStats.pendingApprovals || 0}
          subtitle={`${details?.tasks?.total || 0} total tasks`}
          icon={Clock}
          color={displayStats.pendingApprovals > 5 ? "red" : "gold"}
          onClick={() => router.push('/tasks')}
        />
        
        <StatCard
          title="Tokens Used"
          value={formatNumber(displayStats.tokensUsed || 0)}
          subtitle={`This month${details?.tokens?.estimated ? ' (est.)' : ''}`}
          icon={Zap}
          color="emerald-dark"
          onClick={() => router.push('/system/metrics')}
        />
        
        <StatCard
          title="Monthly Cost"
          value={`$${(displayStats.monthlyCost || 0).toFixed(2)}`}
          subtitle="Current billing"
          icon={DollarSign}
          color="red"
          onClick={() => router.push('/billing')}
        />
      </motion.div>
      
      {/* Last Updated Info */}
      <div 
        className="text-xs text-gray-500 dark:text-gray-400 text-center"
      >
        Last updated: {new Date(displayStats.lastUpdated).toLocaleString()}
        {displayStats.error && (
          <span className="text-amber-600 dark:text-amber-400 ml-2">
            ⚠️ {displayStats.error}
          </span>
        )}
      </div>
    </div>
  );
}