'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { useKanbanTasks } from '@/hooks/useKanbanTasks';

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
}

export function KanbanBoard() {
  const { tasks, loading, error, updateTaskStatus } = useKanbanTasks();
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columns = [
    { id: 'todo', title: 'To Do', color: 'blue' },
    { id: 'in_progress', title: 'In Progress', color: 'orange' },
    { id: 'done', title: 'Done', color: 'green' },
    { id: 'archived', title: 'Archived', color: 'gray', collapsible: true },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const activeTask = tasks.find(task => task.id === activeId);
    if (!activeTask) return;

    // Determine the new status based on the drop target
    let newStatus: TaskStatus;
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '') as TaskStatus;
    } else {
      // If dropped on another task, get that task's status
      const targetTask = tasks.find(task => task.id === overId);
      newStatus = targetTask?.status || activeTask.status;
    }

    // Update the task status
    if (activeTask.status !== newStatus) {
      updateTaskStatus(activeId, newStatus);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 mb-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 mb-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error loading tasks: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 mb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-6 h-full">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id as TaskStatus);
            const isCollapsible = column.collapsible;
            const isExpanded = !isCollapsible || (isCollapsible && isArchivedExpanded);

            return (
              <div key={column.id} className="flex flex-col h-full">
                <KanbanColumn
                  id={column.id}
                  title={column.title}
                  color={column.color}
                  count={columnTasks.length}
                  isCollapsible={isCollapsible}
                  isExpanded={isExpanded}
                  onToggle={() => {
                    if (isCollapsible) {
                      setIsArchivedExpanded(!isArchivedExpanded);
                    }
                  }}
                >
                  {isExpanded && (
                    <SortableContext
                      items={columnTasks.map(task => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {columnTasks.map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            color={column.color}
                            columnId={column.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  )}
                </KanbanColumn>
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
}