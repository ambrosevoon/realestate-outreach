'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SmartFlowLogo } from '@/components/brand/SmartFlowLogo'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        router.replace('/dashboard')
      } else {
        setError('Incorrect password')
        setPassword('')
      }
    } catch {
      setError('Connection error — please try again')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(196,167,109,0.14),transparent_26%),linear-gradient(180deg,#050913_0%,#0b1220_100%)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <SmartFlowLogo size="lg" stacked className="justify-center" />
          <div className="space-y-1">
            <p className="text-sm text-stone-300">Premium outbound automation for real estate teams</p>
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Private access portal</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 rounded-[1.75rem] border border-white/8 bg-white/[0.03] p-5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)] backdrop-blur-sm">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            maxLength={128}
            className="h-11 border-stone-700/70 bg-slate-950/60 text-white placeholder:text-stone-500 focus-visible:ring-amber-500"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading || !password}
            className="h-11 w-full cursor-pointer bg-[linear-gradient(135deg,#d4af6d_0%,#b6894c_48%,#8f6735_100%)] text-slate-950 hover:brightness-110"
          >
            {loading ? 'Checking…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
