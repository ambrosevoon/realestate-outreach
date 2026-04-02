'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, FlaskConical, Radio, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Mode = 'demo' | 'live'

interface Props {
  mode: Mode
  onModeChange: (mode: Mode) => void
  seededFallback?: boolean
  sendRealEmail?: boolean
  onSendRealEmailChange?: (value: boolean) => void
  safeEmail?: string
}

export function DemoModeControl({
  mode,
  onModeChange,
  seededFallback = false,
  sendRealEmail = false,
  onSendRealEmailChange,
  safeEmail = 'ambrosevoon@gmail.com',
}: Props) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verifying, setVerifying] = useState(false)

  const handlePrimaryClick = () => {
    if (mode === 'live') {
      onModeChange('demo')
      return
    }

    setPassword('')
    setError('')
    setOpen(true)
  }

  const handleVerify = async () => {
    setVerifying(true)
    setError('')

    try {
      const response = await fetch('/api/demo-mode/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok || !data?.ok) {
        setError(
          typeof data?.error === 'string'
            ? data.error
            : 'Incorrect password. Demo Mode remains enabled.'
        )
        return
      }

      setOpen(false)
      setPassword('')
      onModeChange('live')
    } finally {
      setVerifying(false)
    }
  }

  const modeLabel = mode === 'demo' ? 'Demo Mode' : 'Live Mode'
  const liveToggleDisabled = mode !== 'live'

  return (
    <>
      <div
        className={`flex flex-col items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between ${
          mode === 'demo' ? 'demo-mode-banner' : ''
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border ${
              mode === 'demo'
                ? 'border-amber-400/35 bg-amber-400/10 text-amber-200'
                : 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200'
            }`}
          >
            {mode === 'demo' ? <FlaskConical className="h-4 w-4" /> : <Radio className="h-4 w-4" />}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] ${
                  mode === 'demo'
                    ? 'border-amber-300/30 bg-amber-300/10 text-amber-100'
                    : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                }`}
              >
                {modeLabel}
              </span>
              {seededFallback && mode === 'demo' ? (
                <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Seeded fallback</span>
              ) : null}
            </div>
            <p className="max-w-2xl text-sm text-stone-300">
              {mode === 'demo'
                ? 'Dashboard is using simulated Perth agent data. Send Email is locked while Demo Mode is on.'
                : 'Dashboard is using the real Supabase leads table. Live email sending is available.'}
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => {
              if (liveToggleDisabled) return
              onSendRealEmailChange?.(!sendRealEmail)
            }}
            disabled={liveToggleDisabled}
            className={`flex min-w-[280px] items-center justify-between rounded-2xl border px-3 py-2.5 text-left transition-colors ${
              liveToggleDisabled
                ? 'cursor-not-allowed border-white/8 bg-white/[0.03] opacity-60'
                : sendRealEmail
                  ? 'border-red-500/40 bg-red-500/10'
                  : 'border-cyan-400/25 bg-cyan-400/8'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/90">Send Real Email</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                    sendRealEmail
                      ? 'bg-red-500/20 text-red-200 animate-[pulse_0.55s_ease-in-out_infinite]'
                      : 'bg-amber-400/15 text-amber-200'
                  }`}
                >
                  {sendRealEmail ? 'LIVE' : 'TEST'}
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-300">
                {sendRealEmail ? 'Fast blinking LIVE. Emails go to the real agent inbox.' : `TEST to Safe Email. Sends route to ${safeEmail}.`}
              </p>
            </div>
            <div
              className={`relative ml-3 h-7 w-12 rounded-full border transition-colors ${
                sendRealEmail ? 'border-red-400/50 bg-red-500/30' : 'border-white/10 bg-slate-800'
              }`}
            >
              <div
                className={`absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  sendRealEmail ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          <Button
            type="button"
            variant={mode === 'demo' ? 'outline' : 'secondary'}
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto"
          >
            {mode === 'demo' ? (
              <>
                <Lock className="mr-1.5 h-4 w-4" />
                Unlock Live Mode
              </>
            ) : (
              <>
                <ShieldCheck className="mr-1.5 h-4 w-4" />
                Switch Back To Demo
              </>
            )}
          </Button>
        </div>
      </div>

      {mode === 'live' ? (
        <div className={`mt-3 flex items-center gap-2 text-xs ${sendRealEmail ? 'text-red-300' : 'text-cyan-300'}`}>
          <Zap className={`h-3.5 w-3.5 ${sendRealEmail ? 'animate-[pulse_0.55s_ease-in-out_infinite]' : ''}`} />
          <span className="uppercase tracking-[0.24em]">
            {sendRealEmail ? 'LIVE' : 'TEST'}
          </span>
          <span className="text-stone-400">
            {sendRealEmail ? 'Real lead emails are enabled right now.' : `Safe route is active. All sends go to ${safeEmail}.`}
          </span>
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Unlock Live Mode</DialogTitle>
            <DialogDescription className="text-stone-400">
              Enter the demo password to switch from simulated demo leads to the real Supabase leads table.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.22em] text-stone-500">
              Demo Password
            </label>
            <Input
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Enter password"
              className="border-white/10 bg-slate-900/80 text-white placeholder:text-stone-600"
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  void handleVerify()
                }
              }}
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="button" onClick={handleVerify} disabled={!password.trim() || verifying} className="cursor-pointer">
              {verifying ? 'Verifying…' : 'Enter Live Mode'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
