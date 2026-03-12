import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import type { AIProviderPort, AISettingsRepository, CacheInvalidationPort, SessionPort } from '../core/ports'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { createDefaultAIProviderPort } from '../adapters/ai-provider'
import { createSignedSessionToken, getValidSessionSecret, verifySignedSessionToken } from '../core/session-token'

const SESSION_TTL_SECONDS = 24 * 60 * 60
const MIN_SESSION_SECRET_LENGTH = 32

function getSessionSecret(): string | undefined {
  return getValidSessionSecret(
    [
      process.env.CHANGELOG_SESSION_SECRET,
      process.env.NEXTAUTH_SECRET,
    ],
    MIN_SESSION_SECRET_LENGTH
  )
}

export function createNextSessionPort(cookieName: string = DEFAULT_SESSION_COOKIE): SessionPort {
  return {
    async setAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        throw new Error(`Session secret is not configured or too short. Set CHANGELOG_SESSION_SECRET (min ${MIN_SESSION_SECRET_LENGTH} characters).`)
      }

      const cookieStore = await cookies()
      cookieStore.set(cookieName, await createSignedSessionToken(secret, SESSION_TTL_SECONDS), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_SECONDS,
      })
    },

    async clearAdminSession() {
      const cookieStore = await cookies()
      cookieStore.delete(cookieName)
    },

    async hasAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        return false
      }

      const cookieStore = await cookies()
      const token = cookieStore.get(cookieName)?.value
      return verifySignedSessionToken(token, secret)
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
