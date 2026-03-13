import crypto from 'node:crypto'
import type { Request, Response, NextFunction } from 'express'

export interface CsrfOptions {
  enabled?: boolean
  cookieName?: string
  headerName?: string
}

const DEFAULT_COOKIE_NAME = 'changelog-csrf'
const DEFAULT_HEADER_NAME = 'x-csrf-token'

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

function serializeCookie(name: string, value: string): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax${secure}`
}

function isStateChanging(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())
}

export function csrfProtection(options: CsrfOptions = {}) {
  if (options.enabled === false) {
    return (_req: Request, _res: Response, next: NextFunction) => next()
  }

  const cookieName = options.cookieName || DEFAULT_COOKIE_NAME
  const headerName = options.headerName || DEFAULT_HEADER_NAME

  return (req: Request, res: Response, next: NextFunction) => {
    const cookies = parseCookies(req.headers.cookie)
    let token = cookies[cookieName]

    if (!token) {
      token = crypto.randomBytes(32).toString('base64url')
      res.append('Set-Cookie', serializeCookie(cookieName, token))
    }

    if (!isStateChanging(req.method)) {
      return next()
    }

    const headerValue = req.get(headerName) || req.get(headerName.toLowerCase())
    if (!headerValue || headerValue !== token) {
      res.status(403).json({ success: false, error: 'CSRF token missing or invalid.' })
      return
    }

    next()
  }
}
