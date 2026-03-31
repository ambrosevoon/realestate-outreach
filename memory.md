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

### 🔄 Session Update (2026-03-30 #2)

**Bug fixed: Send Email silently failing for new leads with no prior email history**

Root cause: `Fetch Prior Subjects` HTTP node returns an empty JSON array `[]` when a lead has no prior `email_sent` activities. n8n silently stops workflow execution when a node outputs 0 items — so `Build Email`, `Send Outreach Email`, `Log Email Activity` never ran. The email was never sent and no activity was logged.

Fix applied live to n8n workflow `gkDnKkwCC4YEPoyu`:
- `Fetch Prior Subjects` node: added `options.response.response.fullResponse = true` — this forces the node to always output exactly 1 item (the full HTTP response object) regardless of whether the body is empty or not
- `Build Email` node: updated `usedSubjects` logic to parse `$('Fetch Prior Subjects').item.json.body` as an array instead of iterating `.all()` on multiple items

Verified fix end-to-end:
- Test execution 42351: all 7 nodes ran, last node = Respond ✅
- Activity `email_sent` correctly written to Supabase for Xuan Test lead ✅
- Gmail send confirmed (subject: "Still following up leads by hand?") ✅

**How this applies**: Any lead that has never been emailed before will now work correctly. Previously only leads with ≥1 prior email activity worked.

---

### ⏭️ Next Step

Main outreach pipeline and booking pipeline are now working. Next sensible options:
- clean up older duplicate safe-test activity rows if desired
- add richer booking metadata to activity log if needed
- improve dashboard auto-refresh after booking events
- decide next Phase 6 feature scope

---

### 🔄 Session Update (2026-03-30 #3) — Codex

This section documents the premium theme integration and GitHub handoff so Claude Code and Codex can continue from the same repo state.

**What Codex changed in the app repo**
- Installed new UI dependencies in [package.json](/Users/ambrosevoon/Projects/realestate-outreach/package.json):
  - `framer-motion`
  - `@paper-design/shaders-react`
- Added reusable shader hero component:
  - [components/ui/hero.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/hero.tsx)
- Added requested demo wrapper:
  - [components/ui/demo.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/demo.tsx)
- Updated main user-facing surfaces to match the new premium visual direction:
  - [app/login/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/login/page.tsx)
  - [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx)
  - [components/dashboard/StatsCards.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/StatsCards.tsx)
  - [components/dashboard/AnalyticsSection.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/AnalyticsSection.tsx)
  - [components/dashboard/LeadsTable.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/LeadsTable.tsx)
  - [components/lead/LeadDrawer.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/lead/LeadDrawer.tsx)
  - [components/ThemeToggle.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ThemeToggle.tsx)

**Design intent used by Codex**
- Product context supplied by user: outreach system for selling automated email workflows to real estate agents
- Brand direction chosen: premium, polished, high-trust B2B rather than generic startup / neon demo styling
- The imported 21st.dev shader concept was adapted to SmartFlow’s actual use case instead of being pasted verbatim with generic “shader experiences” copy

**Important implementation notes**
- The repo already supported the required setup:
  - TypeScript
  - Tailwind CSS
  - ShadCN-style `components/ui`
- No scaffolding migration was required
- The original prompt’s shader props did not fully match the real installed `@paper-design/shaders-react` API
- Codex inspected the installed type definitions in `node_modules` and adjusted unsupported props so the component would compile cleanly

**What Codex verified**
- `npm run build` passes after all shader/theme updates
- Visual refresh remains app-only and does not touch live n8n workflows

**Git / handoff state**
- Codex branding commit already existed earlier in the day:
  - `1a012e1` — `feat(brand): redesign smartflow logo`
- Codex will also push this theme integration session to GitHub so `main` reflects the current UI state for future Claude Code / Codex sessions

**Process note requested by user**
- User asked that Codex push all completed changes to GitHub and document all work in both `tasks.md` and `memory.md` for cross-tool continuity
- Treat this as an active project workflow preference going forward unless the user says otherwise

### 🔄 Session Update (2026-03-30 #4) — Codex

This section records the follow-up shader refinement after the user clarified that the shader treatment should fill the entire page, not sit inside a single section.

**What Codex changed**
- Extracted reusable shader background layer from [components/ui/hero.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/hero.tsx):
  - added exported `ShaderBackdrop`
  - kept the existing hero component intact for full hero usage on login
