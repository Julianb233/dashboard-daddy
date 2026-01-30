'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import DashboardLayout from '@/components/DashboardLayout';
import { ListTodo, Clock, CheckCircle, XCircle, Plus, Filter, MoreVertical, Edit, Trash2, Share, Archive } from 'lucide-react';

// Dynamic imports for swipeable components (client-only, avoid SSR window errors)
const SwipeableTaskCard = dynamic(
  () => import('@/components/ui/SwipeableCard').then(mod => mod.SwipeableTaskCard),
  { ssr: false }
);
const SwipeableBottomSheet = dynamic(
  () => import('@/components/ui/SwipeableBottomSheet').then(mod => mod.SwipeableBottomSheet),
  { ssr: false }
);
const QuickActionSheet = dynamic(
  () => import('@/components/ui/SwipeableBottomSheet').then(mod => mod.QuickActionSheet),
  { ssr: false }
);
const SwipeableTabs = dynamic(
  () => import('@/components/ui/SwipeableTabs').then(mod => mod.SwipeableTabs),
  { ssr: false }
);

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  result?: string;
}

interface TaskStats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  failed: number;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats>({ total: 0, pending: 0, active: 0, completed: 0, failed: 0 });
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    dueDate: ''
  });

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  async function fetchTasks() {
    const filterAtStart = filter;
    try {
      setLoading(true);
      
      const [tasksResponse, statsResponse] = await Promise.all([
        fetch(filter === 'all' ? '/api/tasks' : `/api/tasks?status=${filter}`),
        fetch('/api/tasks')
      ]);
      
      if (!tasksResponse.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      if (filterAtStart !== filter) return;
      
      const data = await tasksResponse.json();
      setTasks(data);
      
      if (statsResponse.ok) {
        const allTasks: Task[] = await statsResponse.json();
        setTaskStats({
          total: allTasks.length,
          pending: allTasks.filter(t => t.status === 'pending').length,
          active: allTasks.filter(t => t.status === 'active').length,
          completed: allTasks.filter(t => t.status === 'completed').length,
          failed: allTasks.filter(t => t.status === 'failed').length,
        });
      }
    } catch (err) {
      if (filterAtStart === filter) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (filterAtStart === filter) {
        setLoading(false);
      }
    }
  }

  async function createTask() {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          dueDate: newTask.dueDate || null
        })
      });

      if (!response.ok) throw new Error('Failed to create task');

      await fetchTasks();
      setShowNewTask(false);
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  }

  async function updateTaskStatus(taskId: string, newStatus: Task['status']) {
    try {
      const response = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }

  async function deleteTask(taskId: string) {
    // Optimistic UI update
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      fetchTasks(); // Revert on error
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-500/20 text-red-400';
      case 'high': return 'bg-orange-500/20 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Task card component with swipe
  const TaskCard = ({ task }: { task: Task }) => (
    <SwipeableTaskCard
      onComplete={() => updateTaskStatus(task.id, 'completed')}
      onDelete={() => deleteTask(task.id)}
      className="mb-3"
    >
      <div 
        className="p-4"
        onClick={() => {
          setSelectedTask(task);
          setShowQuickActions(true);
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-white flex-1">{task.title}</h3>
          <div className="flex gap-2">
            <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
        </div>
        
        {task.description && (
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{task.description}</p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span>{task.assignedAgent}</span>
          </div>
          {task.dueDate && <span>Due: {formatDate(task.dueDate)}</span>}
        </div>
        
        {/* Swipe hint */}
        <div className="mt-2 text-xs text-gray-600 text-center">
          ← Swipe to delete | Swipe to complete →
        </div>
      </div>
    </SwipeableTaskCard>
  );

  // Filter tasks by status for tabs
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const activeTasks = tasks.filter(t => t.status === 'active');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  const tabs = [
    {
      id: 'all',
      label: 'All',
      icon: <ListTodo className="w-4 h-4" />,
      badge: taskStats.total,
      content: (
        <div className="py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No tasks yet</p>
              <p className="text-sm mt-1">Swipe cards to complete or delete</p>
            </div>
          ) : (
            tasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ),
    },
    {
      id: 'pending',
      label: 'Pending',
      icon: <Clock className="w-4 h-4" />,
      badge: taskStats.pending,
      content: (
        <div className="py-4">
          {pendingTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No pending tasks</div>
          ) : (
            pendingTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ),
    },
    {
      id: 'active',
      label: 'Active',
      icon: <ListTodo className="w-4 h-4" />,
      badge: taskStats.active,
      content: (
        <div className="py-4">
          {activeTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No active tasks</div>
          ) : (
            activeTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ),
    },
    {
      id: 'completed',
      label: 'Done',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: taskStats.completed,
      content: (
        <div className="py-4">
          {completedTasks.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No completed tasks</div>
          ) : (
            completedTasks.map(task => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-white">Tasks</h1>
          <button 
            onClick={() => setShowNewTask(true)}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-300">×</button>
          </div>
        )}

        {/* Swipeable Tabs */}
        <div className="flex-1 min-h-0">
          <SwipeableTabs
            tabs={tabs}
            defaultTab="all"
            variant="pills"
            className="h-full"
            onChange={(tabId) => setFilter(tabId)}
          />
        </div>

        {/* Quick Actions Sheet */}
        <QuickActionSheet
          isOpen={showQuickActions}
          onClose={() => {
            setShowQuickActions(false);
            setSelectedTask(null);
          }}
          title={selectedTask?.title}
          actions={[
            {
              icon: <Edit className="w-5 h-5" />,
              label: 'Edit',
              onClick: () => console.log('Edit', selectedTask?.id),
            },
            {
              icon: <CheckCircle className="w-5 h-5" />,
              label: 'Complete',
              onClick: () => selectedTask && updateTaskStatus(selectedTask.id, 'completed'),
            },
            {
              icon: <Archive className="w-5 h-5" />,
              label: 'Archive',
              onClick: () => console.log('Archive', selectedTask?.id),
            },
            {
              icon: <Trash2 className="w-5 h-5" />,
              label: 'Delete',
              onClick: () => selectedTask && deleteTask(selectedTask.id),
              variant: 'danger',
            },
          ]}
        />

        {/* New Task Bottom Sheet */}
        <SwipeableBottomSheet
          isOpen={showNewTask}
          onClose={() => setShowNewTask(false)}
          title="Create New Task"
          snapPoints={[60, 85]}
          initialSnap={1}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Title *</label>
              <input
                type="text"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Task title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                rows={3}
                placeholder="Task description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={createTask}
              disabled={!newTask.title.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Create Task
            </button>
          </div>
        </SwipeableBottomSheet>
      </div>
    </DashboardLayout>
  );
}
