// Sharing types for sharable dashboard links

export type SharePermission = 'stats' | 'commands' | 'errors' | 'full';

export type ShareType = 'public' | 'private';

export interface ShareConfig {
  permissions: SharePermission[];
  type: ShareType;
  expiresAt?: Date;
  allowEmbedding: boolean;
  requireAuth: boolean;
}

export interface ShareLink {
  id: string;
  token: string;
  name: string;
  config: ShareConfig;
  createdAt: Date;
  updatedAt: Date;
  accessCount: number;
  lastAccessedAt?: Date;
  isActive: boolean;
}

export interface ShareAccess {
  id: string;
  shareId: string;
  userAgent: string;
  ipAddress: string;
  accessedAt: Date;
  referrer?: string;
}

export interface CreateShareRequest {
  name: string;
  config: ShareConfig;
}

export interface ShareResponse {
  shareLink: ShareLink;
  fullUrl: string;
  embedCode: string;
}

// Dashboard data filtered by permissions
export interface FilteredDashboardData {
  stats?: {
    totalAgents: number;
    runningAgents: number;
    totalTasks: number;
    completedTasks: number;
  };
  agents?: Array<{
    id: string;
    name: string;
    status: string;
    type?: string;
  }>;
  errors?: Array<{
    id: string;
    message: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high';
  }>;
}