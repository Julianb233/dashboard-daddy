'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Task, TaskStatus } from '@/components/kanban/KanbanBoard';

export interface DatabaseTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  tags?: string[];
  metadata?: any;
}

export function useKanbanTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert database task to frontend task format
  const convertTask = (dbTask: DatabaseTask): Task => ({
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description,
    status: dbTask.status,
    priority: dbTask.priority,
    assignee: dbTask.assignee,
    created_at: dbTask.created_at,
    updated_at: dbTask.updated_at,
  });

  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('kanban_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const convertedTasks = data?.map(convertTask) || [];
      setTasks(convertedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Update task status (for drag and drop)
  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Optimistically update local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, updated_at: new Date().toISOString() }
            : task
        )
      );
    } catch (err) {
      console.error('Error updating task status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  // Create new task
  const createTask = async (taskData: Partial<Task>) => {
    try {
      const { data, error } = await supabase
        .from('kanban_tasks')
        .insert([{
          title: taskData.title,
          description: taskData.description,
          status: taskData.status || 'todo',
          priority: taskData.priority,
          assignee: taskData.assignee || 'Bubba',
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask = convertTask(data);
      setTasks(prevTasks => [newTask, ...prevTasks]);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    }
  };

  // Delete task
  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('kanban_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchTasks();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('kanban_tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'kanban_tasks' 
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Refetch data on any change
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    tasks,
    loading,
    error,
    updateTaskStatus,
    createTask,
    deleteTask,
    refetch: fetchTasks,
  };
}