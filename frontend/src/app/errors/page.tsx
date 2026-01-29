'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BubbaHeader } from '@/components/kanban/BubbaHeader';
import { BubbaSidebar } from '@/components/kanban/BubbaSidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingDown, Activity, Lightbulb, Search } from 'lucide-react';

interface ErrorLog {
  id: string;
  error_type: string;
  error_message: string;
  error_code: string;
  endpoint: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'ignored';
  created_at: string;
  resolved_at?: string;
}

interface ErrorPattern {
  id: string;
  pattern_name: string;
  error_type: string;
  description: string;
  suggested_fix: string;
  frequency: number;
  last_seen: string;
}

interface ErrorSolution {
  id: string;
  solution_title: string;
  solution_description: string;
  fix_steps: string[];
  effectiveness_rating: number;
}

const SEVERITY_COLORS = {
  low: '#10B981',
  medium: '#F59E0B',
  high: '#EF4444',
  critical: '#DC2626'
};

const STATUS_COLORS = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#10B981',
  ignored: '#6B7280'
};

export default function ErrorsPage() {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [errorPatterns, setErrorPatterns] = useState<ErrorPattern[]>([]);
  const [errorSolutions, setErrorSolutions] = useState<ErrorSolution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get error logs from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: logs, error: logsError } = await supabase
        .from('error_logs')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      const { data: patterns, error: patternsError } = await supabase
        .from('error_patterns')
        .select('*')
        .order('frequency', { ascending: false });

      const { data: solutions, error: solutionsError } = await supabase
        .from('error_solutions')
        .select('*')
        .order('effectiveness_rating', { ascending: false });

      if (logsError || patternsError || solutionsError) {
        throw new Error(logsError?.message || patternsError?.message || solutionsError?.message);
      }

      setErrorLogs(logs || []);
      setErrorPatterns(patterns || []);
      setErrorSolutions(solutions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorTimelineData = () => {
    const groupedData: { [key: string]: { date: string; errors: number; resolved: number } } = {};

    errorLogs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      
      if (!groupedData[date]) {
        groupedData[date] = { date, errors: 0, resolved: 0 };
      }
      
      groupedData[date].errors++;
      if (log.status === 'resolved') {
        groupedData[date].resolved++;
      }
    });

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getErrorBreakdown = () => {
    const typeCount: { [key: string]: number } = {};
    
    errorLogs.forEach(log => {
      typeCount[log.error_type] = (typeCount[log.error_type] || 0) + 1;
    });

    return Object.entries(typeCount).map(([type, count], index) => ({
      name: type.replace('_', ' '),
      count,
      color: Object.values(SEVERITY_COLORS)[index % Object.values(SEVERITY_COLORS).length]
    }));
  };

  const getSeverityBreakdown = () => {
    const severityCount = { low: 0, medium: 0, high: 0, critical: 0 };
    
    errorLogs.forEach(log => {
      severityCount[log.severity]++;
    });

    return Object.entries(severityCount).map(([severity, count]) => ({
      name: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS]
    }));
  };

  const getFilteredLogs = () => {
    return errorLogs.filter(log => {
      const severityMatch = selectedSeverity === 'all' || log.severity === selectedSeverity;
      const statusMatch = selectedStatus === 'all' || log.status === selectedStatus;
      const searchMatch = searchQuery === '' || 
        log.error_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.error_type.toLowerCase().includes(searchQuery.toLowerCase());
      
      return severityMatch && statusMatch && searchMatch;
    });
  };

  const getStats = () => {
    const total = errorLogs.length;
    const resolved = errorLogs.filter(log => log.status === 'resolved').length;
    const open = errorLogs.filter(log => log.status === 'open').length;
    const critical = errorLogs.filter(log => log.severity === 'critical').length;
    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    return { total, resolved, open, critical, resolutionRate };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getSeverityBadge = (severity: string) => {
    const color = SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS];
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS];
    return (
      <span 
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const timelineData = getErrorTimelineData();
  const errorBreakdown = getErrorBreakdown();
  const severityBreakdown = getSeverityBreakdown();
  const filteredLogs = getFilteredLogs();
  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-950 text-white">
        <BubbaSidebar />
        <div className="flex-1 flex flex-col">
          <BubbaHeader />
          <main className="flex-1 p-6 overflow-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading error analysis...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      <BubbaSidebar />
      <div className="flex-1 flex flex-col">
        <BubbaHeader />
        <main className="flex-1 p-6 overflow-auto">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Error Analysis</h1>
                <p className="text-gray-400">Monitor and analyze system errors</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Errors</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Activity className="text-red-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Open</p>
                    <p className="text-2xl font-bold">{stats.open}</p>
                  </div>
                  <XCircle className="text-red-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Resolved</p>
                    <p className="text-2xl font-bold">{stats.resolved}</p>
                  </div>
                  <CheckCircle className="text-green-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Critical</p>
                    <p className="text-2xl font-bold">{stats.critical}</p>
                  </div>
                  <AlertTriangle className="text-red-600" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Resolution Rate</p>
                    <p className="text-2xl font-bold">{stats.resolutionRate.toFixed(1)}%</p>
                  </div>
                  <TrendingDown className="text-green-400" size={24} />
                </div>
              </div>
            </div>

            {/* Error Timeline */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Error Timeline</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} name="New Errors" />
                    <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Error Breakdown Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Error Types */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Errors by Type</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={errorBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Severity Distribution */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Severity Distribution</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, count }) => `${name} (${count})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {severityBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Common Error Patterns */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Common Error Patterns</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {errorPatterns.slice(0, 6).map(pattern => (
                  <div key={pattern.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{pattern.pattern_name}</h3>
                      <span className="text-sm text-gray-400">×{pattern.frequency}</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{pattern.description}</p>
                    <p className="text-xs text-blue-400">{pattern.suggested_fix}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Errors */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Errors</h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search errors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-sm"
                    />
                  </div>
                  <select
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="ignored">Ignored</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLogs.map(log => (
                  <div key={log.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium text-sm">{log.error_type.replace('_', ' ')}</h3>
                          {getSeverityBadge(log.severity)}
                          {getStatusBadge(log.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-1">{log.error_message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>{log.endpoint}</span>
                          <span>{formatDate(log.created_at)}</span>
                          {log.error_code && <span>Code: {log.error_code}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Solutions */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={20} />
                Suggested Solutions
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {errorSolutions.slice(0, 4).map(solution => (
                  <div key={solution.id} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{solution.solution_title}</h3>
                      <div className="flex items-center text-yellow-400">
                        {Array.from({ length: solution.effectiveness_rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">{solution.solution_description}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-400">Steps:</p>
                      {solution.fix_steps.slice(0, 3).map((step, index) => (
                        <p key={index} className="text-xs text-gray-300">
                          {index + 1}. {step}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}