'use client'

import { useState } from 'react'
import { ApprovalRequest } from '@/types/approval'

interface ApprovalCardProps {
  approval: ApprovalRequest;
  isSelected: boolean;
  onToggleSelection: () => void;
  onApprovalAction: (approvalId: string, action: 'approve' | 'reject', comment?: string) => void;
}

export function ApprovalCard({ 
  approval, 
  isSelected, 
  onToggleSelection, 
  onApprovalAction 
}: ApprovalCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border-gray-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };

  const riskColors = {
    low: 'text-green-600',
    medium: 'text-yellow-600',
    high: 'text-red-600',
  };

  const handleApprovalWithComment = (action: 'approve' | 'reject') => {
    onApprovalAction(approval.id, action, comment || undefined);
    setComment('');
    setShowCommentInput(false);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className={`bg-white rounded-lg border-2 p-4 transition-all ${
      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="flex items-start gap-4">
        {/* Selection Checkbox */}
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelection}
          className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
        />

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {approval.title}
              </h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityColors[approval.priority]}`}>
                {approval.priority.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{formatTimeAgo(approval.requestedAt)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-3">{approval.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
            <span>
              <strong>Agent:</strong> {approval.requestedBy}
            </span>
            <span>
              <strong>Category:</strong> {approval.metadata.category}
            </span>
            <span className={riskColors[approval.metadata.riskLevel]}>
              <strong>Risk:</strong> {approval.metadata.riskLevel}
            </span>
            {approval.metadata.estimatedDuration && (
              <span>
                <strong>Duration:</strong> {approval.metadata.estimatedDuration}
              </span>
            )}
          </div>

          {/* Action Details (Collapsible) */}
          <div className="mb-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              {showDetails ? '▼' : '▶'} Action Details
            </button>
            
            {showDetails && (
              <div className="mt-2 bg-gray-50 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {approval.action.type}
                  </div>
                  <div>
                    <strong>Agent ID:</strong> {approval.action.agentId || 'N/A'}
                  </div>
                  <div className="col-span-2">
                    <strong>Description:</strong> {approval.action.description}
                  </div>
                  {approval.action.command && (
                    <div className="col-span-2">
                      <strong>Command:</strong>
                      <code className="block mt-1 bg-gray-800 text-green-400 p-2 rounded text-xs font-mono">
                        {approval.action.command}
                      </code>
                    </div>
                  )}
                  {approval.action.parameters && Object.keys(approval.action.parameters).length > 0 && (
                    <div className="col-span-2">
                      <strong>Parameters:</strong>
                      <pre className="mt-1 bg-gray-800 text-green-400 p-2 rounded text-xs font-mono">
                        {JSON.stringify(approval.action.parameters, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment Input */}
          {showCommentInput && (
            <div className="mb-4">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment (optional)..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={2}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowCommentInput(!showCommentInput)}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              {showCommentInput ? 'Hide Comment' : 'Add Comment'}
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => showCommentInput ? handleApprovalWithComment('reject') : onApprovalAction(approval.id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => showCommentInput ? handleApprovalWithComment('approve') : onApprovalAction(approval.id, 'approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}