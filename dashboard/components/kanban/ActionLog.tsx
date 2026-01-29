'use client';

import { useState } from 'react';
import { Activity, CheckCircle, Clock, Database, RefreshCw } from 'lucide-react';

interface ActionLogEntry {
  id: string;
  timestamp: string;
  action: string;
  type: 'task' | 'sync' | 'update' | 'system';
  details?: string;
}

const mockActionLogs: ActionLogEntry[] = [
  {
    id: '1',
    timestamp: '2 minutes ago',
    action: 'Updated Kanban board with current priorities and backlog',
    type: 'update',
    details: 'Added 3 new tasks, archived 2 completed items',
  },
  {
    id: '2',
    timestamp: '15 minutes ago',
    action: 'Synced Linear issues with GitHub activity',
    type: 'sync',
    details: 'Updated 5 issues, created 2 new PRs',
  },
  {
    id: '3',
    timestamp: '45 minutes ago',
    action: 'Processed client email responses',
    type: 'task',
    details: 'Replied to 3 urgent emails, scheduled 2 follow-ups',
  },
  {
    id: '4',
    timestamp: '2 hours ago',
    action: 'Generated daily AI pulse report',
    type: 'task',
    details: 'Analyzed 15 data points, created summary dashboard',
  },
  {
    id: '5',
    timestamp: '3 hours ago',
    action: 'Completed security audit for dashboard',
    type: 'system',
    details: 'Checked 8 security endpoints, updated 3 configurations',
  },
  {
    id: '6',
    timestamp: '5 hours ago',
    action: 'Backed up database to cloud storage',
    type: 'system',
    details: 'Compressed 2.4GB of data, uploaded to S3',
  },
  {
    id: '7',
    timestamp: 'Yesterday',
    action: 'Created YouTube audit report',
    type: 'task',
    details: 'Analyzed 12 channels, generated optimization recommendations',
  },
];

export function ActionLog() {
  const [logs, setLogs] = useState<ActionLogEntry[]>(mockActionLogs);
  const [filter, setFilter] = useState<string>('all');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckCircle size={14} className="text-green-400" />;
      case 'sync':
        return <RefreshCw size={14} className="text-blue-400" />;
      case 'update':
        return <Activity size={14} className="text-orange-400" />;
      case 'system':
        return <Database size={14} className="text-purple-400" />;
      default:
        return <Activity size={14} className="text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-green-400/10 text-green-400 border-green-400/20';
      case 'sync':
        return 'bg-blue-400/10 text-blue-400 border-blue-400/20';
      case 'update':
        return 'bg-orange-400/10 text-orange-400 border-orange-400/20';
      case 'system':
        return 'bg-purple-400/10 text-purple-400 border-purple-400/20';
      default:
        return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
    }
  };

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(log => log.type === filter);

  const refreshLogs = () => {
    // In a real app, this would fetch from Supabase
    console.log('Refreshing action logs...');
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-900/30 rounded-lg">
            <Activity size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Action Log</h3>
            <p className="text-sm text-gray-400">What Bubba has completed</p>
          </div>
        </div>
        <button
          onClick={refreshLogs}
          className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          title="Refresh logs"
        >
          <RefreshCw size={18} className="text-gray-400" />
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          All Actions
        </button>
        <button
          onClick={() => setFilter('task')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filter === 'task'
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setFilter('sync')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filter === 'sync'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          Syncs
        </button>
        <button
          onClick={() => setFilter('update')}
          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
            filter === 'update'
              ? 'bg-orange-600 text-white border-orange-600'
              : 'bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700'
          }`}
        >
          Updates
        </button>
      </div>

      {/* Action Log List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="pt-0.5">
                {getTypeIcon(log.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(log.type)}`}>
                    {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock size={12} />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
                <p className="text-sm text-white mb-2">{log.action}</p>
                {log.details && (
                  <p className="text-xs text-gray-400">{log.details}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLogs.length === 0 && (
        <div className="text-center py-8">
          <Activity size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No actions found for this filter</p>
        </div>
      )}

      {/* Connection Status */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-gray-400">Connected to Supabase</span>
          </div>
          <span className="text-gray-500">{logs.length} total actions</span>
        </div>
      </div>
    </div>
  );
}