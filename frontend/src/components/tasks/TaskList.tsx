'use client';

import { Task } from '@/types/task';
import { CheckCircle, Circle, Loader, XCircle, PlayCircle, Tag } from 'lucide-react';
import useSWR from 'swr';

// Map all possible statuses from API
const statusIcons: Record<string, React.ReactNode> = {
  pending: <Circle className="text-wizard-cream/40" size={18} />,
  active: <PlayCircle className="text-wizard-gold" size={18} />,
  ongoing: <Loader className="text-wizard-gold animate-spin" size={18} />,
  in_progress: <Loader className="text-wizard-gold animate-spin" size={18} />,
  completed: <CheckCircle className="text-green-400" size={18} />,
  failed: <XCircle className="text-red-400" size={18} />,
};

// Category colors
const categoryColors: Record<string, string> = {
  general: 'bg-wizard-medium/30 text-wizard-cream/70',
  work: 'bg-blue-500/20 text-blue-300',
  personal: 'bg-purple-500/20 text-purple-300',
  health: 'bg-green-500/20 text-green-300',
  finance: 'bg-yellow-500/20 text-yellow-300',
  learning: 'bg-orange-500/20 text-orange-300',
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TaskList() {
  const { data: tasks, error } = useSWR<Task[]>('/api/tasks', fetcher, {
    refreshInterval: 3000,
  });

  if (error) return <div className="text-red-400">Failed to load tasks</div>;
  if (!tasks || !Array.isArray(tasks)) return <div className="text-wizard-cream/60">Loading tasks...</div>;

  return (
    <div className="space-y-2">
      {tasks.slice(0, 10).map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 bg-wizard-dark/50 border border-wizard-medium/20 rounded-lg hover:border-wizard-gold/30 transition-colors"
        >
          {statusIcons[task.status] || <Circle className="text-wizard-cream/40" size={18} />}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-wizard-cream truncate">{task.title || 'Untitled Task'}</p>
            <div className="flex items-center gap-2 mt-1">
              {task.category && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[task.category] || categoryColors.general}`}>
                  {task.category}
                </span>
              )}
              {task.assignedAgent && (
                <span className="text-xs text-wizard-cream/40">Agent: {task.assignedAgent}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
