'use client';

import { useState, useMemo } from 'react';
import { AgentCard } from './AgentCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Agent, AgentStatus } from '@/types/agent';
import { Search, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AgentGridProps {
  agents: Agent[];
  onStart?: (agentId: string) => void;
  onStop?: (agentId: string) => void;
  onRestart?: (agentId: string) => void;
  onViewLogs?: (agentId: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const statusFilters: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'busy', label: 'Busy' },
  { value: 'offline', label: 'Offline' },
];

export function AgentGrid({
  agents,
  onStart,
  onStop,
  onRestart,
  onViewLogs,
  onRefresh,
  isLoading = false,
  className,
}: AgentGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AgentStatus | 'all'>('all');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      // Filter by search query
      const matchesSearch = searchQuery === '' ||
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.type.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by status
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [agents, searchQuery, statusFilter]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: agents.length };
    agents.forEach((agent) => {
      counts[agent.status] = (counts[agent.status] || 0) + 1;
    });
    return counts;
  }, [agents]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Status Filters */}
          <div className="flex items-center gap-1">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="gap-1.5"
              >
                {filter.label}
                <Badge variant="outline" className="px-1.5 py-0 text-xs">
                  {statusCounts[filter.value] || 0}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredAgents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium text-muted-foreground">No agents found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'No agents are currently registered'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onStart={onStart}
              onStop={onStop}
              onRestart={onRestart}
              onViewLogs={onViewLogs}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t">
        <span>
          Showing {filteredAgents.length} of {agents.length} agents
        </span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {statusCounts['online'] || 0} online
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {statusCounts['busy'] || 0} busy
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            {statusCounts['offline'] || 0} offline
          </span>
        </div>
      </div>
    </div>
  );
}

export default AgentGrid;
