import { Button } from '@/components/ui/button';

export default function AgentsLoading() {
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
          <Button disabled>Add Agent</Button>
        </div>

        {/* Status Filters Skeleton */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Filter:</span>
          <div className="flex gap-1">
            {['All', 'Online', 'Busy', 'Offline'].map((label) => (
              <div
                key={label}
                className="h-8 px-3 rounded-md bg-muted animate-pulse flex items-center justify-center"
              >
                <span className="opacity-0">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="flex items-center gap-4 text-sm">
          <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded-full animate-pulse" />
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </div>

        {/* Agent Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl border bg-card shadow-sm p-6 animate-pulse"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div>
                    {/* Name */}
                    <div className="h-5 w-24 bg-muted rounded mb-2" />
                    {/* Type */}
                    <div className="h-4 w-16 bg-muted rounded" />
                  </div>
                </div>
                {/* Status Badge */}
                <div className="h-6 w-16 bg-muted rounded-full" />
              </div>

              {/* Card Content */}
              <div className="space-y-3">
                {/* Current Task */}
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-4 w-full bg-muted rounded" />
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-16 bg-muted rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
