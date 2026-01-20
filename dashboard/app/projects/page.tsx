'use client';

import { useProjects, Project } from '@/hooks/use-projects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FolderGit2,
  GitBranch,
  Clock,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  GitCommit,
  AlertTriangle,
} from 'lucide-react';

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
              <CardDescription className="text-sm line-clamp-1">
                {project.description}
              </CardDescription>
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
          {project.git && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GitBranch className="h-4 w-4" />
                <span className="font-mono">{project.git.branch}</span>
                {project.git.isDirty && (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="text-xs">uncommitted</span>
                  </span>
                )}
              </div>

              {project.git.lastCommit && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <GitCommit className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-foreground">{project.git.lastCommit.hash}</span>
                    <span className="mx-1">·</span>
                    <span className="truncate">{project.git.lastCommit.message}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Last activity */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{formatLastActivity(project.lastActivity)}</span>
          </div>

          {/* Path */}
          <div className="text-xs text-muted-foreground font-mono truncate" title={project.path}>
            {project.path}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a
                href={`vscode://file${project.path}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in VS Code
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ProjectsList({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter((p) => p.status !== 'archived');
  const archivedProjects = projects.filter((p) => p.status === 'archived');

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          <p className="text-muted-foreground text-center py-8">
            No projects found in /opt/agency-workspace/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Active Projects */}
      {activeProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Projects ({activeProjects.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}

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
  const { projects, isLoading, error, refetch } = useProjects({
    pollInterval: 30000, // Poll every 30 seconds
  });

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const idleCount = projects.filter((p) => p.status === 'idle').length;

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
            <p className="text-muted-foreground">
              Git repositories in your workspace.
            </p>
          </div>
          <Button onClick={refetch} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button
                onClick={refetch}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {!isLoading && !error && (
          <div className="flex items-center gap-4 text-sm">
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
              {activeCount} Active
            </Badge>
            <Badge className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-0">
              {idleCount} Idle
            </Badge>
            <span className="text-muted-foreground">
              {projects.length} total projects
            </span>
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <ProjectsGridSkeleton />
        ) : (
          <ProjectsList projects={projects} />
        )}
      </div>
    </div>
  );
}
