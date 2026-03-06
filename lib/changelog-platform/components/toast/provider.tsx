'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

type ToastTone = 'success' | 'error'

interface ToastItem {
  id: number
  message: string
  tone: ToastTone
}

interface ToastContextValue {
  showToast: (message: string, tone?: ToastTone, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const showToast = useCallback((message: string, tone: ToastTone = 'success', durationMs: number = 3500) => {
    if (!message) return

    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, tone }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, durationMs)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <div className="cl-toast-viewport" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div key={toast.id} className={`cl-alert ${toast.tone === 'success' ? 'cl-alert-success' : 'cl-alert-error'} cl-toast-item`}>
            <div className="cl-alert-description">{toast.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }

  return context
}