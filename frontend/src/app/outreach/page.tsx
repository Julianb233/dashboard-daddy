'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Instagram, DollarSign, Target, TrendingUp, 
  Trophy, Zap, CheckCircle2, Clock, Send, MessageCircle,
  Star, Filter, ExternalLink, Users, BarChart3
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { 
  RevenuePipelineChart, 
  StatusFunnelChart, 
  BookingGoalTracker,
  WeeklyProgressChart,
  PricePointChart 
} from '@/components/outreach/OutreachCharts';

interface MarketingLead {
  id: string;
  brand_name: string;
  instagram_handle: string;
  contact_name?: string;
  contact_email?: string;
  website?: string;
  brand_description?: string;
  price_point: 'budget' | 'mid-range' | 'premium' | 'luxury';
  brand_aesthetic?: string;
  potential_revenue: number;
  status: 'discovered' | 'followed' | 'dmed' | 'replied' | 'negotiating' | 'booked' | 'completed' | 'rejected';
  notes?: string;
  tags: string[];
  followers_count?: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalLeads: number;
  totalPotentialRevenue: number;
  confirmedRevenue: number;
  conversionRate: number;
  statusBreakdown: Record<string, number>;
  pricePointBreakdown: Record<string, number>;
  pipelineValue: Record<string, number>;
  topBrands: Array<{ name: string; instagram: string; revenue: number; status: string }>;
  weeklyProgress: Array<{ week: string; discovered: number; contacted: number; booked: number }>;
}

