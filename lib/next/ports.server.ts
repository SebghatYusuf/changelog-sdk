import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { AIProviderPort, AISettingsRepository, CacheInvalidationPort, SessionPort } from '../core/ports'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { createDefaultAIProviderPort } from '../adapters/ai-provider'

export function createNextSessionPort(cookieName: string = DEFAULT_SESSION_COOKIE): SessionPort {
  return {
    async setAdminSession() {
      const cookieStore = await cookies()
      cookieStore.set(cookieName, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
      })
    },

    async clearAdminSession() {
      const cookieStore = await cookies()
      cookieStore.delete(cookieName)
    },

    async hasAdminSession() {
      const cookieStore = await cookies()
      return !!cookieStore.get(cookieName)?.value
    },
  }
}

export function createNextCacheInvalidationPort(pathname: string = '/changelog'): CacheInvalidationPort {
  return {
    revalidateChangelog() {
      revalidatePath(pathname)
    },
  }
}

export function createNextAIProviderPort(aiSettingsRepository: AISettingsRepository): AIProviderPort {
  return createDefaultAIProviderPort(aiSettingsRepository)
}

export { DEFAULT_SESSION_COOKIE }
