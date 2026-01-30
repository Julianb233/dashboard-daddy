'use client';

import { useEffect, useState } from 'react';
import { Bot, MessageSquare, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'message' | 'task_completed' | 'agent_started' | 'approval_needed' | 'error';
  title: string;
  description: string;
  timestamp: string;
  agent?: string;
  priority?: 'low' | 'medium' | 'high';
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const response = await fetch('/api/activity/recent');
        if (response.ok) {
          const data = await response.json();
          setActivities(data);
        } else {
          // Generate demo data
          generateDemoActivity();
        }
      } catch (error) {
        console.error('Failed to fetch recent activity:', error);
        generateDemoActivity();
      } finally {
        setLoading(false);
      }
    };

    const generateDemoActivity = () => {
      const demoActivities: ActivityItem[] = [
        {
          id: '1',
          type: 'task_completed',
          title: 'Task Completed',
          description: 'Updated customer database with 47 new leads',
          timestamp: '2 minutes ago',
          agent: 'Riley CRM',
          priority: 'high'
        },
        {
          id: '2', 
          type: 'message',
          title: 'New Message',
          description: 'Customer inquiry about pricing for Enterprise plan',
          timestamp: '5 minutes ago',
          agent: 'Sam Assistant',
          priority: 'medium'
        },
        {
          id: '3',
          type: 'agent_started',
          title: 'Agent Activated',
          description: 'Drew Browser started web scraping task for market research',
          timestamp: '12 minutes ago',
          agent: 'Drew Browser',
          priority: 'low'
        },
        {
          id: '4',
          type: 'approval_needed',
          title: 'Approval Required',
          description: 'Large expense ($2,500) needs authorization for new server',
          timestamp: '18 minutes ago',
          agent: 'Taylor Finance',
          priority: 'high'
        },
        {
          id: '5',
          type: 'task_completed',
          title: 'Report Generated',
          description: 'Weekly performance report sent to stakeholders',
          timestamp: '25 minutes ago',
          agent: 'Quinn Manager',
          priority: 'medium'
        },
        {
          id: '6',
          type: 'message',
          title: 'Voice Call Completed',
          description: 'Successfully scheduled meeting with potential client',
          timestamp: '32 minutes ago',
          agent: 'Alex Voice',
          priority: 'high'
        }
      ];
      
      setActivities(demoActivities);
    };

    fetchRecentActivity();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchRecentActivity, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare size={16} className="text-blue-600" />;
      case 'task_completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'agent_started':
        return <Bot size={16} className="text-wizard-emerald" />;
      case 'approval_needed':
        return <AlertTriangle size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: ActivityItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-wizard-gold';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="wizard-card p-6">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-3 animate-pulse">
              <div className="w-8 h-8 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded mb-2"></div>
                <div className="h-3 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text">
          Recent Activity
        </h3>
        <div className="text-sm text-wizard-emerald-500 dark:text-wizard-dark-text-muted">
          Live updates
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto wizard-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-colors hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary ${getPriorityColor(activity.priority)}`}
          >
            <div className="flex-shrink-0 w-8 h-8 bg-wizard-cream-200 dark:bg-wizard-dark-bg-tertiary rounded-full flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-wizard-emerald-900 dark:text-wizard-dark-text">
                  {activity.title}
                </h4>
                <span className="text-xs text-wizard-emerald-500 dark:text-wizard-dark-text-muted whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
              
              <p className="text-sm text-wizard-emerald-600 dark:text-wizard-dark-text-muted mt-1">
                {activity.description}
              </p>
              
              {activity.agent && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-wizard-emerald-100 dark:bg-wizard-dark-bg-tertiary text-wizard-emerald-700 dark:text-wizard-emerald-light">
                    <Bot size={12} className="mr-1" />
                    {activity.agent}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-wizard-emerald-100 dark:border-wizard-dark-border">
        <button className="text-sm text-wizard-emerald-600 dark:text-wizard-emerald-light hover:text-wizard-emerald-800 dark:hover:text-wizard-emerald-300 font-medium">
          View All Activity →
        </button>
      </div>
    </div>
  );
}