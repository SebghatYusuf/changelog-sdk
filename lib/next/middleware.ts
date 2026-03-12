import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_SESSION_COOKIE } from './constants'
import { getValidSessionSecret, verifySignedSessionToken } from '../core/session-token'

const MIN_SESSION_SECRET_LENGTH = 32

function getSessionSecret(): string | undefined {
  return getValidSessionSecret(
    [
      process.env.CHANGELOG_SESSION_SECRET,
      process.env.NEXTAUTH_SECRET,
      process.env.CHANGELOG_ADMIN_PASSWORD,
      process.env.ADMIN_PASSWORD,
    ],
    MIN_SESSION_SECRET_LENGTH
  )
}

export async function authMiddleware(request: NextRequest, cookieName: string = DEFAULT_SESSION_COOKIE) {
  if (!request.nextUrl.pathname.startsWith('/changelog/admin')) {
    return NextResponse.next()
  }

  const secret = getSessionSecret()
  const token = request.cookies.get(cookieName)?.value
  const isAdmin = secret ? await verifySignedSessionToken(token, secret) : false

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/changelog/login', request.url))
  }

  return NextResponse.next()
}
