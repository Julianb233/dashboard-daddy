import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our tables
export interface Contact {
  id: string
  name: string
  nickname?: string
  phone?: string
  email?: string
  relationship?: string
  notes?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Pet {
  id: string
  name: string
  species: string
  breed?: string
  weight_lbs?: number
  birthdate?: string
  medical_notes?: string
  medications?: string[]
  upcoming_appointments?: string[]
  metadata?: Record<string, any>
  created_at: string
}

export interface ScheduledTask {
  id: string
  title: string
  description?: string
  scheduled_for: string
  reminder_before_mins?: number
  status: string
  recurrence?: string
  category?: string
  metadata?: Record<string, any>
  created_at: string
  completed_at?: string
}

export interface AuditLog {
  id: string
  entity_type: string
  entity_id?: string
  action: string
  actor: string
  changes?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
}

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  start_time: string
  end_time?: string
  all_day: boolean
  calendar_source?: string
  attendees?: any[]
  metadata?: Record<string, any>
  created_at: string
}

export interface DailySummary {
  id: string
  date: string
  tasks_completed: number
  tasks_created: number
  communications_sent: number
  api_cost_cents: number
  highlights?: string[]
  notes?: string
  created_at: string
}
