import { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FolderGit2, GitBranch, Clock, Activity, Plus, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Projects | Dashboard Daddy',
  description: 'Manage your coding projects and workspaces',
};

interface Project {
  id: string;
  name: string;
  description: string;
  path: string;
  gitBranch?: string;
  lastActivity: string;
  agentActivity: {
    tasksCompleted: number;
    activeAgents: number;
  };
  status: 'active' | 'idle' | 'archived';
}

// Mock data - would be fetched from API in production
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'dashboard-daddy',
    description: 'AI Agent Management Dashboard',
    path: '/opt/agency-workspace/dashboard-daddy',
    gitBranch: 'main',
    lastActivity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    agentActivity: { tasksCompleted: 147, activeAgents: 2 },
    status: 'active',
  },
  {
    id: 'proj-2',
    name: 'life-os',
    description: 'Personal productivity and life management system',
    path: '/opt/agency-workspace/life-os',
    gitBranch: 'develop',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    agentActivity: { tasksCompleted: 89, activeAgents: 0 },
    status: 'idle',
  },
  {
    id: 'proj-3',
    name: 'prestige-video-editor',
    description: 'Professional video editing application',
    path: '/opt/agency-workspace/prestige-video-editor',
    gitBranch: 'feature/timeline',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    agentActivity: { tasksCompleted: 256, activeAgents: 0 },
    status: 'idle',
  },
  {
    id: 'proj-4',
    name: 'my-boat-buddy',
    description: 'Boat maintenance and trip planning app',
    path: '/opt/agency-workspace/my-boat-buddy',
    gitBranch: 'main',
    lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    agentActivity: { tasksCompleted: 45, activeAgents: 0 },
    status: 'archived',
  },
];

function formatLastActivity(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function getStatusColor(status: Project['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'idle':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    case 'archived':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FolderGit2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription className="text-sm">{project.description}</CardDescription>
            </div>
          </div>
          <Badge className={`${getStatusColor(project.status)} border-0`}>
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Git info */}
          {project.gitBranch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span className="font-mono">{project.gitBranch}</span>
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatLastActivity(project.lastActivity)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span>{project.agentActivity.tasksCompleted} tasks</span>
            </div>
            {project.agentActivity.activeAgents > 0 && (
              <Badge variant="secondary" className="text-xs">
                {project.agentActivity.activeAgents} agent{project.agentActivity.activeAgents > 1 ? 's' : ''} active
              </Badge>
            )}
          </div>

          {/* Path */}
          <div className="text-xs text-muted-foreground font-mono truncate" title={project.path}>
            {project.path}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1">
              Open
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Button>
            <Button size="sm" variant="default" className="flex-1">
              Assign Agent
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProjectsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 flex-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function ProjectsList() {
  // Simulate async fetch
  await new Promise((resolve) => setTimeout(resolve, 100));

  const activeProjects = mockProjects.filter((p) => p.status !== 'archived');
  const archivedProjects = mockProjects.filter((p) => p.status === 'archived');

  return (
    <div className="space-y-8">
      {/* Active Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Active Projects ({activeProjects.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Archived ({archivedProjects.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
            {archivedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Manage your coding projects and assign agents.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-4 text-sm">
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
            {mockProjects.filter((p) => p.status === 'active').length} Active
          </Badge>
          <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
            {mockProjects.filter((p) => p.status === 'idle').length} Idle
          </Badge>
          <span className="text-muted-foreground">
            {mockProjects.length} total projects
          </span>
        </div>

        {/* Projects Grid */}
        <Suspense fallback={<ProjectsGridSkeleton />}>
          <ProjectsList />
        </Suspense>
      </div>
    </div>
  );
}
