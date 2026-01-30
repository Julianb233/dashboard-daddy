import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { vi } from 'vitest'

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

// Mock the API hook
vi.mock('@/hooks/useApi', () => ({
  useDashboardStats: vi.fn(),
}))

import { useDashboardStats } from '@/hooks/useApi'
const mockUseDashboardStats = useDashboardStats as vi.MockedFunction<typeof useDashboardStats>

describe('DashboardStats', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    })
  })

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    )
  }

  it('renders loading state', () => {
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any)

    renderWithProviders(<DashboardStats />)
    
    // Should show 6 skeleton cards with shimmer class
    const shimmerElements = screen.getAllByText((content, element) => {
      return element?.className?.includes('shimmer') || false
    })
    expect(shimmerElements.length).toBeGreaterThan(0)
  })

  it('renders stats data successfully', () => {
    const mockData = {
      activeAgents: 5,
      totalMessages: 100,
      completedTasks: 25,
      pendingApprovals: 3,
      tokensUsed: 50000,
      monthlyCost: 49.99,
    }

    mockUseDashboardStats.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardStats />)

    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('50.0K')).toBeInTheDocument()
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })

  it('handles error state gracefully', () => {
    mockUseDashboardStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('API Error'),
    } as any)

    renderWithProviders(<DashboardStats />)

    expect(screen.getByText(/Failed to load dashboard stats/)).toBeInTheDocument()
  })

  it('shows correct stat titles', () => {
    mockUseDashboardStats.mockReturnValue({
      data: {
        activeAgents: 5,
        totalMessages: 100,
        completedTasks: 25,
        pendingApprovals: 3,
        tokensUsed: 50000,
        monthlyCost: 49.99,
      },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardStats />)

    expect(screen.getByText('Active Agents')).toBeInTheDocument()
    expect(screen.getByText('Messages Today')).toBeInTheDocument()
    expect(screen.getByText('Tasks Completed')).toBeInTheDocument()
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument()
    expect(screen.getByText('Tokens Used')).toBeInTheDocument()
    expect(screen.getByText('Monthly Cost')).toBeInTheDocument()
  })

  it('formats large numbers correctly', () => {
    mockUseDashboardStats.mockReturnValue({
      data: {
        activeAgents: 5,
        totalMessages: 1500, // Should become 1.5K
        completedTasks: 25,
        pendingApprovals: 3,
        tokensUsed: 892,
        monthlyCost: 49.99,
      },
      isLoading: false,
      error: null,
    } as any)

    renderWithProviders(<DashboardStats />)

    // Check that numbers are displayed (formatting might vary)
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('1.5K')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('892')).toBeInTheDocument()
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })
})