# UI Component Specifications

## Overview

This document defines the component architecture for Dashboard Daddy's Next.js frontend. The design follows a composable, type-safe approach using React Server Components where possible, with client components for interactive elements.

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| UI Framework | Next.js 16 + React 19 | App Router, Server Components |
| Styling | Tailwind CSS 4 | Utility-first styling |
| Component Library | shadcn/ui | Pre-built accessible components |
| Icons | Lucide React | Consistent icon set |
| State Management | Zustand | Lightweight global state |
| Server State | TanStack Query (React Query) | Data fetching, caching |
| Real-time | Socket.io or Server-Sent Events | Live agent output streaming |
| Forms | React Hook Form + Zod | Validation and type-safety |

---

## Component Hierarchy

```
app/
├── layout.tsx                    # Root layout with providers
├── page.tsx                      # Dashboard home (redirect)
├── (dashboard)/
│   ├── layout.tsx               # Dashboard shell layout
│   ├── page.tsx                 # Overview/home
│   ├── agents/
│   │   ├── page.tsx             # Agent list/grid view
│   │   └── [agentId]/
│   │       └── page.tsx         # Agent detail view
│   ├── tasks/
│   │   └── page.tsx             # Task queue (Vibe Kanban view)
│   └── settings/
│       └── page.tsx             # Configuration
└── (auth)/
    ├── login/page.tsx
    └── logout/page.tsx

components/
├── layout/
│   ├── DashboardShell.tsx       # Main dashboard wrapper
│   ├── Sidebar.tsx              # Navigation sidebar
│   ├── Header.tsx               # Top header with user info
│   ├── MainContent.tsx          # Content area wrapper
│   └── MobileNav.tsx            # Mobile navigation drawer
├── agents/
│   ├── AgentCard.tsx            # Individual agent display
│   ├── AgentList.tsx            # List view of agents
│   ├── AgentGrid.tsx            # Grid view of agents
│   ├── AgentStatusBadge.tsx     # Status indicator
│   ├── AgentControls.tsx        # Start/stop/restart buttons
│   ├── AgentMetrics.tsx         # Agent performance stats
│   └── AgentDetail.tsx          # Full agent detail panel
├── tasks/
│   ├── TaskCard.tsx             # Individual task display
│   ├── TaskList.tsx             # Scrollable task list
│   ├── TaskFilters.tsx          # Filter/sort controls
│   ├── TaskStatusBadge.tsx      # Task status indicator
│   └── TaskAssignmentSelector.tsx # Agent assignment dropdown
├── monitoring/
│   ├── MetricsCard.tsx          # Single metric display
│   ├── MetricsGrid.tsx          # Grid of metrics
│   ├── OutputStreamViewer.tsx   # Real-time log viewer
│   ├── StatusIndicator.tsx      # Connection/health status
│   └── ActivityFeed.tsx         # Recent activity timeline
└── ui/                          # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── badge.tsx
    ├── dropdown-menu.tsx
    ├── scroll-area.tsx
    ├── tabs.tsx
    └── ... (other shadcn components)
```

---

## Layout Components

### DashboardShell

The root layout wrapper that provides the consistent dashboard structure.

```typescript
// components/layout/DashboardShell.tsx

interface DashboardShellProps {
  children: React.ReactNode;
}

// Structure:
// ┌──────────────────────────────────────────────────────┐
// │ Header (fixed top)                                    │
// ├────────────┬─────────────────────────────────────────┤
// │            │                                         │
// │  Sidebar   │         MainContent                     │
// │  (fixed)   │         (scrollable)                    │
// │            │                                         │
// │            │                                         │
// └────────────┴─────────────────────────────────────────┘

// Tailwind approach:
// - Grid layout: grid grid-cols-[280px_1fr] grid-rows-[64px_1fr]
// - Full height: min-h-screen
// - Dark mode support: dark:bg-zinc-950
```

### Sidebar

Collapsible navigation sidebar with section grouping.

