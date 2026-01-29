'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Contact {
  id: string
  name: string
  nickname?: string
  phone?: string
  email?: string
  relationship?: string
  notes?: string
  created_at: string
}

export default function PeoplePage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/people')
      .then(res => res.json())
      .then(data => {
        setContacts(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading contacts...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">People</h1>
      
      {contacts.length === 0 ? (
        <p className="text-muted-foreground">No contacts yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contacts.map(contact => (
            <Card key={contact.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {contact.name}
                  {contact.relationship && (
                    <Badge variant="secondary">{contact.relationship}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contact.nickname && (
                  <p className="text-sm text-muted-foreground mb-2">
                    aka "{contact.nickname}"
                  </p>
                )}
                {contact.phone && (
                  <p className="text-sm">📞 {contact.phone}</p>
                )}
                {contact.email && (
                  <p className="text-sm">✉️ {contact.email}</p>
                )}
                {contact.notes && (
                  <p className="text-sm mt-2 text-muted-foreground">{contact.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
