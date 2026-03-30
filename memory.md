# memory.md — SmartFlow Outreach Dashboard

## Current Status (Live Snapshot)

### 🔄 Session Update (2026-03-28) — Codex

This section documents work completed in this Codex session so a later Claude Code session can continue with full context.

**What Codex changed in the app repo**
- Updated [components/lead/ActionButtons.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/lead/ActionButtons.tsx) so `generateDraft()` sends `lead_id`
- Updated [lib/n8n.ts](/Users/ambrosevoon/Projects/realestate-outreach/lib/n8n.ts) so `generateDraft()` accepts optional `lead_id`
- Shared preview/send rendering was attempted first, then rolled back to preserve the legacy send-email body format
- Git commits pushed by Codex this session:
  - `5a2d697` — initial draft/send bridging work
  - `bef6528` — preserve legacy outreach email body layout
  - `eaac23d` — avoid reusing outreach subjects per lead

**What Codex changed live in n8n**
- `[Realestate Outreach] Send Email` — ID: `gkDnKkwCC4YEPoyu`
  - Preserved the original HTML email layout instead of replacing it with AI draft body HTML
  - Added subject override support so the sent email can use AI-generated subject lines
  - Added subject uniqueness guard against prior `email_sent` subjects for the same lead
  - Pain-point section now randomises between 5 and 8 items per send
  - Conversion-focused copy after the pain-point block was improved while keeping the legacy visual format
- `[Realestate Outreach] Generate AI Draft` — ID: `QKSf9yZfaB3nTmXx`
  - Uses `lead_id` and prior sent-subject history to avoid repeating subjects for the same lead
- `[Realestate Outreach] Cal.com Booking → Demo Booked` — ID: `RO7X6UUdta1ibcap`
  - Fixed broken webhook execution path
  - Fixed lead matching when multiple leads share the same email
  - Correctly updates the intended `Happy Realty` safe lead to `demo_booked`
  - Logs activity note `Demo booked via cal.com`
  - Formats booked time in natural language in Perth time, e.g. `Wednesday 1 April 2026 at 9:00 am Perth time`
  - Returns valid JSON response and now completes with `status: success`

**What Codex verified end to end**
- Safe test recipient rule followed throughout: only `ambrosevoon@gmail.com` was used
- GitHub access verified and pushes to `main` succeeded
- n8n API access verified and workflows updated live
- Supabase API access verified for lead/activity inspection
- Vercel production flow understood through GitHub-connected deployment on `main`
- Cal.com booking flow tested end to end using Playwright with safe identity only
- Booking confirmation page reached successfully on Cal.com
- Safe lead `Ambrose / Happy Realty / ambrosevoon@gmail.com` updated to `demo_booked`
- Dashboard table verified visually on deployed app: safe lead row shows `Demo Booked`

**Important findings from this session**
- The “AI subject not reaching sent email” bug was real, but the live state had evolved:
  - old issue: hardcoded send subject
  - intermediate live issue: randomised send subject but still disconnected from AI draft subject
  - final fix: keep legacy body, allow AI subject override only
- The Cal.com booking workflow was previously failing for 2 separate reasons:
  - invalid webhook/response-node configuration
  - `Get Lead ID` code node incorrectly used only the first input item instead of the full result set
- Duplicate safe leads existed for `ambrosevoon@gmail.com`, so lead matching had to prefer the row with agency context and more recent activity
- Dashboard initially loaded stale/empty data until refreshed after login, but the deployed UI did reflect the corrected `demo_booked` state after refresh

**Safe lead used for all testing in this session**
- `aeea7bb1-0ab3-4e01-b9ee-6a625ea17a01`
- Name: `Ambrose`
- Agency: `Happy Realty`
- Email: `ambrosevoon@gmail.com`

**Current result after Codex session**
- AI-generated subjects can influence sent emails
- Legacy email body format is preserved
- Subject reuse per lead is guarded
- Pain-point block is randomised 5–8 items
- Post-pain-point copy is more conversion-focused
- Cal.com booking now updates lead status to `demo_booked`
- Activity note now shows friendly Perth-time booked date/time
- End-to-end safe verification has been completed

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
- `[Realestate Outreach] Discover Agents` — ID: `sxGma92qx6nwJ10k` — active
  - Webhook: `POST /webhook/discover-agents` — payload: `{ count, location }`
  - webhookId: `realestate-discover-agents-v1` (required for webhook registration)
  - Calls Perplexity `sonar` model to search for real estate agents in the given location
  - Count capped at 20 per request (prevents rate limit errors)
  - Code node parses LLM response JSON (strips markdown fences, finds array by bracket scan)
  - Responds: `{ agents: [...], total: N }`
  - Perplexity credential: `LnbJBjfV1EgRKlN1` (predefined credential type works)
  - **Note:** Previous workflow ID `36zDpxdGMZBUPl95` was deleted mid-session. Rebuilt 2026-03-25.
  - **Key n8n lesson:** Webhook nodes MUST have `webhookId` field set or the path won't register.

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

