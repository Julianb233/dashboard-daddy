'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Types matching the API
interface GitInfo {
  branch: string;
  lastCommit: {
    hash: string;
    message: string;
    date: string;
    author: string;
  } | null;
  isDirty: boolean;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description: string;
  git: GitInfo | null;
  lastActivity: string;
  status: 'active' | 'idle' | 'archived';
}

interface ProjectsResponse {
  projects: Project[];
  timestamp: string;
}

export interface UseProjectsOptions {
  pollInterval?: number;
}

export interface UseProjectsReturn {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching projects from the API with optional polling
 */
export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { pollInterval = 30000 } = options; // Poll every 30s by default (projects change less often)

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ProjectsResponse = await response.json();

      if (!mountedRef.current) return;

      setProjects(data.projects);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      if (!mountedRef.current) return;

      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await fetchProjects();
  }, [fetchProjects]);

  // Start polling
  useEffect(() => {
    mountedRef.current = true;

    const poll = () => {
      fetchProjects();
      pollTimeoutRef.current = setTimeout(poll, pollInterval);
    };

    // Initial fetch
    fetchProjects();

    // Start polling after initial fetch
    pollTimeoutRef.current = setTimeout(poll, pollInterval);

    return () => {
      mountedRef.current = false;
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current);
      }
    };
  }, [fetchProjects, pollInterval]);

  return {
    projects,
    isLoading,
    error,
    refetch,
  };
}

export default useProjects;