- Reworked [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx) so the dashboard now uses the shader as a fixed full-page background instead of a compact hero block at the top
- Moved the dashboard heading/content into floating overlay content so the whole screen reads as one shader experience, closer to the supplied reference image

**Result**
- Login page continues to use a full-screen shader experience
- Dashboard now also reads as a full-page shader environment with glassy overlay panels and content floating on top
- The visual direction is now much closer to “entire page is the experience” rather than “one premium section inside a standard page”

**Verification**
- `npm run build` passes after the full-page shader refinement

**Codex handoff note**
- This refinement is app-only and does not touch Supabase or live n8n workflows
- Push this state to GitHub so Claude Code sees the full-page shader version, not the earlier section-only draft

### 🔄 Session Update (2026-03-30 #5) — Codex

Small layout refinement after visual review:

- User feedback: shader look was correct, but the dashboard content stack began too low on the page
- Codex adjusted the dashboard top padding in [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx) so the headline and first content blocks sit higher in the viewport, closer to the provided reference composition
- Verified again with `npm run build`

This is a layout-positioning tweak only; no workflow, data, or dependency changes were made.

### 🔄 Session Update (2026-03-30 #6) — Codex

This section records the discovery-source change and the theme-default change.

**What Codex changed**
- Added server-side discovery route:
  - [app/api/discover-agents/route.ts](/Users/ambrosevoon/Projects/realestate-outreach/app/api/discover-agents/route.ts)
- Updated [lib/n8n.ts](/Users/ambrosevoon/Projects/realestate-outreach/lib/n8n.ts):
  - `discoverAgents()` no longer calls the n8n `/discover-agents` webhook
  - it now calls the local Next.js API route `/api/discover-agents`
- Updated theme boot behavior:
  - [app/layout.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/layout.tsx)
  - [components/ThemeToggle.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ThemeToggle.tsx)
- Updated env example:
  - [.env.local.example](/Users/ambrosevoon/Projects/realestate-outreach/.env.local.example)

**Discovery implementation details**
- Tavily is now used as the search provider for “Discover Agents”
- The API key is read from server env var `TAVILY_API_KEY`
- The key is intentionally kept server-side; the client never receives it
- The route builds a location-aware query, calls Tavily search, and maps search results into `RawAgent` objects for the existing import preview flow

**Theme change**
- First load now defaults to light mode
- If the user has explicitly saved `sf-theme=dark` in localStorage, dark mode still wins

**Verification**
- `npm run build` passes with the new route
- New route appears in build output:
  - `/api/discover-agents`

**Codex handoff note**
- There is now a split between historical docs and current implementation:
  - historical state: discovery used n8n
  - current app state: discovery uses Tavily through Next.js route
- Future sessions should treat the app-side Tavily route as the live frontend path unless deliberately migrated again

### 🔄 Session Update (2026-03-30 #7) — Codex

Follow-up debugging for “Discover Agents”:

- User reported that entering `50` and clicking Discover Agents still showed:
  - `Discovery failed, check n8n workflow`
- Codex verified the current frontend no longer uses n8n for discovery, so that toast message was stale and misleading
- Codex updated [components/dashboard/DiscoverAgentsButton.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/DiscoverAgentsButton.tsx) to surface the actual backend/config error instead
- Codex updated [app/api/discover-agents/route.ts](/Users/ambrosevoon/Projects/realestate-outreach/app/api/discover-agents/route.ts) to run multiple Tavily query variants instead of a single search call, which helps larger requested counts such as `50`

**Likely runtime explanation if failure still appears on deployed app**
- The deployed Vercel environment may not yet have `TAVILY_API_KEY` configured
- Or the latest GitHub changes may not yet be deployed to Vercel
- In that case the new UI should now show a more truthful error after redeploy, rather than mentioning n8n

**Verification**
- `npm run build` passes after the discovery error-handling/search-breadth update

### 🔄 Session Update (2026-03-30 #8) — Codex

Live verification and deployment follow-through for Tavily discovery:

**What Codex verified live**
- Production endpoint before fix:
  - `POST https://realestate-outreach-sand.vercel.app/api/discover-agents`
  - response: HTTP 500
  - body: `{"error":"TAVILY_API_KEY is not configured"}`
