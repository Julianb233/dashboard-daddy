import DashboardLayout from '@/components/DashboardLayout'
import { Skeleton, AgentCardSkeleton } from '@/components/ui/Skeleton'

export default function AgentArmyLoading() {
  return (
    <DashboardLayout>
      <div className="min-h-screen">
        {/* Header skeleton */}
        <div className="bg-gradient-to-r from-wizard-emerald to-wizard-gold/20 p-6 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-10 w-48 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Commander skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-40 mb-4" />
          <div className="p-6 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="ml-auto">
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Squads skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30">
              <Skeleton className="h-6 w-36 mb-4" />
              <div className="space-y-3">
                <AgentCardSkeleton />
                <AgentCardSkeleton />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
