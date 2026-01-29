'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, AlertTriangle, Clock, CheckCircle, User } from 'lucide-react';
import { Task } from './KanbanBoard';

interface TaskCardProps {
  task: Task;
  color: string;
  columnId: string;
}

export function TaskCard({ task, color, columnId }: TaskCardProps) {
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
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle size={14} className="text-red-400" />;
      case 'medium':
        return <Clock size={14} className="text-yellow-400" />;
      case 'low':
        return <Clock size={14} className="text-green-400" />;
      default:
        return null;
    }
  };

  const getCardBorderColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-l-blue-400';
      case 'orange':
        return 'border-l-orange-400';
      case 'green':
        return 'border-l-green-400';
      case 'gray':
        return 'border-l-gray-400';
      default:
        return 'border-l-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const isDoneColumn = columnId === 'done';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-gray-900 border-l-4 ${getCardBorderColor(color)} rounded-r-lg p-4 
        cursor-grab active:cursor-grabbing
        hover:bg-gray-800 transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        shadow-lg relative
      `}
    >
      {/* Checkmark for Done column */}
      {isDoneColumn && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-green-500 rounded-full p-1">
            <CheckCircle size={16} className="text-white" />
          </div>
        </div>
      )}

      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-white flex-1 mr-2">
          {task.title}
        </h4>
        {task.priority && (
          <div className="flex items-center gap-1">
            {getPriorityIcon(task.priority)}
          </div>
        )}
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Footer */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>{formatDate(task.created_at)}</span>
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
              {task.assignee.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Drag Handle Indicator */}
      <div className="mt-2 flex justify-center">
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}