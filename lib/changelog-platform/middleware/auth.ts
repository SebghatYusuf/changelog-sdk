import { NextRequest, NextResponse } from 'next/server'
import { normalizeBasePath, joinPath } from '../runtime/paths'

/**
 * Middleware to protect admin routes
 */

export async function authMiddleware(request: NextRequest, basePath?: string) {
  const resolvedBasePath = normalizeBasePath(basePath)
  const adminPath = joinPath(resolvedBasePath, 'admin')
  const loginPath = joinPath(resolvedBasePath, 'login')

  // Only protect admin routes
  if (!request.nextUrl.pathname.includes(adminPath)) {
    return NextResponse.next()
  }

  const session = request.cookies.get('changelog-admin-session')

  if (!session) {
    // Redirect to login
    return NextResponse.redirect(new URL(loginPath, request.url))
  }

  return NextResponse.next()
}
