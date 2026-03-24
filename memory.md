# memory.md — SmartFlow Outreach Dashboard

## Current Status (Live Snapshot)

### ✅ Completed

**Infrastructure**
- Next.js 16.2.1 (App Router) project scaffolded at `/Users/ambrosevoon/Projects/realestate-outreach/`
- Stack: Next.js + TypeScript + Tailwind CSS v4 + ShadCN UI + Supabase + n8n webhooks
- Dev server running at http://localhost:3000
- No custom backend — Supabase client SDK used directly from client components

**Supabase**
- Project ref: `tjwwldskpqjwjzfxraxd`
- URL: `https://tjwwldskpqjwjzfxraxd.supabase.co`
- Anon/publishable key: stored in `.env.local`
- Tables created and verified live:
  - `re_outreach_leads` — agent lead records (id, name, email, phone, agency_name, suburb, website, status, score, last_contacted_at, next_followup_at, owner_notes, created_at, updated_at)
  - `re_outreach_activities` — per-lead activity log (id, lead_id, type, subject, content, metadata, created_at)
- Test lead inserted and verified: Vicky Yang / Happy Realty / Canning Vale

**n8n Integration**
- Instance: `https://n8n.srv823907.hstgr.cloud`
- 3 webhook endpoints wired in `lib/n8n.ts`:
  - `POST /webhook/send-email` — triggers Gmail outreach
  - `POST /webhook/update-lead` — updates lead status
  - `POST /webhook/schedule-followup` — sets next_followup_at
- n8n workflows for these endpoints NOT yet created — frontend calls are ready, backend needs building

**Dashboard Features**
- Pipeline stats cards: Total Leads, Contacted %, Replied %, Demo Booked %
- Leads table: sortable by score / last_contacted_at, searchable, filterable by status
- Status badges: new (gray), contacted (blue), replied (green), demo_booked (purple), won (emerald), lost (red)
- Row click → ShadCN Sheet drawer slides in from right
- Lead drawer: contact info, status dropdown (auto-saves), notes editor, action buttons, activity timeline
- Create Lead dialog: name, email, agency, suburb, phone, website, notes
- Toast notifications (sonner) for all actions
- Auto-redirect `/` → `/dashboard`
- Dark mode default (slate-950 base)

**Files Created**
- `app/layout.tsx` — root layout, Inter font, Toaster
- `app/page.tsx` — redirect to /dashboard
- `app/dashboard/page.tsx` — main dashboard page
- `app/globals.css` — Tailwind v4 @theme config, dark palette, custom scrollbar
- `components/dashboard/StatsCards.tsx`
- `components/dashboard/LeadsTable.tsx`
- `components/dashboard/StatusBadge.tsx`
- `components/dashboard/CreateLeadDialog.tsx`
- `components/lead/LeadDrawer.tsx`
- `components/lead/ActivityTimeline.tsx`
- `components/lead/ActionButtons.tsx`
- `hooks/useLeads.ts` — fetch, create, update, delete, filter, sort
- `hooks/useActivities.ts` — fetch and add activities per lead
- `lib/supabase.ts` — Supabase browser client singleton
- `lib/n8n.ts` — n8n webhook callers
- `lib/utils.ts` — cn() utility (clsx + tailwind-merge)
- `types/index.ts` — Lead, Activity, LeadStatus, ActivityType types
- `.env.local` — Supabase URL + anon key + n8n URL
- `.env.local.example` — template for new environments

---

