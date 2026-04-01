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
- [x] Pushed the dashboard/shareability cleanup to GitHub `main`, deployed it to Vercel production (`dpl_6gcgjDzQMCTWxZMnQJvpoFutTcEb` then `dpl_HLNSA9X6ZFqGZRR19Mi4y66f1hQe` after the table polish), and verified live that the testing banner is gone and cleaned rows like `Mark Hay Realty Group` no longer display duplicated labels (2026-03-30)
- [x] Reworked the dashboard mobile header layout so utility icons stay in the top row and the main action buttons fit below as a compact grid instead of clipping offscreen (2026-03-30)
- [x] Added shorter mobile button labels for Import / Discover / Add while preserving the full desktop labels (2026-03-30)
- [x] Verified the responsive header changes build successfully with `npm run build` and visually fit at a 390px-wide viewport in local browser verification (2026-03-30)
- [x] Pushed the mobile header fix to GitHub `main`, deployed it to Vercel production (`dpl_Bh14rposBH94t2TzXohgrQnCaGTM`), and verified live at a 390px-wide viewport that the action buttons no longer clip off the right edge (2026-03-30)
- [x] Reworked dashboard light mode so day mode uses a genuinely bright visual treatment instead of reusing the dark shader surface with minimal text overrides (2026-03-31)
- [x] Added dashboard-specific light theme surfaces for the backdrop, overlay, header, hero, cards, analytics panels, toolbar, and leads table to improve readability in day mode (2026-03-31)
- [x] Verified locally that the light-mode dashboard is bright and readable while dark mode still preserves the existing premium shader look (2026-03-31)
- [x] Verified the day-mode redesign still builds successfully with `npm run build` (2026-03-31)
- [x] Pushed the day-mode redesign to GitHub `main`, deployed it to Vercel production (`dpl_7jQvRxtEYC2Q8wWYVJVLv1Lwq7ft`), and verified live that the dashboard now renders as a bright readable surface in light mode while dark mode remains available (2026-03-31)
- [x] Refined the shared glow-button system so day mode buttons use a light-compatible surface treatment instead of keeping the dark/night button fill on bright backgrounds (2026-03-31)
- [x] Added day-mode-compatible styling for popup surfaces including the lead drawer, popover panels, and dialog shells so overlays no longer stay visually locked to the night theme (2026-03-31)
- [x] Verified locally that the light-mode button and popup refresh still builds successfully with `npm run build` (2026-03-31)
- [x] Pushed the light-mode button/popup refresh to GitHub `main`, deployed it to Vercel production (`dpl_8HMUegRWfbKSYs6njGyBvTzk7xfY`), and verified live that the dashboard header buttons and lead drawer both render as bright readable day-mode surfaces (2026-03-31)
- [x] Updated the live n8n workflow `[Realestate Outreach] Generate AI Draft` (`QKSf9yZfaB3nTmXx`) so draft generation now follows a stricter structured copy brief: hook, intro, problem paragraph, pain-box points, solution paragraph, and low-friction CTA (2026-03-31)
- [x] Changed the AI draft workflow to prompt for structured JSON content fields, then parse those fields back into the existing plain-text draft format expected by the app preview (2026-03-31)
- [x] Tightened the draft prompt to avoid generic greetings, feature-dumping, SaaS buzzwords, fabricated overpersonalisation, and brand-heavy language while keeping the tone commercially sharp for real estate outreach (2026-03-31)
- [x] Added a local backup snapshot of the pre-edit Generate Draft workflow at `docs/n8n-generate-draft-workflow-backup-2026-03-31.json` for traceability (2026-03-31)
- [x] Verified the live `/webhook/generate-draft` endpoint returns HTTP 200 with the new structured draft content mapped back into `{ subject, body, content }` response shape (2026-03-31)
- [x] Confirmed important architecture caveat: the AI Draft workflow currently improves the preview draft copy and draft subject generation, but the live send-email body is still produced by the separate `[Realestate Outreach] Send Email` workflow template and only reuses the draft subject (2026-03-31)
- [x] Tightened the live Generate Draft prompt again to push more scenario-based hooks, blunter problem framing, sharper uppercase pain-box headings, and one-line low-friction CTAs while further banning social-proof language and made-up enquiry counts (2026-03-31)
- [x] Re-verified the live `/webhook/generate-draft` endpoint returns HTTP 200 after the second prompt polish pass and produces stronger output without the earlier “agents using this” phrasing (2026-03-31)
- [x] Refined the live Generate Draft prompt again to delay identity further, make the problem framing more blunt, replace generic SaaS-style pain points with more lived-in agent workflow pressure, and reduce feature-sales language in the solution paragraph (2026-03-31)
- [x] Verified the live `/webhook/generate-draft` endpoint returns HTTP 200 after the latest realism pass and now produces softer identity lines, sharper consequence framing, stronger pain-box copy, and a short clean CTA (2026-03-31)
- [x] Added a scene-based hook override to the live Generate Draft prompt so openings start from a recognisable moment in an agent’s week instead of abstract market commentary or generic business observations (2026-03-31)
- [x] Verified the live `/webhook/generate-draft` endpoint returns HTTP 200 after the hook override and now produces a more visual time-based opening such as “It’s Sunday evening after a full day of opens...” rather than commentary-led hooks (2026-03-31)
- [x] Fixed the email-send mismatch so the app now passes the generated draft body and fully rendered `body_html` into the send-email webhook instead of only sending the subject (2026-03-31)
- [x] Updated the live n8n workflow `[Realestate Outreach] Send Email` (`gkDnKkwCC4YEPoyu`) so the `Build Email` node now uses incoming `body_html` when provided and only falls back to the older hardcoded template if no rendered draft HTML is supplied (2026-03-31)
- [x] Verified the app-side send-path fix still builds successfully with `npm run build` (2026-03-31)
- [x] Verified the live send-email webhook with a real Gmail delivery using a unique marker subject/body: the delivered message body matched the provided `body_html` instead of the stale fallback template, confirming the actual sent email path now honors the generated content (2026-03-31)
- [x] Pushed the send-path fix to GitHub `main` in commit `bac2b66` and deployed it to Vercel production (`dpl_ySZUQeoqqzjDkSZuFxFkiKgPkQY9`), aliased at `https://realestate-outreach-sand.vercel.app` (2026-03-31)
- [x] Increased the pain-point bullet spacing in `lib/emailTemplate.ts` so the highlighted box has more separation between the bullet dot and the copy, plus slightly more vertical breathing room between rows (2026-03-31)
- [x] Verified the pain-point spacing update still builds successfully with `npm run build` (2026-03-31)
- [x] Pushed the pain-point spacing polish to GitHub `main` in commit `eebb1d2`, deployed it to Vercel production (`dpl_6Ln7G4wSqRvW3kFdaVmU87tizVFE`), and visually verified the rendered email HTML now shows a wider bullet-to-text gap inside the highlighted pain-point box (2026-03-31)
- [x] Fixed light-mode popup button visibility by applying the glow-button day-mode surface overrides to drawer/dialog/popover scopes instead of only `.dashboard-page`, so portal-rendered popup buttons get bright surfaces and readable dark text (2026-03-31)
- [x] Verified the light-mode popup button fix still builds successfully with `npm run build` (2026-03-31)
- [x] Pushed the popup button readability fix to GitHub `main` in commit `60224f4`, deployed it to Vercel production (`dpl_ALoQxqAFyoLSo5yXitvGbhohdNfE`), and visually verified live on the Scarborough lead drawer that `Save Notes`, `Send Email`, `AI Draft`, `Schedule Follow-up`, `Mark Won`, and `Mark Lost` are now clearly readable in day mode (2026-03-31)
- [x] Reorganized the glow button style guide under `docs/design/buttons/glow-button-style.md` and updated it to explicitly document both dark-mode and light-mode approved states, including popup/drawer behavior for portal-rendered buttons (2026-03-31)
- [x] Added a top-level reusable export for the glow button under `design-system/buttons/glow-button/`, including a reusable component copy, reuse README, and a lightweight copy of the button style guide so future projects can pull it directly from a stable root GitHub path (2026-03-31)
- [x] Fixed the actual sent email pain-point bullet spacing by replacing the preview-only `flex + gap` markup in `lib/emailTemplate.ts` with email-safe table-cell spacing, so Gmail-rendered messages preserve bullet-to-text separation (2026-03-31)
- [x] Verified the email spacing fix still builds successfully with `npm run build` (2026-03-31)
- [x] Verified the live send-email webhook with a real delivery using subject `Codex Bullet Spacing Verify 2026-03-31 15:00 AWST`, confirming the send path accepts the updated email-safe pain-point markup (2026-03-31)
- [x] Pushed the Gmail-safe bullet-spacing fix to GitHub `main` in commit `5463bfb` and deployed it to Vercel production (`dpl_FMJZTuyXaJVxfMwo2BuJeAaciV18`), aliased at `https://realestate-outreach-sand.vercel.app` (2026-03-31)
- [x] Reworked `/api/discover-agents` into a Tavily multi-source merge pipeline that searches across broad web results, agency websites, REIWA, realestate.com.au, Domain, RateMyAgent, and Google-business-style queries, then merges partial records into richer single leads using email/phone/website/name-agency matching (2026-03-31)
- [x] Added enrichment-aware merge logic so discovery can combine partial records from different result pages into one canonical lead with more complete email / phone / website / suburb coverage instead of returning duplicate agent entries (2026-03-31)
- [x] Ranked merged discovery candidates by completeness before returning them, while keeping the API response insert-safe for Supabase by stripping internal merge metadata before returning `agents` (2026-03-31)
- [x] Verified the multi-source discovery merge changes still build successfully with `npm run build` (2026-03-31)
- [x] Added an additional quality pass on discovery results to filter obvious non-Australian / directory-style noise, reject weak phone matches, and clean malformed agent names/suburbs before returning merged leads (2026-03-31)
- [x] Pushed the multi-source merge implementation to GitHub `main` in commits `f258e12`, `baee7d7`, and `4cfd1c4`, then deployed the refined discovery route to Vercel production (`dpl_9v3c12nFuUyukkVrV5EuaaVtm9Ri`) (2026-03-31)
- [x] Verified live production `POST /api/discover-agents` returns HTTP 200 with `source: tavily_multi_source_merge` after deployment; result quality is improved but still has some noisy portal-style candidates that should be tightened further in a later pass (2026-03-31)
- [x] Tightened `/api/discover-agents` again to prioritize person-level agent records instead of agency-only records by requiring stronger person evidence and filtering obvious directory / agency pages from portal hosts (2026-03-31)
- [x] Added stricter portal URL gating so Domain / REIWA / realestate.com.au / RateMyAgent results must point to actual agent-profile style pages rather than agency indexes, suburb directories, or generic listing pages (2026-03-31)
- [x] Removed the risky free-text person extraction fallback that was inventing fake names from random capitalized content, and now favor title-derived person names plus personal-email-derived names only (2026-03-31)
- [x] Added cleaner agency recovery from title parts, content phrases, website domains, and email domains so records like `perthrealty.com.au` resolve to `Perth Realty` instead of `Unknown Agency` where possible (2026-03-31)
- [x] Added extra discovery-key normalization so the merge layer can collapse more same-person duplicates across different portal sources using normalized name/suburb matching (2026-03-31)
- [x] Verified the stricter person-first discovery route still builds successfully with `npm run build` (2026-03-31)
- [x] Verified locally via `POST http://localhost:3000/api/discover-agents` for `Canning Vale` and `Perth` that the route now returns primarily named agents instead of agency-only rows or obvious directory junk (2026-03-31)
- [x] Pushed the person-first discovery refinement to GitHub `main` in commit `76b305f` and deployed it to Vercel production (`dpl_8KwM6eJn3YH49912wDxxYBWrqMtq`, production URL `realestate-outreach-50hjnv1be-ambrosevoon-4152s-projects.vercel.app`, aliased to `https://realestate-outreach-sand.vercel.app`) (2026-03-31)
- [x] Verified live production `POST https://realestate-outreach-sand.vercel.app/api/discover-agents` returns HTTP 200 for both `{"count":12,"location":"Canning Vale"}` and `{"count":12,"location":"Perth"}`, with the returned lists now focused on named agents like Wayne Adlem, Paul Williams, Gurneet Bhatia, John Phillips, and Nadija Begovich rather than agency-only records (2026-03-31)
- [x] Tightened discovery again so agent records must have a usable email address before they are returned, because agency-only or phone-only leads cannot be reached by the current outbound email workflow (2026-03-31)
- [x] Added a stricter reachable-email rule that rejects generic mailbox prefixes like `info@`, `admin@`, `hello@`, `contact@`, and similar variants so discovery favors directly usable agent inboxes over office inboxes (2026-03-31)
- [x] Verified the email-required discovery route still builds successfully with `npm run build` (2026-03-31)
- [x] Pushed the reachable-email discovery filter to GitHub `main` in commit `874ad78` and deployed it to Vercel production (`dpl_ADJ2nBQPPtrbeZsoysXwFzJ4xbsa`, production URL `realestate-outreach-hh5b06pdv-ambrosevoon-4152s-projects.vercel.app`, aliased to `https://realestate-outreach-sand.vercel.app`) (2026-03-31)
- [x] Verified live production discovery after the email-required filter:
  - `POST https://realestate-outreach-sand.vercel.app/api/discover-agents` with `{"count":12,"location":"Canning Vale"}` returns 1 agent with a reachable personal email (`Wayne Adlem`)
  - `POST https://realestate-outreach-sand.vercel.app/api/discover-agents` with `{"count":12,"location":"Perth"}` currently returns `{"error":"No agents found from Tavily search"}` because the remaining candidate pages do not expose a reachable agent email under the stricter rule (2026-03-31)

