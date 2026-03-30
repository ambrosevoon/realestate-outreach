# tasks.md — SmartFlow Outreach Dashboard

---

## ✅ Phase 1 — Core Dashboard
**Completed: 2026-03-24**

- [x] Scaffold Next.js 16.2.1 project (App Router, TypeScript, Tailwind v4, ShadCN)
- [x] Install dependencies: Supabase SSR, lucide-react, date-fns, clsx, tailwind-merge
- [x] Create TypeScript types (Lead, Activity, LeadStatus, ActivityType)
- [x] Set up Supabase browser client (lib/supabase.ts)
- [x] Set up n8n webhook client (lib/n8n.ts) — 3 endpoints
- [x] Build useLeads hook (fetch, create, update, delete, filter, sort)
- [x] Build useActivities hook (fetch, add)
- [x] Build StatsCards — Total, Contacted%, Replied%, Demo Booked%
- [x] Build LeadsTable — sortable, searchable, filterable
- [x] Build StatusBadge — 6 statuses, color-coded
- [x] Build CreateLeadDialog — full form, Supabase insert
- [x] Build LeadDrawer — ShadCN Sheet, status, notes, timeline, actions
- [x] Build ActivityTimeline — chronological, icon per type
- [x] Build ActionButtons — Send Email, AI Draft, Schedule Follow-up, Mark Won/Lost
- [x] Wire dashboard page (app/dashboard/page.tsx)
- [x] Configure Tailwind v4 @theme dark palette
- [x] Connect Supabase credentials (.env.local)
- [x] Create Supabase tables via Management API
- [x] Rename tables to re_outreach_leads / re_outreach_activities
- [x] Verify end-to-end: insert → fetch → update → activity — all PASS

---

## ✅ Phase 2 — n8n Automation
**Completed: 2026-03-24**

- [x] Build n8n workflow: POST /webhook/send-email (Gmail outreach + PATCH last_contacted_at)
- [x] Build n8n workflow: POST /webhook/update-lead (update status + owner_notes in re_outreach_leads)
- [x] Build n8n workflow: POST /webhook/schedule-followup (set next_followup_at)
- [x] Test all 3 webhook calls end-to-end — Supabase updates verified PASS

---

## ✅ Phase 3 — Data Import
**Completed: 2026-03-24**

- [x] CSV import for bulk agent upload (name, agency_name, phone, email, suburb, website)
- [x] Duplicate detection — match by name+phone (primary) or email (secondary), within-batch dedup
- [x] Import preview before committing (ImportPreviewDialog shared by both paths)
- [x] Discover Agents button — Perplexity AI web search via n8n webhook
- [x] Discovery settings popover — count + location, persisted to localStorage
- [x] n8n workflow: [Realestate Outreach] Discover Agents (ID: 36zDpxdGMZBUPl95)

---

## ✅ Phase 4 — Production Hardening
**Completed: 2026-03-24**

- [x] Enable Supabase RLS on re_outreach_leads and re_outreach_activities (2026-03-24)
- [x] Add single-password auth gate (middleware + login page + API routes) (2026-03-24)
- [x] Deploy to Vercel — https://realestate-outreach.vercel.app (2026-03-24)
- [x] Add pagination for large lead lists — 25/page, client-side (2026-03-24)
- [x] Add logout button to dashboard header (2026-03-24)

---

## ✅ Phase 5 — Analytics & Tracking
**Completed: 2026-03-27**

- [x] Email activity chart (sent over time — last 14 days bar chart) (2026-03-27)
- [x] Status breakdown bar chart (counts per status with color-coded progress bars) (2026-03-27)
- [x] Days left / pace tracker (contacted/remaining progress bar, per-day rate, days left estimate) (2026-03-27)
- [x] Reply rate tracking (% of contacted leads who replied, with progress bar) (2026-03-27)

---

## ✅ Phase 6 — Outreach Email / Booking Flow Hardening
**Completed by Codex: 2026-03-28**

