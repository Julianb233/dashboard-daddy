'use client';

import { useDroppable } from '@dnd-kit/core';
import { ReactNode } from 'react';

interface KanbanColumnProps {
  id: string;
  title: string;
  color: string;
  count: number;
  isCollapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
}

export function KanbanColumn({ 
  id, 
  title, 
  color, 
  count, 
  isCollapsible, 
  isExpanded = true,
  onToggle,
  children 
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${id}` });

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-600',
    orange: 'border-orange-600',
    green: 'border-green-600',
    gray: 'border-gray-600',
  };

  const headerColors: Record<string, string> = {
    blue: 'text-blue-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    gray: 'text-gray-400',
  };

  const icons: Record<string, string> = {
    todo: '📋',
    in_progress: '⚡',
    done: '✅',
    archived: '📦',
  };

  return (
    <div 
      className={`flex flex-col rounded-lg border-2 ${colorClasses[color]} bg-gray-900/50 h-full transition-colors ${isOver ? 'border-opacity-100' : 'border-opacity-50'}`}
    >
      <div 
        className={`p-3 border-b border-gray-700 ${headerColors[color]} font-semibold flex items-center justify-between cursor-pointer`}
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          {icons[id]} {title}
        </span>
        <span className="text-sm bg-gray-800 px-2 py-0.5 rounded">
          {count}
          {isCollapsible && (
            <span className="ml-2">{isExpanded ? '▼' : '▶'}</span>
          )}
        </span>
      </div>
      <div 
        ref={setNodeRef} 
        className={`flex-1 p-2 space-y-2 overflow-y-auto ${!isExpanded ? 'hidden' : ''}`}
      >
        {children}
      </div>
    </div>
  );
}
