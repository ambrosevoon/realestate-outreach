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

## ✅ Phase 9 — Bug Fix: Send Email for New Leads
**Completed: 2026-03-30**

- [x] Identified root cause: `Fetch Prior Subjects` HTTP node returns 0 items for leads with no prior email history, causing n8n to silently stop the workflow before sending (2026-03-30)
- [x] Fixed `Fetch Prior Subjects` node: enabled `fullResponse: true` so it always outputs 1 item regardless of empty Supabase response (2026-03-30)
- [x] Fixed `Build Email` node: updated `usedSubjects` logic to parse `item.json.body` from the full response object instead of iterating `.all()` (2026-03-30)
- [x] Verified fix: all 7 workflow nodes now execute, activity logged to Supabase, Gmail send confirmed (execution 42351) (2026-03-30)

> **Note:** This was a live n8n workflow fix — no app code changes required.

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

---

## ✅ Phase 10 — Premium Theme / 21st.dev-Inspired Visual Refresh
**Completed by Codex: 2026-03-30**

- [x] Reviewed the 21st.dev shader prompt and adapted it to the existing Next.js + ShadCN + Tailwind + TypeScript app structure (2026-03-30)
- [x] Installed required frontend dependencies: `framer-motion` and `@paper-design/shaders-react` (2026-03-30)
- [x] Added reusable shader hero component at `components/ui/hero.tsx` and companion demo wrapper at `components/ui/demo.tsx` (2026-03-30)
- [x] Reworked login page into a premium branded entry experience using the new shader hero (2026-03-30)
- [x] Reworked dashboard top section with a compact shader hero tailored to real-estate outreach operations (2026-03-30)
- [x] Applied the new premium visual language across stats cards, analytics, leads table, lead drawer, and theme toggle (2026-03-30)
- [x] Preserved project context by adapting copy and styling to SmartFlow’s “premium outreach automation for real estate agents” positioning rather than using the generic shader demo text (2026-03-30)
- [x] Verified app still builds successfully with `npm run build` after shader integration (2026-03-30)
- [x] Pushed the visual refresh work and documentation updates to GitHub `main` for Claude Code / Codex handoff continuity (2026-03-30)
- [x] Refined the dashboard from a shader hero section into a full-page shader environment so the experience fills the entire screen like the user’s reference image (2026-03-30)
- [x] Extracted reusable `ShaderBackdrop` from the hero component so whole-page shader treatments can be reused outside the hero layout (2026-03-30)
- [x] Verified the whole-page shader refinement still builds successfully with `npm run build` (2026-03-30)
- [x] Adjusted dashboard hero/content stack upward so the headline and top cards sit in the upper section of the viewport instead of starting too low (2026-03-30)

> **Codex handoff note:** this phase was implemented locally in the app repo only. No live n8n workflow changes were needed.

---

## ✅ Phase 11 — Tavily Discovery + Light Mode Default
**Completed by Codex: 2026-03-30**

- [x] Replaced the app-side “Discover Agents” call path so it now uses a server route backed by Tavily web search instead of the previous n8n discovery webhook path (2026-03-30)
- [x] Added `app/api/discover-agents/route.ts` to keep Tavily API usage server-side and out of the client bundle (2026-03-30)
- [x] Updated `lib/n8n.ts` so `discoverAgents()` calls the local Next.js API route rather than `POST /webhook/discover-agents` (2026-03-30)
- [x] Added `TAVILY_API_KEY` placeholder to `.env.local.example` and configured the local runtime env for testing (2026-03-30)
- [x] Changed the app’s first-load theme behavior so day mode is now the default unless the user explicitly saved dark mode (2026-03-30)
- [x] Verified the new discovery route and theme boot changes still build successfully with `npm run build` (2026-03-30)
- [x] Improved discovery failure feedback so the UI now surfaces Tavily/configuration errors instead of the stale “check n8n workflow” message (2026-03-30)
- [x] Expanded Tavily discovery to use multiple search query variations so higher requested counts such as 50 have a better chance of filling (2026-03-30)
- [x] Verified live production failure root cause on Vercel: `TAVILY_API_KEY` missing from production env, causing `/api/discover-agents` to return HTTP 500 (2026-03-30)
- [x] Added `TAVILY_API_KEY` to Vercel production env and manually redeployed `realestate-outreach-sand.vercel.app` (deployment `dpl_55qsqW3yJxDtr8UFFsqFjLJjcEtS`) (2026-03-30)
- [x] Replaced the malformed Vercel Tavily secret with a newline-free value and redeployed again (deployment alias `realestate-outreach-sand.vercel.app`) (2026-03-30)
- [x] Verified live production discovery endpoint returns HTTP 200 and 50 Tavily-backed agent results for `count=50`, `location=perth` (2026-03-30)
- [x] Added a bold testing-mode notice at the top of the dashboard with a blinking animated warning icon and explicit safe-destination email text (`ambrosevoon@gmail.com`) (2026-03-30)
- [x] Verified the testing-mode banner change still builds successfully with `npm run build` (2026-03-30)
- [x] Fixed dashboard day-mode readability by restoring bright text colors inside the shader-based dashboard surface instead of allowing light-mode global text overrides to turn critical copy dark (2026-03-30)
- [x] Verified the dashboard day-mode contrast fix still builds successfully with `npm run build` (2026-03-30)