- Vercel production environment was missing `TAVILY_API_KEY`
- Local `.env.local` did contain the key, so the issue was deployment config, not repo code

**What Codex changed outside the repo**
- Added `TAVILY_API_KEY` to Vercel production env for project `realestate-outreach`
- Triggered manual production deploy via Vercel CLI
- Verified first live deploy changed the failure from missing-config 500 to Tavily 401
- Replaced the Vercel secret with a newline-free value
- Triggered a second production deploy

**Final live verification**
- Production endpoint after env + redeploy:
  - `POST https://realestate-outreach-sand.vercel.app/api/discover-agents`
  - request body: `{"count":50,"location":"perth"}`
  - response: HTTP 200
  - body included `total: 50` and a Tavily-backed `agents` array

**Important process note**
- User explicitly asked that verification happen before finishing
- For live integrations like this, “build passes” is not sufficient; verify the real runtime endpoint and deployment env before closing the task

### 🔄 Session Update (2026-03-30 #9) — Codex

Testing-mode visibility update:

- Added a prominent testing banner to [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx)
- Banner content explicitly says the page is in testing mode and that all destination email addresses are overridden to `ambrosevoon@gmail.com`
- Added a blinking animated warning indicator via [app/globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css)
- Verified with `npm run build`

This update is purely presentational and exists to reduce operator mistakes during the testing phase.

### 🔄 Session Update (2026-03-30 #10) — Codex

Day-mode readability fix:

- User reported that after switching default theme behavior to day mode, key dashboard text became hard to read against the still-dark shader surface
- Root cause: global `html.light .text-white` override was turning dashboard text dark even though the dashboard itself intentionally remains a dark shader environment
- Codex added `dashboard-page` scope in [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx)
- Codex updated [app/globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css) so `text-white` stays bright inside the shader dashboard even when the app is in light mode
- Verified with `npm run build`

This preserves the day-mode setting while keeping the dashboard content readable on top of the shader background.

### 🔄 Session Update (2026-03-30 #11) — Codex

21st.dev glow button integration:

**What Codex changed**
- Added glow button source component:
  - [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)
- Added demo wrapper:
  - [components/ui/shiny-button-demo.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-demo.tsx)
- Updated shared button primitive:
  - [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx)

**Implementation decision**
- The raw 21st.dev button uses fixed dimensions that would break many existing controls if pasted literally into every button instance
- Codex adapted the glow treatment into the shared button primitive so it can scale across the app’s real buttons
- Main action variants now use the glow style:
  - `default`
  - `outline`
  - `secondary`
  - `destructive`
- Utility variants remain plain:
  - `ghost`
  - `link`

**Why this decision was made**
- The user asked for the style to be applied broadly across the app
- Applying the fixed-size effect literally to all buttons would have broken icon-only controls, small utility buttons, and low-emphasis actions
- This approach keeps the visual language while preserving app usability

**Verification**
- `npm run build` passes after the shared button integration

### 🔄 Session Update (2026-03-30 #12) — Codex

Glow button repair after user visual feedback:

- User reported the buttons were not displaying properly
- Root cause:
  - glow layers were too large and visually spilled across the header
  - custom per-button classes like compact sizing and split rounded corners were not being applied to the visible button surface
- Codex repaired:
  - [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)
  - [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx)
- Changes made:
  - reduced default glow size and opacity
  - tightened animated gradient bounds
  - removed forced minimum widths from the glow button sizing
  - applied consumer `className` values to the actual visible button surface so shape/sizing utilities work correctly

**Verification**
- `npm run build` passes after the glow button repair

**Open verification note**
- Because this was a visual bug, ideal next verification is a deployed visual check, not just build success

### 🔄 Session Update (2026-03-30 #13) — Codex

Live verification for repaired glow buttons:

- Pushed repair commit:
  - `9b4cd74` — `fix(ui): repair glow button layout`
- Deployed production build via Vercel CLI
- Verified the live dashboard visually on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`

**Visual verification result**
- Header buttons now render as separate controls again
- The previous oversized glow spill across the header is gone
- Main action buttons remain styled, but the layout is no longer broken

**Evidence**
- Live Playwright snapshot and screenshot were captured during verification
- Screenshot file captured locally during verification:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T06-59-31-486Z.png`

### 🔄 Session Update (2026-03-30 #14) — Codex

