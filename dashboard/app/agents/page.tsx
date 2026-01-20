import { Button } from '@/components/ui/button';
import { AgentsListClient, AgentStatsClient } from '@/components/agents/agents-list-client';
import type { AgentStatus } from '@/types/agent';

interface AgentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'idle', label: 'Idle' },
  { value: 'offline', label: 'Offline' },
];

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as AgentStatus | undefined;
  const validStatuses = ['running', 'idle', 'offline', 'busy', 'error'];
  const isValidStatus = statusFilter && validStatuses.includes(statusFilter);
  const activeStatus = isValidStatus ? statusFilter : undefined;

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
            <p className="text-muted-foreground">
              Manage and monitor your AI agents.
            </p>
          </div>
          <Button>Add Agent</Button>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((filter) => {
              const isActive =
                (filter.value === 'all' && !activeStatus) ||
                filter.value === activeStatus;

              return (
                <a
                  key={filter.value}
                  href={
                    filter.value === 'all'
                      ? '/agents'
                      : `/agents?status=${filter.value}`
                  }
                >
                  <Button
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                  >
                    {filter.label}
                  </Button>
                </a>
              );
            })}
          </div>
        </div>

        {/* Agent Stats Summary - Client component with polling */}
        <div className="flex items-center gap-4 text-sm">
          <AgentStatsClient />
        </div>

        {/* Agents Grid - Client component with polling */}
        <AgentsListClient statusFilter={activeStatus} />
      </div>
    </div>
  );
}
