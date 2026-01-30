'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, 
  AlertTriangle, Activity, Target, Zap, RefreshCw
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

interface AnalyticsData {
  summary: {
    totalTasks: number;
    successfulTasks: number;
    failedTasks: number;
    pendingTasks: number;
    successRate: number;
  };
  dailyTrend: Array<{
    date: string;
    success: number;
    failed: number;
    total: number;
    successRate: number;
  }>;
  errorPatterns: Array<{
    error: string;
    count: number;
  }>;
  recentFailures: Array<{
    id: string;
    task: string;
    error: string;
    timestamp: string;
    agent: string;
  }>;
  lastUpdated: string;
}

export default function AgentAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agents/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const summary = analytics?.summary || {
    totalTasks: 0,
    successfulTasks: 0,
    failedTasks: 0,
    pendingTasks: 0,
    successRate: 0
  };

  const getScoreColor = (rate: number) => {
    if (rate >= 95) return 'text-green-400';
    if (rate >= 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreEmoji = (rate: number) => {
    if (rate >= 95) return '🏆';
    if (rate >= 80) return '📈';
    if (rate >= 60) return '⚠️';
    return '🚨';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">🤖 Agent Performance</h1>
            <p className="text-gray-400">Accountability & continuous improvement tracking</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Score Card */}
        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 mb-8 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 mb-2">Overall Success Rate</p>
              <div className="flex items-center gap-4">
                <span className={`text-6xl font-bold ${getScoreColor(summary.successRate)}`}>
                  {summary.successRate}%
                </span>
                <span className="text-4xl">{getScoreEmoji(summary.successRate)}</span>
              </div>
              <p className="text-gray-400 mt-2">
                Target: 95%+ | {summary.successRate >= 95 ? '✅ Meeting target' : '❌ Below target'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">{summary.successfulTasks}</p>
                <p className="text-xs text-gray-400">Successful</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-400">{summary.failedTasks}</p>
                <p className="text-xs text-gray-400">Failed</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{summary.pendingTasks}</p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-400">{summary.totalTasks}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Success Rate Trend (14 days)
            </h3>
            {analytics?.dailyTrend && analytics.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={analytics.dailyTrend}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#9CA3AF" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                    formatter={(value: number) => [`${value}%`, 'Success Rate']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successRate" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                No trend data yet. Start logging tasks to see trends.
              </div>
            )}
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Error Patterns
            </h3>
            {analytics?.errorPatterns && analytics.errorPatterns.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.errorPatterns} layout="vertical">
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis type="category" dataKey="error" stroke="#9CA3AF" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                  <p>No errors recorded! 🎉</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Failures */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-400" />
            Recent Failures (Learn from mistakes)
          </h3>
          {analytics?.recentFailures && analytics.recentFailures.length > 0 ? (
            <div className="space-y-3">
              {analytics.recentFailures.map((failure) => (
                <div key={failure.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-red-400">{failure.task}</p>
                      <p className="text-sm text-gray-400 mt-1">{failure.error || 'No error message'}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(failure.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
              <p>No recent failures! Keep up the good work.</p>
            </div>
          )}
        </div>

        {/* Improvement Commitments */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Daily Improvement Commitments
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-yellow-400 mb-2">⚡ Before Claiming "Done"</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Test via external URL (not localhost)</li>
                <li>✓ Verify actual data (not just status 200)</li>
                <li>✓ Check UI renders correctly</li>
                <li>✓ Test edge cases (empty data, errors)</li>
              </ul>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="font-medium text-green-400 mb-2">📈 Continuous Improvement</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ Log every error with root cause</li>
                <li>✓ Document lessons learned</li>
                <li>✓ Update processes to prevent repeats</li>
                <li>✓ Review failures daily</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Last updated: {analytics?.lastUpdated ? new Date(analytics.lastUpdated).toLocaleString() : 'Never'}
        </p>
      </div>
    </div>
  );
}
