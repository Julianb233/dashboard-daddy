'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BubbaHeader } from '@/components/kanban/BubbaHeader';
import { BubbaSidebar } from '@/components/kanban/BubbaSidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, DollarSign, Zap, TrendingUp, Activity } from 'lucide-react';

interface TokenUsage {
  id: string;
  model_name: string;
  tokens_used: number;
  total_cost: number;
  request_type: string;
  endpoint: string;
  created_at: string;
}

interface ModelCost {
  id: string;
  model_name: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
}

type ViewPeriod = 'daily' | 'weekly' | 'monthly';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

export default function UsagePage() {
  const [usageData, setUsageData] = useState<TokenUsage[]>([]);
  const [modelCosts, setModelCosts] = useState<ModelCost[]>([]);
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [viewPeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get date range based on view period
      const now = new Date();
      const startDate = new Date();
      
      switch (viewPeriod) {
        case 'daily':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'weekly':
          startDate.setDate(now.getDate() - 30);
          break;
        case 'monthly':
          startDate.setMonth(now.getMonth() - 6);
          break;
      }

      const { data: usage, error: usageError } = await supabase
        .from('token_usage')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      const { data: costs, error: costsError } = await supabase
        .from('model_costs')
        .select('*');

      if (usageError || costsError) {
        throw new Error(usageError?.message || costsError?.message);
      }

      setUsageData(usage || []);
      setModelCosts(costs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const processChartData = () => {
    if (!usageData.length) return [];

    const groupedData: { [key: string]: { date: string; tokens: number; cost: number; models: { [key: string]: number } } } = {};

    usageData.forEach(usage => {
      let dateKey: string;
      const date = new Date(usage.created_at);

      switch (viewPeriod) {
        case 'daily':
          dateKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          dateKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          dateKey = date.toISOString().split('T')[0];
      }

      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          tokens: 0,
          cost: 0,
          models: {}
        };
      }

      groupedData[dateKey].tokens += usage.tokens_used;
      groupedData[dateKey].cost += usage.total_cost || 0;
      groupedData[dateKey].models[usage.model_name] = (groupedData[dateKey].models[usage.model_name] || 0) + usage.tokens_used;
    });

    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getModelBreakdown = () => {
    const modelStats: { [key: string]: { tokens: number; cost: number } } = {};

    usageData.forEach(usage => {
      if (!modelStats[usage.model_name]) {
        modelStats[usage.model_name] = { tokens: 0, cost: 0 };
      }
      modelStats[usage.model_name].tokens += usage.tokens_used;
      modelStats[usage.model_name].cost += usage.total_cost || 0;
    });

    return Object.entries(modelStats).map(([model, stats], index) => ({
      name: model,
      tokens: stats.tokens,
      cost: stats.cost,
      color: COLORS[index % COLORS.length]
    }));
  };

  const getTotalStats = () => {
    const totalTokens = usageData.reduce((sum, usage) => sum + usage.tokens_used, 0);
    const totalCost = usageData.reduce((sum, usage) => sum + (usage.total_cost || 0), 0);
    const uniqueModels = new Set(usageData.map(usage => usage.model_name)).size;
    const avgCostPerToken = totalTokens > 0 ? totalCost / totalTokens : 0;

    return { totalTokens, totalCost, uniqueModels, avgCostPerToken };
  };

  const exportToCSV = () => {
    const csvData = usageData.map(usage => ({
      Date: new Date(usage.created_at).toLocaleString(),
      Model: usage.model_name,
      Tokens: usage.tokens_used,
      Cost: usage.total_cost,
      Type: usage.request_type,
      Endpoint: usage.endpoint
    }));

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const chartData = processChartData();
  const modelBreakdown = getModelBreakdown();
  const stats = getTotalStats();

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
                <p className="text-gray-400">Loading usage data...</p>
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
                <h1 className="text-2xl font-bold text-white">Usage & Cost Tracking</h1>
                <p className="text-gray-400">Monitor token usage and costs across AI models</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={viewPeriod}
                  onChange={(e) => setViewPeriod(e.target.value as ViewPeriod)}
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm"
                >
                  <option value="daily">Last 7 Days</option>
                  <option value="weekly">Last 30 Days</option>
                  <option value="monthly">Last 6 Months</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  <Download size={16} />
                  Export CSV
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                <p className="text-red-400">Error: {error}</p>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Tokens</p>
                    <p className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</p>
                  </div>
                  <Zap className="text-blue-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Cost</p>
                    <p className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</p>
                  </div>
                  <DollarSign className="text-green-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Models Used</p>
                    <p className="text-2xl font-bold">{stats.uniqueModels}</p>
                  </div>
                  <Activity className="text-purple-400" size={24} />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Cost/Token</p>
                    <p className="text-2xl font-bold">${(stats.avgCostPerToken * 1000).toFixed(3)}k</p>
                  </div>
                  <TrendingUp className="text-orange-400" size={24} />
                </div>
              </div>
            </div>

            {/* Token Usage Over Time */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Token Usage Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="tokens" stroke="#3B82F6" strokeWidth={2} name="Tokens" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Cost Over Time */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Cost Over Time</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                      labelStyle={{ color: '#F3F4F6' }}
                      formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="cost" stroke="#10B981" strokeWidth={2} name="Cost ($)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Model Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Model Usage Pie Chart */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Usage by Model</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="tokens"
                      >
                        {modelBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        formatter={(value: number) => [value.toLocaleString(), 'Tokens']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Cost Breakdown */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-4">Cost by Model</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={modelBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                        formatter={(value: number) => [`$${value.toFixed(3)}`, 'Cost']}
                      />
                      <Bar dataKey="cost" fill="#F59E0B" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}