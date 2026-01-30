'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  Calendar,
  Download,
  Settings,
  Zap,
  Server,
  Wrench,
  Brain,
  ChevronUp,
  ChevronDown,
  Edit,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface Subscription {
  id: string;
  name: string;
  provider: string;
  category: string;
  monthly_cost: number;
  billing_cycle: string;
  next_renewal: string;
  usage_limit?: number;
  current_usage?: number;
  usage_unit?: string;
  status: string;
  notes?: string;
  url?: string;
  created_at: string;
  updated_at: string;
}

interface Analytics {
  monthly_totals: { total_monthly: number };
  category_stats: Array<{ category: string; count: number; total_cost: number; status: string }>;
  usage_stats: Array<{ name: string; provider: string; usage_percentage: number; usage_unit: string }>;
  renewal_schedule: Array<{ month: string; renewal_count: number; renewal_cost: number }>;
  historical_data: Array<{ month: string; total_cost: number; new_subscriptions: number; cancelled_subscriptions: number }>;
  category_breakdown: Array<{ category: string; subscription_count: number; total_cost: number; percentage: number }>;
  optimizations: Array<{ type: string; title: string; description: string; action: string }>;
}

const CATEGORY_COLORS = {
  'AI': '#d4a84b', // Gold
  'Hosting': '#1A8B6B', // Emerald
  'Tools': '#e07a5f', // Coral
  'Security': '#1e5f74', // Teal
  'Analytics': '#8b6914', // Dark Gold
  'Communication': '#156b4a', // Dark Emerald
};

