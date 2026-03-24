'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
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
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-sm font-bold">SF</span>
          </div>
          <h1 className="text-xl font-semibold text-white">SmartFlow</h1>
          <p className="text-sm text-slate-500">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            maxLength={128}
            className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-10"
          />
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <Button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-10 cursor-pointer"
          >
            {loading ? 'Checking…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  )
}
