import { NextResponse } from 'next/server';
import { readdir, stat, readFile, access } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

// Project types
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

interface Project {
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

interface ApiErrorResponse {
  error: string;
  code?: string;
  timestamp: string;
}

// Workspace directory to scan
const WORKSPACE_DIR = '/opt/agency-workspace';

/**
 * Check if a path exists
 */
async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get git information for a directory
 */
async function getGitInfo(projectPath: string): Promise<GitInfo | null> {
  try {
    // Check if .git exists
    const gitDir = join(projectPath, '.git');
    const isGitRepo = await pathExists(gitDir);
    if (!isGitRepo) {
      return null;
    }

    // Get current branch
    let branch = 'unknown';
    try {
      branch = execSync('git rev-parse --abbrev-ref HEAD', {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
    } catch {
      // Ignore
    }

    // Get last commit info
    let lastCommit: GitInfo['lastCommit'] = null;
    try {
      const log = execSync(
        'git log -1 --format="%H|%s|%ci|%an"',
        {
          cwd: projectPath,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      ).trim();

      if (log) {
        const [hash, message, date, author] = log.split('|');
        lastCommit = {
          hash: hash?.slice(0, 8) || '',
          message: message || '',
          date: date || '',
          author: author || '',
        };
      }
    } catch {
      // Ignore
    }

    // Check if there are uncommitted changes
    let isDirty = false;
    try {
      const status = execSync('git status --porcelain', {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      isDirty = status.length > 0;
    } catch {
      // Ignore
    }

    return { branch, lastCommit, isDirty };
  } catch {
    return null;
  }
}

/**
 * Get project description from package.json or README
 */
async function getProjectDescription(projectPath: string): Promise<string> {
  // Try package.json first
  try {
    const packageJson = await readFile(join(projectPath, 'package.json'), 'utf-8');
    const pkg = JSON.parse(packageJson);
    if (pkg.description) {
      return pkg.description;
    }
  } catch {
    // Ignore
  }

  // Try pyproject.toml
  try {
    const pyproject = await readFile(join(projectPath, 'pyproject.toml'), 'utf-8');
    const descMatch = pyproject.match(/description\s*=\s*"([^"]+)"/);
    if (descMatch) {
      return descMatch[1];
    }
  } catch {
    // Ignore
  }

  return '';
}

/**
 * Determine project status based on recent activity
 */
function getProjectStatus(lastActivity: Date): 'active' | 'idle' | 'archived' {
  const now = new Date();
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);

  if (hoursSinceActivity < 1) return 'active';
  if (hoursSinceActivity < 48) return 'idle';
  return 'archived';
}

/**
 * Scan workspace for projects
 */
async function scanProjects(): Promise<Project[]> {
  const projects: Project[] = [];

  try {
    const entries = await readdir(WORKSPACE_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      // Skip hidden directories and node_modules
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const projectPath = join(WORKSPACE_DIR, entry.name);

      try {
        // Get directory stats for last modified time
        const stats = await stat(projectPath);

        // Get git info
        const git = await getGitInfo(projectPath);

        // Get description
        const description = await getProjectDescription(projectPath);

        // Determine last activity from git or file stats
        let lastActivity = stats.mtime;
        if (git?.lastCommit?.date) {
          const commitDate = new Date(git.lastCommit.date);
          if (commitDate > lastActivity) {
            lastActivity = commitDate;
          }
        }

        const project: Project = {
          id: `proj-${entry.name}`,
          name: entry.name,
          path: projectPath,
          description: description || `Project at ${projectPath}`,
          git,
          lastActivity: lastActivity.toISOString(),
          status: getProjectStatus(lastActivity),
        };

        projects.push(project);
      } catch {
        // Skip directories we can't access
        continue;
      }
    }

    // Sort by last activity (most recent first)
    projects.sort((a, b) =>
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );

    return projects;
  } catch (error) {
    console.error('Failed to scan projects:', error);
    return [];
  }
}

export async function GET(): Promise<NextResponse<ProjectsResponse | ApiErrorResponse>> {
  try {
    const projects = await scanProjects();

    const response: ProjectsResponse = {
      projects,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: error instanceof Error ? error.message : 'Failed to load projects',
      code: 'PROJECTS_LOAD_ERROR',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