```typescript
// components/layout/Sidebar.tsx

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;        // For notification counts
  children?: NavItem[];           // Nested navigation
}

// Navigation structure:
const navigation: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  {
    label: 'Agents',
    href: '/agents',
    icon: Bot,
    badge: 3,                     // Active agent count
  },
  { label: 'Tasks', href: '/tasks', icon: ListTodo },
  { label: 'Terminal', href: '/terminal', icon: Terminal },
  { label: 'Settings', href: '/settings', icon: Settings },
];

// Tailwind approach:
// - Fixed position: fixed left-0 top-16 h-[calc(100vh-64px)]
// - Width: w-64 (256px) or w-16 (64px) when collapsed
// - Background: bg-zinc-50 dark:bg-zinc-900
// - Border: border-r border-zinc-200 dark:border-zinc-800
// - Transition: transition-all duration-300
```

### Header

Top header with branding, user info, and quick actions.

```typescript
// components/layout/Header.tsx

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

// Slots:
// [Logo/Brand] [Search?] [Spacer] [Status] [Notifications] [User Menu]

// Tailwind approach:
// - Fixed position: fixed top-0 left-0 right-0 h-16 z-50
// - Background: bg-white dark:bg-zinc-950
// - Border: border-b border-zinc-200 dark:border-zinc-800
// - Padding: px-4 md:px-6
// - Flex layout: flex items-center justify-between
```

### MainContent

Scrollable content area wrapper.

```typescript
// components/layout/MainContent.tsx

interface MainContentProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;      // Header action buttons
}

// Tailwind approach:
// - Margin for sidebar: ml-64 (or ml-16 when collapsed)
// - Margin for header: mt-16
// - Padding: p-6 md:p-8
// - Max width: max-w-7xl mx-auto (optional)
// - Overflow: overflow-y-auto
```

---

## Agent Management Components

### AgentCard

Displays individual agent information in a card format.

```typescript
// components/agents/AgentCard.tsx

type AgentType = 'claude-code' | 'gemini-cli' | 'openai-codex';
type AgentStatus = 'running' | 'idle' | 'error' | 'offline';

interface AgentCardProps {
  agent: {
    id: string;
    name: string;                 // "Claude Code"
    type: AgentType;
    status: AgentStatus;
    currentTask?: {
      id: string;
      title: string;
      progress?: number;          // 0-100
    };
    metrics?: {
      tasksCompleted: number;
      uptime: number;             // seconds
      lastActive: Date;
    };
  };
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onClick?: () => void;           // Navigate to detail
}

// Visual structure:
// ┌─────────────────────────────────────┐
// │ [Icon] Agent Name        [Status]   │
// │                                     │
// │ Current Task: Fix login bug         │
// │ [████████████░░░░] 75%              │
// │                                     │
// │ Tasks: 12  │  Uptime: 2h 15m        │
// │                                     │
// │ [Stop] [Restart]        [Details →] │
// └─────────────────────────────────────┘

// Tailwind approach:
// - Card: rounded-lg border bg-card p-4 shadow-sm
// - Hover: hover:shadow-md transition-shadow
// - Status colors: See AgentStatusBadge
```

### AgentList

Vertical list view of agents (for sidebar or compact view).

```typescript
// components/agents/AgentList.tsx

interface AgentListProps {
  agents: Agent[];
  loading?: boolean;
  onAgentSelect?: (agentId: string) => void;
  selectedAgentId?: string;
}

// Tailwind approach:
// - Container: divide-y divide-zinc-200 dark:divide-zinc-800
// - Item: p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer
// - Selected: bg-zinc-100 dark:bg-zinc-800
```

### AgentGrid

Grid layout for dashboard overview.

```typescript
// components/agents/AgentGrid.tsx

interface AgentGridProps {
  agents: Agent[];
  loading?: boolean;
  columns?: 1 | 2 | 3 | 4;        // Responsive override
}

// Tailwind approach:
// - Grid: grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
// - Loading skeleton: animate-pulse bg-zinc-200 dark:bg-zinc-800
```

