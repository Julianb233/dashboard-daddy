'use client'

import { AuditLog } from '@/types/audit'
import { Shield, User, Globe, Sparkles } from 'lucide-react'

interface AuditTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

const actionStyles: Record<string, { label: string; className: string }> = {
  create: { label: 'Create', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  update: { label: 'Update', className: 'bg-sky-500/15 text-sky-300 border-sky-500/40' },
  delete: { label: 'Delete', className: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  export: { label: 'Export', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  login: { label: 'Login', className: 'bg-green-500/15 text-green-300 border-green-500/40' },
  logout: { label: 'Logout', className: 'bg-orange-500/15 text-orange-300 border-orange-500/40' },
  permission: { label: 'Permission', className: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  access: { label: 'Access', className: 'bg-blue-500/15 text-blue-300 border-blue-500/40' },
  system: { label: 'System', className: 'bg-gray-500/15 text-gray-300 border-gray-500/40' },
}

const formatTimestamp = (value: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AuditTable({ logs, isLoading }: AuditTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-950/80 p-8 text-center text-wizard-cream/70">
        Loading audit streams...
      </div>
    )
  }

  if (!logs.length) {
    return (
      <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-950/80 p-8 text-center text-wizard-cream/70">
        No audit events match these filters.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-wizard-emerald/40 bg-gray-950/80">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-wizard-emerald/30">
          <thead className="bg-gradient-to-r from-wizard-emerald/30 via-gray-950 to-wizard-emerald/20 text-left text-xs uppercase tracking-[0.2em] text-wizard-gold">
            <tr>
              <th className="px-5 py-3">When</th>
              <th className="px-5 py-3">Actor</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Target</th>
              <th className="px-5 py-3">Origin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-wizard-emerald/20">
            {logs.map((log) => {
              const actionKey = log.action?.toString().toLowerCase()
              const actionMeta = actionStyles[actionKey] ?? {
                label: log.action,
                className: 'bg-wizard-emerald/15 text-wizard-cream border-wizard-emerald/40',
              }

              return (
                <tr key={log.id} className="transition hover:bg-wizard-emerald/10">
                  <td className="px-5 py-4 text-sm text-wizard-cream">
                    <div className="font-medium">{formatTimestamp(log.created_at)}</div>
                    <div className="text-xs text-wizard-cream/60">{log.resource_type || 'general'}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-wizard-cream">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-wizard-gold" />
                      <div>
                        <div className="font-medium">{log.actor_name || log.actor_email || 'System'}</div>
                        <div className="text-xs text-wizard-cream/60">{log.actor_role || 'unknown role'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm">
                    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${actionMeta.className}`}>
                      <Sparkles className="h-3 w-3" />
                      {actionMeta.label}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-wizard-cream">
                    <div className="font-medium">{log.target || log.resource_id || '-'}</div>
                    <div className="text-xs text-wizard-cream/60">{log.metadata ? 'has metadata' : 'no metadata'}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-wizard-cream">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-wizard-gold" />
                      <span>{log.ip_address || 'Unknown IP'}</span>
                    </div>
                    <div className="mt-1 max-w-xs truncate text-xs text-wizard-cream/60">
                      {log.user_agent || 'No user agent'}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t border-wizard-emerald/30 bg-gray-950/80 px-5 py-3 text-xs uppercase tracking-[0.3em] text-wizard-gold">
        <span className="flex items-center gap-2"><Shield className="h-4 w-4" />Audit sealed</span>
        <span>{logs.length} events</span>
      </div>
    </div>
  )
}