// Mock data for initial display
const mockLeads: MarketingLead[] = [
  {
    id: '1',
    brand_name: 'Urban Threads',
    instagram_handle: 'urbanthreads',
    contact_name: 'Sarah Chen',
    price_point: 'mid-range',
    brand_aesthetic: 'Streetwear, minimalist',
    potential_revenue: 2500,
    status: 'discovered',
    priority: 'high',
    tags: ['streetwear', 'sustainable'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    brand_name: 'Luxe Athletics',
    instagram_handle: 'luxeathletics',
    price_point: 'premium',
    brand_aesthetic: 'Athletic luxury',
    potential_revenue: 5000,
    status: 'followed',
    priority: 'high',
    tags: ['athleisure', 'premium'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    brand_name: 'Coastal Vibes',
    instagram_handle: 'coastalvibes',
    contact_name: 'Mike Johnson',
    price_point: 'mid-range',
    brand_aesthetic: 'Beach, relaxed',
    potential_revenue: 1500,
    status: 'dmed',
    priority: 'medium',
    tags: ['beachwear', 'casual'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    brand_name: 'Elite Fashion House',
    instagram_handle: 'elitefashion',
    price_point: 'luxury',
    brand_aesthetic: 'High fashion, editorial',
    potential_revenue: 10000,
    status: 'negotiating',
    priority: 'urgent',
    tags: ['luxury', 'editorial'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const OutreachPage: React.FC = () => {
  const [leads, setLeads] = useState<MarketingLead[]>(mockLeads);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPricePoint, setFilterPricePoint] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingLead, setEditingLead] = useState<MarketingLead | null>(null);
  const [bookingGoal, setBookingGoal] = useState(10); // Monthly goal
  
  const [formData, setFormData] = useState<{
    brand_name: string;
    instagram_handle: string;
    contact_name: string;
    contact_email: string;
    website: string;
    brand_description: string;
    price_point: 'budget' | 'mid-range' | 'premium' | 'luxury';
    brand_aesthetic: string;
    potential_revenue: number;
    status: 'discovered' | 'followed' | 'dmed' | 'replied' | 'negotiating' | 'booked' | 'completed' | 'rejected';
    notes: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>({
    brand_name: '',
    instagram_handle: '',
    contact_name: '',
    contact_email: '',
    website: '',
    brand_description: '',
    price_point: 'mid-range',
    brand_aesthetic: '',
    potential_revenue: 1000,
    status: 'discovered',
    notes: '',
    tags: [],
    priority: 'medium'
  });

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, [searchTerm, filterStatus, filterPricePoint]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterPricePoint !== 'all') params.append('pricePoint', filterPricePoint);
      
      const response = await fetch(`/api/outreach?${params}`);
      const data = await response.json();
      
      if (response.ok && data.leads?.length > 0) {
        setLeads(data.leads);
      }
      // Keep mock data if no real data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/outreach/stats');
      const data = await response.json();
      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLead 
        ? `/api/outreach/${editingLead.id}`
        : '/api/outreach';
      
      const method = editingLead ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateLeadStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/outreach/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      // Update local state
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus as any } : l));
      fetchStats();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      brand_name: '',
      instagram_handle: '',
      contact_name: '',
      contact_email: '',
      website: '',
      brand_description: '',
      price_point: 'mid-range',
      brand_aesthetic: '',
      potential_revenue: 1000,
      status: 'discovered',
      notes: '',
      tags: [],
      priority: 'medium'
    });
    setEditingLead(null);
  };

  const handleEdit = (lead: MarketingLead) => {
    setEditingLead(lead);
    setFormData({
      brand_name: lead.brand_name,
      instagram_handle: lead.instagram_handle,
      contact_name: lead.contact_name || '',
      contact_email: lead.contact_email || '',
      website: lead.website || '',
      brand_description: lead.brand_description || '',
      price_point: lead.price_point,
      brand_aesthetic: lead.brand_aesthetic || '',
      potential_revenue: lead.potential_revenue,
      status: lead.status,
      notes: lead.notes || '',
      tags: lead.tags || [],
      priority: lead.priority
    });
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      discovered: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      followed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      dmed: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      replied: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      negotiating: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      booked: 'bg-green-500/20 text-green-400 border-green-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || colors.discovered;
  };

  const getPricePointColor = (pricePoint: string) => {
    const colors: Record<string, string> = {
      budget: 'text-green-400',
      'mid-range': 'text-blue-400',
      premium: 'text-purple-400',
      luxury: 'text-yellow-400'
    };
    return colors[pricePoint] || 'text-gray-400';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Calculate stats from current leads
  const currentStats = {
    total: leads.length,
    potentialRevenue: leads.reduce((sum, l) => sum + l.potential_revenue, 0),
    booked: leads.filter(l => l.status === 'booked' || l.status === 'completed').length,
    inProgress: leads.filter(l => ['followed', 'dmed', 'replied', 'negotiating'].includes(l.status)).length,
    bookedRevenue: leads.filter(l => l.status === 'booked' || l.status === 'completed')
      .reduce((sum, l) => sum + l.potential_revenue, 0)
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-4xl font-brier font-bold text-glow-gold mb-2">
              🎯 Marketing Outreach
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Track clothing brands for modeling, acting & UGC opportunities
            </p>
          </div>
          
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="w-full lg:w-auto inline-flex items-center justify-center px-4 py-3 bg-gradient-wizard text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform cosmic-glow text-base min-h-[44px]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Brand
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 agent-shimmer-frame">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Brands</p>
                <p className="text-2xl font-bold text-white">{currentStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 agent-shimmer-frame">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Pipeline Value</p>
                <p className="text-2xl font-bold text-green-400">{formatCurrency(currentStats.potentialRevenue)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 agent-shimmer-frame">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Booked</p>
                <p className="text-2xl font-bold text-yellow-400">{currentStats.booked}</p>
              </div>
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          
          <div className="bg-card rounded-lg p-4 agent-shimmer-frame">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Confirmed Revenue</p>
                <p className="text-2xl font-bold text-emerald-400">{formatCurrency(currentStats.bookedRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Booking Goal Gamification */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 agent-shimmer-frame mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Monthly Booking Goal</h2>
                <p className="text-muted-foreground text-sm">
                  {currentStats.booked} / {bookingGoal} bookings this month
                </p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-400">
              {Math.round((currentStats.booked / bookingGoal) * 100)}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-green-400 rounded-full transition-all duration-500 relative"
              style={{ width: `${Math.min((currentStats.booked / bookingGoal) * 100, 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>🔥 Keep pushing!</span>
            <span>{bookingGoal - currentStats.booked} more to go</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <RevenuePipelineChart leads={leads} />
          <StatusFunnelChart leads={leads} />
        </div>

        {/* Filters */}
        <div className="bg-card rounded-lg p-4 lg:p-6 mb-6 agent-shimmer-frame">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent text-base min-h-[44px]"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-base min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="discovered">Discovered</option>
              <option value="followed">Followed</option>
              <option value="dmed">DM'd</option>
              <option value="replied">Replied</option>
              <option value="negotiating">Negotiating</option>
              <option value="booked">Booked</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={filterPricePoint}
              onChange={(e) => setFilterPricePoint(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring text-base min-h-[44px]"
            >
              <option value="all">All Price Points</option>
              <option value="budget">Budget</option>
              <option value="mid-range">Mid-Range</option>
              <option value="premium">Premium</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : leads.length === 0 ? (
            <div className="bg-card rounded-lg p-8 text-center agent-shimmer-frame">
              <Instagram className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No brands yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by adding clothing brands to track your outreach
              </p>
              <button
                onClick={() => { resetForm(); setShowModal(true); }}
                className="px-6 py-2 bg-gradient-wizard text-primary-foreground font-semibold rounded-lg"
              >
                Add Your First Brand
              </button>
            </div>
          ) : (
            leads.map((lead, index) => (
              <div
                key={lead.id}
                className="bg-card rounded-lg p-6 hover:scale-[1.01] transition-transform agent-shimmer-frame"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full">
                        <Instagram className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{lead.brand_name}</h3>
                        <a 
                          href={`https://instagram.com/${lead.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:underline flex items-center gap-1"
                        >
                          @{lead.instagram_handle}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-muted-foreground text-xs">Potential Revenue</span>
                        <p className="text-lg font-bold text-green-400">{formatCurrency(lead.potential_revenue)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-xs">Price Point</span>
                        <p className={`font-semibold capitalize ${getPricePointColor(lead.price_point)}`}>
                          {lead.price_point.replace('-', ' ')}
                        </p>
                      </div>
                      {lead.contact_name && (
                        <div>
                          <span className="text-muted-foreground text-xs">Contact</span>
                          <p className="font-medium text-white">{lead.contact_name}</p>
                        </div>
                      )}
                      {lead.brand_aesthetic && (
                        <div>
                          <span className="text-muted-foreground text-xs">Aesthetic</span>
                          <p className="font-medium text-white truncate">{lead.brand_aesthetic}</p>
                        </div>
                      )}
                    </div>

                    {/* Status & Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                      {lead.tags?.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="px-3 py-2 bg-secondary/20 text-secondary rounded-lg hover:bg-secondary/30 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    
                    {/* Quick Status Buttons */}
                    {lead.status === 'discovered' && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'followed')}
                        className="px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Followed
                      </button>
                    )}
                    {lead.status === 'followed' && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'dmed')}
                        className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> DM'd
                      </button>
                    )}
                    {lead.status === 'dmed' && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'replied')}
                        className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <MessageCircle className="w-3 h-3" /> Replied
                      </button>
                    )}
                    {(lead.status === 'replied' || lead.status === 'negotiating') && (
                      <button
                        onClick={() => updateLeadStatus(lead.id, 'booked')}
                        className="px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-1"
                      >
                        <Trophy className="w-3 h-3" /> Booked!
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto agent-shimmer-frame">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingLead ? 'Edit Brand' : 'Add New Brand'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Brand Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.brand_name}
                        onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        placeholder="e.g., Urban Threads"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Instagram Handle *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                        <input
                          type="text"
                          required
                          value={formData.instagram_handle}
                          onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value.replace('@', '') })}
                          className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                          placeholder="urbanthreads"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Name</label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        placeholder="e.g., Sarah Chen"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Email</label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        placeholder="collab@brand.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Price Point</label>
                      <select
                        value={formData.price_point}
                        onChange={(e) => setFormData({ ...formData, price_point: e.target.value as any })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="budget">Budget ($)</option>
                        <option value="mid-range">Mid-Range ($$)</option>
                        <option value="premium">Premium ($$$)</option>
                        <option value="luxury">Luxury ($$$$)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Potential Revenue</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input
                          type="number"
                          min="0"
                          value={formData.potential_revenue}
                          onChange={(e) => setFormData({ ...formData, potential_revenue: parseInt(e.target.value) || 0 })}
                          className="w-full pl-8 pr-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="discovered">Discovered</option>
                        <option value="followed">Followed</option>
                        <option value="dmed">DM'd</option>
                        <option value="replied">Replied</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="booked">Booked</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                        className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Brand Aesthetic</label>
                    <input
                      type="text"
                      value={formData.brand_aesthetic}
                      onChange={(e) => setFormData({ ...formData, brand_aesthetic: e.target.value })}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring"
                      placeholder="e.g., Streetwear, minimalist, sustainable"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Why this brand? What do they represent?"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-wizard text-primary-foreground font-semibold rounded-lg hover:scale-105 transition-transform"
                    >
                      {editingLead ? 'Update' : 'Add Brand'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
};

export default OutreachPage;
