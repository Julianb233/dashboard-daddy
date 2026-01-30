'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Play, Plus } from 'lucide-react';
import Link from 'next/link';

interface TaskSummary {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  assignedTo: string;
  dueDate?: string;
  priority: 'high' | 'medium' | 'low';
}

export function TaskSummary() {
  const [summary, setSummary] = useState<TaskSummary>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const [summaryResponse, tasksResponse] = await Promise.all([
          fetch('/api/tasks/summary'),
          fetch('/api/tasks/recent')
        ]);

        if (summaryResponse.ok && tasksResponse.ok) {
          const summaryData = await summaryResponse.json();
          const tasksData = await tasksResponse.json();
          setSummary(summaryData);
          setRecentTasks(tasksData);
        } else {
          generateDemoData();
        }
      } catch (error) {
        console.error('Failed to fetch task data:', error);
        generateDemoData();
      } finally {
        setLoading(false);
      }
    };

    const generateDemoData = () => {
      const demoSummary: TaskSummary = {
        total: 47,
        completed: 28,
        inProgress: 12,
        pending: 5,
        overdue: 2,
      };

      const demoTasks: RecentTask[] = [
        {
          id: '1',
          title: 'Update customer database schema',
          status: 'in_progress',
          assignedTo: 'Riley',
          dueDate: 'Today',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Generate monthly financial report',
          status: 'completed',
          assignedTo: 'Taylor',
          dueDate: 'Yesterday',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Schedule client calls for next week',
          status: 'pending',
          assignedTo: 'Sam',
          dueDate: 'Tomorrow',
          priority: 'medium'
        },
        {
          id: '4',
          title: 'Research market trends',
          status: 'overdue',
          assignedTo: 'Maya',
          dueDate: '2 days ago',
          priority: 'low'
        },
        {
          id: '5',
          title: 'Draft blog post about AI automation',
          status: 'in_progress',
          assignedTo: 'Jordan',
          dueDate: 'This week',
          priority: 'medium'
        }
      ];

      setSummary(demoSummary);
      setRecentTasks(demoTasks);
    };

    fetchTaskData();
  }, []);

  const getStatusIcon = (status: RecentTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'in_progress':
        return <Play size={16} className="text-blue-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'overdue':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: RecentTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const getStatusColor = (status: RecentTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="wizard-card p-6">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text mb-4">
          Task Overview
        </h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center animate-pulse">
                <div className="h-8 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded mb-2"></div>
                <div className="h-4 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded"></div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completionRate = Math.round((summary.completed / summary.total) * 100);

  return (
    <div className="wizard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text">
          Task Overview
        </h3>
        <Link 
          href="/tasks"
          className="text-sm text-wizard-emerald-600 dark:text-wizard-emerald-light hover:text-wizard-emerald-800 dark:hover:text-wizard-emerald-300 font-medium"
        >
          View All →
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary rounded-lg">
          <div className="text-2xl font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
            {summary.completed}
          </div>
          <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
            Completed
          </div>
        </div>
        
        <div className="text-center p-3 bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {summary.inProgress}
          </div>
          <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
            In Progress
          </div>
        </div>
        
        <div className="text-center p-3 bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {summary.pending}
          </div>
          <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
            Pending
          </div>
        </div>
        
        <div className="text-center p-3 bg-wizard-cream-100 dark:bg-wizard-dark-bg-tertiary rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {summary.overdue}
          </div>
          <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
            Overdue
          </div>
        </div>
      </div>

      {/* Completion Rate */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">
            Completion Rate
          </span>
          <span className="font-medium text-wizard-emerald-900 dark:text-wizard-dark-text">
            {completionRate}%
          </span>
        </div>
        <div className="w-full bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded-full h-2">
          <div
            className="bg-wizard-emerald h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-wizard-emerald-800 dark:text-wizard-dark-text mb-3">
          Recent Tasks
        </h4>
        {recentTasks.slice(0, 4).map((task) => (
          <div
            key={task.id}
            className={`p-3 rounded-lg border-l-4 hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary transition-colors ${getPriorityColor(task.priority)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h5 className="text-sm font-medium text-wizard-emerald-900 dark:text-wizard-dark-text truncate">
                    {task.title}
                  </h5>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
                    {task.assignedTo}
                  </span>
                  <span className="text-wizard-emerald-500 dark:text-wizard-dark-text-muted">
                    •
                  </span>
                  <span className="text-wizard-emerald-500 dark:text-wizard-dark-text-muted">
                    {task.dueDate}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(task.status)}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-wizard-emerald-100 dark:border-wizard-dark-border">
        <button className="w-full flex items-center justify-center gap-2 text-sm text-wizard-emerald-600 dark:text-wizard-emerald-light hover:text-wizard-emerald-800 dark:hover:text-wizard-emerald-300 font-medium py-2 border border-wizard-emerald-200 dark:border-wizard-dark-border rounded-lg hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary transition-colors">
          <Plus size={16} />
          Create New Task
        </button>
      </div>
    </div>
  );
}