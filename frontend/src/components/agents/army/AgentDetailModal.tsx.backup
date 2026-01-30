'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  X, 
  Edit, 
  Save, 
  Trash2, 
  User, 
  Crown,
  Shield,
  Star,
  Activity,
  Target,
  TrendingUp,
  Clock,
  Zap,
  Plus,
  Minus
} from 'lucide-react'
import { ArmyAgent, AgentDetailProps, SKILL_CATEGORIES, SkillCategory } from '@/types/agent-army'

export function AgentDetailModal({ agent, onClose, onUpdate, onDelete }: AgentDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedAgent, setEditedAgent] = useState<Partial<ArmyAgent>>(agent)
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>('Technical')

  useEffect(() => {
    // Flatten all skills from categories for the available skills list
    const allSkills = Object.values(SKILL_CATEGORIES).flat()
    setAvailableSkills(allSkills)
  }, [])

  const handleSave = () => {
    onUpdate(editedAgent)
    setIsEditing(false)
  }

  const handleAddSkill = (skill: string) => {
    if (!editedAgent.skills?.includes(skill)) {
      setEditedAgent(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skill]
      }))
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setEditedAgent(prev => ({
      ...prev,
      skills: (prev.skills || []).filter(s => s !== skill)
    }))
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'commander': return Crown
      case 'squad_leader': return Shield
      case 'agent': return User
      default: return User
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'busy': return 'bg-amber-500'
      case 'idle': return 'bg-blue-500'
      case 'offline': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-amber-600'
    return 'text-red-600'
  }

  const RoleIcon = getRoleIcon(agent.role)

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
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <RoleIcon className="w-8 h-8 text-white" />
                </div>
                <div className={`absolute -top-1 -right-1 w-6 h-6 ${getStatusColor(agent.status)} rounded-full border-2 border-white`}></div>
              </div>
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAgent.name || ''}
                    onChange={(e) => setEditedAgent(prev => ({ ...prev, name: e.target.value }))}
                    className="text-2xl font-bold bg-white/10 backdrop-blur-sm text-white border border-white/30 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-white/50"
                  />
                ) : (
                  <h2 className="text-2xl font-bold">{agent.name}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-emerald-200 font-medium capitalize">{agent.role.replace('_', ' ')}</span>
                  {agent.squad && (
                    <>
                      <span className="text-white/60">•</span>
                      <span className="text-amber-200">{agent.squad} Squad</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(Math.floor(agent.performance_score / 20))].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-200 fill-current" />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
                >
                  <Edit className="w-5 h-5 text-white" />
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
                >
                  <Save className="w-5 h-5 text-white" />
                </button>
              )}
              
              <button
                onClick={() => onDelete(agent.id)}
                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-white" />
              </button>

              <button
                onClick={onClose}
                className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editedAgent.description || ''}
                onChange={(e) => setEditedAgent(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="Describe this agent's role and responsibilities..."
              />
            ) : (
              <p className="text-gray-700 bg-gray-50 rounded-lg p-3">
                {agent.description || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Current Task */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Task</label>
            {isEditing ? (
              <input
                type="text"
                value={editedAgent.current_task || ''}
                onChange={(e) => setEditedAgent(prev => ({ ...prev, current_task: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder="What is this agent currently working on?"
              />
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-blue-700">{agent.current_task || 'No current task assigned'}</span>
              </div>
            )}
          </div>

          {/* Status */}
          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editedAgent.status || agent.status}
                onChange={(e) => setEditedAgent(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="busy">Busy</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          )}

          {/* Performance Metrics */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Performance Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <div className={`text-2xl font-bold ${getPerformanceColor(agent.performance_score)}`}>
                  {agent.performance_score}%
                </div>
                <div className="text-sm text-green-600">Performance</div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Target className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{agent.missions_completed}</div>
                <div className="text-sm text-blue-600">Completed</div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Activity className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{agent.success_rate}%</div>
                <div className="text-sm text-purple-600">Success Rate</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <Clock className="w-6 h-6 text-amber-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-600">{Math.round(agent.total_uptime / 60)}h</div>
                <div className="text-sm text-amber-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-600" />
                Skills
              </h3>
              {isEditing && (
                <div className="text-sm text-gray-500">
                  Click skills below to add/remove
                </div>
              )}
            </div>

            {/* Current Skills */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {(editedAgent.skills || agent.skills).map((skill) => (
                  <motion.span
                    key={skill}
                    whileHover={{ scale: isEditing ? 1.05 : 1 }}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 flex items-center gap-1 ${
                      isEditing 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-300 cursor-pointer hover:bg-emerald-200' 
                        : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    }`}
                    onClick={() => isEditing && handleRemoveSkill(skill)}
                  >
                    {skill}
                    {isEditing && <Minus className="w-3 h-3" />}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Add Skills (when editing) */}
            {isEditing && (
              <div>
                <div className="mb-3">
                  <div className="flex gap-2">
                    {(Object.keys(SKILL_CATEGORIES) as SkillCategory[]).map((category) => (
                      <button
                        key={category}
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

                <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                  <div className="flex flex-wrap gap-1">
                    {SKILL_CATEGORIES[selectedCategory].map((skill) => {
                      const isSelected = (editedAgent.skills || agent.skills).includes(skill)
                      return (
                        <motion.button
                          key={skill}
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
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditedAgent(agent)
                }}
                className="px-6 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}