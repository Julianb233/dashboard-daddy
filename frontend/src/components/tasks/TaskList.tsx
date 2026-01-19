'use client';

import { Task, TaskStatus } from '@/types/task';
import { CheckCircle, Circle, Loader, XCircle } from 'lucide-react';
import useSWR from 'swr';

const statusIcons: Record<TaskStatus, React.ReactNode> = {
  pending: <Circle className="text-gray-400" size={18} />,
  in_progress: <Loader className="text-blue-400 animate-spin" size={18} />,
  completed: <CheckCircle className="text-green-400" size={18} />,
  failed: <XCircle className="text-red-400" size={18} />,
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function TaskList() {
  const { data: tasks, error } = useSWR<Task[]>('/api/tasks', fetcher, {
    refreshInterval: 3000,
  });

  if (error) return <div className="text-red-400">Failed to load tasks</div>;
  if (!tasks) return <div className="text-gray-400">Loading tasks...</div>;

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center gap-3 p-3 bg-gray-900 border border-gray-800 rounded-lg"
        >
          {statusIcons[task.status]}
          <div className="flex-1">
            <p className="font-medium">{task.title}</p>
            {task.assignedAgent && (
              <p className="text-xs text-gray-400">Agent: {task.assignedAgent}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
