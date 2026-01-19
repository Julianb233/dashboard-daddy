'use client';

import { Task } from '@/types/task';
import { getPriorityColor } from '@/lib/tasks';

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function TaskCard({ task, isDragging }: TaskCardProps) {
  const priorityClasses = getPriorityColor(task.priority);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      className={`
        rounded-lg border bg-white p-3 shadow-sm transition-shadow
        dark:bg-zinc-800 dark:border-zinc-700
        ${isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:shadow-md'}
      `}
    >
      {/* Priority Badge */}
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${priorityClasses}`}
        >
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        {task.dueDate && (
          <span
            className={`text-xs ${
              isOverdue
                ? 'text-red-600 dark:text-red-400'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isOverdue && '! '}
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
        {task.title}
      </h4>

      {/* Labels */}
      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center rounded px-1.5 py-0.5 text-xs"
              style={{
                backgroundColor: `${label.color}20`,
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Assigned Agent */}
      {task.assignedAgent && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-700">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-medium text-white">
            {task.assignedAgent.name.charAt(0)}
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {task.assignedAgent.name}
          </span>
        </div>
      )}
    </div>
  );
}
