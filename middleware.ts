import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sf_auth')?.value
  const expected = process.env.AUTH_TOKEN

  if (!expected) {
    // AUTH_TOKEN not configured — fail open with a warning (dev safety valve)
    console.warn('[middleware] AUTH_TOKEN env var is not set')
    return NextResponse.next()
  }

  if (token && safeEqual(token, expected)) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)'],
}