> **Codex handoff note:** user asked to “change all the button to this style.” Codex applied the glow treatment at the shared button primitive level for primary/outline/secondary/destructive actions, while intentionally leaving `ghost`/`link` utility controls plain to avoid breaking tiny icon buttons and low-emphasis controls.

> **Codex handoff note:** Tavily discovery is now app-side via Next.js route. Existing n8n discovery workflow may still exist remotely, but the frontend no longer depends on it.

- [x] Added a password-gated Demo Mode toggle to the dashboard with Demo Mode defaulting to ON on every page refresh, no persistence in localStorage/cookies, and a visible mode banner plus unlock/switch controls (2026-04-01)
- [x] Updated lead loading so Demo Mode reads from a dedicated demo table name (`re_outreach_demo_leads`) while Live Mode continues using the existing real table (`re_outreach_leads`) without modifying live workflow logic (2026-04-01)
- [x] Added a server-side `/api/demo-mode/verify` route that validates the entered password against `DEMO_MODE_PASSWORD` from environment variables and returns inline-safe errors for wrong passwords (2026-04-01)
- [x] Disabled and greyed out the `Send Email` button in Demo Mode, including helper text in the lead drawer so demo users can see that outbound email is intentionally locked until Live Mode is unlocked (2026-04-01)
- [x] Added seeded fake Perth leads in `lib/demoLeads.ts` and a SQL setup file at `docs/sql/2026-04-01-demo-mode.sql` so the app has realistic non-deliverable demo data now and a ready migration path for creating the real Supabase demo table later (2026-04-01)
- [x] Added `DEMO_MODE_PASSWORD=change-me-before-sharing` to `.env.local.example` and local `.env.local`, with the explicit requirement that the placeholder password must be changed before sharing the dashboard externally (2026-04-01)
- [x] Verified locally that `npm run build` passes, the dashboard opens in Demo Mode by default, the seeded fake leads load, `Send Email` is disabled in Demo Mode, wrong passwords are rejected, and the correct password unlocks Live Mode (2026-04-01)
- [x] Pushed the Demo Mode feature to GitHub `main` in commit `e81700a` and deployed it to Vercel production (`dpl_aH6HbUQ5Ho7fwmxn4xMK6dDJnm3N`, aliased to `https://realestate-outreach-sand.vercel.app`) (2026-04-01)
- [x] Fixed the Vercel production `DEMO_MODE_PASSWORD` environment value after the first deploy rejected the placeholder password; removed/re-added the env var cleanly, redeployed production, and re-verified that wrong password returns HTTP 401 while `change-me-before-sharing` returns HTTP 200 on `/api/demo-mode/verify` (2026-04-01)
- [x] Verified the live dashboard flow after deploy: page loads in Demo Mode by default, Live Mode can be unlocked with the configured password, and no persistence keeps the mode reset back to Demo on refresh (2026-04-01)