Button style refinement based on further user feedback:

- User wanted to keep the premium button treatment but remove the large glowing background flash when buttons sit near each other
- Codex updated [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx) to:
  - remove the oversized ambient glow layer
  - keep the shine concentrated along the outer edge of the button
  - retain subtle animated edge movement without flooding nearby layout areas

**Verification**
- `npm run build` passes after the edge-shine-only refinement

### 🔄 Session Update (2026-03-30 #15) — Codex

Live verification for edge-shine-only button refinement:

- Pushed refinement commit:
  - `224905b` — `fix(ui): reduce glow button ambient bleed`
- Deployed production build via Vercel CLI
- Verified the live dashboard visually on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`

**Visual verification result**
- The grouped header buttons render cleanly as separate controls
- The section-level ambient glow wash behind grouped buttons is gone
- The shine is now concentrated on the outer edge of each button, which matches the user's requested direction much more closely

**Evidence**
- Live Playwright screenshot captured during verification:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-15-47-564Z.png`

### 🔄 Session Update (2026-03-30 #16) — Codex

Reusable documentation for the glow button system:

- Added a dedicated reference doc:
  - [docs/glow-button-style.md](/Users/ambrosevoon/Projects/realestate-outreach/docs/glow-button-style.md)

**What the doc captures**
- source-of-truth files for the shared button primitive and glow implementation
- design intent for the premium edge-shine treatment
- which button variants should use the glow treatment and which should stay plain
- copy-paste usage example with the shared `Button` component
- implementation notes for where the visual behavior lives in code
- the approved verified state after the section-level ambient glow was removed

**Reuse guidance**
- Future work in this repo should prefer the shared [components/ui/button.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/button.tsx) primitive
- If the glow style needs refinement, update [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx) rather than duplicating custom button effects in feature components

### 🔄 Session Update (2026-03-30 #17) — Codex

Pre-share cleanup based on stakeholder comments:

- Removed the visible testing-mode banner from the dashboard:
  - [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx)
- Removed the now-unused banner pulse CSS:
  - [app/globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css)
- Kept the actual testing safeguard unchanged:
  - [lib/n8n.ts](/Users/ambrosevoon/Projects/realestate-outreach/lib/n8n.ts)
  - outbound email destination remains hardcoded to `ambrosevoon@gmail.com`

Lead-name cleanup for messy scraped discovery results:

- Added a shared formatter/normalizer:
  - [lib/leadFormatting.ts](/Users/ambrosevoon/Projects/realestate-outreach/lib/leadFormatting.ts)
- Updated Tavily discovery parsing to normalize names/agencies before returning agents:
  - [app/api/discover-agents/route.ts](/Users/ambrosevoon/Projects/realestate-outreach/app/api/discover-agents/route.ts)
- Updated lead fetching and insert paths so normalization applies to:
  - existing fetched leads shown in the table
  - newly discovered/imported leads inserted into Supabase
  - manually created leads
  - file: [hooks/useLeads.ts](/Users/ambrosevoon/Projects/realestate-outreach/hooks/useLeads.ts)

**Targeted verification**
- `npm run build` passes after the cleanup
- Targeted formatter check:
  - `Mark Hay Realty Group: Real Estate Agents and Property...` normalizes to `Mark Hay Realty Group`
  - `Home` with agency `Lally Real Estate` normalizes to `Lally Real Estate`

**Why this approach was chosen**
- It cleans the current UI immediately without needing a risky one-off database migration
- It also cleans future Tavily-discovered leads at import time so the issue does not keep reappearing

Additional presentation polish:

- Updated [components/dashboard/LeadsTable.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/LeadsTable.tsx) so when a cleaned `name` and `agency_name` are identical, the table only shows one line instead of repeating the same label twice
- This helps rows like `Lally Real Estate` and `Mark Hay Realty Group` read as deliberate cleanup rather than duplicated scraped data

**Production verification**
- Pushed cleanup commit:
  - `0345934` — `fix(ui): clean dashboard shareable state`
- Pushed table-polish follow-up:
  - `b25dafb` — `fix(ui): polish cleaned lead rows`
- Deployed production builds:
  - `dpl_6gcgjDzQMCTWxZMnQJvpoFutTcEb`
  - `dpl_HLNSA9X6ZFqGZRR19Mi4y66f1hQe`
