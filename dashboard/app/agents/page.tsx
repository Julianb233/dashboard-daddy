import { Suspense } from 'react';
import { getAgents, getStatusLabel } from '@/lib/agents';
import { AgentCard } from '@/components/agents/agent-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentStatus } from '@/types/agent';

interface AgentsPageProps {
  searchParams: Promise<{ status?: string }>;
}

const STATUS_FILTERS: { value: AgentStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'online', label: 'Online' },
  { value: 'busy', label: 'Busy' },
  { value: 'offline', label: 'Offline' },
];

async function AgentsList({ status }: { status?: AgentStatus }) {
  const agents = await getAgents(status);

  if (agents.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <p className="text-muted-foreground text-center py-8">
            {status
              ? `No agents with status "${getStatusLabel(status)}" found.`
              : 'No agents configured yet. Add your first agent to get started.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as AgentStatus | undefined;
  const isValidStatus = statusFilter && ['online', 'busy', 'offline'].includes(statusFilter);
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

        {/* Agent Stats Summary */}
        <div className="flex items-center gap-4 text-sm">
          <Suspense fallback={<span className="text-muted-foreground">Loading stats...</span>}>
            <AgentStats />
          </Suspense>
        </div>

        {/* Agents Grid */}
        <Suspense fallback={<AgentsGridSkeleton />}>
          <AgentsList status={activeStatus} />
        </Suspense>
      </div>
    </div>
  );
}

async function AgentStats() {
  const agents = await getAgents();
  const online = agents.filter((a) => a.status === 'online').length;
  const busy = agents.filter((a) => a.status === 'busy').length;
  const offline = agents.filter((a) => a.status === 'offline').length;

  return (
    <>
      <div className="flex items-center gap-2">
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
          {online} Online
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-0">
          {busy} Busy
        </Badge>
      </div>
      {offline > 0 && (
        <div className="flex items-center gap-2">
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-0">
            {offline} Offline
          </Badge>
        </div>
      )}
      <span className="text-muted-foreground">
        {agents.length} total agents
      </span>
    </>
  );
}

function AgentsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border bg-card shadow-sm p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div>
                <div className="h-5 w-24 bg-muted rounded mb-2" />
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            </div>
            <div className="h-6 w-16 bg-muted rounded-full" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded" />
            <div className="h-4 w-3/4 bg-muted rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