const CATEGORY_ICONS = {
  'AI': Brain,
  'Hosting': Server,
  'Tools': Wrench,
  'Security': AlertTriangle,
  'Analytics': TrendingUp,
  'Communication': Zap,
};

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'cost' | 'renewal' | 'usage'>('cost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Animated number counter component
  const AnimatedNumber = ({ value, prefix = '', suffix = '', duration = 1000 }: { 
    value: number; 
    prefix?: string; 
    suffix?: string; 
    duration?: number;
  }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
      const startTime = Date.now();
      const startValue = displayValue;
      const endValue = value;
      const totalChange = endValue - startValue;

      const timer = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentValue = startValue + totalChange * easeOutCubic;
        
        setDisplayValue(currentValue);
        
        if (progress === 1) {
          clearInterval(timer);
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value]);

    return (
      <span className="font-mono">
        {prefix}{Math.round(displayValue * 100) / 100}{suffix}
      </span>
    );
  };

  // Load data
  useEffect(() => {
    fetchSubscriptions();
    fetchAnalytics();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/subscriptions');
      const data = await response.json();
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/subscriptions/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvData = subscriptions.map(sub => ({
      Name: sub.name,
      Provider: sub.provider,
      Category: sub.category,
      'Monthly Cost': sub.monthly_cost,
      'Billing Cycle': sub.billing_cycle,
      'Next Renewal': sub.next_renewal,
      'Usage': sub.current_usage && sub.usage_limit ? `${sub.current_usage}/${sub.usage_limit} ${sub.usage_unit}` : '',
      Status: sub.status,
      URL: sub.url || ''
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscriptions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'cost':
        comparison = a.monthly_cost - b.monthly_cost;
        break;
      case 'renewal':
        comparison = new Date(a.next_renewal).getTime() - new Date(b.next_renewal).getTime();
        break;
      case 'usage':
        const usageA = a.current_usage && a.usage_limit ? (a.current_usage / a.usage_limit) * 100 : 0;
        const usageB = b.current_usage && b.usage_limit ? (b.current_usage / b.usage_limit) * 100 : 0;
        comparison = usageA - usageB;
        break;
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredSubscriptions = sortedSubscriptions.filter(sub => {
    const categoryMatch = filterCategory === 'all' || sub.category === filterCategory;
    const statusMatch = filterStatus === 'all' || sub.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6 flex items-center justify-center">
        <div className="text-cream text-xl">Loading subscriptions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-cream mb-2">AI & Tech Stack Subscriptions</h1>
              <p className="text-gold-300">Manage your technology investments with wizard-level precision</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-gold-500/20 border border-gold-500/30 rounded-lg text-gold-300 hover:bg-gold-500/30 transition-all duration-200 backdrop-blur-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-700/50 border border-emerald-600/50 rounded-lg text-cream hover:bg-emerald-600/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Plus className="w-4 h-4" />
                Add Subscription
              </button>
            </div>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">Monthly Total</span>
              </div>
              <div className="text-2xl font-bold text-cream">
                $<AnimatedNumber value={analytics?.monthly_totals?.total_monthly || 0} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">Active Services</span>
              </div>
              <div className="text-2xl font-bold text-cream">
                <AnimatedNumber value={subscriptions.filter(s => s.status === 'active').length} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">Renewals This Month</span>
              </div>
              <div className="text-2xl font-bold text-cream">
                <AnimatedNumber value={
                  subscriptions.filter(s => {
                    const renewal = new Date(s.next_renewal);
                    const now = new Date();
                    return renewal.getMonth() === now.getMonth() && renewal.getFullYear() === now.getFullYear();
                  }).length
                } />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-gold-400" />
                <span className="text-gold-300 text-sm font-medium">Projected Yearly</span>
              </div>
              <div className="text-2xl font-bold text-cream">
                $<AnimatedNumber value={(analytics?.monthly_totals?.total_monthly || 0) * 12} />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Spending Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-cream mb-4">Monthly Spending Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics?.historical_data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A8B6B" strokeOpacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  stroke="#fdf8e8" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short' })}
                />
                <YAxis stroke="#fdf8e8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a4d3c', 
                    border: '1px solid #1A8B6B', 
                    borderRadius: '8px',
                    color: '#fdf8e8'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="total_cost" 
                  stroke="#d4a84b" 
                  strokeWidth={3}
                  dot={{ fill: '#d4a84b', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#d4a84b' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Breakdown Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6"
          >
            <h3 className="text-lg font-semibold text-cream mb-4">Cost by Category</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics?.category_breakdown || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="total_cost"
                  label={({ category, percentage }) => `${category} (${percentage}%)`}
                  labelLine={false}
                  fontSize={12}
                  fill="#d4a84b"
                >
                  {analytics?.category_breakdown?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#d4a84b'} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a4d3c', 
                    border: '1px solid #1A8B6B', 
                    borderRadius: '8px',
                    color: '#fdf8e8'
                  }} 
                  formatter={(value: number) => [`$${value}`, 'Monthly Cost']}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Usage vs Limits Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-cream mb-4">Usage vs Limits</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics?.usage_stats || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A8B6B" strokeOpacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke="#fdf8e8" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#fdf8e8" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a4d3c', 
                  border: '1px solid #1A8B6B', 
                  borderRadius: '8px',
                  color: '#fdf8e8'
                }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Usage']}
              />
              <Bar 
                dataKey="usage_percentage" 
                fill="#d4a84b"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Optimization Suggestions */}
        {analytics?.optimizations && analytics.optimizations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-cream mb-4">Cost Optimization Suggestions</h3>
            <div className="space-y-4">
              {analytics.optimizations.map((suggestion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    suggestion.type === 'warning' 
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-300'
                      : suggestion.type === 'cost'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <h4 className="font-semibold">{suggestion.title}</h4>
                      <p className="text-sm opacity-80 mt-1">{suggestion.description}</p>
                      <p className="text-xs mt-2 font-medium">💡 {suggestion.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Subscriptions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-800/40 to-emerald-700/40 backdrop-blur-xl border border-emerald-600/30 rounded-xl overflow-hidden"
        >
          {/* Table Controls */}
          <div className="p-6 border-b border-emerald-600/30">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg font-semibold text-cream">Subscription Details</h3>
              
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-1 bg-emerald-900/50 border border-emerald-600/30 rounded-lg text-cream text-sm"
                >
                  <option value="all">All Categories</option>
                  {Array.from(new Set(subscriptions.map(s => s.category))).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1 bg-emerald-900/50 border border-emerald-600/30 rounded-lg text-cream text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="trial">Trial</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 bg-emerald-900/50 border border-emerald-600/30 rounded-lg text-cream text-sm"
                >
                  <option value="cost">Sort by Cost</option>
                  <option value="name">Sort by Name</option>
                  <option value="renewal">Sort by Renewal</option>
                  <option value="usage">Sort by Usage</option>
                </select>

                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="p-1 text-gold-300 hover:text-gold-400"
                >
                  {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-emerald-900/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Usage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Renewal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gold-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-600/20">
                {filteredSubscriptions.map((subscription, index) => {
                  const IconComponent = CATEGORY_ICONS[subscription.category as keyof typeof CATEGORY_ICONS] || Wrench;
                  const usagePercentage = subscription.current_usage && subscription.usage_limit 
                    ? (subscription.current_usage / subscription.usage_limit) * 100 
                    : 0;

                  return (
                    <motion.tr
                      key={subscription.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-emerald-800/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: CATEGORY_COLORS[subscription.category as keyof typeof CATEGORY_COLORS] }}>
                            <IconComponent className="w-4 h-4" style={{ color: CATEGORY_COLORS[subscription.category as keyof typeof CATEGORY_COLORS] }} />
                          </div>
                          <div>
                            <div className="font-medium text-cream">{subscription.name}</div>
                            <div className="text-sm text-gold-300">{subscription.provider}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span 
                          className="inline-block px-2 py-1 text-xs rounded-full border"
                          style={{ 
                            backgroundColor: `${CATEGORY_COLORS[subscription.category as keyof typeof CATEGORY_COLORS]}20`,
                            borderColor: `${CATEGORY_COLORS[subscription.category as keyof typeof CATEGORY_COLORS]}60`,
                            color: CATEGORY_COLORS[subscription.category as keyof typeof CATEGORY_COLORS]
                          }}
                        >
                          {subscription.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-cream font-medium">${subscription.monthly_cost}/mo</div>
                        <div className="text-sm text-gold-300">{subscription.billing_cycle}</div>
                      </td>
                      <td className="px-6 py-4">
                        {subscription.usage_limit ? (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-16 bg-emerald-900/50 rounded-full h-2">
                                <div 
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${Math.min(usagePercentage, 100)}%`,
                                    backgroundColor: usagePercentage > 80 ? '#e07a5f' : usagePercentage > 60 ? '#d4a84b' : '#1A8B6B'
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gold-300">{usagePercentage.toFixed(1)}%</span>
                            </div>
                            <div className="text-xs text-cream">
                              {subscription.current_usage?.toLocaleString()}/{subscription.usage_limit?.toLocaleString()} {subscription.usage_unit}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gold-300/60">No limit set</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-cream">{new Date(subscription.next_renewal).toLocaleDateString()}</div>
                        <div className="text-xs text-gold-300">
                          {Math.ceil((new Date(subscription.next_renewal).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          subscription.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                          subscription.status === 'trial' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40' :
                          'bg-red-500/20 text-red-400 border border-red-500/40'
                        }`}>
                          {subscription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {subscription.url && (
                            <a
                              href={subscription.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 text-gold-300 hover:text-gold-400 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          <button
                            onClick={() => setEditingSubscription(subscription)}
                            className="p-1 text-emerald-300 hover:text-emerald-400 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {/* Add delete functionality */}}
                            className="p-1 text-red-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredSubscriptions.length === 0 && (
            <div className="p-8 text-center text-gold-300/60">
              No subscriptions match your current filters.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}