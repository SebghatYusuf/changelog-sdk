import type { Request, Response } from 'express'
import type { SessionPort } from '../core/ports'
import { createSignedSessionToken, getValidSessionSecret, verifySignedSessionToken } from '../core/session-token'
import { DEFAULT_SESSION_COOKIE } from './constants'

const SESSION_TTL_SECONDS = 24 * 60 * 60
const MIN_SESSION_SECRET_LENGTH = 32

interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'lax' | 'strict' | 'none'
  maxAge?: number
  path?: string
  expires?: Date
}

function getSessionSecret(): string | undefined {
  return getValidSessionSecret(
    [
      process.env.CHANGELOG_SESSION_SECRET,
      process.env.EXPRESS_SESSION_SECRET,
    ],
    MIN_SESSION_SECRET_LENGTH
  )
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  const parts = cookieHeader.split(';')
  for (const part of parts) {
    const [rawName, ...rawValue] = part.trim().split('=')
    if (!rawName) continue
    const name = rawName.trim()
    const value = rawValue.join('=')
    cookies[name] = decodeURIComponent(value || '')
  }
  return cookies
}

function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const segments = [`${name}=${encodeURIComponent(value)}`]
  if (options.maxAge !== undefined) segments.push(`Max-Age=${options.maxAge}`)
  if (options.expires) segments.push(`Expires=${options.expires.toUTCString()}`)
  segments.push(`Path=${options.path || '/'}`)
  if (options.httpOnly) segments.push('HttpOnly')
  if (options.secure) segments.push('Secure')
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`)
  return segments.join('; ')
}

function appendCookie(res: Response, cookie: string) {
  res.append('Set-Cookie', cookie)
}

export function createExpressSessionPort(
  req: Request,
  res: Response,
  cookieName: string = DEFAULT_SESSION_COOKIE
): SessionPort {
  return {
    async setAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        throw new Error(`Session secret is not configured or too short. Set CHANGELOG_SESSION_SECRET (min ${MIN_SESSION_SECRET_LENGTH} characters).`)
      }

      const token = await createSignedSessionToken(secret, SESSION_TTL_SECONDS)
      appendCookie(
        res,
        serializeCookie(cookieName, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: SESSION_TTL_SECONDS,
          path: '/',
        })
      )
    },

    async clearAdminSession() {
      appendCookie(
        res,
        serializeCookie(cookieName, '', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0,
          path: '/',
          expires: new Date(0),
        })
      )
    },

    async hasAdminSession() {
      const secret = getSessionSecret()
      if (!secret) {
        return false
      }

      const cookies = parseCookies(req.headers.cookie)
      const token = cookies[cookieName]
      return verifySignedSessionToken(token, secret)
    },
  }
}
