'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { AgentPerformanceData } from '@/types/agent';
import { getAggregatedMetrics } from '@/lib/agents';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AgentMetricsProps {
  className?: string;
  agentId?: string; // If provided, shows metrics for specific agent
}

type TimeRange = '24h' | '7d' | '30d';

const timeRangeOptions: { value: TimeRange; label: string; days: number }[] = [
  { value: '24h', label: '24 Hours', days: 1 },
  { value: '7d', label: '7 Days', days: 7 },
  { value: '30d', label: '30 Days', days: 30 },
];

function formatTimestamp(timestamp: string, range: TimeRange): string {
  const date = new Date(timestamp);
  if (range === '24h') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function calculateStats(data: AgentPerformanceData[]) {
  if (data.length === 0) {
    return {
      totalTasks: 0,
      avgResponseTime: 0,
      avgErrorRate: 0,
      tasksTrend: 0,
      responseTrend: 0,
      errorTrend: 0,
    };
  }

  const totalTasks = data.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const avgResponseTime = data.reduce((sum, d) => sum + d.responseTimeMs, 0) / data.length;
  const avgErrorRate = data.reduce((sum, d) => sum + d.errorRate, 0) / data.length;

  // Calculate trends (compare first half to second half)
  const midpoint = Math.floor(data.length / 2);
  const firstHalf = data.slice(0, midpoint);
  const secondHalf = data.slice(midpoint);

  const firstTasks = firstHalf.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const secondTasks = secondHalf.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const tasksTrend = firstTasks > 0 ? ((secondTasks - firstTasks) / firstTasks) * 100 : 0;

  const firstResponse = firstHalf.reduce((sum, d) => sum + d.responseTimeMs, 0) / firstHalf.length;
  const secondResponse = secondHalf.reduce((sum, d) => sum + d.responseTimeMs, 0) / secondHalf.length;
  const responseTrend = firstResponse > 0 ? ((secondResponse - firstResponse) / firstResponse) * 100 : 0;

  const firstError = firstHalf.reduce((sum, d) => sum + d.errorRate, 0) / firstHalf.length;
  const secondError = secondHalf.reduce((sum, d) => sum + d.errorRate, 0) / secondHalf.length;
  const errorTrend = firstError > 0 ? ((secondError - firstError) / firstError) * 100 : 0;

  return {
    totalTasks,
    avgResponseTime,
    avgErrorRate,
    tasksTrend,
    responseTrend,
    errorTrend,
  };
}

function TrendIndicator({ value, inverse = false }: { value: number; inverse?: boolean }) {
  const isPositive = inverse ? value < 0 : value > 0;
  const Icon = value > 0 ? TrendingUp : TrendingDown;

  return (
    <span className={cn(
      'flex items-center gap-0.5 text-xs font-medium',
      isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
    )}>
      <Icon className="h-3 w-3" />
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function AgentMetrics({ className, agentId }: AgentMetricsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [data, setData] = useState<AgentPerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const days = timeRangeOptions.find(t => t.value === timeRange)?.days || 7;
      const metrics = await getAggregatedMetrics(days);
      setData(metrics);
      setIsLoading(false);
    };
    fetchData();
  }, [timeRange, agentId]);

  const stats = useMemo(() => calculateStats(data), [data]);

  // Sample data for display (reduce data points for chart readability)
  const chartData = useMemo(() => {
    const sampleRate = timeRange === '24h' ? 4 : timeRange === '7d' ? 6 : 24;
    return data
      .filter((_, i) => i % sampleRate === 0)
      .map(d => ({
        ...d,
        time: formatTimestamp(d.timestamp, timeRange),
      }));
  }, [data, timeRange]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Agent Performance</h2>
          <p className="text-sm text-muted-foreground">
            {agentId ? `Metrics for ${agentId}` : 'Aggregated metrics across all agents'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTimeRange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Tasks Completed
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-3">
              {stats.totalTasks.toLocaleString()}
              <TrendIndicator value={stats.tasksTrend} />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-3">
              {stats.avgResponseTime.toFixed(0)}ms
              <TrendIndicator value={stats.responseTrend} inverse />
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Rate
            </CardDescription>
            <CardTitle className="text-2xl flex items-center gap-3">
              {stats.avgErrorRate.toFixed(2)}%
              <TrendIndicator value={stats.errorTrend} inverse />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Completed Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tasks Completed Over Time</CardTitle>
            <CardDescription>Number of tasks completed by agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="tasksCompleted"
                      name="Tasks"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Response Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Response Time</CardTitle>
            <CardDescription>Average response time in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTimeMs"
                      name="Response Time (ms)"
                      stroke="hsl(142.1 76.2% 36.3%)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Rate Chart - Full Width */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Error Rate</CardTitle>
            <CardDescription>Percentage of failed tasks over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              {isLoading ? (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Loading...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      domain={[0, 10]}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value) => [`${(value as number)?.toFixed(2) ?? 0}%`, 'Error Rate']}
                    />
                    <Area
                      type="monotone"
                      dataKey="errorRate"
                      name="Error Rate"
                      stroke="hsl(0 84.2% 60.2%)"
                      fill="hsl(0 84.2% 60.2%)"
                      fillOpacity={0.2}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AgentMetrics;
