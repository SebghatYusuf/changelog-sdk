import { inject, provide, reactive } from 'vue'

export type ToastTone = 'success' | 'error'

export interface ToastItem {
  id: string
  message: string
  tone: ToastTone
}

export interface ToastApi {
  toasts: ToastItem[]
  showToast: (message: string, tone: ToastTone) => void
  removeToast: (id: string) => void
}

const TOAST_KEY = Symbol('changelog-toast')

export function provideToast() {
  const state = reactive<{ toasts: ToastItem[] }>({ toasts: [] })

  const removeToast = (id: string) => {
    state.toasts = state.toasts.filter((toast) => toast.id !== id)
  }

  const showToast = (message: string, tone: ToastTone) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    state.toasts = [...state.toasts, { id, message, tone }]
    setTimeout(() => removeToast(id), 3500)
  }

  const api: ToastApi = {
    get toasts() {
      return state.toasts
    },
    showToast,
    removeToast,
  }

  provide(TOAST_KEY, api)
  return api
}

export function useToast() {
  const api = inject<ToastApi>(TOAST_KEY)
  if (!api) {
    throw new Error('Toast provider not found')
  }
  return api
}
