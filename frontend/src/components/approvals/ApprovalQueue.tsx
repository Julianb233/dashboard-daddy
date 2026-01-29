'use client'

import { useState } from 'react'
import { ApprovalRequest } from '@/types/approval'
import { ApprovalCard } from './ApprovalCard'

interface ApprovalQueueProps {
  approvals: ApprovalRequest[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  onApprovalAction: (approvalId: string, action: 'approve' | 'reject', comment?: string) => void;
}

export function ApprovalQueue({ 
  approvals, 
  selectedIds, 
  onToggleSelection, 
  onApprovalAction 
}: ApprovalQueueProps) {
  const [filter, setFilter] = useState<'all' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'agent'>('priority');

  // Priority sorting order
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

  // Filter and sort approvals
  const filteredApprovals = approvals
    .filter(approval => {
      if (filter === 'all') return true;
      return approval.priority === filter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'date':
          return new Date(a.requestedAt).getTime() - new Date(b.requestedAt).getTime();
        case 'agent':
          return a.requestedBy.localeCompare(b.requestedBy);
        default:
          return 0;
      }
    });

  if (filteredApprovals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500">No pending approvals</p>
        <p className="text-sm text-gray-400 mt-1">All caught up! 🎉</p>
      </div>
    );
  }

  return (
    <div>
      {/* Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Filter:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'high' | 'critical')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All Priority</option>
              <option value="critical">Critical Only</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'priority' | 'date' | 'agent')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="priority">Priority</option>
              <option value="date">Request Date</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredApprovals.length} approval{filteredApprovals.length !== 1 ? 's' : ''} pending
        </div>
      </div>

      {/* Approval Cards */}
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <ApprovalCard
            key={approval.id}
            approval={approval}
            isSelected={selectedIds.has(approval.id)}
            onToggleSelection={() => onToggleSelection(approval.id)}
            onApprovalAction={onApprovalAction}
          />
        ))}
      </div>
    </div>
  );
}