### n8n Workflows (Phase 2 — Complete)
- `[Realestate Outreach] Send Email` — ID: `gkDnKkwCC4YEPoyu` — active
  - Webhook: `POST /webhook/send-email` — payload: `{ lead_id, email, name, agency_name }`
  - Sends Gmail via credential `VcLjSm5vjePd5FQs` (Property Agent Demo's Gmail)
  - PATCHes `re_outreach_leads` to update `last_contacted_at` + `updated_at`
- `[Realestate Outreach] Update Lead` — ID: `ma8KVeKAvk0cdQKr` — active
  - Webhook: `POST /webhook/update-lead` — payload: `{ lead_id, status, notes? }`
  - PATCHes `re_outreach_leads` with `status`, `owner_notes`, `updated_at`
- `[Realestate Outreach] Schedule Followup` — ID: `BV5IMxcNMc4sp4d2` — active
  - Webhook: `POST /webhook/schedule-followup` — payload: `{ lead_id, next_followup_at }`
  - PATCHes `re_outreach_leads` with `next_followup_at`, `updated_at`
- **Key n8n quirk**: webhook body data is at `$json.body.X` (not `$json.X`) — n8n webhook node wraps payload under `body`
- Supabase PATCH uses secret key in headers; URL expression: `={{ 'https://...?id=eq.' + $json.body.lead_id }}`
- All 3 verified end-to-end: webhook → Supabase updated — PASS

---

### ⚠️ In Progress / Pending

- RLS (Row Level Security) not configured on Supabase tables — open access via anon key
- No CSV import feature yet
- No agent profile "View" links yet

---

### ❌ Known Issues

- Supabase anon key has full table access — RLS should be enabled before going to production

---

### n8n Workflows (Phase 3 Addition)
- `[Realestate Outreach] Discover Agents` — ID: `36zDpxdGMZBUPl95` — active
  - Webhook: `POST /webhook/discover-agents` — payload: `{ count, location }`
  - Calls Perplexity `sonar` model to search for real estate agents in the given location
  - Code node parses LLM response JSON (strips markdown fences if present)
  - Responds: `{ agents: [...], total: N }`
  - Perplexity credential: `LnbJBjfV1EgRKlN1` (predefined credential type works)

### Phase 3 Frontend Components
- `components/dashboard/ImportPreviewDialog.tsx` — shared dedup + preview modal
  - Dedup: name+phone (primary), email (secondary), within-batch duplicates also caught
  - Phone normalisation: strips formatting + converts +61 AU prefix to local 0xxx
- `components/dashboard/CSVImportDialog.tsx` — CSV import
  - RFC 4180-aware parser (handles quoted fields containing commas)
  - Flexible column aliases: name/agent_name, phone/mobile/contact, agency/company, etc.
  - Required columns: name + agency_name; optional: email, phone, suburb, website
- `components/dashboard/DiscoverAgentsButton.tsx` — Discover Agents button + gear settings
  - Settings: count (1–200, default 20) + location (text), persisted to localStorage key `discover_settings`
- `components/ui/popover.tsx` — Radix Popover primitive (added for settings)
- `@radix-ui/react-popover` added to package.json

---

### Phase 4 — Production Hardening (Complete)
- Single-password auth gate: `middleware.ts` + `/api/auth/login` + `/api/auth/logout` + `app/login/page.tsx`
- Two env vars: `AUTH_PASSWORD` (login check) + `AUTH_TOKEN` (httpOnly cookie value, 64-char hex)
- Client-side pagination: 25 leads/page, page resets on search/filter/sort change, hidden when ≤1 page
- Logout button (LogOut icon) in dashboard header, calls `/api/auth/logout` then `router.replace('/login')`
- Deployed to Vercel: `https://realestate-outreach.vercel.app` (private, Hobby plan)
- GitHub: `https://github.com/ambrosevoon/realestate-outreach` (private, standalone repo)

---

### 📍 Current Phase

**Phase 4 — Production Hardening Complete**
Auth gate, pagination, and Vercel deployment all live and verified.

---

### 🎯 Immediate Goal

Phase 5: Analytics & Tracking (charts, reply rate, pace tracker)

---

### 🔄 Last Session Summary (2026-03-24)

- Built auth gate: middleware + login page + login/logout API routes (timingSafeEqual, httpOnly cookie)
- Added client-side pagination (25/page) and logout button to dashboard
- Created standalone GitHub repo `ambrosevoon/realestate-outreach`
- Deployed to Vercel — login page confirmed live in production

---

### ⏭️ Next Step

Phase 5: Analytics & Tracking
1. Email activity chart (sent over time)
2. Status breakdown donut chart
3. Reply rate tracking
4. Days left / pace tracker
