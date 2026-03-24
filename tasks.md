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

## 📋 Phase 5 — Analytics & Tracking
**Status: NOT STARTED**

- [ ] Email activity chart (sent over time, like reference screenshot)
- [ ] Status breakdown donut chart
- [ ] Days left / pace tracker (X leads remaining at Y/day)
- [ ] Reply rate tracking
