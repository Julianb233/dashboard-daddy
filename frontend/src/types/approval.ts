// Approval status types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type ApprovalPriority = 'low' | 'medium' | 'high' | 'critical';

// Approval action types
export interface ApprovalAction {
  type: 'approve' | 'reject' | 'execute' | 'cancel';
  description: string;
  agentId?: string;
  command?: string;
  parameters?: Record<string, any>;
}

// Approval request
export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  requestedBy: string; // Agent ID or user ID
  requestedAt: string;
  priority: ApprovalPriority;
  status: ApprovalStatus;
  action: ApprovalAction;
  metadata: {
    category: string;
    riskLevel: 'low' | 'medium' | 'high';
    estimatedDuration?: string;
    requiredPermissions?: string[];
  };
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  expiresAt?: string;
  comments?: ApprovalComment[];
}

// Approval comment
export interface ApprovalComment {
  id: string;
  approvalId: string;
  author: string;
  message: string;
  createdAt: string;
}

// Approval batch operation
export interface ApprovalBatchOperation {
  action: 'approve' | 'reject';
  requestIds: string[];
  comment?: string;
}

// API response types
export interface ApprovalListResponse {
  approvals: ApprovalRequest[];
  total: number;
  pending: number;
  timestamp: string;
}

export interface ApprovalActionResponse {
  success: boolean;
  message: string;
  approval?: ApprovalRequest;
}