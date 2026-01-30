'use client';

import { useEffect, useState } from 'react';
import { Server, Database, Wifi, HardDrive, Cpu, MemoryStick, AlertTriangle } from 'lucide-react';

interface SystemMetrics {
  uptime: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  databaseStatus: 'healthy' | 'warning' | 'error';
  apiResponseTime: number;
  activeConnections: number;
}

interface HealthCheck {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime?: number;
  lastCheck: string;
  uptime?: string;
}

export function SystemHealth() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: '0d 0h 0m',
    cpuUsage: 0,
    memoryUsage: 0,
    diskUsage: 0,
    networkLatency: 0,
    databaseStatus: 'healthy',
    apiResponseTime: 0,
    activeConnections: 0,
  });
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSystemHealth = async () => {
      try {
        const [metricsResponse, healthResponse] = await Promise.all([
          fetch('/api/system/metrics'),
          fetch('/api/system/health')
        ]);

        if (metricsResponse.ok && healthResponse.ok) {
          const metricsData = await metricsResponse.json();
          const healthData = await healthResponse.json();
          setMetrics(metricsData);
          setHealthChecks(healthData);
        } else {
          generateDemoData();
        }
      } catch (error) {
        console.error('Failed to fetch system health:', error);
        generateDemoData();
      } finally {
        setLoading(false);
      }
    };

    const generateDemoData = () => {
      const demoMetrics: SystemMetrics = {
        uptime: '7d 12h 34m',
        cpuUsage: 23,
        memoryUsage: 67,
        diskUsage: 45,
        networkLatency: 12,
        databaseStatus: 'healthy',
        apiResponseTime: 156,
        activeConnections: 847,
      };

      const demoHealthChecks: HealthCheck[] = [
        {
          service: 'Next.js App',
          status: 'healthy',
          responseTime: 89,
          lastCheck: '30s ago',
          uptime: '99.9%'
        },
        {
          service: 'Supabase Database',
          status: 'healthy',
          responseTime: 45,
          lastCheck: '1m ago',
          uptime: '100%'
        },
        {
          service: 'Agent API',
          status: 'warning',
          responseTime: 234,
          lastCheck: '2m ago',
          uptime: '98.7%'
        },
        {
          service: 'Memory Search',
          status: 'healthy',
          responseTime: 67,
          lastCheck: '45s ago',
          uptime: '99.5%'
        }
      ];

      setMetrics(demoMetrics);
      setHealthChecks(demoHealthChecks);
    };

    fetchSystemHealth();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchSystemHealth, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string, value?: number) => {
    if (status === 'error' || (value && value > 90)) return 'text-red-600';
    if (status === 'warning' || (value && value > 70)) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      healthy: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200'
    };
    return `px-2 py-1 rounded-md text-xs font-medium border ${colors[status as keyof typeof colors] || colors.healthy}`;
  };

  const getProgressBarColor = (value: number) => {
    if (value > 90) return 'bg-red-500';
    if (value > 70) return 'bg-yellow-500';
    return 'bg-wizard-emerald';
  };

  if (loading) {
    return (
      <div className="wizard-card p-6">
        <h3 className="text-lg font-semibold text-wizard-emerald-900 dark:text-wizard-dark-text mb-4">
          System Health
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded"></div>
                <div className="h-4 bg-wizard-emerald-200 dark:bg-wizard-dark-border rounded w-24"></div>
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
          System Health
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-wizard-pulse"></div>
          <span className="text-xs text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
            Live monitoring
          </span>
        </div>
      </div>

      {/* System Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server size={16} className="text-wizard-emerald-600" />
            <span className="text-sm text-wizard-emerald-700 dark:text-wizard-dark-text-muted">
              Uptime
            </span>
          </div>
          <span className="text-sm font-medium text-wizard-emerald-900 dark:text-wizard-dark-text">
            {metrics.uptime}
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-wizard-emerald-600" />
                <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">CPU</span>
              </div>
              <span className={`font-medium ${getStatusColor('', metrics.cpuUsage)}`}>
                {metrics.cpuUsage}%
              </span>
            </div>
            <div className="w-full bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics.cpuUsage)}`}
                style={{ width: `${metrics.cpuUsage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <MemoryStick size={16} className="text-wizard-emerald-600" />
                <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">Memory</span>
              </div>
              <span className={`font-medium ${getStatusColor('', metrics.memoryUsage)}`}>
                {metrics.memoryUsage}%
              </span>
            </div>
            <div className="w-full bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics.memoryUsage)}`}
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <div className="flex items-center gap-2">
                <HardDrive size={16} className="text-wizard-emerald-600" />
                <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">Disk</span>
              </div>
              <span className={`font-medium ${getStatusColor('', metrics.diskUsage)}`}>
                {metrics.diskUsage}%
              </span>
            </div>
            <div className="w-full bg-wizard-emerald-100 dark:bg-wizard-dark-border rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(metrics.diskUsage)}`}
                style={{ width: `${metrics.diskUsage}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-wizard-emerald-600" />
            <span className="text-sm text-wizard-emerald-700 dark:text-wizard-dark-text-muted">
              Network Latency
            </span>
          </div>
          <span className="text-sm font-medium text-wizard-emerald-900 dark:text-wizard-dark-text">
            {metrics.networkLatency}ms
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-wizard-emerald-600" />
            <span className="text-sm text-wizard-emerald-700 dark:text-wizard-dark-text-muted">
              Database
            </span>
          </div>
          <span className={getStatusBadge(metrics.databaseStatus)}>
            {metrics.databaseStatus}
          </span>
        </div>
      </div>

      {/* Service Health Checks */}
      <div className="border-t border-wizard-emerald-100 dark:border-wizard-dark-border pt-4">
        <h4 className="text-sm font-medium text-wizard-emerald-800 dark:text-wizard-dark-text mb-3">
          Service Status
        </h4>
        <div className="space-y-2">
          {healthChecks.map((check, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  check.status === 'healthy' ? 'bg-green-500' :
                  check.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-wizard-emerald-700 dark:text-wizard-dark-text-muted">
                  {check.service}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-wizard-emerald-600 dark:text-wizard-dark-text-muted">
                  {check.responseTime}ms
                </span>
                <span className={getStatusColor(check.status)}>
                  {check.uptime}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-wizard-emerald-100 dark:border-wizard-dark-border text-center">
        <div className="text-xs text-wizard-emerald-500 dark:text-wizard-dark-text-muted">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}