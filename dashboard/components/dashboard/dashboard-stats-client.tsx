'use client';

import { useAgents } from '@/hooks/use-agents';
import { useProjects } from '@/hooks/use-projects';
import { StatsCard } from '@/components/dashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot, CheckCircle2, FolderKanban } from 'lucide-react';

export function DashboardStatsClient() {
  const { agents, isLoading: agentsLoading } = useAgents({ pollInterval: 5000 });
  const { projects, isLoading: projectsLoading } = useProjects({ pollInterval: 30000 });

  const isLoading = agentsLoading || projectsLoading;

  if (isLoading && agents.length === 0 && projects.length === 0) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate stats from real data
  const runningAgents = agents.filter(
    (a) => a.status === 'running' || a.status === 'busy'
  ).length;

  const totalAgents = agents.length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatsCard
        icon={Bot}
        label="Running Agents"
        value={runningAgents}
      />
      <StatsCard
        icon={CheckCircle2}
        label="Total Agents"
        value={totalAgents}
      />
      <StatsCard
        icon={FolderKanban}
        label="Projects"
        value={projects.length}
      />
    </div>
  );
}

export default DashboardStatsClient;
