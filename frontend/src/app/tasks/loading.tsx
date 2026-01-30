import DashboardLayout from '@/components/DashboardLayout'
import { TaskListSkeleton } from '@/components/ui/Skeleton'

export default function TasksLoading() {
  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <div className="h-8 w-24 bg-wizard-medium/20 rounded animate-pulse" />
          <div className="h-10 w-10 bg-wizard-medium/20 rounded animate-pulse" />
        </div>
        
        {/* Filter tabs skeleton */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-wizard-medium/20 rounded-lg animate-pulse" />
          ))}
        </div>
        
        <TaskListSkeleton count={8} />
      </div>
    </DashboardLayout>
  )
}