- Verified live on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`

**Live result**
- The testing banner is no longer visible
- The email override remains hardcoded internally in [lib/n8n.ts](/Users/ambrosevoon/Projects/realestate-outreach/lib/n8n.ts)
- Cleaned rows such as `Mark Hay Realty Group` now render without a duplicated second line
- The first-load empty-table issue still exists, but using the built-in Refresh button loads the lead list correctly for verification

**Evidence**
- Live verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-40-03-235Z.png`

### 🔄 Session Update (2026-03-30 #18) — Codex

Mobile dashboard header responsiveness:

- User reported the dashboard action buttons were clipping offscreen on mobile
- Root cause:
  - the header action area was still structured like a single desktop toolbar
  - full desktop button labels were too wide for narrow screens

**Changes made**
- Updated [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx) so mobile now uses:
  - top row: logo + theme/logout/refresh utility icons
  - second row: compact action-button grid for import, discover, and add
- Updated button-trigger components with mobile-friendly labels and width behavior:
  - [components/dashboard/CSVImportDialog.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/CSVImportDialog.tsx)
  - [components/dashboard/DiscoverAgentsButton.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/DiscoverAgentsButton.tsx)
  - [components/dashboard/CreateLeadDialog.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/CreateLeadDialog.tsx)

**Mobile behavior**
- `Import CSV` becomes `Import` on mobile
- `Discover Agents` becomes `Discover` on mobile
- `Add Lead` becomes `Add` on mobile
- Desktop keeps the original full labels

**Verification**
- `npm run build` passes after the responsive changes
- Local browser verification at `390x844` shows the header actions fitting cleanly without clipping

**Evidence**
- Local mobile verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-54-37-118Z.png`

**Production verification**
- Pushed commit:
  - `2ae8f82` — `fix(ui): improve mobile dashboard header`
- Deployed production build:
  - `dpl_Bh14rposBH94t2TzXohgrQnCaGTM`
- Verified live on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`
  - viewport: `390x844`

**Live result**
- Mobile action buttons fit within the viewport
- The old right-edge clipping is gone
- Utility controls remain accessible in the top row
- Main actions now read as a compact two-row mobile header control set

**Live evidence**
- Production mobile verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-30T07-59-13-088Z.png`

### 🔄 Session Update (2026-03-31 #19) — Codex

Day mode redesign for the dashboard:

- User reported that toggling day/night mode barely changed the visual design and that the current dashboard still felt like a night-mode surface
- Goal: make light mode genuinely bright while preserving text readability and keeping dark mode visually strong

**Changes made**
- Updated [app/dashboard/page.tsx](/Users/ambrosevoon/Projects/realestate-outreach/app/dashboard/page.tsx) to add stable hook classes for theme-aware dashboard surfaces:
  - `dashboard-backdrop`
  - `dashboard-overlay`
  - `dashboard-header`
  - `dashboard-eyebrow`
  - `dashboard-hero-title`
  - `dashboard-hero-copy`
  - `dashboard-toolbar`
  - `dashboard-panel`
- Updated dashboard components with reusable theme-aware surface/text hooks:
  - [components/dashboard/StatsCards.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/StatsCards.tsx)
  - [components/dashboard/AnalyticsSection.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/AnalyticsSection.tsx)
  - [components/dashboard/LeadsTable.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/dashboard/LeadsTable.tsx)
  - [components/ThemeToggle.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ThemeToggle.tsx)
- Added dashboard-specific light-mode CSS in [app/globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css) for:
  - brighter shader treatment
  - pale atmospheric overlay
  - white/soft-slate glass surfaces
  - dark readable text values in cards, table, and hero copy

**Verification**
- `npm run build` passes
- Local light-mode verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-31T04-04-06-051Z.png`
- Local dark-mode sanity-check screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-31T04-05-19-307Z.png`

**Result**
- Light mode now reads as a true day surface
- Dark mode still preserves the premium shader atmosphere
- Text contrast is materially better in day mode across the hero, cards, analytics, and table

**Production verification**
- Pushed commit:
  - `db8e6bc` — `fix(ui): create true dashboard light mode`
- Deployed production build:
  - `dpl_7jQvRxtEYC2Q8wWYVJVLv1Lwq7ft`
- Verified live on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`

