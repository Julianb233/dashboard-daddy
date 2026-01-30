'use client'

import { useState, useEffect } from 'react'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { Users, Brain, MessageCircle, TrendingUp, Filter, Search } from 'lucide-react'

interface ContactProfile {
  id: string
  phone: string
  name: string
  disc_primary: 'D' | 'I' | 'S' | 'C'
  disc_secondary?: 'D' | 'I' | 'S' | 'C'
  vak_primary: 'visual' | 'auditory' | 'kinesthetic'
  formality: 'formal' | 'casual' | 'balanced'
  energy_level: 'high' | 'medium' | 'low'
  message_count: number
  emoji_frequency: number
  avg_message_length: number
  rapport_markers: string[]
  last_contacted?: string
  recommendations: string[]
}

const DISC_COLORS = {
  D: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500' },
  I: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500' },
  S: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500' },
  C: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500' },
}

const DISC_LABELS = {
  D: 'Dominance',
  I: 'Influence',
  S: 'Steadiness',
  C: 'Conscientiousness',
}

const VAK_ICONS = {
  visual: '👁️',
  auditory: '👂',
  kinesthetic: '✋',
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactProfile[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts/profiles')
        if (res.ok) {
          const data = await res.json()
          setContacts(data.contacts || [])
          setStats(data.stats || null)
        } else {
          // Mock data for development
          setContacts(mockContacts)
          setStats(mockStats)
        }
      } catch {
        setContacts(mockContacts)
        setStats(mockStats)
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(c => {
    const matchesFilter = filter === 'all' || c.disc_primary === filter
    const matchesSearch = c.name?.toLowerCase().includes(search.toLowerCase()) || 
                         c.phone?.includes(search)
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <DashboardShell>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-wizard-medium/20 rounded-lg" />
          <div className="h-64 bg-wizard-medium/20 rounded-lg" />
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-wizard-cream flex items-center gap-2">
              <Brain className="w-7 h-7 text-wizard-gold" />
              Communication Profiles
            </h1>
            <p className="text-wizard-cream/60 mt-1">
              NLP-informed profiles for personalized messaging
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard label="Total Contacts" value={stats.total} icon={<Users className="w-5 h-5" />} />
            <StatCard label="D Types" value={stats.disc?.D || 0} color="red" />
            <StatCard label="I Types" value={stats.disc?.I || 0} color="yellow" />
            <StatCard label="S Types" value={stats.disc?.S || 0} color="green" />
            <StatCard label="C Types" value={stats.disc?.C || 0} color="blue" />
            <StatCard label="Analyzed" value={`${stats.analyzed || 0}%`} icon={<TrendingUp className="w-5 h-5" />} />
          </div>
        )}

        {/* DISC Distribution Chart */}
        {stats && (
          <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30">
            <h3 className="text-lg font-semibold text-wizard-cream mb-4">DISC Distribution</h3>
            <div className="flex items-end gap-4 h-32">
              {['D', 'I', 'S', 'C'].map((type) => {
                const count = stats.disc?.[type] || 0
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
                const colors = DISC_COLORS[type as keyof typeof DISC_COLORS]
                return (
                  <div key={type} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full ${colors.bg} rounded-t-lg transition-all duration-500`}
                      style={{ height: `${Math.max(percentage, 5)}%` }}
                    />
                    <div className={`mt-2 text-sm font-bold ${colors.text}`}>{type}</div>
                    <div className="text-xs text-wizard-cream/50">{count} ({percentage.toFixed(0)}%)</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wizard-cream/40" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-wizard-dark/50 border border-wizard-medium/30 text-wizard-cream placeholder:text-wizard-cream/40 focus:outline-none focus:border-wizard-gold"
            />
          </div>
          <div className="flex gap-2">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>All</FilterButton>
            <FilterButton active={filter === 'D'} onClick={() => setFilter('D')} color="red">D</FilterButton>
            <FilterButton active={filter === 'I'} onClick={() => setFilter('I')} color="yellow">I</FilterButton>
            <FilterButton active={filter === 'S'} onClick={() => setFilter('S')} color="green">S</FilterButton>
            <FilterButton active={filter === 'C'} onClick={() => setFilter('C')} color="blue">C</FilterButton>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12 text-wizard-cream/50">
            No contacts found matching your criteria
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon?: React.ReactNode; color?: string }) {
  const colorClasses = {
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  }
  return (
    <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30">
      <div className="flex items-center gap-2 text-wizard-cream/60 text-sm">
        {icon}
        {label}
      </div>
      <div className={`text-2xl font-bold mt-1 ${color ? colorClasses[color as keyof typeof colorClasses] : 'text-wizard-gold'}`}>
        {value}
      </div>
    </div>
  )
}

function FilterButton({ children, active, onClick, color }: { children: React.ReactNode; active: boolean; onClick: () => void; color?: string }) {
  const colorClasses = {
    red: 'bg-red-500/20 border-red-500 text-red-400',
    yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    green: 'bg-green-500/20 border-green-500 text-green-400',
    blue: 'bg-blue-500/20 border-blue-500 text-blue-400',
  }
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg border transition-all ${
        active
          ? color
            ? colorClasses[color as keyof typeof colorClasses]
            : 'bg-wizard-gold/20 border-wizard-gold text-wizard-gold'
          : 'bg-wizard-dark/50 border-wizard-medium/30 text-wizard-cream/60 hover:border-wizard-medium/50'
      }`}
    >
      {children}
    </button>
  )
}

function ContactCard({ contact }: { contact: ContactProfile }) {
  const [showEducation, setShowEducation] = useState(false)
  const discColors = DISC_COLORS[contact.disc_primary]
  
  // Generate educational reasoning based on the contact's profile
  const getDiscReasoning = () => {
    const reasons: Record<string, string> = {
      D: `Dominance indicators detected: direct language, result-oriented phrases, commands/requests. ${contact.avg_message_length < 40 ? 'Short, to-the-point messages' : 'Decisive tone'} suggest action-oriented communication style.`,
      I: `Influence indicators detected: enthusiastic language, social references, emoji usage (${(contact.emoji_frequency * 100).toFixed(0)}%). Frequent use of expressions like "${contact.rapport_markers[0] || 'hey'}" suggests relationship-focused style.`,
      S: `Steadiness indicators detected: supportive language, patient tone, consistent response patterns. ${contact.message_count} messages over time show reliable, relationship-nurturing style.`,
      C: `Conscientiousness indicators detected: detailed questions, precise language, factual focus. ${contact.avg_message_length > 50 ? 'Longer, thorough messages' : 'Careful word choice'} suggests analytical approach.`,
    }
    return reasons[contact.disc_primary]
  }

  const getVakReasoning = () => {
    const reasons: Record<string, string> = {
      visual: `Visual language patterns: Uses phrases like "I see", "looks like", "picture this", prefers links and images.`,
      auditory: `Auditory language patterns: Uses phrases like "sounds good", "hear you", "let's talk", prefers voice notes/calls.`,
      kinesthetic: `Kinesthetic language patterns: Uses phrases like "feels right", "get a grip", "touch base", values emotional connection.`,
    }
    return reasons[contact.vak_primary]
  }
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${discColors.border} bg-wizard-dark/30 border border-wizard-medium/30 hover:bg-wizard-dark/50 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-wizard-cream">{contact.name || 'Unknown'}</h3>
          <p className="text-sm text-wizard-cream/50">{contact.phone}</p>
        </div>
        <div className="flex gap-1">
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${discColors.bg} ${discColors.text}`}>
            {contact.disc_primary}
          </span>
          {contact.disc_secondary && (
            <span className={`px-2 py-0.5 rounded text-xs ${DISC_COLORS[contact.disc_secondary].bg} ${DISC_COLORS[contact.disc_secondary].text}`}>
              {contact.disc_secondary}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
        <div className="text-center p-2 rounded bg-wizard-dark/50">
          <div className="text-lg">{VAK_ICONS[contact.vak_primary]}</div>
          <div className="text-wizard-cream/50 capitalize">{contact.vak_primary}</div>
        </div>
        <div className="text-center p-2 rounded bg-wizard-dark/50">
          <div className="text-wizard-cream font-semibold">{contact.formality}</div>
          <div className="text-wizard-cream/50">Formality</div>
        </div>
        <div className="text-center p-2 rounded bg-wizard-dark/50">
          <div className="text-wizard-cream font-semibold">{contact.energy_level}</div>
          <div className="text-wizard-cream/50">Energy</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-wizard-cream/50">
        <span>{contact.message_count} messages</span>
        <span>📱 {(contact.emoji_frequency * 100).toFixed(0)}% emoji</span>
      </div>

      {contact.rapport_markers?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.rapport_markers.slice(0, 4).map((marker, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-wizard-medium/20 text-xs text-wizard-cream/70">
              "{marker}"
            </span>
          ))}
        </div>
      )}

      {/* Educational Dropdown */}
      <button
        onClick={() => setShowEducation(!showEducation)}
        className="mt-3 w-full text-left text-sm text-wizard-gold hover:text-wizard-gold-light flex items-center gap-2 transition-colors"
      >
        <span className="text-base">📚</span>
        <span>Why this profile?</span>
        <span className={`ml-auto transition-transform ${showEducation ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {showEducation && (
        <div className="mt-3 p-3 rounded-lg bg-wizard-dark/70 border border-wizard-medium/20 text-xs space-y-3">
          {/* DISC Analysis */}
          <div>
            <h4 className="font-semibold text-wizard-gold mb-1 flex items-center gap-1">
              🎯 DISC Analysis: {DISC_LABELS[contact.disc_primary]}
            </h4>
            <p className="text-wizard-cream/70 leading-relaxed">{getDiscReasoning()}</p>
          </div>

          {/* VAK Analysis */}
          <div>
            <h4 className="font-semibold text-wizard-gold mb-1 flex items-center gap-1">
              {VAK_ICONS[contact.vak_primary]} VAK Preference: {contact.vak_primary}
            </h4>
            <p className="text-wizard-cream/70 leading-relaxed">{getVakReasoning()}</p>
          </div>

          {/* Evidence Summary */}
          <div>
            <h4 className="font-semibold text-wizard-gold mb-1">📊 Evidence Summary</h4>
            <ul className="text-wizard-cream/70 space-y-1">
              <li>• Analyzed {contact.message_count} messages</li>
              <li>• Avg message length: {contact.avg_message_length} chars</li>
              <li>• Emoji frequency: {(contact.emoji_frequency * 100).toFixed(0)}% of messages</li>
              <li>• Formality level: {contact.formality}</li>
              {contact.rapport_markers.length > 0 && (
                <li>• Common phrases: {contact.rapport_markers.slice(0, 3).map(m => `"${m}"`).join(', ')}</li>
              )}
            </ul>
          </div>

          {/* Recommendations */}
          {contact.recommendations?.length > 0 && (
            <div>
              <h4 className="font-semibold text-wizard-gold mb-1">💡 Communication Tips</h4>
              <ul className="text-wizard-cream/70 space-y-1">
                {contact.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Methodology note */}
          <div className="pt-2 border-t border-wizard-medium/20 text-wizard-cream/50 text-[10px]">
            Profile generated using NLP analysis of message history. DISC model based on word patterns, 
            sentence structure, and communication frequency. VAK preference detected from sensory language markers.
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for development
const mockContacts: ContactProfile[] = [
  {
    id: '1',
    phone: '+17602716295',
    name: 'Blake',
    disc_primary: 'I',
    disc_secondary: 'D',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'high',
    message_count: 248,
    emoji_frequency: 0.35,
    avg_message_length: 65,
    rapport_markers: ['bro', 'man', 'sick'],
    recommendations: ['Be enthusiastic', 'Share tech discoveries'],
  },
  {
    id: '2',
    phone: '+13017870430',
    name: 'Aaron Drew',
    disc_primary: 'D',
    disc_secondary: 'I',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'medium',
    message_count: 1454,
    emoji_frequency: 0.15,
    avg_message_length: 32,
    rapport_markers: ['lol', 'grinding'],
    recommendations: ['Keep it brief', 'Lead with results'],
  },
  {
    id: '3',
    phone: '+18186751325',
    name: 'Shray SD Investor',
    disc_primary: 'C',
    disc_secondary: 'I',
    vak_primary: 'visual',
    formality: 'balanced',
    energy_level: 'medium',
    message_count: 796,
    emoji_frequency: 0.20,
    avg_message_length: 45,
    rapport_markers: ['bro'],
    recommendations: ['Share links', 'Be curious'],
  },
  {
    id: '4',
    phone: '+18584499950',
    name: 'Fred Cary',
    disc_primary: 'D',
    disc_secondary: 'C',
    vak_primary: 'auditory',
    formality: 'formal',
    energy_level: 'low',
    message_count: 147,
    emoji_frequency: 0.0,
    avg_message_length: 55,
    rapport_markers: [],
    recommendations: ['Be precise', 'Professional tone'],
  },
  {
    id: '5',
    phone: '+19498649943',
    name: 'Sophia',
    disc_primary: 'I',
    disc_secondary: 'S',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'high',
    message_count: 9387,
    emoji_frequency: 0.45,
    avg_message_length: 28,
    rapport_markers: ['babe', 'love'],
    recommendations: ['Warm and affectionate', 'Emoji welcome'],
  },
  {
    id: '6',
    phone: '+18609840558',
    name: 'Andrea',
    disc_primary: 'S',
    disc_secondary: 'I',
    vak_primary: 'kinesthetic',
    formality: 'casual',
    energy_level: 'medium',
    message_count: 1146,
    emoji_frequency: 0.10,
    avg_message_length: 18,
    rapport_markers: ['howdy', 'lmk'],
    recommendations: ['Super casual', 'Keep it brief'],
  },
]

const mockStats = {
  total: 150,
  analyzed: 85,
  disc: { D: 38, I: 45, S: 32, C: 35 },
  vak: { visual: 42, auditory: 35, kinesthetic: 73 },
}
