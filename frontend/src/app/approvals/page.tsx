'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { ApprovalRequest, ApprovalBatchOperation } from '@/types/approval'
import { ApprovalQueue } from '@/components/approvals/ApprovalQueue'
import { ApprovalHistory } from '@/components/approvals/ApprovalHistory'
import { ApprovalStats } from '@/components/approvals/ApprovalStats'

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'pending' | 'history'>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch approvals
  const fetchApprovals = useCallback(async () => {
    try {
      const res = await fetch('/api/approvals');
      if (!res.ok) throw new Error('Failed to fetch approvals');
      const data = await res.json();
      setApprovals(data.approvals);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
    // Poll every 10 seconds for new approvals
    const interval = setInterval(fetchApprovals, 10000);
    return () => clearInterval(interval);
  }, [fetchApprovals]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger shortcuts when typing in inputs
      }

      switch (e.key.toLowerCase()) {
        case 'y':
          e.preventDefault();
          if (selectedIds.size > 0) {
            handleBatchAction('approve');
          }
          break;
        case 'n':
          e.preventDefault();
          if (selectedIds.size > 0) {
            handleBatchAction('reject');
          }
          break;
        case 'a':
          e.preventDefault();
          handleSelectAll();
          break;
        case 'escape':
          e.preventDefault();
          setSelectedIds(new Set());
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedIds]);

  // Handle single approval action
  const handleApprovalAction = async (approvalId: string, action: 'approve' | 'reject', comment?: string) => {
    try {
      const res = await fetch(`/api/approvals/${approvalId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comment }),
      });

      if (!res.ok) throw new Error('Action failed');

      // Refresh approvals
      await fetchApprovals();
      
      // Clear selection if this item was selected
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(approvalId);
        return newSet;
      });
    } catch (err) {
      console.error('Approval action failed:', err);
    }
  };

  // Handle batch operations
  const handleBatchAction = async (action: 'approve' | 'reject') => {
    if (selectedIds.size === 0) return;

    const batchOp: ApprovalBatchOperation = {
      action,
      requestIds: Array.from(selectedIds),
    };

    try {
      const res = await fetch('/api/approvals/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchOp),
      });

      if (!res.ok) throw new Error('Batch action failed');

      // Refresh approvals and clear selection
      await fetchApprovals();
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Batch action failed:', err);
    }
  };

  // Select all pending approvals
  const handleSelectAll = () => {
    const pendingIds = approvals
      .filter(a => a.status === 'pending')
      .map(a => a.id);
    setSelectedIds(new Set(pendingIds));
  };

  // Toggle selection
  const handleToggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const pendingApprovals = approvals.filter(a => a.status === 'pending');
  const completedApprovals = approvals.filter(a => a.status !== 'pending');

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Workflows</h1>
            <p className="text-gray-500 mt-1">
              Review and manage agent action requests
              {selectedIds.size > 0 && (
                <span className="ml-2 text-blue-600">
                  ({selectedIds.size} selected)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {(['pending', 'history'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === v
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {v === 'pending' ? 'Queue' : 'History'}
                </button>
              ))}
            </div>

            {/* Batch Actions */}
            {selectedIds.size > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleBatchAction('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  Approve All ({selectedIds.size})
                </button>
                <button
                  onClick={() => handleBatchAction('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                >
                  Reject All ({selectedIds.size})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <ApprovalStats approvals={approvals} />

        {/* Keyboard Shortcuts Help */}
        <div className="bg-gray-50 border rounded-lg p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Keyboard Shortcuts</h3>
          <div className="flex gap-6 text-xs text-gray-600">
            <span><kbd className="px-1 bg-gray-200 rounded">Y</kbd> Approve selected</span>
            <span><kbd className="px-1 bg-gray-200 rounded">N</kbd> Reject selected</span>
            <span><kbd className="px-1 bg-gray-200 rounded">A</kbd> Select all</span>
            <span><kbd className="px-1 bg-gray-200 rounded">Esc</kbd> Clear selection</span>
          </div>
        </div>

        {/* Loading/Error states */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading approvals...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchApprovals}
              className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {view === 'pending' && (
              <ApprovalQueue
                approvals={pendingApprovals}
                selectedIds={selectedIds}
                onToggleSelection={handleToggleSelection}
                onApprovalAction={handleApprovalAction}
              />
            )}

            {view === 'history' && (
              <ApprovalHistory
                approvals={completedApprovals}
              />
            )}
          </>
        )}

        {!loading && !error && approvals.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No approval requests found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}