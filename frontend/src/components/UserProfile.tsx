'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/auth/login'
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-4 border-t border-gray-700">
        <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded animate-pulse w-24 mb-2" />
          <div className="h-3 bg-gray-700 rounded animate-pulse w-32" />
        </div>
      </div>
    )
  }

  if (!user) return null

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || '?'

  return (
    <div className="flex items-center gap-3 p-4 border-t border-gray-700">
      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
        {user.user_metadata?.avatar_url ? (
          <img
            src={user.user_metadata.avatar_url}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {user.user_metadata?.full_name || 'User'}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {user.email}
        </p>
      </div>
      <button
        onClick={handleSignOut}
        className="p-2 text-gray-400 hover:text-white rounded-md hover:bg-gray-700"
        title="Sign out"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  )
}
