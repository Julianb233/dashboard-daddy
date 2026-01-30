'use client';

import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList,
  AreaChart, Area
} from 'recharts';
import { DollarSign, Target, TrendingUp, Trophy } from 'lucide-react';

interface MarketingLead {
  id: string;
  brand_name: string;
  instagram_handle: string;
  price_point: 'budget' | 'mid-range' | 'premium' | 'luxury';
  potential_revenue: number;
  status: string;
  priority: string;
}

interface ChartProps {
  leads: MarketingLead[];
}

const COLORS = {
  discovered: '#6b7280',
  followed: '#3b82f6',
  dmed: '#8b5cf6',
  replied: '#eab308',
  negotiating: '#f97316',
  booked: '#22c55e',
  completed: '#10b981',
  rejected: '#ef4444'
};

const PRICE_COLORS = {
  budget: '#22c55e',
  'mid-range': '#3b82f6',
  premium: '#8b5cf6',
  luxury: '#eab308'
};

export const RevenuePipelineChart: React.FC<ChartProps> = ({ leads }) => {
  const pipelineData = Object.entries(COLORS).map(([status, color]) => {
    const statusLeads = leads.filter(l => l.status === status);
    return {
      status: status.charAt(0).toUpperCase() + status.slice(1),
      value: statusLeads.reduce((sum, l) => sum + l.potential_revenue, 0),
      count: statusLeads.length,
      fill: color
    };
  }).filter(d => d.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-card rounded-lg p-6 agent-shimmer-frame">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-bold text-white">Revenue Pipeline</h3>
      </div>
      
      {pipelineData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pipelineData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              type="number" 
              tickFormatter={formatCurrency}
              tick={{ fill: '#888' }}
            />
            <YAxis 
              type="category" 
              dataKey="status" 
              tick={{ fill: '#888' }}
              width={90}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              contentStyle={{ 
                backgroundColor: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {pipelineData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Add brands to see revenue pipeline
        </div>
      )}
    </div>
  );
};

export const StatusFunnelChart: React.FC<ChartProps> = ({ leads }) => {
  const stages = ['discovered', 'followed', 'dmed', 'replied', 'negotiating', 'booked'];
  
  const funnelData = stages.map(status => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: leads.filter(l => l.status === status).length,
    fill: COLORS[status as keyof typeof COLORS]
  }));

  return (
    <div className="bg-card rounded-lg p-6 agent-shimmer-frame">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Outreach Funnel</h3>
      </div>
      
      <div className="space-y-3">
        {funnelData.map((stage, index) => {
          const maxValue = Math.max(...funnelData.map(d => d.value), 1);
          const percentage = (stage.value / maxValue) * 100;
          
          return (
            <div key={stage.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{stage.name}</span>
                <span className="font-bold" style={{ color: stage.fill }}>
                  {stage.value}
                </span>
              </div>
              <div className="h-8 bg-gray-800 rounded-lg overflow-hidden relative">
                <div 
                  className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ 
                    width: `${Math.max(percentage, 5)}%`,
                    backgroundColor: stage.fill 
                  }}
                >
                  {percentage > 20 && (
                    <span className="text-xs text-white font-medium">
                      {stage.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Conversion rates */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Follow → DM Rate</span>
            <p className="text-lg font-bold text-purple-400">
              {funnelData[1].value > 0 
                ? Math.round((funnelData[2].value / funnelData[1].value) * 100)
                : 0}%
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">DM → Book Rate</span>
            <p className="text-lg font-bold text-green-400">
              {funnelData[2].value > 0 
                ? Math.round((funnelData[5].value / funnelData[2].value) * 100)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const BookingGoalTracker: React.FC<{ current: number; goal: number }> = ({ current, goal }) => {
  const percentage = Math.min((current / goal) * 100, 100);
  const remaining = Math.max(goal - current, 0);
  
  return (
    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg p-6 agent-shimmer-frame">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-yellow-400" />
        <h3 className="text-lg font-bold text-white">Monthly Booking Goal</h3>
      </div>
      
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-white">{current}</span>
            <span className="text-muted-foreground"> / {goal}</span>
          </div>
          <span className={`text-2xl font-bold ${percentage >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
            {Math.round(percentage)}%
          </span>
        </div>
        
        <div className="overflow-hidden h-4 text-xs flex rounded-full bg-gray-700">
          <div 
            style={{ width: `${percentage}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-500"
          />
        </div>
        
        <div className="flex justify-between mt-2 text-sm">
          <span className="text-green-400">✓ {current} booked</span>
          <span className="text-muted-foreground">{remaining} to go</span>
        </div>
      </div>
      
      {percentage >= 100 && (
        <div className="mt-4 text-center">
          <span className="text-2xl">🎉</span>
          <p className="text-green-400 font-bold">Goal achieved!</p>
        </div>
      )}
    </div>
  );
};

export const WeeklyProgressChart: React.FC<{ data?: Array<{ week: string; discovered: number; contacted: number; booked: number }> }> = ({ data }) => {
  const defaultData = [
    { week: 'Week 1', discovered: 5, contacted: 3, booked: 0 },
    { week: 'Week 2', discovered: 8, contacted: 5, booked: 1 },
    { week: 'Week 3', discovered: 12, contacted: 8, booked: 2 },
    { week: 'Week 4', discovered: 15, contacted: 10, booked: 3 }
  ];
  
  const chartData = data || defaultData;

  return (
    <div className="bg-card rounded-lg p-6 agent-shimmer-frame">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Weekly Progress</h3>
      </div>
      
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="week" tick={{ fill: '#888' }} />
          <YAxis tick={{ fill: '#888' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1a1a2e',
              border: '1px solid #333',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="discovered" 
            stackId="1"
            stroke="#6b7280" 
            fill="#6b7280" 
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="contacted" 
            stackId="1"
            stroke="#8b5cf6" 
            fill="#8b5cf6"
            fillOpacity={0.6}
          />
          <Area 
            type="monotone" 
            dataKey="booked" 
            stackId="1"
            stroke="#22c55e" 
            fill="#22c55e"
            fillOpacity={0.8}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PricePointChart: React.FC<ChartProps> = ({ leads }) => {
  const data = Object.entries(PRICE_COLORS).map(([pricePoint, color]) => ({
    name: pricePoint.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: leads.filter(l => l.price_point === pricePoint).length,
    revenue: leads.filter(l => l.price_point === pricePoint)
      .reduce((sum, l) => sum + l.potential_revenue, 0),
    fill: color
  })).filter(d => d.value > 0);

  return (
    <div className="bg-card rounded-lg p-6 agent-shimmer-frame">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Price Point Distribution</h3>
      </div>
      
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string, props: any) => [
                `${value} brands ($${props.payload.revenue.toLocaleString()})`,
                name
              ]}
              contentStyle={{ 
                backgroundColor: '#1a1a2e',
                border: '1px solid #333',
                borderRadius: '8px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
          Add brands to see distribution
        </div>
      )}
    </div>
  );
};

export default {
  RevenuePipelineChart,
  StatusFunnelChart,
  BookingGoalTracker,
  WeeklyProgressChart,
  PricePointChart
};