### Phase 5 — Analytics & Tracking (Complete)
- `components/dashboard/AnalyticsSection.tsx` — analytics section below StatsCards
  - Email activity bar chart (last 14 days, fetches all activities from Supabase)
  - Pace tracker: contacted/remaining progress bar, daily rate, estimated days left
  - Reply rate: % of contacted leads who replied, with progress bar
  - Status breakdown: horizontal bars per status, sorted by count
- `hooks/useAllActivities.ts` — fetches all activities (not per-lead) for analytics
- `recharts` + `@tailwindcss/postcss` added to package.json (devDep)
- **Node_modules note:** `@tailwindcss/postcss` is a devDep — must run `npm install --include=dev` locally (Vercel handles this automatically)

### Phase 4 — Production Hardening (Complete)
- Single-password auth gate: `middleware.ts` + `/api/auth/login` + `/api/auth/logout` + `app/login/page.tsx`
- Two env vars: `AUTH_PASSWORD` (login check) + `AUTH_TOKEN` (httpOnly cookie value, 64-char hex)
- Client-side pagination: 25 leads/page, page resets on search/filter/sort change, hidden when ≤1 page
- Logout button (LogOut icon) in dashboard header, calls `/api/auth/logout` then `router.replace('/login')`
- Deployed to Vercel: `https://realestate-outreach.vercel.app` (private, Hobby plan)
- GitHub: `https://github.com/ambrosevoon/realestate-outreach` (private, standalone repo)

---

### 🔄 Session Update (2026-03-30)

**Changes made this session:**

1. **Hardcoded test email destination** — `lib/n8n.ts`
   - `sendEmail()` now always sends to `ambrosevoon@gmail.com` regardless of which lead is selected
   - Real lead email preserved in payload for n8n logging; only the `email` field is overridden
   - Commit: `cef87fc`

2. **Disabled login gate** — `middleware.ts`
   - Auth middleware replaced with a pass-through — dashboard accessible without password
   - Full `safeEqual` + cookie check preserved in git history for easy restore
   - Commit: `47dd16c`

3. **Redeployed to Vercel** — triggered manually via CLI after GitHub auto-deploy wasn't firing
   - Linked project locally: `.vercel/project.json` now exists (`prj_hxB2TVCnvTK3o0GCQr1eoUSpZWw4`)
   - Updated Vercel env vars to match `.env.local` (overrode stale 6-day-old values)
   - Deployments: `dpl_6jLLGTh5G29VLAjj56k8xgVEbdFP` then `dpl_92FNf9CxUuCSBE6wKkgBhk69X5aN`

**IMPORTANT — Two different Vercel URLs:**
- ✅ **Our app (correct):** `https://realestate-outreach-sand.vercel.app` — project `prj_hxB2TVCnvTK3o0GCQr1eoUSpZWw4`, linked to `github.com/ambrosevoon/realestate-outreach`
- ❌ **Different project:** `https://realestate-outreach.vercel.app` — completely different codebase (email+password Supabase auth, "RealEstate OutReach" branding). Do NOT use this URL for this project.

**Verified working (2026-03-30):**
- Email send flow: n8n confirms `email: ambrosevoon@gmail.com` in every execution, Gmail thread ID returned
- Dashboard loads all leads on `realestate-outreach-sand.vercel.app` after clicking Refresh
- Initial page load shows 0 leads (timing/hydration delay) — clicking Refresh always fixes it
- Supabase connection confirmed working: RLS enabled, `anon_full_access` policies on both tables

**Revert checklist before go-live:**
- `lib/n8n.ts` — remove `TEST_EMAIL` constant, change `{ ...lead, email: TEST_EMAIL }` back to `lead`
- `middleware.ts` — restore `safeEqual` + cookie check (see git history commit `47dd16c~1`)

---

### 📍 Current Phase

**Phase 8 — Testing Phase Safety Config (Complete)**
App is in testing mode: email hardcoded to safe address, login disabled, dashboard open.

---

### 🎯 Immediate Goal

Continue testing the outreach flow end-to-end. When testing is done, revert the two items in the checklist above before go-live.

---

### 🔄 Last Session Summary (2026-03-30)

- Hardcoded `sendEmail()` destination to `ambrosevoon@gmail.com` for testing phase
- Disabled middleware auth gate for testing phase
- Discovered GitHub→Vercel auto-deploy was NOT firing — must deploy manually with `npx vercel --prod --yes --scope ambrosevoon-4152s-projects` from project dir
- Linked local project to Vercel (`.vercel/project.json` now exists)
- Confirmed correct app URL is `realestate-outreach-sand.vercel.app` (NOT `realestate-outreach.vercel.app`)
- Verified email flow end-to-end via n8n execution logs
- Verified dashboard loads leads (initial load slow — Refresh button works immediately)
- All commits pushed to `github.com/ambrosevoon/realestate-outreach` on `main`

---

### ⏭️ Next Step

Main outreach pipeline and booking pipeline are now working. Next sensible options:
- clean up older duplicate safe-test activity rows if desired
- add richer booking metadata to activity log if needed
- improve dashboard auto-refresh after booking events
- decide next Phase 6 feature scope
