'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { AgentCard } from '@/components/agents/AgentCard'
import { Agent, AgentAction } from '@/types/agent'

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'running' | 'stopped'>('all');

  // Fetch agents
  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) throw new Error('Failed to fetch agents');
      const data = await res.json();
      setAgents(data.agents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    // Poll every 5 seconds
    const interval = setInterval(fetchAgents, 5000);
    return () => clearInterval(interval);
  }, []);

  // Handle agent actions
  const handleAgentAction = async (agentId: string, action: AgentAction) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error('Action failed');

      // Refresh agents after action
      await fetchAgents();
    } catch (err) {
      console.error('Agent action failed:', err);
    }
  };

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    if (filter === 'running') return agent.status === 'running' || agent.status === 'idle';
    if (filter === 'stopped') return agent.status === 'stopped' || agent.status === 'error';
    return true;
  });

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Agents</h1>
            <p className="text-gray-500 mt-1">Manage your AI coding agents</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Filter */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['all', 'running', 'stopped'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Agents"
            value={agents.length}
            color="blue"
          />
          <StatCard
            label="Running"
            value={agents.filter(a => a.status === 'running').length}
            color="green"
          />
          <StatCard
            label="Idle"
            value={agents.filter(a => a.status === 'idle').length}
            color="yellow"
          />
          <StatCard
            label="Errors"
            value={agents.filter(a => a.status === 'error').length}
            color="red"
          />
        </div>

        {/* Loading/Error states */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading agents...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchAgents}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Agent Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onAction={(action) => handleAgentAction(agent.id, action)}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredAgents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No agents match the current filter</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Stat card component
function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    red: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <div className={`rounded-lg border p-4 ${colors[color as keyof typeof colors]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm opacity-80">{label}</p>
    </div>
  );
}
