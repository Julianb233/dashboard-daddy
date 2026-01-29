'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Task {
  id: string;
  title: string;
  created_at: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TaskCardProps {
  task: Task;
  color: string;
}

export function TaskCard({ task, color }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const cardColors: Record<string, string> = {
    blue: 'bg-blue-800/80 hover:bg-blue-700',
    orange: 'bg-orange-700/80 hover:bg-orange-600',
    green: 'bg-green-700/80 hover:bg-green-600',
    gray: 'bg-gray-700/80 hover:bg-gray-600',
  };

  const priorityColors: Record<string, string> = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-blue-500',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-3 rounded-lg cursor-grab active:cursor-grabbing ${cardColors[color]} transition-all shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="font-medium text-white text-sm flex-1">{task.title}</div>
        {task.priority && (
          <span className={`w-2 h-2 rounded-full ${priorityColors[task.priority]} ml-2 mt-1`} />
        )}
      </div>
      <div className="text-xs text-gray-300 mt-2">
        {new Date(task.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        })}
      </div>
    </div>
  );
}
