import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('changelog-admin-session')
  if (!session?.value) {
    return NextResponse.redirect(new URL('/changelog/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/changelog/admin/:path*'],
}
