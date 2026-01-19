import { Suspense } from 'react';
import { AgentMetrics } from '@/components/agents/AgentMetrics';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Metrics | Dashboard Daddy',
  description: 'Agent performance metrics and analytics',
};

function MetricsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex gap-1">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <Skeleton className="h-5 w-40 mb-1" />
            <Skeleton className="h-4 w-56 mb-4" />
            <Skeleton className="h-[250px] w-full" />
          </div>
        ))}
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      </div>
    </div>
  );
}

export default function MetricsPage() {
  return (
    <div className="container py-6">
      <Suspense fallback={<MetricsSkeleton />}>
        <AgentMetrics />
      </Suspense>
    </div>
  );
}
