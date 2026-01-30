'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Plus, 
  User, 
  Crown,
  Shield,
  Zap,
  Target,
  Minus
} from 'lucide-react'
import { CreateAgentData, SKILL_CATEGORIES, SkillCategory, ArmyRole, SquadName } from '@/types/agent-army'

interface CreateAgentModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function CreateAgentModal({ onClose, onSuccess }: CreateAgentModalProps) {
  const [formData, setFormData] = useState<CreateAgentData>({
    name: '',
    role: 'agent',
    skills: [],
    description: ''
  })
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('Technical')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      setError('Agent name is required')
      return
    }
    
    if (formData.skills.length === 0) {
      setError('At least one skill is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/agents/army', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        throw new Error('Failed to create agent')
      }

      onSuccess()
    } catch (err) {
      console.error('Error creating agent:', err)
      setError(err instanceof Error ? err.message : 'Failed to create agent')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const getRoleIcon = (role: ArmyRole) => {
    switch (role) {
      case 'commander': return Crown
      case 'squad_leader': return Shield
      case 'agent': return User
    }
  }

  const RoleIcon = getRoleIcon(formData.role)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-amber-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <RoleIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Recruit New Agent</h2>
                <p className="text-emerald-200">Add a new agent to your army</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Enter agent name..."
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as ArmyRole }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="agent">Agent</option>
                <option value="squad_leader">Squad Leader</option>
                <option value="commander">Commander</option>
              </select>
            </div>
          </div>

          {/* Squad Assignment */}
          {(formData.role === 'agent' || formData.role === 'squad_leader') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Squad Assignment
              </label>
              <select
                value={formData.squad || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, squad: e.target.value as SquadName || undefined }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">No Squad Assignment</option>
                <option value="Research">Research Squad</option>
                <option value="Development">Development Squad</option>
                <option value="Communications">Communications Squad</option>
                <option value="Operations">Operations Squad</option>
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Describe the agent's role and responsibilities..."
            />
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                Skills *
              </h3>
              <div className="text-sm text-gray-500">
                {formData.skills.length} selected
              </div>
            </div>

            {/* Selected Skills */}
            {formData.skills.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  {formData.skills.map((skill) => (
                    <motion.span
                      key={skill}
                      whileHover={{ scale: 1.05 }}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-sm font-medium cursor-pointer hover:bg-emerald-200 flex items-center gap-1"
                      onClick={() => handleRemoveSkill(skill)}
                    >
                      {skill}
                      <Minus className="w-3 h-3" />
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Categories */}
            <div className="mb-3">
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Skills */}
            <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
              <div className="flex flex-wrap gap-1">
                {SKILL_CATEGORIES[selectedCategory].map((skill) => {
                  const isSelected = formData.skills.includes(skill)
                  return (
                    <motion.button
                      key={skill}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => isSelected ? handleRemoveSkill(skill) : handleAddSkill(skill)}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                      }`}
                    >
                      {skill}
                      {!isSelected && <Plus className="w-3 h-3 inline ml-1" />}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Target className="w-4 h-4" />
                  </motion.div>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Recruit Agent
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}