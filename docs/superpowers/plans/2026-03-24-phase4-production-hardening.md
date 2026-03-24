# Phase 4 — Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single-password auth gate, client-side pagination, and prepare the app for Vercel deployment.

**Architecture:** Next.js middleware intercepts all routes and checks an httpOnly cookie against `AUTH_TOKEN` env var. A login page + Route Handler handle credential exchange. Pagination is pure client-side — `useLeads` slices the existing `filtered` array, no backend changes.

**Tech Stack:** Next.js 16.2.1 App Router, TypeScript, `next/server` (NextRequest/NextResponse), Node.js `crypto` module, Tailwind v4 + ShadCN UI

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `middleware.ts` | Check `sf_auth` cookie on all protected routes; redirect to `/login` if missing/invalid |
| Create | `app/login/page.tsx` | Password form UI, POSTs to `/api/auth/login` |
| Create | `app/api/auth/login/route.ts` | Validate `AUTH_PASSWORD`, set `sf_auth` cookie with `AUTH_TOKEN` value |
| Create | `app/api/auth/logout/route.ts` | Clear `sf_auth` cookie, redirect to `/login` |
| Modify | `hooks/useLeads.ts` | Add `page`, `setPage`, `totalPages`, `paginated` |
| Modify | `app/dashboard/page.tsx` | Use `paginated` instead of `filtered`, add pagination controls, add logout button |
| Modify | `.env.local` | Add `AUTH_PASSWORD` and `AUTH_TOKEN` |

---

## Task 1: Add auth env vars to .env.local

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Open `.env.local` and append two new vars**

Add these two lines (use your own values):

```
AUTH_PASSWORD=your-chosen-password-here
AUTH_TOKEN=replace-with-a-long-random-string-eg-uuid
```

To generate a random token, run in terminal:
```bash
node -e "console.log(require('crypto').randomUUID() + require('crypto').randomUUID())"
```

- [ ] **Step 2: Verify `.env.local` now has both vars**

```bash
grep "AUTH_" .env.local
```

Expected: two lines printed, no secrets logged elsewhere.

---

## Task 2: Create the Next.js middleware

**Files:**
- Create: `middleware.ts` (project root, alongside `package.json`)

- [ ] **Step 1: Create `middleware.ts`**

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('sf_auth')?.value
  const expected = process.env.AUTH_TOKEN

  if (!expected) {
    // AUTH_TOKEN not configured — fail open with a warning (dev safety valve)
    console.warn('[middleware] AUTH_TOKEN env var is not set')
    return NextResponse.next()
  }

  if (token === expected) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/login', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)'],
}
```

- [ ] **Step 2: Verify the file is in the project root (not inside `app/`)**

```bash
ls middleware.ts
```

Expected: `middleware.ts`

---

## Task 3: Create the login API route

**Files:**
- Create: `app/api/auth/login/route.ts`

- [ ] **Step 1: Create the route handler**

```ts
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

function safeCompare(a: string, b: string): boolean {
  // timingSafeEqual requires equal-length buffers
  const aBuf = Buffer.from(a)
  const bBuf = Buffer.from(b)
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
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
```

---

## Task 4: Create the logout API route

**Files:**
- Create: `app/api/auth/logout/route.ts`

- [ ] **Step 1: Create the route handler**

Returns JSON `{ ok: true }` after clearing the cookie. The client (logout button) handles the redirect to `/login`. This avoids the need for an absolute URL on the server.

```ts
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('sf_auth', '', { maxAge: 0, path: '/' })
  return response
}
```

---

## Task 5: Create the login page

**Files:**
- Create: `app/login/page.tsx`

- [ ] **Step 1: Create the login page**

```tsx
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

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Incorrect password')
      setPassword('')
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
```

- [ ] **Step 2: Start dev server and test auth end-to-end**

```bash
npm run dev
```

1. Open http://localhost:3000 — should redirect to `/login`
2. Enter wrong password — should show "Incorrect password"
3. Enter correct password (the one in `AUTH_PASSWORD`) — should redirect to `/dashboard`
4. Refresh `/dashboard` — should stay on dashboard (cookie persists in session)
5. Open a new tab to http://localhost:3000/dashboard — should go through without login (same session cookie)

- [ ] **Step 3: Commit auth gate**

```bash
git add middleware.ts app/login/page.tsx app/api/auth/login/route.ts app/api/auth/logout/route.ts
git commit -m "feat: add single-password auth gate with httpOnly cookie"
```

---

## Task 6: Add pagination to useLeads

**Files:**
- Modify: `hooks/useLeads.ts`

- [ ] **Step 1: Add pagination state and derived values**

Add after the existing `const [sortBy, ...]` line (around line 12):

```ts
const PAGE_SIZE = 25
const [page, setPage] = useState(1)
```

Add after the `const filtered = useMemo(...)` block (after line 100):

```ts
const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

