'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BubbaHeader } from '@/components/kanban/BubbaHeader'
import { BubbaSidebar } from '@/components/kanban/BubbaSidebar'
import { AuditFilters } from '@/components/audit/AuditFilters'
import { AuditTable } from '@/components/audit/AuditTable'
import type { AuditFiltersState, AuditLog, AuditExportFormat } from '@/types/audit'
import { Activity, ShieldCheck, Sparkles, UserCheck } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const ADMIN_ROLES = new Set(['admin', 'security'])

const defaultFilters: AuditFiltersState = {
  search: '',
  action: 'all',
  role: 'all',
  dateFrom: '',
  dateTo: '',
}

const getRoleFromUser = (user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null) => {
  if (!user) return ''
  const appRole = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : ''
  const userRole = typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : ''
  return appRole || userRole || ''
}

const matchesFilters = (log: AuditLog, filters: AuditFiltersState) => {
  const search = filters.search.trim().toLowerCase()
  const searchTarget = [
    log.actor_name,
    log.actor_email,
    log.action,
    log.target,
    log.resource_type,
    log.resource_id,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (search && !searchTarget.includes(search)) return false
  if (filters.action !== 'all' && log.action !== filters.action) return false
  if (filters.role !== 'all' && log.actor_role !== filters.role) return false

  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom)
    if (!Number.isNaN(from.getTime()) && new Date(log.created_at) < from) return false
  }

  if (filters.dateTo) {
    const to = new Date(filters.dateTo)
    if (!Number.isNaN(to.getTime())) {
      const logDate = new Date(log.created_at)
      const endOfDay = new Date(to)
      endOfDay.setHours(23, 59, 59, 999)
      if (logDate > endOfDay) return false
    }
  }

  return true
}

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [filters, setFilters] = useState<AuditFiltersState>(defaultFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const filtersRef = useRef(filters)

  useEffect(() => {
    filtersRef.current = filters
  }, [filters])

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      const role = getRoleFromUser(user)
      if (!user) {
        setIsAuthorized(false)
        return
      }
      setIsAuthorized(ADMIN_ROLES.has(role))
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const role = getRoleFromUser(session?.user ?? null)
      setIsAuthorized(ADMIN_ROLES.has(role))
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchAuditLogs = async (isManual = false) => {
    if (!isAuthorized) return
    if (isManual) {
      setIsRefreshing(true)
    }
    setIsLoading(!isManual)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.action !== 'all') params.set('action', filters.action)
      if (filters.role !== 'all') params.set('role', filters.role)
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters.dateTo) params.set('dateTo', filters.dateTo)
      params.set('limit', '300')

      const response = await fetch(`/api/audit?${params.toString()}`)
      if (response.status === 401) {
        setIsAuthorized(false)
        setError('Please sign in to view audit logs.')
        return
      }
      if (response.status === 403) {
        setIsAuthorized(false)
        setError('You do not have permission to view audit logs.')
        return
      }

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to load audit logs')
      }

      setAuditLogs(payload.logs || [])
      setLastUpdated(new Date())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (isAuthorized === null) return
    if (!isAuthorized) {
      setIsLoading(false)
      return
    }

    const timeout = setTimeout(() => {
      fetchAuditLogs()
    }, 250)

    return () => clearTimeout(timeout)
  }, [filters, isAuthorized])

  useEffect(() => {
    if (!isAuthorized) return

    const supabase = createClient()
    const channel = supabase
      .channel('audit-logs-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          const incoming = payload.new as AuditLog
          if (!matchesFilters(incoming, filtersRef.current)) return

          setAuditLogs((prev) => {
            if (prev.some((log) => log.id === incoming.id)) return prev
            return [incoming, ...prev].slice(0, 300)
          })
          setLastUpdated(new Date())
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isAuthorized])

  const filteredLogs = useMemo(() => auditLogs.filter((log) => matchesFilters(log, filters)), [auditLogs, filters])

  const actionOptions = useMemo(() => {
    const values = Array.from(new Set(auditLogs.map((log) => log.action).filter(Boolean)))
    return values.sort()
  }, [auditLogs])

  const roleOptions = useMemo(() => {
    const values = Array.from(new Set(auditLogs.map((log) => log.actor_role).filter((r): r is string => r !== null)))
    return values.sort()
  }, [auditLogs])

  const timelineData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredLogs.forEach((log) => {
      const date = log.created_at.split('T')[0]
      counts[date] = (counts[date] || 0) + 1
    })

    return Object.entries(counts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [filteredLogs])

  const stats = useMemo(() => {
    const total = filteredLogs.length
    const uniqueActors = new Set(
      filteredLogs.map((log) => log.actor_email || log.actor_name || 'system')
    ).size
    const actionCounts: Record<string, number> = {}
    filteredLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1
    })
    const topAction = Object.entries(actionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'n/a'

    return { total, uniqueActors, topAction }
  }, [filteredLogs])

  const handleExport = (format: AuditExportFormat) => {
    if (!filteredLogs.length) return

    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`
    let blob: Blob

    if (format === 'json') {
      blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' })
    } else {
      const headers = [
        'id',
        'created_at',
        'actor_name',
        'actor_email',
        'actor_role',
        'action',
        'resource_type',
        'resource_id',
        'target',
        'ip_address',
        'user_agent',
      ]
      const rows = filteredLogs.map((log) =>
        headers
          .map((key) => {
            const value = (log as unknown as Record<string, unknown>)[key]
            const cell = value === null || value === undefined ? '' : String(value)
            return `"${cell.replace(/"/g, '""')}"`
          })
          .join(',')
      )
      blob = new Blob([`${headers.join(',')}\n${rows.join('\n')}`], { type: 'text/csv;charset=utf-8;' })
    }

    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (isAuthorized === false) {
    return (
      <div className="flex h-screen bg-gray-950 text-wizard-cream">
        <BubbaSidebar />
        <div className="flex flex-1 flex-col">
          <BubbaHeader />
          <main className="flex flex-1 items-center justify-center p-8">
            <div className="max-w-lg rounded-2xl border border-wizard-gold/40 bg-gray-900/80 p-8 text-center shadow-[0_0_30px_rgba(212,168,75,0.15)]">
              <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-wizard-gold" />
              <h2 className="mb-2 text-xl font-semibold">Restricted Grimoire</h2>
              <p className="text-sm text-wizard-cream/70">
                {error || 'You need admin or security access to view the audit spellbook.'}
              </p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-wizard-cream">
      <BubbaSidebar />
      <div className="flex flex-1 flex-col">
        <BubbaHeader />
        <main className="flex-1 space-y-6 overflow-auto p-6">
          <section className="rounded-3xl border border-wizard-emerald/40 bg-gradient-to-br from-wizard-emerald/20 via-gray-950 to-wizard-emerald/10 p-6 shadow-[0_0_40px_rgba(10,77,60,0.25)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-wizard-gold">Wizard of AI</p>
                <h1 className="mt-2 text-3xl font-semibold text-wizard-cream">Audit Log Sanctum</h1>
                <p className="mt-2 max-w-2xl text-sm text-wizard-cream/70">
                  Track who did what when with live streaming, spellbound filters, and export-ready records.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-900/70 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Events</div>
                  <div className="mt-1 text-xl font-semibold text-wizard-cream">{stats.total}</div>
                </div>
                <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-900/70 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Unique Actors</div>
                  <div className="mt-1 text-xl font-semibold text-wizard-cream">{stats.uniqueActors}</div>
                </div>
                <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-900/70 px-4 py-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Top Action</div>
                  <div className="mt-1 text-xl font-semibold text-wizard-cream">{stats.topAction}</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-wizard-cream/70">
              <span className="inline-flex items-center gap-2 rounded-full border border-wizard-emerald/40 bg-wizard-emerald/10 px-3 py-1">
                <Sparkles className="h-4 w-4 text-wizard-gold" />
                Live updates
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-wizard-emerald/40 bg-wizard-emerald/10 px-3 py-1">
                <Activity className="h-4 w-4 text-wizard-gold" />
                Last sync {lastUpdated ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
              </span>
            </div>
          </section>

          <AuditFilters
            filters={filters}
            actions={actionOptions}
            roles={roleOptions}
            onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            onExport={handleExport}
            onRefresh={() => fetchAuditLogs(true)}
            isRefreshing={isRefreshing}
          />

          <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-950/80 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-wizard-gold">Timeline</p>
                  <h2 className="mt-2 text-lg font-semibold">Audit flow over time</h2>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-wizard-cream/60">
                  <ShieldCheck className="h-4 w-4 text-wizard-gold" />
                  Tamper-evident
                </div>
              </div>
              <div className="mt-6 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid stroke="rgba(253,248,232,0.1)" strokeDasharray="4 4" />
                    <XAxis dataKey="date" stroke="#FDF8E8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#FDF8E8" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#041f1a', border: '1px solid rgba(212,168,75,0.4)' }}
                      labelStyle={{ color: '#FDF8E8' }}
                      itemStyle={{ color: '#D4A84B' }}
                    />
                    <Line type="monotone" dataKey="count" stroke="#D4A84B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-wizard-emerald/40 bg-gray-950/80 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-wizard-gold">Security Lens</p>
              <h2 className="mt-2 text-lg font-semibold">Who did what</h2>
              <div className="mt-6 space-y-4 text-sm text-wizard-cream/80">
                <div className="flex items-center gap-3 rounded-xl border border-wizard-emerald/30 bg-wizard-emerald/10 p-3">
                  <UserCheck className="h-5 w-5 text-wizard-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Actors tracked</p>
                    <p className="font-medium text-wizard-cream">{stats.uniqueActors} unique identities in scope</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-wizard-emerald/30 bg-wizard-emerald/10 p-3">
                  <Activity className="h-5 w-5 text-wizard-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Action density</p>
                    <p className="font-medium text-wizard-cream">{stats.total} events logged in this view</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-wizard-emerald/30 bg-wizard-emerald/10 p-3">
                  <Sparkles className="h-5 w-5 text-wizard-gold" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-wizard-gold">Peak action</p>
                    <p className="font-medium text-wizard-cream">{stats.topAction} dominates activity</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          )}

          <AuditTable logs={filteredLogs} isLoading={isLoading} />
        </main>
      </div>
    </div>
  )
}
