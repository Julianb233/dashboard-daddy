'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface ApiError {
  message: string
  status?: number
}

// Generic fetch function with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new ApiError(`API Error: ${errorData.message || response.statusText}`, response.status)
  }

  return response.json()
}

// Dashboard Stats
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => fetchApi('/api/dashboard/stats'),
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Activity Data
export function useActivityData(timeframe: '24h' | '7d' | '30d' = '24h') {
  return useQuery({
    queryKey: ['activity', timeframe],
    queryFn: () => fetchApi(`/api/stats/activity?timeframe=${timeframe}`),
    refetchInterval: 60000, // Refetch every minute
  })
}

// Recent Activity
export function useRecentActivity() {
  return useQuery({
    queryKey: ['activity', 'recent'],
    queryFn: () => fetchApi('/api/activity/recent'),
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

// Agents
export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: () => fetchApi('/api/agents'),
    refetchInterval: 10000, // Refetch every 10 seconds
  })
}

// Tasks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => fetchApi('/api/tasks'),
    refetchInterval: 30000,
  })
}

export function useTaskSummary() {
  return useQuery({
    queryKey: ['tasks', 'summary'],
    queryFn: () => fetchApi('/api/tasks/summary'),
    refetchInterval: 30000,
  })
}

export function useRecentTasks() {
  return useQuery({
    queryKey: ['tasks', 'recent'],
    queryFn: () => fetchApi('/api/tasks/recent'),
    refetchInterval: 60000,
  })
}

// System Health
export function useSystemMetrics() {
  return useQuery({
    queryKey: ['system', 'metrics'],
    queryFn: () => fetchApi('/api/system/metrics'),
    refetchInterval: 15000, // Refetch every 15 seconds
  })
}

export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => fetchApi('/api/system/health'),
    refetchInterval: 20000, // Refetch every 20 seconds
  })
}

// Mutations
export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (taskData: any) => fetchApi('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    }),
    onSuccess: () => {
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...updates }: { id: string; [key: string]: any }) =>
      fetchApi(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => fetchApi(`/api/tasks/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Error boundary for API errors
export class ApiError extends Error {
  status?: number
  
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}