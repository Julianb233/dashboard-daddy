import { NextResponse } from 'next/server'

export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'archived';

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: 'low' | 'medium' | 'high';
  assignee?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: KanbanTask[];
  color: string;
}

// Mock kanban board data with realistic sample tasks
const mockTasks: KanbanTask[] = [
  // Todo tasks
  {
    id: 'task_001',
    title: 'Implement user authentication system',
    description: 'Set up JWT-based authentication with refresh tokens and role-based access control',
    status: 'todo',
    priority: 'high',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['security', 'auth', 'backend']
  },
  {
    id: 'task_002',
    title: 'Design mobile-responsive dashboard',
    description: 'Create responsive layouts that work seamlessly across desktop, tablet, and mobile devices',
    status: 'todo',
    priority: 'medium',
    assignee: 'Claude',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['design', 'frontend', 'mobile']
  },
  {
    id: 'task_003',
    title: 'Set up database migrations',
    description: 'Create migration scripts for production deployment',
    status: 'todo',
    priority: 'medium',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    tags: ['database', 'deployment']
  },
  
  // In Progress tasks
  {
    id: 'task_004',
    title: 'Integrate WebSocket real-time features',
    description: 'Add real-time updates for terminal outputs and agent status changes',
    status: 'in_progress',
    priority: 'high',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    tags: ['websockets', 'realtime', 'backend']
  },
  {
    id: 'task_005',
    title: 'Optimize API response times',
    description: 'Profile and optimize database queries, add caching layer for frequently accessed data',
    status: 'in_progress',
    priority: 'medium',
    assignee: 'Claude',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    tags: ['performance', 'optimization', 'caching']
  },
  
  // Done tasks
  {
    id: 'task_006',
    title: 'Implement theme consistency across components',
    description: 'Apply Wizard of AI color scheme throughout the application',
    status: 'done',
    priority: 'medium',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutes ago
    tags: ['design', 'theming', 'ui']
  },
  {
    id: 'task_007',
    title: 'Set up project structure and dependencies',
    description: 'Initialize Next.js project with TypeScript, Tailwind, and required packages',
    status: 'done',
    priority: 'high',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    tags: ['setup', 'dependencies', 'infrastructure']
  },
  {
    id: 'task_008',
    title: 'Create reusable UI component library',
    description: 'Build modular components for buttons, forms, cards, and navigation elements',
    status: 'done',
    priority: 'medium',
    assignee: 'Claude',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    tags: ['components', 'ui', 'reusable']
  },
  {
    id: 'task_009',
    title: 'Configure development environment',
    description: 'Set up ESLint, Prettier, and development scripts',
    status: 'done',
    priority: 'low',
    assignee: 'Bubba',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    tags: ['development', 'tooling', 'config']
  },

  // Archived tasks
  {
    id: 'task_010',
    title: 'Research competitor analysis',
    description: 'Analyze similar dashboard solutions and identify key differentiators',
    status: 'archived',
    priority: 'low',
    assignee: 'Claude',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    tags: ['research', 'analysis']
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    // Group tasks by status
    const columns: KanbanColumn[] = [
      {
        id: 'todo',
        title: 'To Do',
        status: 'todo',
        color: 'blue',
        tasks: mockTasks.filter(task => task.status === 'todo')
      },
      {
        id: 'in_progress',
        title: 'In Progress',
        status: 'in_progress',
        color: 'orange',
        tasks: mockTasks.filter(task => task.status === 'in_progress')
      },
      {
        id: 'done',
        title: 'Done',
        status: 'done',
        color: 'green',
        tasks: mockTasks.filter(task => task.status === 'done')
      },
      {
        id: 'archived',
        title: 'Archived',
        status: 'archived',
        color: 'gray',
        tasks: mockTasks.filter(task => task.status === 'archived')
      }
    ];

    const summary = {
      totalTasks: mockTasks.length,
      todoCount: columns[0].tasks.length,
      inProgressCount: columns[1].tasks.length,
      doneCount: columns[2].tasks.length,
      archivedCount: columns[3].tasks.length,
      highPriorityTasks: mockTasks.filter(task => task.priority === 'high').length,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        columns,
        tasks: mockTasks,
        summary
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching kanban data:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch kanban data',
      data: {
        columns: [],
        tasks: [],
        summary: {
          totalTasks: 0,
          todoCount: 0,
          inProgressCount: 0,
          doneCount: 0,
          archivedCount: 0,
          highPriorityTasks: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    }, { status: 500 });
  }
}