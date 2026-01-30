'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

interface Activity {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'task' | 'contact' | 'sale' | 'system';
}

type ActivityFilter = 'all' | 'task' | 'contact' | 'sale' | 'system';

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [limit, setLimit] = useState(50);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/activity?limit=${limit}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`);
      }
      
      const data = await response.json();
      setActivities(data.items || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Filter and search activities
  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = searchQuery === '' || 
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeIcon = (type: Activity['type']) => {
    switch (type) {
      case 'task': return '✅';
      case 'contact': return '👤';
      case 'sale': return '💰';
      case 'system': return '🔔';
      default: return '📋';
    }
  };

  const getTypeColor = (type: Activity['type']) => {
    switch (type) {
      case 'task': return 'bg-green-100 text-green-800';
      case 'contact': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const filterButtons: { key: ActivityFilter; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📋' },
    { key: 'task', label: 'Tasks', icon: '✅' },
    { key: 'contact', label: 'Contacts', icon: '👤' },
    { key: 'sale', label: 'Sales', icon: '💰' },
    { key: 'system', label: 'System', icon: '🔔' },
  ];

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((groups, activity) => {
    const date = new Date(activity.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-500 mt-1">Track all actions and events across your workspace</p>
          </div>
          <button
            onClick={fetchActivities}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>↻</span> Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Activities</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activities.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Tasks</h3>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {activities.filter(a => a.type === 'task').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Contacts</h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {activities.filter(a => a.type === 'contact').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-medium text-gray-500">Sales</h3>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {activities.filter(a => a.type === 'sale').length}
            </p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {filterButtons.map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1 ${
                      filter === key
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{icon}</span> {label}
                  </button>
                ))}
              </div>
              
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Limit selector */}
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={25}>Last 25</option>
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={200}>Last 200</option>
              </select>
            </div>
          </div>

          {/* Activity List */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-lg">No activities found</p>
                <p className="text-sm mt-2">
                  {searchQuery || filter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Activities will appear here as you work'}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedActivities).map(([date, dateActivities]) => (
                  <div key={date}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {formatDateHeader(date)}
                    </h3>
                    <div className="space-y-3">
                      {dateActivities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="text-2xl">{getTypeIcon(activity.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-gray-900">{activity.action}</p>
                              <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(activity.type)}`}>
                                {activity.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 truncate">{activity.details}</p>
                          </div>
                          <span className="text-sm text-gray-400 whitespace-nowrap">
                            {formatTime(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Load More */}
        {filteredActivities.length >= limit && (
          <div className="text-center">
            <button
              onClick={() => setLimit(limit + 50)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Load more activities...
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