### AgentStatusBadge

Visual status indicator with color coding.

```typescript
// components/agents/AgentStatusBadge.tsx

interface AgentStatusBadgeProps {
  status: AgentStatus;
  showLabel?: boolean;            // Show text label
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;                // Animated pulse for running
}

// Status colors (Tailwind):
const statusStyles: Record<AgentStatus, string> = {
  running: 'bg-green-500 text-green-50',      // Active, working
  idle: 'bg-blue-500 text-blue-50',           // Ready, waiting
  error: 'bg-red-500 text-red-50',            // Failed, needs attention
  offline: 'bg-zinc-400 text-zinc-50',        // Disconnected
};

// Pulse animation for running:
// animate-pulse (built-in) or custom @keyframes
```

### AgentControls

Action buttons for agent management.

```typescript
// components/agents/AgentControls.tsx

interface AgentControlsProps {
  agentId: string;
  status: AgentStatus;
  onStart: () => void | Promise<void>;
  onStop: () => void | Promise<void>;
  onRestart: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'compact' | 'icon-only';
}

// Button states based on status:
// - running: Stop (enabled), Restart (enabled), Start (disabled)
// - idle: Start (enabled), Stop (disabled), Restart (disabled)
// - error: Start (enabled), Stop (disabled), Restart (enabled)
// - offline: All disabled except reconnect

// Tailwind approach for buttons (using shadcn/ui Button):
// - Primary action: variant="default"
// - Destructive: variant="destructive" (for stop)
// - Icon only: size="icon"
// - Loading: disabled with spinner icon
```

### AgentMetrics

Performance statistics display.

```typescript
// components/agents/AgentMetrics.tsx

interface AgentMetricsProps {
  metrics: {
    tasksCompleted: number;
    tasksInProgress: number;
    tasksFailed: number;
    avgTaskDuration: number;      // seconds
    uptime: number;               // seconds
    tokensUsed?: number;
    lastError?: {
      message: string;
      timestamp: Date;
    };
  };
  period?: '1h' | '24h' | '7d' | '30d';
}

// Tailwind approach:
// - Grid of stat cards: grid grid-cols-2 md:grid-cols-4 gap-4
// - Each stat: flex flex-col p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800
// - Label: text-sm text-zinc-500 dark:text-zinc-400
// - Value: text-2xl font-semibold
```

---

## Task Queue Components

### TaskCard

Individual task display card.

```typescript
// components/tasks/TaskCard.tsx

type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'blocked';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignedAgent?: {
      id: string;
      name: string;
      type: AgentType;
    };
    createdAt: Date;
    updatedAt: Date;
    dueDate?: Date;
    labels?: string[];
    linkedPR?: {
      number: number;
      url: string;
      status: 'open' | 'merged' | 'closed';
    };
  };
  onStatusChange?: (status: TaskStatus) => void;
  onAssign?: (agentId: string) => void;
  onClick?: () => void;
  draggable?: boolean;            // For Kanban drag-drop
}

// Visual structure:
// ┌─────────────────────────────────────┐
// │ [Priority] Task Title    [Status]   │
// │                                     │
// │ Description preview text...         │
// │                                     │
// │ [Label] [Label]                     │
// │                                     │
// │ Agent: Claude Code  │  PR: #123     │
// └─────────────────────────────────────┘

// Priority colors:
const priorityStyles: Record<TaskPriority, string> = {
  low: 'border-l-4 border-l-zinc-400',
  medium: 'border-l-4 border-l-blue-500',
  high: 'border-l-4 border-l-orange-500',
  critical: 'border-l-4 border-l-red-500',
};
```

### TaskList

Scrollable list of tasks with virtualization for performance.

