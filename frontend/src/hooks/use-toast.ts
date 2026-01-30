import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
}

const toastState: ToastState = { toasts: [] }
const listeners: Set<() => void> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).substr(2, 9)
  toastState.toasts = [...toastState.toasts, { id, title, description, variant }]
  notifyListeners()
  
  setTimeout(() => {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id)
    notifyListeners()
  }, 5000)
  
  return { id, dismiss: () => {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id)
    notifyListeners()
  }}
}

export function useToast() {
  const [, forceUpdate] = useState({})
  
  useState(() => {
    const listener = () => forceUpdate({})
    listeners.add(listener)
    return () => listeners.delete(listener)
  })

  return { toast, toasts: toastState.toasts }
}

export { type Toast }
