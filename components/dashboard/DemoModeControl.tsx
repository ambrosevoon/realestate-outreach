'use client'

import { useState } from 'react'
import { ShieldCheck, Lock, FlaskConical, Radio } from 'lucide-react'
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
}

export function DemoModeControl({ mode, onModeChange, seededFallback = false }: Props) {
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

  return (
    <>
      <div className="flex flex-col items-start gap-2 rounded-2xl border border-white/8 bg-white/[0.045] px-4 py-3 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
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
                ? 'Dashboard is using fake Perth agent data. Send Email is locked while Demo Mode is on.'
                : 'Dashboard is using the real Supabase leads table. Live email sending is available.'}
            </p>
          </div>
        </div>

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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-white/10 bg-slate-950 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Unlock Live Mode</DialogTitle>
            <DialogDescription className="text-stone-400">
              Enter the demo password to switch from fake demo leads to the real Supabase leads table.
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