```typescript
// components/tasks/TaskList.tsx

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  emptyMessage?: string;
  onTaskClick?: (taskId: string) => void;
  selectedTaskId?: string;
  groupBy?: 'status' | 'priority' | 'agent' | 'none';
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate';
  sortOrder?: 'asc' | 'desc';
}

// Considerations:
// - Use react-virtual for large lists (100+ tasks)
// - Grouped view with collapsible sections
// - Keyboard navigation support

// Tailwind approach:
// - Container: h-full overflow-y-auto
// - Group header: sticky top-0 bg-white dark:bg-zinc-950 px-4 py-2 font-medium
// - List: space-y-2 p-4
```

### TaskFilters

Filter and sort controls for task list.

```typescript
// components/tasks/TaskFilters.tsx

interface TaskFiltersProps {
  filters: {
    status?: TaskStatus[];
    priority?: TaskPriority[];
    agent?: string[];
    search?: string;
    dateRange?: { from: Date; to: Date };
  };
  onFilterChange: (filters: TaskFiltersProps['filters']) => void;
  onReset?: () => void;
  agentOptions: { id: string; name: string }[];
}

// UI elements:
// - Search input with debounce
// - Multi-select dropdowns for status, priority, agent
// - Date range picker
// - Clear/Reset button

// Tailwind approach:
// - Container: flex flex-wrap gap-3 p-4 border-b
// - Dropdowns: Use shadcn/ui Select or DropdownMenu
// - Search: relative with search icon
```

---

## Monitoring Components

### MetricsCard

Single metric display with optional trend indicator.

```typescript
// components/monitoring/MetricsCard.tsx

interface MetricsCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;                // Percentage change
    direction: 'up' | 'down' | 'neutral';
    label?: string;               // "vs last week"
  };
  loading?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

// Visual structure:
// ┌─────────────────────────────────┐
// │ [Icon]  Title                   │
// │                                 │
// │        42                       │
// │                                 │
// │ ↑ 12% vs last week              │
// └─────────────────────────────────┘

// Tailwind approach:
// - Card: rounded-lg border p-6 bg-card
// - Title: text-sm font-medium text-muted-foreground
// - Value: text-3xl font-bold
// - Trend up: text-green-600 dark:text-green-400
// - Trend down: text-red-600 dark:text-red-400
```

### MetricsGrid

Grid of MetricsCards for overview.

```typescript
// components/monitoring/MetricsGrid.tsx

interface MetricsGridProps {
  metrics: MetricsCardProps[];
  columns?: 2 | 3 | 4;
  loading?: boolean;
}

// Tailwind approach:
// - Grid: grid gap-4 sm:grid-cols-2 lg:grid-cols-4
```

### OutputStreamViewer

Real-time log/output viewer with ANSI color support.

```typescript
// components/monitoring/OutputStreamViewer.tsx

interface OutputStreamViewerProps {
  agentId: string;
  autoScroll?: boolean;           // Scroll to bottom on new content
  maxLines?: number;              // Limit buffer size (default 1000)
  showTimestamps?: boolean;
  showLineNumbers?: boolean;
  filter?: string;                // Regex filter
  onClear?: () => void;
}

// Features:
// - WebSocket/SSE connection for real-time updates
// - ANSI color code parsing (use ansi-to-html or similar)
// - Search within output
// - Copy to clipboard
// - Download as file
// - Pause/Resume streaming

// Tailwind approach:
// - Container: relative h-[400px] rounded-lg border bg-zinc-950
// - Output area: font-mono text-sm p-4 overflow-y-auto
// - Text colors: Various text-* classes for ANSI colors
// - Controls: absolute top-2 right-2 flex gap-2
```

### StatusIndicator

Connection/health status dot with tooltip.

```typescript
// components/monitoring/StatusIndicator.tsx

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

interface StatusIndicatorProps {
  status: ConnectionStatus;
  label?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Sizes:
const sizeStyles = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

// Status colors:
const statusStyles: Record<ConnectionStatus, string> = {
  connected: 'bg-green-500',
  connecting: 'bg-yellow-500 animate-pulse',
  disconnected: 'bg-zinc-400',
  error: 'bg-red-500',
};
```

