'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { TaskFilters } from './TaskFilters';
import { TaskBoard as TaskBoardType, TaskFiltersState, TaskStatus } from '@/types/task';
import { fetchTaskBoard, moveTask } from '@/lib/tasks';

export function TaskBoard() {
  const [board, setBoard] = useState<TaskBoardType | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTaskBoard(filters);
      setBoard(data);
    } catch (err) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error loading task board:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!board) return;

    // Optimistically update the UI
    const sourceColumn = board.columns.find((col) => col.id === source.droppableId);
    const destColumn = board.columns.find((col) => col.id === destination.droppableId);

    if (!sourceColumn || !destColumn) return;

    const task = sourceColumn.tasks.find((t) => t.id === draggableId);
    if (!task) return;

    // Create new columns with the moved task
    const newColumns = board.columns.map((column) => {
      if (column.id === source.droppableId) {
        return {
          ...column,
          tasks: column.tasks.filter((t) => t.id !== draggableId),
        };
      }
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks];
        const movedTask = { ...task, status: destination.droppableId as TaskStatus };
        newTasks.splice(destination.index, 0, movedTask);
        return {
          ...column,
          tasks: newTasks,
        };
      }
      return column;
    });

    setBoard({ columns: newColumns });

    // Persist the change
    try {
      await moveTask({
        taskId: draggableId,
        sourceStatus: source.droppableId as TaskStatus,
        destinationStatus: destination.droppableId as TaskStatus,
        destinationIndex: destination.index,
      });
    } catch (err) {
      console.error('Error moving task:', err);
      // Revert on error
      loadBoard();
    }
  };

  const handleFiltersChange = (newFilters: TaskFiltersState) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={loadBoard}
          className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TaskFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {board?.columns.map((column) => (
              <div
                key={column.id}
                className="flex flex-col rounded-lg bg-gray-50 dark:bg-zinc-900"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {column.title}
                  </h3>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-700 dark:bg-zinc-700 dark:text-gray-300">
                    {column.tasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 p-2 min-h-[200px] transition-colors ${
                        snapshot.isDraggingOver
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              <TaskCard
                                task={task}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}

                      {/* Empty State */}
                      {column.tasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="flex items-center justify-center h-20 text-sm text-gray-400 dark:text-gray-500">
                          No tasks
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
}
