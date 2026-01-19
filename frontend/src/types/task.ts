export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assignedAgent?: string;
  createdAt: Date;
  completedAt?: Date;
}
