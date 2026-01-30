'use client'

import { AuditExportFormat, AuditFiltersState } from '@/types/audit'
import { Download, Filter, RefreshCcw, Search } from 'lucide-react'

interface AuditFiltersProps {
  filters: AuditFiltersState
  actions: string[]
  roles: string[]
  onChange: (next: Partial<AuditFiltersState>) => void
  onExport: (format: AuditExportFormat) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function AuditFilters({
  filters,
  actions,
  roles,
  onChange,
  onExport,
  onRefresh,
  isRefreshing,
}: AuditFiltersProps) {
  return (
    <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-950/80 p-5 shadow-[0_0_25px_rgba(10,77,60,0.25)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-4 lg:flex-row lg:items-center">
          <label className="relative flex w-full items-center">
            <Search className="absolute left-3 top-3 h-4 w-4 text-wizard-gold" />
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search user, action, target..."
              className="h-10 w-full rounded-xl border border-wizard-emerald/40 bg-gray-900/80 pl-9 pr-3 text-sm text-wizard-cream placeholder:text-wizard-cream/60 focus:border-wizard-gold focus:outline-none focus:ring-2 focus:ring-wizard-gold/30"
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-wizard-gold">
              <Filter className="h-4 w-4" />
              Filters
            </label>
            <select
              value={filters.action}
              onChange={(event) => onChange({ action: event.target.value })}
              className="h-10 rounded-xl border border-wizard-emerald/40 bg-gray-900/80 px-3 text-sm text-wizard-cream focus:border-wizard-gold focus:outline-none focus:ring-2 focus:ring-wizard-gold/30"
            >
              <option value="all">All actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>

            <select
              value={filters.role}
              onChange={(event) => onChange({ role: event.target.value })}
              className="h-10 rounded-xl border border-wizard-emerald/40 bg-gray-900/80 px-3 text-sm text-wizard-cream focus:border-wizard-gold focus:outline-none focus:ring-2 focus:ring-wizard-gold/30"
            >
              <option value="all">All roles</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(event) => onChange({ dateFrom: event.target.value })}
              className="h-10 rounded-xl border border-wizard-emerald/40 bg-gray-900/80 px-3 text-sm text-wizard-cream focus:border-wizard-gold focus:outline-none focus:ring-2 focus:ring-wizard-gold/30"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(event) => onChange({ dateTo: event.target.value })}
              className="h-10 rounded-xl border border-wizard-emerald/40 bg-gray-900/80 px-3 text-sm text-wizard-cream focus:border-wizard-gold focus:outline-none focus:ring-2 focus:ring-wizard-gold/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onExport('csv')}
            className="inline-flex items-center gap-2 rounded-xl border border-wizard-gold/40 bg-wizard-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-wizard-gold transition hover:bg-wizard-gold/20"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => onExport('json')}
            className="inline-flex items-center gap-2 rounded-xl border border-wizard-gold/40 bg-wizard-gold/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-wizard-gold transition hover:bg-wizard-gold/20"
          >
            <Download className="h-4 w-4" />
            JSON
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-wizard-emerald/50 bg-wizard-emerald/10 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-wizard-cream transition hover:bg-wizard-emerald/20"
          >
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  )
}