- [x] Investigate mismatch between AI draft subject and actual sent email subject (2026-03-28)
- [x] Confirm actual architecture: AI draft flow and send-email flow were separate (2026-03-28)
- [x] Update app to pass `lead_id` into AI draft generation for per-lead subject history checks (2026-03-28)
- [x] Update live send-email workflow to support subject override while preserving legacy HTML body format (2026-03-28)
- [x] Preserve original send-email visual layout after discovering full draft-body handoff changed the email format too much (2026-03-28)
- [x] Add subject uniqueness guard per lead in live send-email workflow (2026-03-28)
- [x] Add subject uniqueness guard in live generate-draft workflow using prior sent-subject history (2026-03-28)
- [x] Increase pain-point section from fixed 3 items to random 5–8 items in live send-email workflow (2026-03-28)
- [x] Improve copy after pain points to better explain conversion benefit while keeping legacy format (2026-03-28)
- [x] Verify safe test emails only to `ambrosevoon@gmail.com` (2026-03-28)
- [x] Push app-side commits to GitHub `main` for the draft/subject fixes (2026-03-28)

---

## ✅ Phase 7 — Cal.com Demo Booked Automation Repair
**Completed by Codex: 2026-03-28**

- [x] Inspect live Cal.com booking workflow after end-to-end booking failed to update dashboard (2026-03-28)
- [x] Identify initial workflow error: unused / invalid webhook response-node setup (2026-03-28)
- [x] Identify duplicate safe leads on same email and harden matching logic to choose the intended `Happy Realty` lead (2026-03-28)
- [x] Fix `Get Lead ID` node to use the full HTTP result set instead of only the first item (2026-03-28)
- [x] Fix response body so webhook returns valid JSON and workflow finishes with `status: success` (2026-03-28)
- [x] Verify safe lead updates to `demo_booked` in Supabase after booking webhook runs (2026-03-28)
- [x] Verify `Demo booked via cal.com` activity note is written to `re_outreach_activities` (2026-03-28)
- [x] Format booking activity content in natural-language Perth time instead of raw ISO timestamp (2026-03-28)
- [x] Verify deployed dashboard shows safe `Ambrose / Happy Realty` row as `Demo Booked` (2026-03-28)

---

## ✅ Phase 8 — Testing Phase Safety Config
**Completed: 2026-03-30**

- [x] Hardcode send-email destination to `ambrosevoon@gmail.com` in `lib/n8n.ts` — prevents real leads receiving test emails (2026-03-30)
- [x] Disable auth/login gate in `middleware.ts` — dashboard open without password during testing (2026-03-30)

> **Revert checklist before go-live:**
> - `lib/n8n.ts` — remove `TEST_EMAIL` constant, restore `call('/send-email', lead)`
> - `middleware.ts` — restore full `safeEqual` + cookie check

---

## Notes For Next Session

- Safe lead used throughout testing:
  - `aeea7bb1-0ab3-4e01-b9ee-6a625ea17a01` — Ambrose / Happy Realty / `ambrosevoon@gmail.com`
- App-side Git commits made by Codex in this session:
  - `5a2d697`
  - `bef6528`
  - `eaac23d`
- Live n8n workflows modified directly in this session:
  - `gkDnKkwCC4YEPoyu` — Send Email
  - `QKSf9yZfaB3nTmXx` — Generate AI Draft
  - `RO7X6UUdta1ibcap` — Cal.com Booking → Demo Booked

---

## Infrastructure Notes (2026-03-30)

### Vercel Deployment
- ✅ **Correct app URL:** `https://realestate-outreach-sand.vercel.app`
- ❌ **Different project (wrong URL):** `https://realestate-outreach.vercel.app` — completely different codebase, do NOT use
- **Vercel project ID:** `prj_hxB2TVCnvTK3o0GCQr1eoUSpZWw4`
- **GitHub repo:** `github.com/ambrosevoon/realestate-outreach` (private)
- **Local link:** `.vercel/project.json` exists — project already linked

### Deploy Command (MUST use this exact command)
```
cd /Users/ambrosevoon/Projects/realestate-outreach
npx vercel --prod --yes --scope ambrosevoon-4152s-projects
```

### ⚠️ GitHub → Vercel Auto-Deploy is NOT Enabled
Manual deploy required after every push to GitHub. Steps:
1. `git add -A && git commit -m "..." && git push origin main`
2. `cd /Users/ambrosevoon/Projects/realestate-outreach && npx vercel --prod --yes --scope ambrosevoon-4152s-projects`

### Known UX Issue
- Dashboard shows 0 leads on initial page load — clicking Refresh loads them immediately
- Root cause: client-side hydration timing delay, not a data/auth bug
- Fix: add loading state retry or delayed fetch in `useLeads` hook (not yet implemented)
