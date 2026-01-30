export type TaskStatus = 'pending' | 'active' | 'ongoing' | 'in_progress' | 'completed' | 'failed';

export type TaskCategory = 'general' | 'work' | 'personal' | 'health' | 'finance' | 'learning';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  category?: TaskCategory;
  assignedAgent?: string;
  createdAt: string;
  updatedAt?: string;
  dueDate?: string;
  completedAt?: string;
  result?: string;
}