---

## ✅ Phase 12 — 21st.dev Glow Button Integration
**Completed by Codex: 2026-03-30**

- [x] Confirmed the repo already supports the required stack: ShadCN-style `components/ui`, Tailwind CSS, and TypeScript (2026-03-30)
- [x] Added the requested 21st.dev-inspired glow button component at `components/ui/shiny-button-1.tsx` (2026-03-30)
- [x] Added a companion demo wrapper at `components/ui/shiny-button-demo.tsx` (2026-03-30)
- [x] Integrated the glow treatment into the shared `components/ui/button.tsx` primitive so the main action buttons across the app inherit the new shiny style automatically (2026-03-30)
- [x] Preserved plain utility behavior for `ghost` and `link` button variants so top-bar icon controls and low-emphasis actions remain usable and compact (2026-03-30)
- [x] Verified the glow button integration still builds successfully with `npm run build` (2026-03-30)
- [x] Fixed the initial glow-button rendering bug by reducing uncontrolled glow bleed and making per-button layout classes apply to the visible button surface rather than only the wrapper (2026-03-30)
- [x] Verified the repaired glow button system still builds successfully with `npm run build` (2026-03-30)
- [x] Pushed repaired glow-button layout fix to GitHub `main`, deployed to Vercel production, and visually verified the live header/buttons no longer bleed across the page (`realestate-outreach-sand.vercel.app`) (2026-03-30)
- [x] Refined the glow-button style again to remove the large ambient section glow and keep only a tighter animated outer-edge shine around each button (2026-03-30)
- [x] Verified the edge-shine-only button refinement still builds successfully with `npm run build` (2026-03-30)
- [x] Pushed the edge-shine-only refinement to GitHub `main`, deployed it to Vercel production, and visually verified on the live dashboard that grouped buttons now keep a restrained outer-edge shine without the previous section-level glow wash behind them (2026-03-30)
- [x] Documented the approved glow button pattern for future reuse in `docs/glow-button-style.md`, including design intent, supported variants, usage guidance, and the verified approved state (2026-03-30)
- [x] Removed the public testing-mode banner from the dashboard while keeping the email override hardcoded internally in `lib/n8n.ts` (2026-03-30)
- [x] Added a shared lead-formatting normalization layer in `lib/leadFormatting.ts` so messy scraped discovery titles are cleaned before display and before new Tavily-discovered leads are inserted (2026-03-30)
- [x] Applied lead normalization to both existing fetched leads and newly created/imported leads via `hooks/useLeads.ts` so bad names are cleaned without requiring an immediate database migration (2026-03-30)
- [x] Verified the cleanup logic against the reported examples: `Mark Hay Realty Group: Real Estate Agents and Property...` now resolves cleanly, and `Home` with agency `Lally Real Estate` now resolves to `Lally Real Estate` instead of the junk title (2026-03-30)
- [x] Verified the dashboard cleanup changes still build successfully with `npm run build` (2026-03-30)
- [x] Polished the leads table rendering so rows no longer repeat the same cleaned label twice when `name` and `agency_name` resolve to the same value (2026-03-30)

> **Codex handoff note:** user asked to “change all the button to this style.” Codex applied the glow treatment at the shared button primitive level for primary/outline/secondary/destructive actions, while intentionally leaving `ghost`/`link` utility controls plain to avoid breaking tiny icon buttons and low-emphasis controls.

> **Codex handoff note:** Tavily discovery is now app-side via Next.js route. Existing n8n discovery workflow may still exist remotely, but the frontend no longer depends on it.