const paginated = useMemo(() => {
  return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
}, [filtered, page])
```

Add a `useEffect` to reset page when search, statusFilter, or sortBy changes — add after the existing `useEffect` for `fetchLeads`:

```ts
useEffect(() => {
  setPage(1)
}, [search, statusFilter, sortBy])
```

Add to the return object (after `bulkCreateLeads`):

```ts
page,
setPage,
totalPages,
paginated,
```

- [ ] **Step 2: Verify the hook compiles**

```bash
npm run build 2>&1 | grep -E "error|warning" | head -20
```

Expected: no TypeScript errors relating to `useLeads`.

---

## Task 7: Wire pagination controls in dashboard

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Destructure new values from useLeads**

Change the `useLeads()` destructure (around line 34) to also pull `page`, `setPage`, `totalPages`, `paginated`:

```ts
const {
  leads,
  filtered,
  paginated,
  loading,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  fetchLeads,
  createLead,
  updateLead,
  bulkCreateLeads,
  page,
  setPage,
  totalPages,
} = useLeads()
```

- [ ] **Step 2: Change LeadsTable to use `paginated`**

Find this line (around line 153):

```tsx
<LeadsTable
  leads={filtered}
```

Change to:

```tsx
<LeadsTable
  leads={paginated}
```

- [ ] **Step 3: Add a logout button to the dashboard header**

In `app/dashboard/page.tsx`, add `useRouter` import at the top:

```ts
import { useRouter } from 'next/navigation'
```

Add `const router = useRouter()` inside the component body (near the top, after the `useLeads()` call).

Add a logout handler:

```ts
const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' })
  router.push('/login')
}
```

In the header's button row (around line 84, next to the RefreshCw button), add a logout button as the first item:

```tsx
<Button
  variant="ghost"
  size="icon"
  onClick={handleLogout}
  className="text-slate-500 hover:text-white cursor-pointer w-8 h-8"
  title="Sign out"
>
  <LogOut className="w-4 h-4" />
</Button>
```

Add `LogOut` to the lucide-react import at the top of the file:

```ts
import { Search, SlidersHorizontal, RefreshCw, LogOut } from 'lucide-react'
```

- [ ] **Step 4: Add pagination controls below the table**

After the `<LeadsTable ... />` closing tag and before `</main>`, add:

```tsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-between text-sm text-slate-500">
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
      className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
    >
      ← Previous
    </Button>
    <span>
      Page {page} of {totalPages}
    </span>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
    >
      Next →
    </Button>
  </div>
)}
```

- [ ] **Step 5: Build and verify no errors**

```bash
npm run build 2>&1 | tail -10
```

Expected: `✓ Compiled successfully` or similar success output.

- [ ] **Step 6: Manual test pagination and logout**

With dev server running:
1. If you have fewer than 25 leads, the pagination controls should be hidden
2. To test pagination: temporarily change `PAGE_SIZE` to `2` in `useLeads.ts`, reload, verify controls appear and clicking Previous/Next shows different rows, then revert `PAGE_SIZE` to `25`
3. Click the LogOut icon in the header — should clear the cookie and redirect to `/login`
4. Navigating to `/dashboard` after logout should redirect to `/login`

- [ ] **Step 7: Commit pagination and logout**

```bash
git add hooks/useLeads.ts app/dashboard/page.tsx
git commit -m "feat: add client-side pagination (25 leads/page) and logout button"
```

---

## Task 8: Deploy to Vercel

- [ ] **Step 1: Ensure repo is pushed to GitHub**

```bash
git remote -v
```

If no remote is set, create a new GitHub repo and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/realestate-outreach.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

1. Go to https://vercel.com → New Project
2. Import your GitHub repository
3. Framework will be auto-detected as Next.js
4. Do NOT click Deploy yet — set env vars first

- [ ] **Step 3: Set environment variables in Vercel**

In the Vercel project settings → Environment Variables, add:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | (from `.env.local`) | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (from `.env.local`) | Production, Preview, Development |
| `NEXT_PUBLIC_N8N_URL` | `https://n8n.srv823907.hstgr.cloud` | Production, Preview, Development |
| `AUTH_PASSWORD` | (your chosen password) | Production |
| `AUTH_TOKEN` | (the random token from Task 1) | Production |

- [ ] **Step 4: Deploy**

Click "Deploy" in Vercel. Watch the build log. Expected: build completes with `✓ Compiled` output.

- [ ] **Step 5: Verify production deploy**

1. Open the Vercel deployment URL (e.g., `https://realestate-outreach.vercel.app`)
2. Should redirect to `/login`
3. Login with `AUTH_PASSWORD` — should redirect to `/dashboard`
4. Verify leads load (Supabase connection works)
5. Verify "Send Email" and other n8n actions work

- [ ] **Step 6: Commit final state**

```bash
git add docs/superpowers/specs/2026-03-24-phase4-production-hardening-design.md docs/superpowers/plans/2026-03-24-phase4-production-hardening.md
git commit -m "docs: add Phase 4 spec and implementation plan"
```
