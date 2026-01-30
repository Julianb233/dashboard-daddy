'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface DashboardStats {
  tasks: {
    active: number;
    completed: number;
    pending: number;
  };
  contacts: number;
  radarItems: number;
  receivables: number;
  lastUpdated: string;
}

interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'task' | 'contact' | 'sale' | 'system';
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/activity?limit=10')
        ]);
        
        // Handle stats response - throw error if not ok
        if (!statsRes.ok) {
          const errorText = await statsRes.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch stats: ${statsRes.status} ${errorText}`);
        }
        const statsData = await statsRes.json();
        setStats(statsData);
        
        // Handle activity response - throw error if not ok
        if (!activityRes.ok) {
          const errorText = await activityRes.text().catch(() => 'Unknown error');
          throw new Error(`Failed to fetch activity: ${activityRes.status} ${errorText}`);
        }
        const activityData = await activityRes.json();
        setActivity(activityData.items || []);
        
        // Clear any previous errors on successful fetch
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const totalTasks = stats ? stats.tasks.active + stats.tasks.completed + stats.tasks.pending : 0;
  const successRate = stats && totalTasks > 0 
    ? Math.round((stats.tasks.completed / totalTasks) * 100) 
    : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return '✅';
      case 'contact': return '👤';
      case 'sale': return '💰';
      default: return '🔔';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {stats?.lastUpdated && (
            <span className="text-sm text-gray-500">
              Updated {formatTime(stats.lastUpdated)}
            </span>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emerald-500">
            <h3 className="text-sm font-medium text-gray-500">Active Tasks</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.tasks.active || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats?.tasks.pending || 0} pending
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500">Completed Tasks</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.tasks.completed || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {successRate}% success rate
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
            <h3 className="text-sm font-medium text-gray-500">Radar Items</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats?.radarItems || 0}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {stats?.contacts || 0} contacts
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500">Receivables</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {formatCurrency(stats?.receivables || 0)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              outstanding
            </p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
          
          {activity.length > 0 ? (
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0">
                  <span className="text-xl">{getActivityIcon(item.type)}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-sm text-gray-500">{item.details}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No recent activity to display.</p>
              <p className="text-sm mt-2">Activity will appear here as tasks are completed and events occur.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/tasks" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <span className="block text-lg font-semibold">View Tasks</span>
            <span className="text-sm opacity-80">Manage scheduled tasks</span>
          </a>
          <a 
            href="/kanban" 
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <span className="block text-lg font-semibold">Kanban Board</span>
            <span className="text-sm opacity-80">Visual task management</span>
          </a>
          <a 
            href="/approvals" 
            className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-4 text-center transition-colors"
          >
            <span className="block text-lg font-semibold">Approvals</span>
            <span className="text-sm opacity-80">Pending agent actions</span>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