**Live result**
- Light mode now presents as a genuinely bright dashboard surface
- Hero copy, metrics, analytics, and table content are readable in day mode
- Dark mode remains visually distinct and still matches the original premium shader direction

**Live evidence**
- Production light-mode verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-31T04-10-48-054Z.png`

### 🔄 Session Update (2026-03-31 #20) — Codex

Day-mode polish for buttons and popup surfaces:

- User reported that even after the bright dashboard redesign:
  - action buttons still looked like dark/night controls in day mode
  - popup surfaces such as the lead drawer were still visually stuck in the dark theme

**Changes made**
- Added explicit light-mode hooks to the shared glow button implementation:
  - [components/ui/shiny-button-1.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/shiny-button-1.tsx)
- Added light-mode styling hooks for custom overlay/popup UI:
  - [components/lead/LeadDrawer.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/lead/LeadDrawer.tsx)
  - [components/lead/ActionButtons.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/lead/ActionButtons.tsx)
  - [components/ui/popover.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/popover.tsx)
  - [components/ui/dialog.tsx](/Users/ambrosevoon/Projects/realestate-outreach/components/ui/dialog.tsx)
- Added corresponding day-mode CSS overrides in:
  - [app/globals.css](/Users/ambrosevoon/Projects/realestate-outreach/app/globals.css)

**Intent of this pass**
- Day-mode buttons should still feel premium, but with a light glass surface and dark readable text
- Drawers/popups should inherit the light theme rather than sitting as dark islands on a bright dashboard

**Verification**
- `npm run build` passes after the light-mode button/popup styling pass
- Local production-browser verification confirms:
  - dashboard action buttons render with light-compatible surfaces and readable dark text in day mode
  - the lead drawer opens with a bright card surface, readable labels, and day-mode-compatible action controls

**Production verification**
- Pushed commit:
  - `3214f40` — `fix(ui): improve light mode buttons and popups`
- Deployed production build:
  - `dpl_8HMUegRWfbKSYs6njGyBvTzk7xfY`
- Verified live on:
  - `https://realestate-outreach-sand.vercel.app/dashboard`

**Live result**
- Day-mode header buttons no longer look like night-mode controls on a bright page
- The lead drawer now reads as a proper light-theme popup rather than a dark overlay island
- Button labels, drawer labels, notes/status fields, and action controls are readable in day mode

**Live evidence**
- Production light-mode header verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/page-2026-03-31T04-29-44-818Z.png`
- Production light-mode lead drawer verification screenshot:
  - `/Users/ambrosevoon/Projects/.playwright-cli/live-drawer-daymode-2026-03-31-vicky.png`

### 🔄 Session Update (2026-03-31 #21) — Codex

AI draft copy polish in the live n8n workflow:

- User supplied a new outbound cold-email copy brief focused on keeping the existing template/layout untouched while improving only the generated content
- Important constraint discovered during implementation:
  - the app-side AI draft preview comes from live n8n workflow `[Realestate Outreach] Generate AI Draft` (`QKSf9yZfaB3nTmXx`)
  - the actual sent email body still comes from the separate live n8n workflow `[Realestate Outreach] Send Email` (`gkDnKkwCC4YEPoyu`)
  - today’s change improves AI draft preview copy and draft subject generation, but does not yet make the sent email body match the AI draft body

**What Codex changed live in n8n**
- Updated the `Generate Draft` agent prompt in workflow `QKSf9yZfaB3nTmXx`
  - replaced the older freeform subject/body prompt with the new structured copy brief
  - prompt now asks for:
    - `hook`
    - `intro`
    - `problem_paragraph`
    - `pain_box_heading`
    - `pain_points`
    - `solution_paragraph`
    - `cta`
- Tightened prompt rules to better fit the user brief:
  - stronger operational hook instead of generic openers
  - concise Ambrose positioning line
  - sharper problem framing around follow-up speed and missed opportunities
  - 4–6 concrete pain points for the highlighted box
  - shorter outcome-focused solution paragraph
  - lower-friction CTA
  - explicit bans on HTML output, template changes, product-name dumping, and generic SaaS copy
- Added prompt constraints after sample review:
  - write from Ambrose in first-person singular
  - avoid social-proof claims about other agents already using it
  - avoid overpersonalised or fabricated local observations
  - avoid generic greetings and weak intros
- Updated the `Parse Draft` code node so the structured JSON is converted back into the app’s expected draft response shape:
  - returns `subject`
  - returns plain-text `body`
  - preserves the `[[ ... ]]` highlighted pain-box delimiters for the existing preview renderer
  - includes a `content` object carrying the structured fields for inspection/debugging

**Repo-side traceability**
- Saved a local pre-edit workflow backup:
  - [n8n-generate-draft-workflow-backup-2026-03-31.json](/Users/ambrosevoon/Projects/realestate-outreach/docs/n8n-generate-draft-workflow-backup-2026-03-31.json)

**Verification**
- Verified live draft webhook before changes to capture baseline output
- Verified live draft webhook after prompt/parser update:
  - `POST https://n8n.srv823907.hstgr.cloud/webhook/generate-draft`
  - response shape confirmed as `{ subject, body, content }`
  - structured sections now appear in the response payload and the `body` is assembled in the required sequence
