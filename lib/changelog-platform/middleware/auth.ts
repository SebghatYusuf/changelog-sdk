import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * Middleware to protect admin routes
 */

export async function authMiddleware(request: NextRequest) {
  // Only protect admin routes
  if (!request.nextUrl.pathname.includes('/changelog/admin')) {
    return NextResponse.next()
  }

  const cookieStore = await cookies()
  const session = cookieStore.get('changelog-admin-session')

  if (!session) {
    // Redirect to login
    return NextResponse.redirect(new URL('/changelog/login', request.url))
  }

  return NextResponse.next()
}