### ActivityFeed

Timeline of recent system events.

```typescript
// components/monitoring/ActivityFeed.tsx

interface ActivityEvent {
  id: string;
  type: 'task_started' | 'task_completed' | 'task_failed' |
        'agent_started' | 'agent_stopped' | 'pr_created' | 'error';
  title: string;
  description?: string;
  timestamp: Date;
  agent?: { id: string; name: string };
  task?: { id: string; title: string };
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  loading?: boolean;
  maxItems?: number;
  onLoadMore?: () => void;
  filter?: ActivityEvent['type'][];
}

// Tailwind approach:
// - Container: space-y-4
// - Event item: flex gap-4
// - Timeline dot: flex-shrink-0 h-2 w-2 rounded-full mt-2
// - Content: flex-1 min-w-0
// - Timestamp: text-xs text-muted-foreground
```

---

## State Management

### Global State (Zustand)

```typescript
// stores/dashboard.ts

interface DashboardState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Selected items
  selectedAgentId: string | null;
  selectAgent: (id: string | null) => void;

  // View preferences
  agentViewMode: 'list' | 'grid';
  setAgentViewMode: (mode: 'list' | 'grid') => void;

  // Real-time connection
  connectionStatus: ConnectionStatus;
  setConnectionStatus: (status: ConnectionStatus) => void;
}

// stores/agents.ts

interface AgentsState {
  agents: Agent[];
  agentsLoading: boolean;
  agentError: string | null;

  // Actions
  fetchAgents: () => Promise<void>;
  startAgent: (id: string) => Promise<void>;
  stopAgent: (id: string) => Promise<void>;
  restartAgent: (id: string) => Promise<void>;
}

// stores/tasks.ts

interface TasksState {
  tasks: Task[];
  tasksLoading: boolean;
  taskFilters: TaskFilters;

  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskDTO) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  assignTask: (taskId: string, agentId: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
}
```

### Server State (TanStack Query)

```typescript
// hooks/useAgents.ts

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: fetchAgents,
    refetchInterval: 5000,        // Poll every 5 seconds
  });
}

export function useAgent(id: string) {
  return useQuery({
    queryKey: ['agents', id],
    queryFn: () => fetchAgent(id),
    enabled: !!id,
  });
}

export function useAgentMutations() {
  const queryClient = useQueryClient();

  const startAgent = useMutation({
    mutationFn: (id: string) => api.startAgent(id),
    onSuccess: () => queryClient.invalidateQueries(['agents']),
  });

  // ... stop, restart mutations

  return { startAgent, stopAgent, restartAgent };
}

// hooks/useTasks.ts

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });
}

// hooks/useOutputStream.ts

export function useOutputStream(agentId: string) {
  const [lines, setLines] = useState<OutputLine[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/agents/${agentId}/stream`);

    eventSource.onmessage = (event) => {
      const line = JSON.parse(event.data);
      setLines(prev => [...prev.slice(-999), line]);  // Keep last 1000
    };

    return () => eventSource.close();
  }, [agentId]);

  return { lines, clear: () => setLines([]) };
}
```

---

## Tailwind Styling Approach

### Design Tokens

Using CSS custom properties with Tailwind for theming:

```css
/* app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;

    /* Agent status colors */
    --status-running: 142 76% 36%;
    --status-idle: 217 91% 60%;
    --status-error: 0 84% 60%;
    --status-offline: 240 5% 64%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    /* ... dark mode overrides */
  }
}
```

### Component Class Patterns

```typescript
// Consistent patterns using clsx/cn utility

// Card pattern
const cardClasses = cn(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  "transition-all duration-200",
  "hover:shadow-md"
);

// Interactive element pattern
const interactiveClasses = cn(
  "cursor-pointer",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  "disabled:pointer-events-none disabled:opacity-50"
);

