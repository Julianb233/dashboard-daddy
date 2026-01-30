'use client'

import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react'

interface CostData {
  daily: number
  weekly: number
  monthly: number
  yearly: number
  trend: 'up' | 'down' | 'stable'
  breakdown: {
    category: string
    amount: number
    percentage: number
  }[]
}

export function CostTracker() {
  const [costs, setCosts] = useState<CostData | null>(null)
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch cost data from API
    async function fetchCosts() {
      try {
        const res = await fetch('/api/costs')
        if (res.ok) {
          const data = await res.json()
          setCosts(data)
        } else {
          // Use mock data if API not available
          setCosts({
            daily: 12.50,
            weekly: 87.50,
            monthly: 375.00,
            yearly: 4500.00,
            trend: 'down',
            breakdown: [
              { category: 'API Calls', amount: 8.25, percentage: 66 },
              { category: 'Compute', amount: 2.50, percentage: 20 },
              { category: 'Storage', amount: 1.25, percentage: 10 },
              { category: 'Other', amount: 0.50, percentage: 4 },
            ]
          })
        }
      } catch {
        // Mock data fallback
        setCosts({
          daily: 12.50,
          weekly: 87.50,
          monthly: 375.00,
          yearly: 4500.00,
          trend: 'down',
          breakdown: [
            { category: 'API Calls', amount: 8.25, percentage: 66 },
            { category: 'Compute', amount: 2.50, percentage: 20 },
            { category: 'Storage', amount: 1.25, percentage: 10 },
            { category: 'Other', amount: 0.50, percentage: 4 },
          ]
        })
      } finally {
        setLoading(false)
      }
    }
    fetchCosts()
  }, [])

  if (loading) {
    return (
      <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30 animate-pulse">
        <div className="h-6 w-32 bg-wizard-medium/20 rounded mb-4" />
        <div className="h-10 w-24 bg-wizard-medium/20 rounded" />
      </div>
    )
  }

  if (!costs) return null

  const currentCost = costs[period]
  const TrendIcon = costs.trend === 'up' ? TrendingUp : costs.trend === 'down' ? TrendingDown : Calendar

  return (
    <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30 dark:bg-wizard-dark/30 light:bg-white light:border-wizard-emerald/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-wizard-cream dark:text-wizard-cream light:text-wizard-dark flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-wizard-gold" />
          Cost Tracker
        </h3>
        <div className="flex gap-1">
          {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                period === p
                  ? 'bg-wizard-gold text-wizard-dark'
                  : 'bg-wizard-medium/20 text-wizard-cream/60 hover:bg-wizard-medium/40'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1, 1)}
              {p === 'daily' ? 'D' : p === 'weekly' ? 'W' : p === 'monthly' ? 'M' : 'Y'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-end gap-2 mb-4">
        <span className="text-3xl font-bold text-wizard-gold">
          ${currentCost.toFixed(2)}
        </span>
        <span className="text-wizard-cream/60 text-sm mb-1">
          /{period === 'daily' ? 'day' : period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}
        </span>
        <TrendIcon className={`w-5 h-5 ml-auto ${
          costs.trend === 'down' ? 'text-green-400' : costs.trend === 'up' ? 'text-red-400' : 'text-wizard-cream/60'
        }`} />
      </div>

      {/* Cost breakdown */}
      <div className="space-y-2">
        {costs.breakdown.map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <span className="text-xs text-wizard-cream/60 w-20">{item.category}</span>
            <div className="flex-1 h-2 bg-wizard-medium/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-wizard-gold rounded-full"
                style={{ width: `${item.percentage}%` }}
              />
            </div>
            <span className="text-xs text-wizard-cream/80 w-12 text-right">
              ${item.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Period totals */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-wizard-medium/20">
        <div className="text-center">
          <p className="text-xs text-wizard-cream/50">Day</p>
          <p className="text-sm font-semibold text-wizard-cream">${costs.daily.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-wizard-cream/50">Week</p>
          <p className="text-sm font-semibold text-wizard-cream">${costs.weekly.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-wizard-cream/50">Month</p>
          <p className="text-sm font-semibold text-wizard-cream">${costs.monthly.toFixed(0)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-wizard-cream/50">Year</p>
          <p className="text-sm font-semibold text-wizard-cream">${costs.yearly.toFixed(0)}</p>
        </div>
      </div>
    </div>
  )
}
