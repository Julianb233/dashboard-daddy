'use client'

import { useState } from 'react'
import { ApprovalRequest } from '@/types/approval'

interface ApprovalHistoryProps {
  approvals: ApprovalRequest[];
}

export function ApprovalHistory({ approvals }: ApprovalHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'approved' | 'rejected' | 'expired'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'agent'>('date');

  // Filter and sort approvals
  const filteredApprovals = approvals
    .filter(approval => {
      if (filter === 'all') return true;
      return approval.status === filter;
    })
    .sort((a, b) => {
      const getCompletedAt = (approval: ApprovalRequest) => {
        return approval.approvedAt || approval.rejectedAt || approval.requestedAt;
      };

      switch (sortBy) {
        case 'date':
          return new Date(getCompletedAt(b)).getTime() - new Date(getCompletedAt(a)).getTime();
        case 'priority':
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'agent':
          return a.requestedBy.localeCompare(b.requestedBy);
        default:
          return 0;
      }
    });

  const statusColors = {
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (filteredApprovals.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-gray-500">No approval history found</p>
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
              onChange={(e) => setFilter(e.target.value as 'all' | 'approved' | 'rejected' | 'expired')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'agent')}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="date">Completion Date</option>
              <option value="priority">Priority</option>
              <option value="agent">Agent</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {filteredApprovals.length} record{filteredApprovals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredApprovals.map((approval) => (
                <tr key={approval.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {approval.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {approval.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {approval.requestedBy}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      approval.priority === 'critical' ? 'bg-red-100 text-red-700 border-red-200' :
                      approval.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                      approval.priority === 'medium' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {approval.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                      statusColors[approval.status as keyof typeof statusColors]
                    }`}>
                      {approval.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {formatDate(
                      approval.approvedAt || approval.rejectedAt || approval.requestedAt
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {approval.approvedBy || approval.rejectedBy || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}