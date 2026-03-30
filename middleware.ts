import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// TESTING PHASE: auth disabled — re-enable before going live
export function middleware(_request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)'],
}
