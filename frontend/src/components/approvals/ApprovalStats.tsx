'use client'

import { ApprovalRequest } from '@/types/approval'

interface ApprovalStatsProps {
  approvals: ApprovalRequest[];
}

export function ApprovalStats({ approvals }: ApprovalStatsProps) {
  const pending = approvals.filter(a => a.status === 'pending').length;
  const approved = approvals.filter(a => a.status === 'approved').length;
  const rejected = approvals.filter(a => a.status === 'rejected').length;
  const expired = approvals.filter(a => a.status === 'expired').length;

  const stats = [
    {
      label: 'Pending',
      value: pending,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200',
    },
    {
      label: 'Approved',
      value: approved,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200',
    },
    {
      label: 'Rejected',
      value: rejected,
      color: 'red',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
    },
    {
      label: 'Expired',
      value: expired,
      color: 'gray',
      bgColor: 'bg-gray-50',
      textColor: 'text-gray-700',
      borderColor: 'border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-lg border p-4 ${stat.bgColor} ${stat.textColor} ${stat.borderColor}`}
        >
          <p className="text-2xl font-bold">{stat.value}</p>
          <p className="text-sm opacity-80">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}