import { beforeEach, vi } from 'vitest'

const cookieStore = new Map<string, string>()

vi.mock('server-only', () => ({}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (key: string) => {
      const value = cookieStore.get(key)
      return value ? { value } : undefined
    },
    set: (key: string, value: string) => {
      cookieStore.set(key, value)
    },
    delete: (key: string) => {
      cookieStore.delete(key)
    },
  }),
}))

beforeEach(() => {
  cookieStore.clear()
})
