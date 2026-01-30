'use client';

import { useState, useEffect } from 'react';

interface SOP {
  id: string;
  name: string;
  category: string;
  status: 'pending_approval' | 'approved' | 'declined';
  description: string;
  thoughtProcess: string;
  tools: string[];
  skills: string[];
  agents: string[];
  triggers: string[];
  steps: string[];
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

interface SOPData {
  categories: string[];
  sops: SOP[];
  summary: {
    total: number;
    pending: number;
    approved: number;
    declined: number;
  };
}

export default function SOPsPage() {
  const [data, setData] = useState<SOPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'declined'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/sops')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (sopId: string, action: 'approve' | 'decline', feedback?: string) => {
    const res = await fetch('/api/sops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sopId, action, feedback })
    });
    
    if (res.ok) {
      // Refresh data
      const newData = await fetch('/api/sops').then(r => r.json());
      setData(newData);
      setSelectedSOP(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="animate-pulse text-[#0a4d3c]">Loading SOPs...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#fdf8e8] p-4 sm:p-6">
        <div className="text-red-600">Failed to load SOPs</div>
      </div>
    );
  }

  const filteredSOPs = data.sops.filter(sop => {
    if (filter !== 'all' && sop.status !== (filter === 'pending' ? 'pending_approval' : filter)) return false;
    if (categoryFilter !== 'all' && sop.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#fdf8e8]">
      {/* Header */}
      <div className="bg-[#0a4d3c] text-white p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold">📋 Standard Operating Procedures</h1>
        <p className="text-white/70 mt-1">Review, approve, and manage Bubba&apos;s workflows</p>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{data.summary.total}</div>
            <div className="text-xs text-white/70">Total SOPs</div>
          </div>
          <div className="bg-yellow-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-300">{data.summary.pending}</div>
            <div className="text-xs text-white/70">Pending Review</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-300">{data.summary.approved}</div>
            <div className="text-xs text-white/70">Approved</div>
          </div>
          <div className="bg-red-500/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-300">{data.summary.declined}</div>
            <div className="text-xs text-white/70">Declined</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-[#0a4d3c]/10 flex flex-wrap gap-2">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2 rounded-lg border border-[#0a4d3c]/20 bg-white text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">⏳ Pending</option>
          <option value="approved">✅ Approved</option>
          <option value="declined">❌ Declined</option>
        </select>
        
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-[#0a4d3c]/20 bg-white text-sm"
        >
          <option value="all">All Categories</option>
          {data.categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* SOP List */}
      <div className="p-4 space-y-4">
        {filteredSOPs.map(sop => (
          <div 
            key={sop.id}
            className={`bg-white rounded-xl border-2 overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
              sop.status === 'pending_approval' ? 'border-yellow-400' :
              sop.status === 'approved' ? 'border-green-400' :
              'border-red-400'
            }`}
            onClick={() => setSelectedSOP(sop)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      sop.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' :
                      sop.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {sop.status === 'pending_approval' ? '⏳ Pending' : 
                       sop.status === 'approved' ? '✅ Approved' : '❌ Declined'}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-[#0a4d3c]/10 text-[#0a4d3c]">
                      {sop.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#0a4d3c] mt-2">{sop.name}</h3>
                  <p className="text-sm text-[#0a4d3c]/70 mt-1">{sop.description}</p>
                </div>
                <div className="text-[#d4a84b] text-xl">→</div>
              </div>
              
              {/* Quick Info */}
              <div className="mt-3 flex flex-wrap gap-2">
                {sop.agents.map(agent => (
                  <span key={agent} className="px-2 py-1 bg-[#fdf8e8] rounded text-xs text-[#0a4d3c]">
                    🤖 {agent}
                  </span>
                ))}
                {sop.tools.slice(0, 3).map(tool => (
                  <span key={tool} className="px-2 py-1 bg-[#fdf8e8] rounded text-xs text-[#0a4d3c]">
                    🔧 {tool}
                  </span>
                ))}
                {sop.tools.length > 3 && (
                  <span className="px-2 py-1 bg-[#fdf8e8] rounded text-xs text-[#0a4d3c]">
                    +{sop.tools.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SOP Detail Modal */}
      {selectedSOP && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0a4d3c] text-white p-4 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    selectedSOP.status === 'pending_approval' ? 'bg-yellow-500' :
                    selectedSOP.status === 'approved' ? 'bg-green-500' :
                    'bg-red-500'
                  }`}>
                    {selectedSOP.status === 'pending_approval' ? 'Pending Review' : 
                     selectedSOP.status === 'approved' ? 'Approved' : 'Declined'}
                  </span>
                  <h2 className="text-xl font-bold mt-2">{selectedSOP.name}</h2>
                  <p className="text-white/70 text-sm">{selectedSOP.category}</p>
                </div>
                <button 
                  onClick={() => setSelectedSOP(null)}
                  className="text-white/70 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-[#0a4d3c] mb-2">📝 Description</h3>
                <p className="text-[#0a4d3c]/80">{selectedSOP.description}</p>
              </div>

              {/* Thought Process */}
              <div className="bg-[#fdf8e8] rounded-xl p-4">
                <h3 className="font-semibold text-[#0a4d3c] mb-2">🧠 Thought Process</h3>
                <p className="text-[#0a4d3c]/80 italic">&quot;{selectedSOP.thoughtProcess}&quot;</p>
              </div>

              {/* Triggers */}
              <div>
                <h3 className="font-semibold text-[#0a4d3c] mb-2">⚡ When It Fires</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSOP.triggers.map((trigger, i) => (
                    <span key={i} className="px-3 py-1 bg-[#d4a84b]/20 text-[#0a4d3c] rounded-full text-sm">
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools & Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-[#0a4d3c] mb-2">🔧 Tools</h3>
                  <div className="space-y-1">
                    {selectedSOP.tools.map(tool => (
                      <div key={tool} className="text-sm text-[#0a4d3c]/80">• {tool}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#0a4d3c] mb-2">🎯 Skills</h3>
                  <div className="space-y-1">
                    {selectedSOP.skills.map(skill => (
                      <div key={skill} className="text-sm text-[#0a4d3c]/80 font-mono">• {skill}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Agents */}
              <div>
                <h3 className="font-semibold text-[#0a4d3c] mb-2">🤖 Agents</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSOP.agents.map(agent => (
                    <span key={agent} className="px-3 py-1 bg-[#0a4d3c]/10 text-[#0a4d3c] rounded-full text-sm">
                      {agent}
                    </span>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <h3 className="font-semibold text-[#0a4d3c] mb-2">📋 Process Steps</h3>
                <ol className="space-y-2">
                  {selectedSOP.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#0a4d3c] text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-[#0a4d3c]/80 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Buttons */}
              {selectedSOP.status === 'pending_approval' && (
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleAction(selectedSOP.id, 'approve')}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition"
                  >
                    ✅ Approve
                  </button>
                  <button
                    onClick={() => {
                      const feedback = prompt('Reason for declining (optional):');
                      handleAction(selectedSOP.id, 'decline', feedback || undefined);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition"
                  >
                    ❌ Decline
                  </button>
                </div>
              )}

              {/* Voice Edit Button */}
              <div className="pt-2">
                <button
                  className="w-full bg-[#d4a84b] text-white py-3 rounded-xl font-medium hover:bg-[#d4a84b]/90 transition flex items-center justify-center gap-2"
                  onClick={() => alert('Voice edit feature coming soon! Send a voice note via Telegram with your edits.')}
                >
                  🎤 Voice Edit
                </button>
                <p className="text-xs text-[#0a4d3c]/50 text-center mt-2">
                  Send a voice note to Bubba via Telegram with your corrections
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
