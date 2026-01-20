import {
  Task,
  TaskBoard,
  TaskFiltersState,
  TaskApiResponse,
  MoveTaskPayload,
  TaskStatus,
  Agent,
} from '@/types/task';

// const VIBE_KANBAN_URL = process.env.NEXT_PUBLIC_VIBE_KANBAN_URL || 'http://localhost:3000';

// Mock data for development
const mockAgents: Agent[] = [
  { id: 'agent-1', name: 'Claude', avatar: undefined },
  { id: 'agent-2', name: 'GPT-4', avatar: undefined },
  { id: 'agent-3', name: 'Gemini', avatar: undefined },
];

const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system',
    status: 'in_progress',
    priority: 'high',
    assignedAgent: mockAgents[0],
    labels: [
      { id: 'label-1', name: 'backend', color: '#3b82f6' },
      { id: 'label-2', name: 'security', color: '#ef4444' },
    ],
    dueDate: '2026-01-25',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-19T14:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Design dashboard layout',
    description: 'Create responsive dashboard with metrics widgets',
    status: 'review',
    priority: 'medium',
    assignedAgent: mockAgents[1],
    labels: [
      { id: 'label-3', name: 'frontend', color: '#10b981' },
      { id: 'label-4', name: 'design', color: '#8b5cf6' },
    ],
    dueDate: '2026-01-22',
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-18T16:45:00Z',
  },
  {
    id: 'task-3',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated deployment',
    status: 'backlog',
    priority: 'medium',
    assignedAgent: undefined,
    labels: [{ id: 'label-5', name: 'devops', color: '#f59e0b' }],
    dueDate: '2026-01-30',
    createdAt: '2026-01-16T11:00:00Z',
    updatedAt: '2026-01-16T11:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description: 'Document all REST endpoints using OpenAPI spec',
    status: 'backlog',
    priority: 'low',
    assignedAgent: mockAgents[2],
    labels: [{ id: 'label-6', name: 'docs', color: '#6b7280' }],
    dueDate: undefined,
    createdAt: '2026-01-17T08:00:00Z',
    updatedAt: '2026-01-17T08:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Fix memory leak in worker process',
    description: 'Investigate and resolve memory leak causing OOM errors',
    status: 'in_progress',
    priority: 'urgent',
    assignedAgent: mockAgents[0],
    labels: [
      { id: 'label-1', name: 'backend', color: '#3b82f6' },
      { id: 'label-7', name: 'bug', color: '#dc2626' },
    ],
    dueDate: '2026-01-20',
    createdAt: '2026-01-19T06:00:00Z',
    updatedAt: '2026-01-19T12:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Add unit tests for auth module',
    description: 'Achieve 80% code coverage for authentication',
    status: 'done',
    priority: 'medium',
    assignedAgent: mockAgents[1],
    labels: [
      { id: 'label-8', name: 'testing', color: '#14b8a6' },
      { id: 'label-2', name: 'security', color: '#ef4444' },
    ],
    dueDate: '2026-01-18',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-18T15:00:00Z',
  },
  {
    id: 'task-7',
    title: 'Optimize database queries',
    description: 'Add indexes and optimize slow queries',
    status: 'done',
    priority: 'high',
    assignedAgent: mockAgents[2],
    labels: [
      { id: 'label-1', name: 'backend', color: '#3b82f6' },
      { id: 'label-9', name: 'performance', color: '#f97316' },
    ],
    dueDate: '2026-01-17',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-17T11:00:00Z',
  },
  {
    id: 'task-8',
    title: 'Implement real-time notifications',
    description: 'WebSocket-based notification system',
    status: 'review',
    priority: 'high',
    assignedAgent: mockAgents[0],
    labels: [
      { id: 'label-3', name: 'frontend', color: '#10b981' },
      { id: 'label-1', name: 'backend', color: '#3b82f6' },
    ],
    dueDate: '2026-01-24',
    createdAt: '2026-01-13T14:00:00Z',
    updatedAt: '2026-01-19T09:00:00Z',
  },
];

// Track tasks in memory for mock mutations
const tasksStore = [...mockTasks];

export async function fetchTasks(filters?: TaskFiltersState): Promise<TaskApiResponse> {
  // TODO: Replace with actual API call to Vibe Kanban
  // const response = await fetch(`${VIBE_KANBAN_URL}/api/tasks`, {
  //   method: 'GET',
  //   headers: { 'Content-Type': 'application/json' },
  // });
  // return response.json();

  // Mock implementation with filtering
  let filteredTasks = [...tasksStore];

  if (filters?.agentId) {
    filteredTasks = filteredTasks.filter(
      (task) => task.assignedAgent?.id === filters.agentId
    );
  }

  if (filters?.priority) {
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === filters.priority
    );
  }

  if (filters?.status) {
    filteredTasks = filteredTasks.filter(
      (task) => task.status === filters.status
    );
  }

  if (filters?.dateRange) {
    filteredTasks = filteredTasks.filter((task) => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      const start = new Date(filters.dateRange!.start);
      const end = new Date(filters.dateRange!.end);
      return dueDate >= start && dueDate <= end;
    });
  }

  return {
    tasks: filteredTasks,
    total: filteredTasks.length,
    page: 1,
    pageSize: 50,
  };
}

export async function fetchTaskBoard(filters?: TaskFiltersState): Promise<TaskBoard> {
  const { tasks } = await fetchTasks(filters);

  const columns: Record<TaskStatus, Task[]> = {
    backlog: [],
    in_progress: [],
    review: [],
    done: [],
  };

  tasks.forEach((task) => {
    columns[task.status].push(task);
  });

  return {
    columns: [
      { id: 'backlog', title: 'Backlog', tasks: columns.backlog },
      { id: 'in_progress', title: 'In Progress', tasks: columns.in_progress },
      { id: 'review', title: 'Review', tasks: columns.review },
      { id: 'done', title: 'Done', tasks: columns.done },
    ],
  };
}

export async function moveTask(payload: MoveTaskPayload): Promise<Task> {
  // TODO: Replace with actual API call to Vibe Kanban
  // const response = await fetch(`${VIBE_KANBAN_URL}/api/tasks/${payload.taskId}/move`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();

  // Mock implementation
  const taskIndex = tasksStore.findIndex((t) => t.id === payload.taskId);
  if (taskIndex === -1) {
    throw new Error(`Task ${payload.taskId} not found`);
  }

  const task = tasksStore[taskIndex];
  const updatedTask: Task = {
    ...task,
    status: payload.destinationStatus,
    updatedAt: new Date().toISOString(),
  };

  tasksStore[taskIndex] = updatedTask;
  return updatedTask;
}

export async function fetchAgents(): Promise<Agent[]> {
  // TODO: Replace with actual API call
  // const response = await fetch(`${VIBE_KANBAN_URL}/api/agents`);
  // return response.json();

  return mockAgents;
}

export function getColumnTitle(status: TaskStatus): string {
  const titles: Record<TaskStatus, string> = {
    backlog: 'Backlog',
    in_progress: 'In Progress',
    review: 'Review',
    done: 'Done',
  };
  return titles[status];
}

export function getPriorityColor(priority: Task['priority']): string {
  const colors: Record<Task['priority'], string> = {
    low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };
  return colors[priority];
}
