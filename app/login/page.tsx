'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import ShaderShowcase from '@/components/ui/hero'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
    <div className="relative min-h-screen overflow-hidden bg-[#02040a]">
      <ShaderShowcase
        title="Win more listings with elegant automated outreach."
        eyebrow="Private access portal"
        description="SmartFlow gives real-estate operators a premium outbound system: agent discovery, AI-assisted email drafts, tracking, and follow-up cadence in one place."
        navLinks={[
          { label: 'Outreach', href: '#signin' },
          { label: 'Automation', href: '#signin' },
          { label: 'Reporting', href: '#signin' },
        ]}
        primaryAction={{ label: 'Access dashboard', href: '#signin' }}
        secondaryAction={{ label: 'View workflow', href: '#signin' }}
        stats={[
          { label: 'Sequences', value: 'AI-led' },
          { label: 'Follow-up', value: '3 days' },
          { label: 'Ops mode', value: 'Live' },
          { label: 'Positioning', value: 'Premium' },
        ]}
      />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(2,4,10,0.2)_0%,rgba(2,4,10,0.55)_36%,rgba(2,4,10,0.92)_56%,rgba(2,4,10,0.98)_100%)]" />

      <div className="absolute inset-y-0 right-0 z-20 flex w-full items-center justify-end px-4 py-8 sm:px-6 lg:px-10">
        <div
          id="signin"
          className="w-full max-w-md rounded-[2rem] border border-white/12 bg-[linear-gradient(180deg,rgba(9,14,24,0.84),rgba(4,7,13,0.94))] p-6 shadow-[0_32px_120px_-48px_rgba(0,0,0,0.95)] backdrop-blur-xl"
        >
          <div className="space-y-2">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] text-stone-500">Secure sign-in</p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-stone-100">Continue to SmartFlow</h1>
            <p className="text-sm leading-relaxed text-stone-300/80">
              Access the outreach dashboard, review pipeline activity, and launch branded campaigns.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              maxLength={128}
              className="h-12 rounded-2xl border-stone-700/70 bg-slate-950/70 text-white placeholder:text-stone-500 focus-visible:ring-amber-500"
            />
            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}
            <Button
              type="submit"
              disabled={loading || !password}
              className="h-12 w-full rounded-2xl cursor-pointer bg-[linear-gradient(135deg,#eed8ae_0%,#d2a461_45%,#8d6736_100%)] text-slate-950 hover:brightness-110"
            >
              {loading ? 'Checking…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
