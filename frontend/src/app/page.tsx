import { DashboardShell } from '@/components/layout/DashboardShell';
import { AgentGrid } from '@/components/agents/AgentGrid';
import { TaskList } from '@/components/tasks/TaskList';
import { CostTracker } from '@/components/dashboard/CostTracker';
import { RelationshipsWidget } from '@/components/dashboard/RelationshipsWidget';

export default function Home() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Top row: Cost + Relationships */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostTracker />
          <RelationshipsWidget />
        </div>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Active Agents</h2>
          <AgentGrid />
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-4">Task Queue</h2>
          <TaskList />
        </section>
      </div>
    </DashboardShell>
  );
}