- Caught and fixed one regression during the session:
  - an attempted parser hardening step introduced a JavaScript syntax error in the n8n Code node
  - Codex reverted to the last known-good parser immediately and re-verified the webhook response

**Current result**
- AI draft output is now noticeably closer to the requested style:
  - stronger hooks
  - more commercially aware problem framing
  - more concrete pain-box content
  - cleaner CTA structure
- The draft system is now structured enough to support future template insertion work if the send-email workflow is later aligned to the same content fields

**Important next-step caveat**
- If the goal is for the final sent outreach email body to match the polished AI draft copy as well, the next change must be made in `[Realestate Outreach] Send Email` (`gkDnKkwCC4YEPoyu`), because that workflow still builds its own HTML body independently and currently only reuses the draft subject

**Follow-up polish in the same session**
- User asked for one more pass with an even stricter copy brief:
  - scenario-based hook first
  - delayed identity
  - blunt problem framing with consequence
  - tighter pain-box items
  - outcome-first solution
  - low-friction slightly assumptive CTA
- Codex updated the live `Generate Draft` system prompt again to reinforce:
  - no social proof
  - no fabricated exact enquiry counts unless provided
  - no casual headings like `Sound familiar?`
  - sharper uppercase-style pain-box headings
  - CTA kept to one sentence
- Re-verified the live webhook after the prompt adjustment

**Latest live draft result**
- Output now trends closer to the desired tone benchmark:
  - more operational pressure in the hook
  - clearer commercial consequence in the problem paragraph
  - stronger pain-box heading style
  - cleaner CTA
- The model can still occasionally choose specific numbers in hooks on some generations, but the social-proof phrasing was successfully removed in the latest verified sample

**Additional realism pass**
- User wanted one more reduction in polished SaaS tone:
  - identity delayed further and made softer
  - problem paragraph made more blunt
  - pain points rewritten to feel more like lived day-to-day agent pressure
  - solution paragraph stripped back from feature-sales phrasing toward outcome language only
- Codex updated the live `Generate Draft` prompt again to explicitly steer toward:
  - softer identity lines like “This is something I’ve been helping agents deal with...”
  - more direct consequence language around leads going cold and first-responder advantage
  - operational pain points like weekend stack-up, late-night replies, leads slipping through, and enquiries across multiple channels
  - a shorter CTA in the exact “Open to a quick 10-minute look…” style

**Latest verification**
- Re-tested live webhook:
  - `POST https://n8n.srv823907.hstgr.cloud/webhook/generate-draft`
  - response still returned HTTP 200 and valid JSON
- Latest verified sample showed:
  - softer intro line
  - blunter problem framing
  - more realistic pain-box copy
  - cleaner CTA

**Scene-based hook refinement**
- User wanted the opening hook to stop sounding like commentary about the market and instead feel like a lived moment from an agent’s week
- Codex updated the live `Generate Draft` prompt again with a hook-specific override:
  - force scene-based openings
  - start from a recognisable moment in time
  - add visible tension such as stacked enquiries or trying to switch off while replies are still waiting
  - explicitly ban commentary-led openings such as “In today’s market...” or “Response time matters...”
- Re-verified the live webhook after the hook override

**Latest live hook result**
- Latest verified sample opened with:
  - `It's Sunday evening after a full day of opens, and you've still got a stack of new enquiries waiting for replies while you're trying to switch off.`
- This is materially closer to the requested “snapshot / lived moment” style than the earlier abstract openings
