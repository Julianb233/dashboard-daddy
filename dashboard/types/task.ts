export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'backlog' | 'in_progress' | 'review' | 'done';

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgent?: Agent;
  labels: TaskLabel[];
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskColumn {
  id: TaskStatus;
  title: string;
  tasks: Task[];
}

export interface TaskBoard {
  columns: TaskColumn[];
}

export interface TaskFiltersState {
  agentId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface TaskApiResponse {
  tasks: Task[];
  total: number;
  page: number;
  pageSize: number;
}

export interface MoveTaskPayload {
  taskId: string;
  sourceStatus: TaskStatus;
  destinationStatus: TaskStatus;
  destinationIndex: number;
}
