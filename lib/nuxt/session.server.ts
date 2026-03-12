import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { SessionPort } from '../core/ports'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { createSignedSessionToken, getValidSessionSecret, verifySignedSessionToken } from '../core/session-token'

const SESSION_TTL_SECONDS = 24 * 60 * 60
const MIN_SESSION_SECRET_LENGTH = 32

function getSessionSecret(): string | undefined {
  return getValidSessionSecret(
    [
      process.env.CHANGELOG_SESSION_SECRET,
      process.env.NUXT_SESSION_PASSWORD,
    ],
    MIN_SESSION_SECRET_LENGTH
  )
}

export function createNuxtSessionPort(event: H3Event, cookieName: string = DEFAULT_SESSION_COOKIE): SessionPort {
  return {
    async setAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        throw new Error(`Session secret is not configured or too short. Set CHANGELOG_SESSION_SECRET (min ${MIN_SESSION_SECRET_LENGTH} characters).`)
      }

      setCookie(event, cookieName, await createSignedSessionToken(secret, SESSION_TTL_SECONDS), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_TTL_SECONDS,
        path: '/',
      })
    },

    async clearAdminSession() {
      deleteCookie(event, cookieName, { path: '/' })
    },

    async hasAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        return false
      }

      const token = getCookie(event, cookieName)
      return verifySignedSessionToken(token, secret)
    },
  }
}
