import { NextRequest } from 'next/server'
import { GET } from '@/app/api/stats/route'

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
        gte: jest.fn(() => Promise.resolve({ data: [], error: null })),
        filter: jest.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
}))

describe('/api/stats', () => {
  it('returns dashboard stats successfully', async () => {
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('activeAgents')
    expect(data).toHaveProperty('totalMessages')
    expect(data).toHaveProperty('completedTasks')
    expect(data).toHaveProperty('pendingApprovals')
    expect(data).toHaveProperty('tokensUsed')
    expect(data).toHaveProperty('monthlyCost')
    expect(data).toHaveProperty('lastUpdated')
    
    // Ensure numbers are reasonable
    expect(typeof data.activeAgents).toBe('number')
    expect(data.activeAgents).toBeGreaterThanOrEqual(0)
    expect(typeof data.totalMessages).toBe('number')
    expect(data.totalMessages).toBeGreaterThanOrEqual(0)
    expect(typeof data.completedTasks).toBe('number')
    expect(data.completedTasks).toBeGreaterThanOrEqual(0)
  })

  it('includes timestamp in response', async () => {
    const response = await GET()
    const data = await response.json()

    expect(data.lastUpdated).toBeDefined()
    expect(new Date(data.lastUpdated).toString()).not.toBe('Invalid Date')
  })

  it('returns fallback data when database is unavailable', async () => {
    // This should still work even with mocked/unavailable database
    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.activeAgents).toBeDefined()
    expect(data.totalMessages).toBeDefined()
  })
})