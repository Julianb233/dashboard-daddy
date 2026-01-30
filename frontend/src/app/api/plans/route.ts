import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface Plan {
  id: string
  title: string
  summary: string           // High-level overview
  details: string           // Detailed breakdown
  reasoning: string         // Why I made these decisions
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  priority: 'high' | 'medium' | 'low'
  category: string          // contacts, dashboard, automation, etc.
  estimated_effort: string  // "2 hours", "1 day", etc.
  created_at: string
  reviewed_at?: string
  feedback?: string
}

// Demo plans while we build out the table
const demoPlans: Plan[] = [
  {
    id: '1',
    title: 'Contact Organization & Consolidation',
    summary: 'Clean up 7,145 Google Contacts - remove duplicates, add relationship fields, organize into groups.',
    details: `**Phase 1: Audit**
- Scan all contacts for duplicates (same phone/email)
- Identify contacts missing key info
- Generate report for review

**Phase 2: Consolidate**
- Merge duplicates, keep richest data
- Archive or soft-delete extras

**Phase 3: Categorize**
- Create groups: VIP Clients, Mentors, Business Partners, Friends, Family
- Auto-assign based on existing data

**Phase 4: Enrich**
- Add relationship fields to top 100 contacts
- Set follow-up schedules`,
    reasoning: `**Why this approach:**
1. Audit first = no destructive changes until you approve
2. Groups align with Keith Ferrazzi's relationship categories
3. Starting with top 100 focuses effort on highest-value relationships
4. Timezone inference from area codes enables smart follow-up timing`,
    status: 'pending',
    priority: 'high',
    category: 'contacts',
    estimated_effort: '4 hours',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Mac Mini Life Scripts Setup',
    summary: 'Install and configure top 10 life optimization scripts on Mac Mini.',
    details: `**Scripts to Install:**
1. Morning Briefing (7 AM)
2. Relationship Nurturing Pulse
3. Calendar Conflict Guardian
4. Email Triage + Draft
5. Meeting Prep Generator
6. End of Day Summary (6 PM)

**Requirements:**
- Clawdbot installed on Mac Mini
- Full Disk Access enabled
- Calendar/Contacts permissions`,
    reasoning: `**Why these 6 first:**
1. They only need APIs I already have access to
2. They cover morning → evening workflow
3. Relationship focus aligns with your Keith Ferrazzi goals
4. Email triage will save significant daily time`,
    status: 'pending',
    priority: 'high',
    category: 'automation',
    estimated_effort: '2 hours',
    created_at: new Date().toISOString()
  }
]

export async function GET() {
  // For now return demo plans - will connect to Supabase table
  return NextResponse.json({ plans: demoPlans })
}

export async function POST(request: Request) {
  const body = await request.json()
  // Will save to Supabase
  return NextResponse.json({ success: true, plan: body })
}

export async function PATCH(request: Request) {
  const body = await request.json()
  const { id, status, feedback } = body
  // Will update in Supabase
  return NextResponse.json({ success: true, updated: { id, status, feedback } })
}
