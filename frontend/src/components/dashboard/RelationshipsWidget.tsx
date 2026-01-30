'use client'

import { useState, useEffect } from 'react'
import { Users, Heart, Briefcase, Star, Clock, MessageCircle } from 'lucide-react'

interface Contact {
  id: string
  name: string
  relationship: 'family' | 'friend' | 'business' | 'client'
  lastContact?: string
  nextFollowUp?: string
  notes?: string
  priority: 'high' | 'medium' | 'low'
}

const relationshipIcons = {
  family: <Heart className="w-4 h-4 text-red-400" />,
  friend: <Star className="w-4 h-4 text-yellow-400" />,
  business: <Briefcase className="w-4 h-4 text-blue-400" />,
  client: <Users className="w-4 h-4 text-green-400" />,
}

const priorityColors = {
  high: 'border-l-red-400',
  medium: 'border-l-yellow-400',
  low: 'border-l-wizard-medium',
}

export function RelationshipsWidget() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContacts() {
      try {
        const res = await fetch('/api/contacts')
        if (res.ok) {
          const data = await res.json()
          setContacts(data)
        } else {
          // Sample data
          setContacts([
            { 
              id: '1', 
              name: 'Rachel Bradley', 
              relationship: 'family', 
              lastContact: '2026-01-30',
              priority: 'high',
              notes: 'Wife'
            },
            { 
              id: '2', 
              name: 'Pamela Bradley', 
              relationship: 'family', 
              lastContact: '2026-01-28',
              nextFollowUp: '2026-02-01',
              priority: 'high',
              notes: 'Mom - call this weekend'
            },
            { 
              id: '3', 
              name: 'Brian Bovenzi', 
              relationship: 'client', 
              lastContact: '2026-01-25',
              nextFollowUp: '2026-01-31',
              priority: 'high',
              notes: 'Pet appointment follow-up'
            },
            { 
              id: '4', 
              name: 'Stephen G. Pope', 
              relationship: 'business', 
              lastContact: '2026-01-20',
              priority: 'medium',
              notes: 'No-Code Architects / Content Academy'
            },
          ])
        }
      } catch {
        setContacts([])
      } finally {
        setLoading(false)
      }
    }
    fetchContacts()
  }, [])

  if (loading) {
    return (
      <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30 animate-pulse">
        <div className="h-6 w-32 bg-wizard-medium/20 rounded mb-4" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-wizard-medium/20 rounded" />
          ))}
        </div>
      </div>
    )
  }

  const needsFollowUp = contacts.filter(c => c.nextFollowUp && new Date(c.nextFollowUp) <= new Date())

  return (
    <div className="p-4 rounded-lg border border-wizard-medium/30 bg-wizard-dark/30 dark:bg-wizard-dark/30 light:bg-white light:border-wizard-emerald/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-wizard-cream dark:text-wizard-cream light:text-wizard-dark flex items-center gap-2">
          <Users className="w-5 h-5 text-wizard-gold" />
          Relationships
        </h3>
        {needsFollowUp.length > 0 && (
          <span className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-full">
            {needsFollowUp.length} follow-up
          </span>
        )}
      </div>

      <div className="space-y-2">
        {contacts.slice(0, 5).map((contact) => (
          <div
            key={contact.id}
            className={`p-3 rounded-lg bg-wizard-dark/50 border-l-4 ${priorityColors[contact.priority]} hover:bg-wizard-dark/70 transition-colors`}
          >
            <div className="flex items-center gap-2">
              {relationshipIcons[contact.relationship]}
              <span className="font-medium text-wizard-cream">{contact.name}</span>
              {contact.nextFollowUp && new Date(contact.nextFollowUp) <= new Date() && (
                <Clock className="w-4 h-4 text-red-400 ml-auto" />
              )}
            </div>
            {contact.notes && (
              <p className="text-xs text-wizard-cream/50 mt-1 flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {contact.notes}
              </p>
            )}
            {contact.lastContact && (
              <p className="text-xs text-wizard-cream/40 mt-1">
                Last: {new Date(contact.lastContact).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {contacts.length === 0 && (
        <p className="text-center text-wizard-cream/50 py-4">No contacts yet</p>
      )}

      <div className="mt-4 pt-4 border-t border-wizard-medium/20 flex justify-between text-xs text-wizard-cream/50">
        <span>{contacts.filter(c => c.relationship === 'family').length} Family</span>
        <span>{contacts.filter(c => c.relationship === 'business').length} Business</span>
        <span>{contacts.filter(c => c.relationship === 'client').length} Clients</span>
        <span>{contacts.filter(c => c.relationship === 'friend').length} Friends</span>
      </div>
    </div>
  )
}
