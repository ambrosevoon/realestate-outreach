# Phase 4 — Production Hardening Design

**Date:** 2026-03-24
**Project:** SmartFlow Outreach Dashboard (`realestate-outreach`)
**Status:** Approved

---

## Scope

Three improvements to make the dashboard production-ready:

1. **Password gate** — protect all routes behind a single password
2. **Client-side pagination** — show 25 leads per page in the leads table
3. **Deploy to Vercel** — host the Next.js app on Vercel free tier

---

## 1. Password Gate

### Approach
Single-password protection using Next.js middleware + an httpOnly cookie. No Supabase Auth, no user accounts — just one env var password for the single user.

Two env vars are used:
- `AUTH_PASSWORD` — the password the user types. Compared at login time only. Never stored in the cookie.
- `AUTH_TOKEN` — a separate opaque secret (e.g., a random UUID) stored as the cookie value. The middleware checks cookie === `AUTH_TOKEN`, not the password.

This keeps the password distinct from the session token. Stealing the cookie reveals only the token, not the password.

### Components

**`middleware.ts`** (project root)
- Runs on protected routes only via a `config.matcher` that excludes:
  - `/_next/static/*` and `/_next/image/*` (static assets needed to render the login page)
  - `/favicon.ico`
  - `/api/auth/*` (login/logout endpoints)
  - `/login`
- Reads a cookie named `sf_auth`
- If cookie value matches `AUTH_TOKEN` env var → pass through
- Otherwise → redirect to `/login`

**Middleware matcher config:**
```ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth|login).*)',
  ],
}
```

**`app/login/page.tsx`**
- Simple form: password input + submit button
- POSTs to `/api/auth/login`
- On success → redirect to `/dashboard` (fixed destination, intentional for simplicity)
- On failure → show inline error ("Incorrect password")
- Matches existing dark slate design

**`app/api/auth/login/route.ts`**
- POST handler
- Reads `password` from request body
- Compares against `AUTH_PASSWORD` env var (constant-time comparison via `crypto.timingSafeEqual`)
- On match: set `sf_auth` httpOnly cookie with value `AUTH_TOKEN`
  - `httpOnly: true`
  - `sameSite: 'lax'`
  - `secure: process.env.NODE_ENV === 'production'` — allows local HTTP dev without breaking the secure cookie
  - No `maxAge` / `expires` → session cookie (cleared on browser close)
  - Return 200
- On mismatch: return 401

**`app/api/auth/logout/route.ts`**
- POST handler
- Clears `sf_auth` cookie (set maxAge to 0)
- Returns redirect to `/login`

### Environment Variables
- `AUTH_PASSWORD` — the password. Server-side only (no `NEXT_PUBLIC_` prefix).
- `AUTH_TOKEN` — opaque session token (e.g., a long random string). Server-side only.

---

## 2. Client-side Pagination

### Approach
The `useLeads` hook already fetches all leads and exposes a `filtered` array. Add page state and a slice step — no backend changes required.

### Changes

**`hooks/useLeads.ts`**
- Add `page` state (default: `1`) and `PAGE_SIZE` constant (`25`)
- Add `totalPages` derived value: `Math.ceil(filtered.length / PAGE_SIZE)` (minimum 1)
- Add `paginated` derived value: `filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)`
- Reset `page` to `1` via `useEffect` whenever `search` or `statusFilter` changes
- Expose: `page`, `setPage`, `totalPages`, `paginated`

**`app/dashboard/page.tsx`**
- Pass `paginated` to `LeadsTable` instead of `filtered`
- Add pagination controls below the table:
  - "Previous" button — disabled when `page === 1`
  - "Page X of Y" label
  - "Next" button — disabled when `page === totalPages`
- Hide controls entirely when `totalPages <= 1`

**`components/dashboard/LeadsTable.tsx`**
- No changes needed — already accepts `leads: Lead[]` prop

---

## 3. Deploy to Vercel

### Steps
1. Push repo to GitHub (if not already)
2. Connect repo to Vercel via vercel.com → New Project → Import Git Repository
3. Set environment variables in Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_N8N_URL` (used by `lib/n8n.ts`)
   - `AUTH_PASSWORD`
   - `AUTH_TOKEN`
4. Trigger deploy — Vercel auto-detects Next.js, no `vercel.json` needed
5. Optionally add a custom domain

### No config file needed
Next.js (App Router) is detected automatically by Vercel. Default build command (`next build`) and output directory work out of the box.

---

## Implementation Order

1. Password gate (middleware + login page + API routes)
2. Pagination (hook + dashboard page controls)
3. Vercel deployment (env vars + connect repo)
