import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { AIProviderPort, CacheInvalidationPort, SessionPort } from '../core/ports'
import type { AIProviderKind } from '../core/constants'
import enhanceChangelog from '../changelog-platform/ai/enhancer'
import { AIProviderFactory } from '../changelog-platform/ai/provider'
import { DEFAULT_SESSION_COOKIE } from './constants'

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

export function createNextAIProviderPort(): AIProviderPort {
  return {
    enhance(rawNotes: string, currentVersion?: string) {
      return enhanceChangelog(rawNotes, currentVersion)
    },

    listModels(input: { provider: AIProviderKind; ollamaBaseUrl?: string }) {
      return AIProviderFactory.listModels({
        provider: input.provider,
        apiKey: undefined,
        baseUrl: input.ollamaBaseUrl,
      })
    },
  }
}

export { DEFAULT_SESSION_COOKIE }
