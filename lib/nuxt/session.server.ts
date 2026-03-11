import { deleteCookie, getCookie, setCookie, type H3Event } from 'h3'
import type { SessionPort } from '../core/ports'
import { DEFAULT_SESSION_COOKIE } from './constants'

export function createNuxtSessionPort(event: H3Event, cookieName: string = DEFAULT_SESSION_COOKIE): SessionPort {
  return {
    async setAdminSession() {
      setCookie(event, cookieName, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60,
        path: '/',
      })
    },

    async clearAdminSession() {
      deleteCookie(event, cookieName, { path: '/' })
    },

    async hasAdminSession() {
      return Boolean(getCookie(event, cookieName))
    },
  }
}
