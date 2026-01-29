'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Task {
  id: string
  title: string
  description?: string
  scheduled_for: string
  status: string
  category?: string
  recurrence?: string
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        setTasks(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="p-6">Loading tasks...</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'active': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>
      
      {tasks.length === 0 ? (
        <p className="text-muted-foreground">No tasks scheduled.</p>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <Card key={task.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                    {task.title}
                  </span>
                  <div className="flex gap-2">
                    {task.category && (
                      <Badge variant="outline">{task.category}</Badge>
                    )}
                    {task.recurrence && (
                      <Badge variant="secondary">🔄 Recurring</Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  📅 {formatDate(task.scheduled_for)}
                </p>
                {task.description && (
                  <p className="text-sm mt-2">{task.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
