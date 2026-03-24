import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('sf_auth', '', { maxAge: 0, path: '/', httpOnly: true })
  return response
}
