'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle, XCircle, ChevronDown, ChevronUp, Brain } from 'lucide-react'

interface Plan {
  id: string
  title: string
  summary: string
  details: string
  reasoning: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  priority: 'high' | 'medium' | 'low'
  category: string
  estimated_effort: string
  created_at: string
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleApprove = async (id: string) => {
    await fetch('/api/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'approved' })
    })
    setPlans(plans.map(p => p.id === id ? { ...p, status: 'approved' } : p))
  }

  const handleReject = async (id: string) => {
    await fetch('/api/plans', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'rejected' })
    })
    setPlans(plans.map(p => p.id === id ? { ...p, status: 'rejected' } : p))
  }

  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30'
  }

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-yellow-400" />,
    approved: <CheckCircle className="w-5 h-5 text-green-400" />,
    rejected: <XCircle className="w-5 h-5 text-red-400" />,
    in_progress: <Clock className="w-5 h-5 text-blue-400 animate-spin" />
  }

  return (
    <div className="min-h-screen bg-wizard-dark-bg p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-wizard-gold mb-2">📋 Plans for Review</h1>
        <p className="text-wizard-cream/70 mb-8">Review Bubba&apos;s proposals before execution</p>

        {loading ? (
          <div className="text-wizard-cream/50">Loading plans...</div>
        ) : plans.length === 0 ? (
          <div className="text-wizard-cream/50">No plans pending review</div>
        ) : (
          <div className="space-y-4">
            {plans.map(plan => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-wizard-dark-bg-secondary border border-wizard-dark-border rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div 
                  className="p-4 cursor-pointer hover:bg-wizard-dark-bg-tertiary transition-colors"
                  onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {statusIcons[plan.status]}
                      <div>
                        <h3 className="text-lg font-semibold text-wizard-cream">{plan.title}</h3>
                        <p className="text-sm text-wizard-cream/60">{plan.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full border ${priorityColors[plan.priority]}`}>
                        {plan.priority}
                      </span>
                      <span className="text-xs text-wizard-cream/50">{plan.estimated_effort}</span>
                      {expandedPlan === plan.id ? (
                        <ChevronUp className="w-5 h-5 text-wizard-cream/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-wizard-cream/50" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedPlan === plan.id && (
                  <div className="border-t border-wizard-dark-border p-4 space-y-4">
                    {/* Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-wizard-gold" />
                        <h4 className="font-semibold text-wizard-gold">Details</h4>
                      </div>
                      <div className="text-wizard-cream/80 text-sm whitespace-pre-wrap bg-wizard-dark-bg-tertiary p-3 rounded-lg">
                        {plan.details}
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-emerald-400" />
                        <h4 className="font-semibold text-emerald-400">My Reasoning</h4>
                      </div>
                      <div className="text-wizard-cream/80 text-sm whitespace-pre-wrap bg-wizard-dark-bg-tertiary p-3 rounded-lg border-l-2 border-emerald-400">
                        {plan.reasoning}
                      </div>
                    </div>

                    {/* Actions */}
                    {plan.status === 'pending' && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => handleApprove(plan.id)}
                          className="flex-1 py-2 bg-gradient-to-r from-wizard-gold to-wizard-gold-dark text-wizard-dark-bg font-semibold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          ✓ Approve &amp; Execute
                        </button>
                        <button
                          onClick={() => handleReject(plan.id)}
                          className="flex-1 py-2 bg-wizard-dark-bg-tertiary text-wizard-cream/70 font-semibold rounded-lg hover:bg-wizard-dark-border transition-colors"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
