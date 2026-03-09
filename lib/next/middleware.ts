import { NextRequest, NextResponse } from 'next/server'
import { DEFAULT_SESSION_COOKIE } from './constants'

export async function authMiddleware(request: NextRequest, cookieName: string = DEFAULT_SESSION_COOKIE) {
  if (request.nextUrl.pathname !== '/changelog/admin') {
    return NextResponse.next()
  }

  const isAdmin = Boolean(request.cookies.get(cookieName)?.value)

  if (!isAdmin) {
    return NextResponse.redirect(new URL('/changelog/login', request.url))
  }

  return NextResponse.next()
}