> **Codex handoff note:** the remote Supabase demo table was not created from this workspace because only anon/browser credentials were available. The app currently falls back to seeded fake leads in Demo Mode if `re_outreach_demo_leads` does not exist, and `docs/sql/2026-04-01-demo-mode.sql` contains the ready-to-run table creation + seed SQL.

- [x] Changed the Demo Mode unlock password from the placeholder to `ambrose1` in the local example env, updated the Vercel environment variable, redeployed production, and re-verified the live `/api/demo-mode/verify` route with the new password (2026-04-01)
- [x] Changed the AI Draft preview pane from read-only to editable so owners can manually tweak both the generated subject and body before sending, without needing to click `Re-generate` and lose the current draft (2026-04-01)
- [x] Kept the existing preview/send pipeline intact while ensuring Preview and `Send Email` now both use the current edited draft text from the drawer state rather than only the originally generated content (2026-04-01)
- [x] Verified the editable draft update still builds successfully with `npm run build` before pushing and deploying (2026-04-01)
- [x] Improved the editable AI Draft drawer so the pain-point section is shown in a properly formatted live preview instead of exposing raw `[[ ... ]]` markers inside the editor workflow, making it easier to tweak copy without losing template structure (2026-04-01)
- [x] Increased the body editor height by roughly 40% so longer drafts are easier to edit in place inside the drawer (2026-04-01)
- [x] Verified the draft-formatting polish still builds successfully with `npm run build` before pushing and deploying (2026-04-01)
- [x] Rolled back the extra in-drawer live formatted preview after user feedback that it overcomplicated the editing experience; the Preview button remains the single formatted preview surface while the larger editable textarea stays in place (2026-04-01)
- [x] Updated the shared HTML email footer so the role line now reads `SmartFlow Automation` instead of `Real Estate Tech Advisor` (2026-04-01)
- [x] Removed the footer sentence beginning `You're receiving this because your agency was...` from the shared email template so it no longer appears in preview or sent emails (2026-04-01)
- [x] Verified the drawer rollback and footer cleanup still build successfully with `npm run build` before pushing and deploying (2026-04-01)
- [x] Fixed Demo Mode AI Draft so seeded fake leads can still generate an email draft even when the live n8n draft webhook returns HTTP 200 with an empty body for demo-only IDs/emails (2026-04-01)
- [x] Added a frontend-safe demo draft fallback in `lib/n8n.ts` that detects demo leads by `demo-` IDs or `.example` emails and returns a realistic local draft without touching the live workflow path for real leads (2026-04-01)
- [x] Verified the demo draft fallback by direct call for `demo-sarah-chen` and confirmed it now returns a valid `{ subject, body }`, and re-verified `npm run build` passes before pushing and deploying (2026-04-01)
- [x] Updated the Demo Mode banner copy to use `simulated` instead of `fake` for the demo dataset wording, including the unlock modal description (2026-04-01)
- [x] Added a slow golden-yellow blinking outer-edge effect to the Demo Mode banner so the state is more visually obvious without becoming aggressive (2026-04-01)
- [x] Verified the Demo Mode banner styling update still builds successfully with `npm run build` before pushing and deploying (2026-04-01)
