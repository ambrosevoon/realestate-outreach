import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()
    const expected = process.env.DEMO_MODE_PASSWORD

    if (!expected) {
      return NextResponse.json(
        { ok: false, error: 'Demo mode password is not configured.' },
        { status: 500 }
      )
    }

    if (typeof password !== 'string' || password !== expected) {
      return NextResponse.json(
        { ok: false, error: 'Incorrect password. Demo Mode remains enabled.' },
        { status: 401 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Unable to verify password right now.' },
      { status: 400 }
    )
  }
}

