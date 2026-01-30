'use client';

import React from 'react';
import { Users, Crown, UserCheck, Heart, Clock, AlertCircle } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  circle?: 'inner' | 'key' | 'outer' | 'dormant';
  relationship_role?: string;
  last_contact_date?: string;
  next_contact_date?: string;
  tags?: string[];
}

interface RelationshipVisualsProps {
  people: Person[];
}

export function RelationshipStats({ people }: RelationshipVisualsProps) {
  // Calculate stats
  const stats = {
    total: people.length,
    inner: people.filter(p => p.circle === 'inner').length,
    key: people.filter(p => p.circle === 'key').length,
    outer: people.filter(p => p.circle === 'outer').length,
    mentors: people.filter(p => p.relationship_role === 'mentor').length,
    disciples: people.filter(p => p.relationship_role === 'disciple').length,
    needsAttention: people.filter(p => {
      if (!p.next_contact_date) return false;
      return new Date(p.next_contact_date) < new Date();
    }).length,
  };

  const statCards = [
    { label: 'Total', value: stats.total, icon: Users, color: 'bg-blue-500' },
    { label: 'Inner Circle', value: stats.inner, icon: Crown, color: 'bg-purple-500' },
    { label: 'Key Contacts', value: stats.key, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Mentors', value: stats.mentors, icon: Crown, color: 'bg-yellow-500' },
    { label: 'Disciples', value: stats.disciples, icon: Heart, color: 'bg-pink-500' },
    { label: 'Needs Attention', value: stats.needsAttention, icon: AlertCircle, color: 'bg-red-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`${stat.color} p-2 rounded-lg`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FerrazziCircles({ people }: RelationshipVisualsProps) {
  const inner = people.filter(p => p.circle === 'inner');
  const key = people.filter(p => p.circle === 'key');
  const outer = people.filter(p => p.circle === 'outer');

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎯</span> Ferrazzi Circles
      </h3>
      
      <div className="relative flex items-center justify-center h-80">
        {/* Outer Circle */}
        <div className="absolute w-72 h-72 rounded-full border-2 border-gray-600 bg-gray-700/30 flex items-center justify-center">
          <span className="absolute -top-3 bg-gray-800 px-2 text-xs text-gray-400">
            OUTER ({outer.length})
          </span>
        </div>
        
        {/* Key Circle */}
        <div className="absolute w-48 h-48 rounded-full border-2 border-green-500/50 bg-green-500/10 flex items-center justify-center">
          <span className="absolute -top-3 bg-gray-800 px-2 text-xs text-green-400">
            KEY ({key.length})
          </span>
        </div>
        
        {/* Inner Circle */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-purple-500 bg-purple-500/20 flex items-center justify-center">
          <span className="absolute -top-3 bg-gray-800 px-2 text-xs text-purple-400">
            INNER ({inner.length})
          </span>
        </div>

        {/* People dots in inner circle */}
        <div className="absolute flex flex-wrap justify-center items-center w-20 h-20 gap-1">
          {inner.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white cursor-pointer hover:scale-125 transition-transform"
              title={p.name || `${p.first_name} ${p.last_name || ''}`}
            >
              {(p.first_name || p.name || '?')[0]}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-gray-300">Inner (5-10 lifeline)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-300">Key (50-100 important)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
          <span className="text-gray-300">Outer (broader network)</span>
        </div>
      </div>
    </div>
  );
}

export function RoleBreakdown({ people }: RelationshipVisualsProps) {
  const roles = [
    { role: 'acquaintance', label: 'Acquaintances', icon: '👋', color: 'bg-gray-500' },
    { role: 'mentor', label: 'Mentors', icon: '👑', color: 'bg-yellow-500' },
    { role: 'disciple', label: 'Disciples', icon: '🙏', color: 'bg-pink-500' },
    { role: 'peer', label: 'Peers', icon: '🤝', color: 'bg-blue-500' },
    { role: 'client', label: 'Clients', icon: '💼', color: 'bg-green-500' },
    { role: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: 'bg-red-500' },
    { role: 'friend', label: 'Friends', icon: '😊', color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-white mb-4">Relationship Roles</h3>
      <div className="space-y-3">
        {roles.map(({ role, label, icon, color }) => {
          const count = people.filter(p => p.relationship_role === role).length;
          const percentage = people.length > 0 ? (count / people.length) * 100 : 0;
          
          return (
            <div key={role} className="flex items-center gap-3">
              <span className="text-xl w-8">{icon}</span>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{label}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function NeedsAttention({ people }: RelationshipVisualsProps) {
  const [triggers, setTriggers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/relationships/triggers')
      .then(res => res.json())
      .then(data => {
        setTriggers(data.triggers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [people]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 mb-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className="space-y-2">
          <div className="h-10 bg-gray-700 rounded"></div>
          <div className="h-10 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (triggers.length === 0) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-green-400">
          <span className="text-xl">✅</span>
          <span>All relationships are healthy! No action needed.</span>
        </div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 border-red-500/50 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500/50 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      default: return 'bg-gray-500/20 border-gray-500/50 text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'no_contact_warning': return '⚠️';
      case 'relationship_cooling': return '🥶';
      case 'check_in_needed': return '👋';
      case 'birthday_upcoming': return '🎂';
      case 'action_item_pending': return '📋';
      case 'quality_declining': return '📉';
      default: return '📌';
    }
  };

  const getRoleEmoji = (role: string) => {
    switch (role) {
      case 'mentor': return '👑';
      case 'disciple': return '🙏';
      case 'client': return '💼';
      case 'family': return '👨‍👩‍👧‍👦';
      default: return '👤';
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-4 mb-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-400" />
          Needs Attention ({triggers.length})
        </span>
        <div className="flex gap-2 text-xs">
          {triggers.filter(t => t.priority === 'urgent').length > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded">
              {triggers.filter(t => t.priority === 'urgent').length} urgent
            </span>
          )}
          {triggers.filter(t => t.priority === 'high').length > 0 && (
            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
              {triggers.filter(t => t.priority === 'high').length} high
            </span>
          )}
        </div>
      </h3>
      
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {triggers.slice(0, 10).map((trigger, i) => (
          <div 
            key={i} 
            className={`rounded-lg p-3 border ${getPriorityColor(trigger.priority)}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getTypeIcon(trigger.trigger_type)}</span>
                  <span className="font-medium text-white">{trigger.person_name}</span>
                  <span className="text-xs opacity-70">{getRoleEmoji(trigger.role)} {trigger.role}</span>
                </div>
                <p className="text-sm opacity-90">{trigger.reason}</p>
                {trigger.suggested_action && (
                  <p className="text-xs mt-1 opacity-70">💡 {trigger.suggested_action}</p>
                )}
              </div>
              <div className="text-right text-xs">
                {trigger.days_since !== null && trigger.days_since !== undefined && (
                  <div className="opacity-70">{trigger.days_since}d ago</div>
                )}
                {trigger.last_contact_type && (
                  <div className="opacity-50">via {trigger.last_contact_type}</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {triggers.length > 10 && (
        <p className="text-center text-gray-500 text-sm mt-2">
          +{triggers.length - 10} more...
        </p>
      )}
    </div>
  );
}
