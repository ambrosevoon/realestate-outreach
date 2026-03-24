import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  const maxLen = Math.max(aBuf.length, bBuf.length)
  const paddedA = Buffer.alloc(maxLen)
  const paddedB = Buffer.alloc(maxLen)
  aBuf.copy(paddedA)
  bBuf.copy(paddedB)
  return timingSafeEqual(paddedA, paddedB)
}

export async function POST(request: Request) {
  const { password } = await request.json()

  const expectedPassword = process.env.AUTH_PASSWORD
  const authToken = process.env.AUTH_TOKEN

  if (!expectedPassword || !authToken) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
  }

  if (!password || !safeCompare(String(password), expectedPassword)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('sf_auth', authToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return response
}
