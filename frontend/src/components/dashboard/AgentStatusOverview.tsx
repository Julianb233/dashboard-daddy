'use client';

import { useEffect, useState } from 'react';
import { Bot, Activity, Pause, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface Agent {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  lastActive: string;
  tasksCompleted: number;
  uptime: string;
  cpuUsage?: number;
  memoryUsage?: number;
}

export function AgentStatusOverview() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgentStatus = async () => {
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data);
        } else {
          // Generate demo data
          generateDemoAgents();
        }
      } catch (error) {
        console.error('Failed to fetch agent status:', error);
        generateDemoAgents();
      } finally {
        setLoading(false);
      }
    };

    const generateDemoAgents = () => {
      const demoAgents: Agent[] = [
        {
          id: '1',
          name: 'Quinn',
          type: 'Life Manager',
          status: 'active',
          lastActive: '1 min ago',
          tasksCompleted: 23,
          uptime: '99.9%',
          cpuUsage: 12,
          memoryUsage: 45
        },
        {
          id: '2',
          name: 'Sam',
          type: 'Personal Assistant',
          status: 'busy',
          lastActive: 'Now',
          tasksCompleted: 18,
          uptime: '98.7%',
          cpuUsage: 34,
          memoryUsage: 62
        },
        {
          id: '3',
          name: 'Riley',
          type: 'CRM Operations',
          status: 'active',
          lastActive: '3 min ago',
          tasksCompleted: 31,
          uptime: '99.2%',
          cpuUsage: 8,
          memoryUsage: 38
        },
        {
          id: '4',
          name: 'Taylor',
          type: 'Finance',
          status: 'idle',
          lastActive: '15 min ago',
          tasksCompleted: 7,
          uptime: '100%',
          cpuUsage: 2,
          memoryUsage: 22
        },
        {
          id: '5',
          name: 'Alex',
          type: 'Voice Assistant',
          status: 'active',
          lastActive: '2 min ago',
          tasksCompleted: 12,
          uptime: '97.8%',
          cpuUsage: 28,
          memoryUsage: 55
        },
        {
          id: '6',
          name: 'Jordan',
          type: 'Content Writer',
          status: 'error',
          lastActive: '45 min ago',
          tasksCompleted: 5,
          uptime: '95.1%',
          cpuUsage: 0,
          memoryUsage: 15
        }
      ];
      
      setAgents(demoAgents);
    };

    fetchAgentStatus();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAgentStatus, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return <Activity size={16} className="text-green-600 animate-pulse" />;
      case 'busy':
        return <Activity size={16} className="text-emerald-600 animate-spin" />;
      case 'idle':
        return <Pause size={16} className="text-yellow-600" />;
      case 'error':
        return <AlertTriangle size={16} className="text-red-600" />;
      default:
        return <Bot size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'busy':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'idle':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBadge = (status: Agent['status']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium border';
    return `${baseClasses} ${getStatusColor(status)}`;
  };

  if (loading) {
    return (
      <div className="wizard-card p-6">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text mb-4">
          Agent Status
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded-full"></div>
                <div>
                  <div className="h-4 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded mb-1"></div>
                  <div className="h-3 bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded w-20"></div>
                </div>
              </div>
              <div className="h-6 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded w-16"></div>
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
          Agent Status
        </h3>
        <Link 
          href="/agents"
          className="text-sm text-wizard-emerald-600 dark:text-wizard-emerald-light hover:text-wizard-emerald-800 dark:hover:text-wizard-emerald-300 font-medium"
        >
          View All →
        </Link>
      </div>

      <div className="space-y-3">
        {agents.slice(0, 6).map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-wizard-cream-100 dark:hover:bg-wizard-dark-bg-tertiary transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gradient-wizard rounded-full flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-wizard-emerald-900 dark:text-wizard-dark-text">
                    {agent.name}
                  </h4>
                  {getStatusIcon(agent.status)}
                </div>
                <p className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
                  {agent.type}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className={getStatusBadge(agent.status)}>
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </span>
              <div className="text-xs text-wizard-emerald-500 dark:text-wizard-dark-text-muted">
                {agent.tasksCompleted} tasks
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-wizard-emerald-100 dark:border-wizard-dark-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-wizard-emerald-900 dark:text-wizard-dark-text">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
              Active
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-wizard-gold">
              {agents.filter(a => a.status === 'busy').length}
            </div>
            <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
              Busy
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-600">
              {agents.filter(a => a.status === 'error').length}
            </div>
            <div className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
              Issues
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}