// Status indicator pattern
const statusClasses = (status: AgentStatus) => cn(
  "h-2 w-2 rounded-full",
  {
    "bg-green-500": status === "running",
    "bg-blue-500": status === "idle",
    "bg-red-500": status === "error",
    "bg-zinc-400": status === "offline",
  },
  status === "running" && "animate-pulse"
);
```

### Responsive Breakpoints

```typescript
// Standard breakpoint usage
// sm: 640px   - Small tablets, large phones
// md: 768px   - Tablets
// lg: 1024px  - Small laptops
// xl: 1280px  - Desktop
// 2xl: 1536px - Large desktop

// Example responsive pattern
const gridClasses = "grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

// Mobile-first sidebar
const sidebarClasses = cn(
  "fixed inset-y-0 left-0 z-40",
  "w-64 bg-background border-r",
  "transform transition-transform duration-200",
  "lg:translate-x-0",
  collapsed && "-translate-x-full lg:w-16 lg:translate-x-0"
);
```

---

## Recommended Libraries

### Core UI (shadcn/ui)

Install these shadcn/ui components:

```bash
npx shadcn@latest init
npx shadcn@latest add button card badge dropdown-menu scroll-area tabs \
  select input label dialog sheet tooltip avatar separator skeleton
```

### Additional Dependencies

```json
{
  "dependencies": {
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.0.0",
    "lucide-react": "^0.300.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "date-fns": "^3.0.0",
    "socket.io-client": "^4.7.0",
    "ansi-to-html": "^0.7.2",
    "@tanstack/react-virtual": "^3.0.0"
  },
  "devDependencies": {
    "class-variance-authority": "^0.7.0"
  }
}
```

### Utility Function

```typescript
// lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Type Definitions

```typescript
// types/agent.ts

export type AgentType = 'claude-code' | 'gemini-cli' | 'openai-codex';
export type AgentStatus = 'running' | 'idle' | 'error' | 'offline';

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  enabled: boolean;
  command: string;
  args: string[];
  description: string;
  features: {
    parallelExecution: boolean;
    autonomousMode: boolean;
    gitIntegration: boolean;
    mcpSupport?: boolean;
  };
  currentTask?: Task;
  metrics?: AgentMetrics;
  lastError?: {
    message: string;
    timestamp: Date;
  };
}

export interface AgentMetrics {
  tasksCompleted: number;
  tasksInProgress: number;
  tasksFailed: number;
  avgTaskDuration: number;
  uptime: number;
  tokensUsed?: number;
}

// types/task.ts

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgentId?: string;
  assignedAgent?: Agent;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  labels: string[];
  linkedPR?: {
    number: number;
    url: string;
    status: 'open' | 'merged' | 'closed';
  };
  output?: string[];
}

export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  agentId?: string[];
  search?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
```

---

## Implementation Priority

### Phase 1: Layout Foundation
1. DashboardShell with responsive grid
2. Sidebar with navigation
3. Header with basic user info placeholder
4. MainContent wrapper

### Phase 2: Agent Components
1. AgentStatusBadge
2. AgentCard
3. AgentGrid/AgentList
4. AgentControls

### Phase 3: Task Components
1. TaskStatusBadge
2. TaskCard
3. TaskList
4. TaskFilters

### Phase 4: Monitoring
1. MetricsCard
2. StatusIndicator
3. OutputStreamViewer (basic version)
4. ActivityFeed

### Phase 5: Polish
1. Real-time streaming integration
2. Keyboard shortcuts
3. Loading states and skeletons
4. Error boundaries
5. Mobile responsiveness refinement

---

## Notes

- All components should support dark mode via Tailwind's `dark:` variants
- Use Server Components by default, add `'use client'` only when needed
- Implement proper loading and error states for all async operations
- Follow accessibility best practices (ARIA labels, keyboard navigation)
- Consider adding Storybook for component documentation and testing
