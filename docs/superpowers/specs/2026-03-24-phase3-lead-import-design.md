# Phase 3 — Lead Import Design
**Date:** 2026-03-24
**Project:** SmartFlow Outreach Dashboard

## Overview

Two ways to populate the leads table with real estate agents:
1. **CSV Import** — upload a CSV file, preview, deduplicate, insert
2. **Discover Agents** — click a button to pull live agent data from the web via Perplexity AI, preview, deduplicate, insert

## Architecture

### Discover Agents flow
```
[Discover Agents btn] → POST /webhook/discover-agents { count, location }
                              ↓
                   n8n: HTTP Request → Perplexity sonar model
                   Prompt: "Find [count] real estate agents in [location].
                            Return JSON array: name, agency_name, phone,
                            email, suburb, website."
                              ↓
                   Code node: parse choices[0].message.content as JSON
                              ↓
                   Respond: { agents: [...] }
                              ↓
              Frontend compares against loaded leads
              Dedup key: name+phone (primary), email (if present)
                              ↓
              Preview modal: "X new, Y duplicates (skipped)"
                              ↓
              [Import X Agents] → Supabase bulk insert → refresh
```

### CSV Import flow
```
[Import CSV btn] → file picker → parse in browser (no library)
                              ↓
              Map columns: name, email, phone, agency_name, suburb, website
                              ↓
              Same dedup + preview modal → Supabase bulk insert → refresh
```

## Components

### New: `components/dashboard/DiscoverAgentsButton.tsx`
- "Discover Agents" button with globe icon + loading spinner
- Gear icon (⚙) opens a `Popover` with settings:
  - Count: number input (default 20, range 1–200)
  - Location: text input (placeholder: "example: Canning Vale WA")
  - Settings persisted in `localStorage` key `discover_settings`
- On click: calls `discoverAgents(count, location)` from `lib/n8n.ts`
- On response: opens `ImportPreviewDialog` with results

### New: `components/dashboard/CSVImportDialog.tsx`
- "Import CSV" button opens a Dialog
- File input (accept=".csv")
- Client-side CSV parse (split lines + headers, no external library)
- Expected columns (case-insensitive): name, email, phone, agency_name, suburb, website
- On parse: opens `ImportPreviewDialog` with results

### New: `components/dashboard/ImportPreviewDialog.tsx`
- Shared by both import paths
- Props: `agents: RawAgent[], existingLeads: Lead[], onConfirm: (newLeads) => void`
- Dedup logic: match if (name+phone match) OR (email match, when non-empty)
- Shows two counts: "X new agents" (green) + "Y already in database (skipped)" (gray)
- Lists new agents in a scrollable table (name, agency, suburb, phone)
- [Import X Agents] button → calls `bulkCreateLeads` → closes dialog → toast

### Modified: `hooks/useLeads.ts`
- Add `bulkCreateLeads(agents: RawAgent[])` — parallel `createLead` calls via `Promise.all`
- Returns `{ inserted: number, errors: number }`

### Modified: `lib/n8n.ts`
- Add `discoverAgents(count: number, location: string)` → `POST /webhook/discover-agents`

### Modified: `app/dashboard/page.tsx`
- Import and render `CSVImportDialog` and `DiscoverAgentsButton` in header toolbar
- Pass `leads` + `bulkCreateLeads` + `fetchLeads` as props

## n8n Workflow

**Name:** `[Realestate Outreach] Discover Agents`
**Nodes:**
1. Webhook — `POST /webhook/discover-agents`, responseMode: responseNode
2. HTTP Request — Perplexity API (`https://api.perplexity.ai/chat/completions`)
   - Model: `sonar`
   - Auth: Bearer token from credential `LnbJBjfV1EgRKlN1`
   - System: "Return valid JSON only, no markdown, no explanation."
   - User: "Find {{ count }} real estate agents in {{ location }}. Return a JSON array where each object has: name, agency_name, phone, email, suburb, website. Use empty string for missing fields."
3. Code node — extract and parse `items[0].json.choices[0].message.content` as JSON array
4. Respond to Webhook — `{ agents: [...], total: N }`

## Deduplication Logic

```
function isDuplicate(candidate, existingLeads):
  for each lead in existingLeads:
    nameMatch = normalize(candidate.name) === normalize(lead.name)
    phoneMatch = normalizePhone(candidate.phone) === normalizePhone(lead.phone)
    emailMatch = candidate.email && lead.email &&
                 candidate.email.toLowerCase() === lead.email.toLowerCase()
    if (nameMatch && phoneMatch) return true
    if (emailMatch) return true
  return false
```

Normalize: lowercase, trim whitespace. Phone normalize: strip spaces, dashes, parentheses.

## UI Placement

Header toolbar (right side):
```
[↻]  [↑ Import CSV]  [Discover Agents  ⚙]  [+ Add Lead]
```

## CSV Column Mapping

Case-insensitive header matching. Accepted column names:
- name / agent_name / full_name
- email / email_address
- phone / mobile / contact
- agency_name / agency / company
- suburb / location / area
- website / url / web
