import { DashboardShell } from '@/components/layout/DashboardShell';
import { AgentGrid } from '@/components/agents/AgentGrid';
import { TaskList } from '@/components/tasks/TaskList';

export default function Home() {
  return (
    <DashboardShell>
      <div className="space-y-8">
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
