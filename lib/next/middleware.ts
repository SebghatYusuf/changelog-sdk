import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { getValidSessionSecret, verifySignedSessionToken } from '../core/session-token'

const MIN_SESSION_SECRET_LENGTH = 32
const DEFAULT_CHANGELOG_BASE_PATH = '/changelog'

export interface AuthMiddlewareOptions {
  cookieName?: string
  basePath?: string
}

function normalizeBasePath(basePath?: string): string {
  const candidate = (basePath ?? DEFAULT_CHANGELOG_BASE_PATH).trim()
  if (!candidate) return DEFAULT_CHANGELOG_BASE_PATH

  const withLeadingSlash = candidate.startsWith('/') ? candidate : `/${candidate}`
  if (withLeadingSlash === '/') return '/'

  return withLeadingSlash.replace(/\/+$/, '')
}

function resolveAuthMiddlewareOptions(cookieNameOrOptions?: string | AuthMiddlewareOptions) {
  if (typeof cookieNameOrOptions === 'string') {
    return {
      cookieName: cookieNameOrOptions,
      basePath: DEFAULT_CHANGELOG_BASE_PATH,
    }
  }

  return {
    cookieName: cookieNameOrOptions?.cookieName || DEFAULT_SESSION_COOKIE,
    basePath: normalizeBasePath(cookieNameOrOptions?.basePath),
  }
}

function getSessionSecret(): string | undefined {
  return getValidSessionSecret(
    [
      process.env.CHANGELOG_SESSION_SECRET,
      process.env.NEXTAUTH_SECRET,
    ],
    MIN_SESSION_SECRET_LENGTH
  )
}

export async function authMiddleware(request: NextRequest, cookieNameOrOptions?: string | AuthMiddlewareOptions) {
  const { cookieName, basePath } = resolveAuthMiddlewareOptions(cookieNameOrOptions)

  if (!request.nextUrl.pathname.startsWith(`${basePath}/admin`)) {
    return NextResponse.next()
  }

  const secret = getSessionSecret()
  const token = request.cookies.get(cookieName)?.value
  const isAdmin = secret ? await verifySignedSessionToken(token, secret) : false

  if (!isAdmin) {
    return NextResponse.redirect(new URL(`${basePath}/login`, request.url))
  }

  return NextResponse.next()
}
