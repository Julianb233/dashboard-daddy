'use client';

import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  LineChart, Line, Area, AreaChart,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { DollarSign, TrendingUp, MessageSquare, Calendar } from 'lucide-react';

interface Person {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  circle?: string;
  relationship_role?: string;
  relationship_strength?: number;
  tags?: string[];
  notes?: string;
  company?: string;
  potential_value?: number;
  last_contact_date?: string;
  created_at?: string;
}

interface RelationshipChartsProps {
  people: Person[];
}

const COLORS = {
  inner: '#8B5CF6',
  key: '#10B981',
  outer: '#6B7280',
  dormant: '#EF4444',
  mentor: '#F59E0B',
  disciple: '#EC4899',
  peer: '#3B82F6',
  client: '#10B981',
  prospect: '#6366F1',
  family: '#EF4444',
  friend: '#8B5CF6',
};

const CHART_COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#6366F1', '#EF4444'];

export function CircleDistributionChart({ people }: RelationshipChartsProps) {
  const data = [
    { name: 'Inner Circle', value: people.filter(p => p.circle === 'inner').length, color: COLORS.inner },
    { name: 'Key Contacts', value: people.filter(p => p.circle === 'key').length, color: COLORS.key },
    { name: 'Outer Network', value: people.filter(p => p.circle === 'outer').length, color: COLORS.outer },
    { name: 'Dormant', value: people.filter(p => p.circle === 'dormant').length, color: COLORS.dormant },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Circle Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-gray-300">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoleDistributionChart({ people }: RelationshipChartsProps) {
  const roles = ['mentor', 'disciple', 'peer', 'client', 'prospect', 'family', 'friend'];
  const data = roles.map(role => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    count: people.filter(p => p.relationship_role === role).length,
    fill: COLORS[role as keyof typeof COLORS] || '#6B7280'
  })).filter(d => d.count > 0);

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Relationship Roles</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="#9CA3AF" />
          <YAxis type="category" dataKey="name" stroke="#9CA3AF" width={80} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function IncomeProjectionChart({ people }: RelationshipChartsProps) {
  // Calculate potential income from clients and prospects
  const clients = people.filter(p => p.relationship_role === 'client');
  const prospects = people.filter(p => p.relationship_role === 'prospect');
  
  // Estimate values (can be customized per person later)
  const avgClientValue = 5000;  // Average monthly value per client
  const prospectConversionRate = 0.3;
  const avgProspectValue = 3000;

  const currentRevenue = clients.length * avgClientValue;
  const pipelineValue = prospects.length * avgProspectValue * prospectConversionRate;
  const potentialTotal = currentRevenue + pipelineValue;

  const data = [
    { name: 'Current Clients', value: currentRevenue, fill: '#10B981' },
    { name: 'Pipeline (30% conv)', value: pipelineValue, fill: '#6366F1' },
  ];

  const monthlyProjection = [
    { month: 'Now', current: currentRevenue, pipeline: 0 },
    { month: '+1mo', current: currentRevenue, pipeline: pipelineValue * 0.3 },
    { month: '+2mo', current: currentRevenue, pipeline: pipelineValue * 0.5 },
    { month: '+3mo', current: currentRevenue, pipeline: pipelineValue * 0.7 },
    { month: '+6mo', current: currentRevenue * 1.1, pipeline: pipelineValue },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-400" />
        Income Potential
      </h3>
      <p className="text-gray-400 text-sm mb-4">Based on {clients.length} clients, {prospects.length} prospects</p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">${currentRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Current Monthly</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-400">${pipelineValue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Pipeline Value</p>
        </div>
        <div className="bg-gray-700/50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-yellow-400">${potentialTotal.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Potential Total</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={monthlyProjection}>
          <XAxis dataKey="month" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Area type="monotone" dataKey="current" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Current" />
          <Area type="monotone" dataKey="pipeline" stackId="1" stroke="#6366F1" fill="#6366F1" fillOpacity={0.6} name="Pipeline" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RelationshipStrengthRadar({ people }: RelationshipChartsProps) {
  // Group by role and calculate average strength
  const roles = ['mentor', 'disciple', 'peer', 'client', 'family', 'friend'];
  const data = roles.map(role => {
    const rolePeople = people.filter(p => p.relationship_role === role && p.relationship_strength);
    const avgStrength = rolePeople.length > 0 
      ? rolePeople.reduce((sum, p) => sum + (p.relationship_strength || 0), 0) / rolePeople.length
      : 0;
    return {
      role: role.charAt(0).toUpperCase() + role.slice(1),
      strength: Math.round(avgStrength * 10) / 10,
      count: rolePeople.length
    };
  });

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Relationship Strength by Role</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="role" stroke="#9CA3AF" />
          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9CA3AF" />
          <Radar name="Avg Strength" dataKey="strength" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InteractionTimeline({ people }: RelationshipChartsProps) {
  // Create timeline of when people were added/last contacted
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  const data = last30Days.map(date => {
    const added = people.filter(p => p.created_at?.startsWith(date)).length;
    const contacted = people.filter(p => p.last_contact_date?.startsWith(date)).length;
    return {
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      added,
      contacted
    };
  });

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-blue-400" />
        Activity Timeline (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 10 }} interval={6} />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
          />
          <Legend />
          <Line type="monotone" dataKey="added" stroke="#10B981" name="Added" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="contacted" stroke="#8B5CF6" name="Contacted" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopTagsChart({ people }: RelationshipChartsProps) {
  // Count tag frequency
  const tagCounts: Record<string, number> = {};
  people.forEach(p => {
    (p.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const data = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count], i) => ({
      tag,
      count,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }));

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Top Tags</h3>
        <p className="text-gray-400 text-center py-8">No tags yet. Add tags to people to see insights.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Top Tags</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="tag" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ConversationTopicsChart({ people }: RelationshipChartsProps) {
  // Extract topics from notes (simple keyword analysis)
  const topicKeywords: Record<string, string[]> = {
    'Business': ['business', 'revenue', 'client', 'project', 'deal', 'contract'],
    'Faith': ['prayer', 'bible', 'church', 'jesus', 'faith', 'spiritual'],
    'Personal': ['family', 'kids', 'vacation', 'health', 'birthday'],
    'Networking': ['intro', 'connection', 'referral', 'event', 'conference'],
    'Mentorship': ['advice', 'guidance', 'lesson', 'learn', 'mentor'],
  };

  const topicCounts: Record<string, number> = {};
  Object.keys(topicKeywords).forEach(topic => topicCounts[topic] = 0);

  people.forEach(p => {
    const notes = (p.notes || '').toLowerCase();
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(kw => notes.includes(kw))) {
        topicCounts[topic]++;
      }
    });
  });

  const data = Object.entries(topicCounts)
    .map(([topic, count], i) => ({
      topic,
      count,
      fill: CHART_COLORS[i % CHART_COLORS.length]
    }))
    .filter(d => d.count > 0);

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          Conversation Topics
        </h3>
        <p className="text-gray-400 text-center py-8">Add notes to people to see topic analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-purple-400" />
        Conversation Topics
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            dataKey="count"
            label={({ topic, count }) => `${topic}: ${count}`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
