export type AuditAction =
  | 'access'
  | 'create'
  | 'update'
  | 'delete'
  | 'export'
  | 'login'
  | 'logout'
  | 'permission'
  | 'system'
  | string;

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  actor_email: string | null;
  actor_role: string | null;
  action: AuditAction;
  resource_type: string | null;
  resource_id: string | null;
  target: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AuditFiltersState {
  search: string;
  action: string;
  role: string;
  dateFrom: string;
  dateTo: string;
}

export type AuditExportFormat = 'csv' | 'json';

export interface AuditLogInsert {
  actor_id?: string | null;
  actor_name?: string | null;
  actor_email?: string | null;
  actor_role?: string | null;
  action: AuditAction;
  resource_type?: string | null;
  resource_id?: string | null;
  target?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
}
