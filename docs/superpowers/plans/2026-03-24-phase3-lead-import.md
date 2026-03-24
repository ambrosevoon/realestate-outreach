# Phase 3 — Lead Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two lead import paths to the dashboard — CSV file upload and AI-powered web discovery via Perplexity — both with deduplication preview before inserting.

**Architecture:** A shared `ImportPreviewDialog` handles deduplication logic and confirmation for both paths. CSV is parsed client-side in the browser; web discovery calls a new n8n webhook that uses Perplexity `sonar` to search for agents and returns a structured JSON array. Both paths use `bulkCreateLeads` in `useLeads` to batch-insert new agents.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4, ShadCN UI (Dialog, Popover via existing Radix), Supabase JS client, n8n REST API, Perplexity AI API

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `lib/n8n.ts` | Modify | Add `discoverAgents(count, location)` |
| `hooks/useLeads.ts` | Modify | Add `bulkCreateLeads(agents[])` |
| `components/dashboard/ImportPreviewDialog.tsx` | Create | Shared dedup + preview + confirm modal |
| `components/dashboard/CSVImportDialog.tsx` | Create | CSV file picker + parser + triggers preview |
| `components/dashboard/DiscoverAgentsButton.tsx` | Create | Button + settings popover + triggers preview |
| `app/dashboard/page.tsx` | Modify | Wire up new components in header |
| n8n workflow (via REST API) | Create | `[Realestate Outreach] Discover Agents` |

---

## Task 1: n8n Discover Agents Workflow

**Files:** n8n REST API only (no local files)

- [ ] **Step 1: Create the workflow via n8n REST API**

```bash
source ~/.env && curl -s -X POST "https://n8n.srv823907.hstgr.cloud/api/v1/workflows" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "[Realestate Outreach] Discover Agents",
  "nodes": [
    {
      "id": "d4e5f6a7-0004-0004-0004-000000000001",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300],
      "parameters": {
        "path": "discover-agents",
        "httpMethod": "POST",
        "responseMode": "responseNode",
        "options": {}
      }
    },
    {
      "id": "d4e5f6a7-0004-0004-0004-000000000002",
      "name": "Perplexity Search",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 4.2,
      "position": [470, 300],
      "credentials": {
        "perplexityApi": {
          "id": "LnbJBjfV1EgRKlN1",
          "name": "Perplexity account"
        }
      },
      "parameters": {
        "method": "POST",
        "url": "https://api.perplexity.ai/chat/completions",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "perplexityApi",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {"name": "Content-Type", "value": "application/json"}
          ]
        },
        "sendBody": true,
        "contentType": "json",
        "bodyParameters": {
          "parameters": [
            {"name": "model", "value": "sonar"},
            {"name": "messages", "value": "={{ [{role:\"system\",content:\"Return valid JSON only, no markdown, no explanation.\"},{role:\"user\",content:\"Find \" + $json.body.count + \" real estate agents in \" + $json.body.location + \". Return a JSON array where each object has exactly these fields: name, agency_name, phone, email, suburb, website. Use empty string for any missing field.\"}] }}"}
          ]
        },
        "options": {}
      }
    },
    {
      "id": "d4e5f6a7-0004-0004-0004-000000000003",
      "name": "Parse Agents",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [690, 300],
      "parameters": {
        "jsCode": "const content = $input.first().json.choices[0].message.content;\nconst cleaned = content.replace(/```json\\n?/g, '').replace(/```\\n?/g, '').trim();\nlet agents = [];\ntry { agents = JSON.parse(cleaned); } catch(e) { agents = []; }\nif (!Array.isArray(agents)) agents = [];\nreturn [{ json: { agents, total: agents.length } }];"
      }
    },
    {
      "id": "d4e5f6a7-0004-0004-0004-000000000004",
      "name": "Respond",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.1,
      "position": [910, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ agents: $json.agents, total: $json.total }) }}",
        "options": {}
      }
    }
  ],
  "connections": {
    "Webhook": {"main": [[{"node": "Perplexity Search", "type": "main", "index": 0}]]},
    "Perplexity Search": {"main": [[{"node": "Parse Agents", "type": "main", "index": 0}]]},
    "Parse Agents": {"main": [[{"node": "Respond", "type": "main", "index": 0}]]}
  },
  "settings": {"executionOrder": "v1"}
}' | python3 -c "import sys,json; r=json.load(sys.stdin); print('ID:', r.get('id'), r.get('message',''))"
```

- [ ] **Step 2: Activate the workflow**

```bash
source ~/.env
WF_ID=<id from step 1>
curl -s -X POST "https://n8n.srv823907.hstgr.cloud/api/v1/workflows/$WF_ID/activate" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | python3 -c "import sys,json; r=json.load(sys.stdin); print('active:', r.get('active'), r.get('message',''))"
```

- [ ] **Step 3: Smoke test the webhook**

```bash
curl -s -X POST "https://n8n.srv823907.hstgr.cloud/webhook/discover-agents" \
  -H "Content-Type: application/json" \
  -d '{"count": 3, "location": "Canning Vale WA"}' | python3 -m json.tool
```

Expected: `{ "agents": [...], "total": 3 }` with real agent data.

If response is empty or error, check n8n execution logs:
```bash
source ~/.env
curl -s "https://n8n.srv823907.hstgr.cloud/api/v1/executions?workflowId=$WF_ID&limit=1" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" | python3 -c "
import sys,json; r=json.load(sys.stdin); e=r['data'][0]
print('status:', e['status'])
"
```

- [ ] **Step 4: If Perplexity auth fails, fix credential approach**

If the predefined credential doesn't inject auth, fall back to explicit Bearer header.
Fetch and update the workflow:
```bash
source ~/.env
# Get Perplexity API key value (check ~/.env)
cat ~/.env | grep -i perplexity
# Update Perplexity Search node to add Authorization header manually:
# {"name": "Authorization", "value": "Bearer YOUR_KEY"}
# and set authentication: "none"
```

---

## Task 2: Add `discoverAgents` to n8n client

**Files:**
- Modify: `lib/n8n.ts`

- [ ] **Step 1: Add the function**

In `lib/n8n.ts`, add after the existing exports:

```typescript
export function discoverAgents(count: number, location: string) {
  return call('/discover-agents', { count, location })
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/ambrosevoon/Projects/realestate-outreach
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Add `bulkCreateLeads` to useLeads hook

**Files:**
- Modify: `hooks/useLeads.ts`

- [ ] **Step 1: Define the RawAgent type**

In `types/index.ts`, add:

```typescript
export interface RawAgent {
  name: string
  agency_name: string
  phone?: string
  email?: string
  suburb?: string
  website?: string
}
```

- [ ] **Step 2: Add `bulkCreateLeads` to useLeads**

Inside the `useLeads` function, add after `deleteLead`:

```typescript
const bulkCreateLeads = useCallback(async (agents: RawAgent[]) => {
  const results = await Promise.allSettled(
    agents.map(agent =>
      supabase
        .from('re_outreach_leads')
        .insert({ ...agent, status: 'new', score: 0 })
        .select()
        .single()
    )
  )
  const inserted: Lead[] = []
  let errors = 0
  for (const r of results) {
    if (r.status === 'fulfilled' && r.value.data) {
      inserted.push(r.value.data as Lead)
    } else {
      errors++
    }
  }
  if (inserted.length > 0) {
    setLeads(prev => [...inserted, ...prev])
  }
  return { inserted: inserted.length, errors }
}, [])
```

- [ ] **Step 3: Add `bulkCreateLeads` to the return object**

```typescript
return {
  // ...existing
  bulkCreateLeads,
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

---

## Task 4: Build ImportPreviewDialog (shared dedup + confirm modal)

**Files:**
- Create: `components/dashboard/ImportPreviewDialog.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, SkipForward } from 'lucide-react'
import type { Lead, RawAgent } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  agents: RawAgent[]
  existingLeads: Lead[]
  onConfirm: (newAgents: RawAgent[]) => void
  importing: boolean
}

function normalizePhone(p?: string) {
  return (p || '').replace(/[\s\-().+]/g, '').toLowerCase()
}

function isDuplicate(candidate: RawAgent, existing: Lead[]): boolean {
  const candPhone = normalizePhone(candidate.phone)
  const candEmail = (candidate.email || '').toLowerCase().trim()
  const candName = (candidate.name || '').toLowerCase().trim()

  return existing.some(lead => {
    const nameMatch = candName === lead.name.toLowerCase().trim()
    const phoneMatch = candPhone && candPhone === normalizePhone(lead.phone)
    const emailMatch =
      candEmail && lead.email && candEmail === lead.email.toLowerCase().trim()
    return (nameMatch && phoneMatch) || emailMatch
  })
}

export function ImportPreviewDialog({
  open,
  onClose,
  agents,
  existingLeads,
  onConfirm,
  importing,
}: Props) {
  const { newAgents, duplicates } = useMemo(() => {
    const newAgents: RawAgent[] = []
    const duplicates: RawAgent[] = []
    for (const a of agents) {
      if (isDuplicate(a, existingLeads)) duplicates.push(a)
      else newAgents.push(a)
    }
    return { newAgents, duplicates }
  }, [agents, existingLeads])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Import Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              {newAgents.length} new
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <SkipForward className="w-4 h-4" />
              {duplicates.length} already in database (skipped)
            </span>
          </div>

          {newAgents.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-md border border-slate-700 divide-y divide-slate-800">
              {newAgents.map((a, i) => (
                <div key={i} className="px-3 py-2 text-sm">
                  <div className="font-medium text-white">{a.name}</div>
                  <div className="text-slate-400 text-xs">
                    {a.agency_name}{a.suburb ? ` · ${a.suburb}` : ''}{a.phone ? ` · ${a.phone}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {newAgents.length === 0 && (
            <p className="text-slate-400 text-sm">
              All agents are already in your database.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(newAgents)}
            disabled={newAgents.length === 0 || importing}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {importing ? 'Importing...' : `Import ${newAgents.length} Agent${newAgents.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

---

## Task 5: Build CSVImportDialog

**Files:**
- Create: `components/dashboard/CSVImportDialog.tsx`

- [ ] **Step 1: Create the component**

```typescript
'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ImportPreviewDialog } from './ImportPreviewDialog'
import { toast } from 'sonner'
import type { Lead, RawAgent } from '@/types'

// Case-insensitive column name aliases
const COL_MAP: Record<string, keyof RawAgent> = {
  name: 'name', agent_name: 'name', full_name: 'name',
  email: 'email', email_address: 'email',
  phone: 'phone', mobile: 'phone', contact: 'phone',
  agency_name: 'agency_name', agency: 'agency_name', company: 'agency_name',
  suburb: 'suburb', location: 'suburb', area: 'suburb',
  website: 'website', url: 'website', web: 'website',
}

function parseCSV(text: string): RawAgent[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
  const fieldMap = headers.map(h => COL_MAP[h] ?? null)

  return lines.slice(1).map(line => {
    const cells = line.split(',').map(c => c.trim().replace(/"/g, ''))
    const agent: Partial<RawAgent> = {}
    fieldMap.forEach((field, i) => {
      if (field && cells[i]) (agent as Record<string, string>)[field] = cells[i]
    })
    return agent as RawAgent
  }).filter(a => a.name)
}

interface Props {
  existingLeads: Lead[]
  onImported: (count: number) => void
  bulkCreate: (agents: RawAgent[]) => Promise<{ inserted: number; errors: number }>
}

export function CSVImportDialog({ existingLeads, onImported, bulkCreate }: Props) {
  const [open, setOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [parsed, setParsed] = useState<RawAgent[]>([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const agents = parseCSV(text)
      if (agents.length === 0) {
        toast.error('No valid rows found. Check CSV has a header row with: name, email, phone, agency_name, suburb.')
        return
      }
      setParsed(agents)
      setOpen(false)
      setPreviewOpen(true)
    }
    reader.readAsText(file)
    // Reset input so same file can be re-selected
    e.target.value = ''
  }

  const handleConfirm = async (newAgents: RawAgent[]) => {
    setImporting(true)
    const { inserted, errors } = await bulkCreate(newAgents)
    setImporting(false)
    setPreviewOpen(false)
    if (inserted > 0) {
      toast.success(`Imported ${inserted} agent${inserted !== 1 ? 's' : ''}.`)
      onImported(inserted)
    }
    if (errors > 0) toast.error(`${errors} agent${errors !== 1 ? 's' : ''} failed to import.`)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8 text-xs cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          Import CSV
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFile}
        />
      </Dialog>

      <ImportPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        agents={parsed}
        existingLeads={existingLeads}
        onConfirm={handleConfirm}
        importing={importing}
      />
    </>
  )
}
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit
```

---

## Task 6: Build DiscoverAgentsButton

**Files:**
- Create: `components/dashboard/DiscoverAgentsButton.tsx`

- [ ] **Step 1: Install Radix Popover (needed for settings)**

```bash
cd /Users/ambrosevoon/Projects/realestate-outreach
npm install @radix-ui/react-popover
```

- [ ] **Step 2: Create ShadCN popover primitive**

Create `components/ui/popover.tsx`:

```typescript
'use client'

import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

function PopoverContent({
  className,
  align = 'center',
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-72 rounded-lg border border-slate-700 bg-slate-900 p-4 shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}

export { Popover, PopoverTrigger, PopoverContent }
```

- [ ] **Step 3: Create DiscoverAgentsButton**

Create `components/dashboard/DiscoverAgentsButton.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'
import { Globe, Settings2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ImportPreviewDialog } from './ImportPreviewDialog'
import { discoverAgents } from '@/lib/n8n'
import { toast } from 'sonner'
import type { Lead, RawAgent } from '@/types'

const SETTINGS_KEY = 'discover_settings'

interface DiscoverSettings {
  count: number
  location: string
}

function loadSettings(): DiscoverSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { count: 20, location: '' }
}

interface Props {
  existingLeads: Lead[]
  onImported: (count: number) => void
  bulkCreate: (agents: RawAgent[]) => Promise<{ inserted: number; errors: number }>
}

export function DiscoverAgentsButton({ existingLeads, onImported, bulkCreate }: Props) {
  const [settings, setSettings] = useState<DiscoverSettings>({ count: 20, location: '' })
  const [discovering, setDiscovering] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [discovered, setDiscovered] = useState<RawAgent[]>([])
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const saveSettings = (next: DiscoverSettings) => {
    setSettings(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }

  const handleDiscover = async () => {
    if (!settings.location.trim()) {
      toast.error('Set a location in settings before discovering.')
      return
    }
    setDiscovering(true)
    const { data, error } = await discoverAgents(settings.count, settings.location)
    setDiscovering(false)
    if (error || !data?.agents) {
      toast.error('Discovery failed. Check n8n workflow.')
      return
    }
    setDiscovered(data.agents as RawAgent[])
    setPreviewOpen(true)
  }

  const handleConfirm = async (newAgents: RawAgent[]) => {
    setImporting(true)
    const { inserted, errors } = await bulkCreate(newAgents)
    setImporting(false)
    setPreviewOpen(false)
    if (inserted > 0) {
      toast.success(`Imported ${inserted} agent${inserted !== 1 ? 's' : ''}.`)
      onImported(inserted)
    }
    if (errors > 0) toast.error(`${errors} failed to import.`)
  }

  return (
    <>
      <div className="flex items-center">
        <Button
          size="sm"
          onClick={handleDiscover}
          disabled={discovering}
          className="bg-violet-600 hover:bg-violet-700 text-white h-8 text-xs rounded-r-none cursor-pointer"
        >
          {discovering ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5 mr-1.5" />
          )}
          Discover Agents
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 border-l-0 rounded-l-none text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Discovery Settings
              </p>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Leads to pull</label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={settings.count}
                  onChange={e =>
                    saveSettings({ ...settings, count: Math.max(1, Math.min(200, Number(e.target.value))) })
                  }
                  className="bg-slate-800 border-slate-600 text-white h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Location</label>
                <Input
                  value={settings.location}
                  onChange={e => saveSettings({ ...settings, location: e.target.value })}
                  placeholder="example: Canning Vale WA"
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-600 h-8 text-sm"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ImportPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        agents={discovered}
        existingLeads={existingLeads}
        onConfirm={handleConfirm}
        importing={importing}
      />
    </>
  )
}
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

---

## Task 7: Wire up Dashboard Page

**Files:**
- Modify: `app/dashboard/page.tsx`

- [ ] **Step 1: Import new components and hook return value**

Add to imports:
```typescript
import { CSVImportDialog } from '@/components/dashboard/CSVImportDialog'
import { DiscoverAgentsButton } from '@/components/dashboard/DiscoverAgentsButton'
```

Update the `useLeads` destructure to include `bulkCreateLeads`:
```typescript
const {
  leads,
  filtered,
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
} = useLeads()
```

- [ ] **Step 2: Add handler for import completion**

```typescript
const handleImported = (_count: number) => {
  fetchLeads()
}
```

- [ ] **Step 3: Update header toolbar JSX**

Replace the existing `<div className="flex items-center gap-2">` block in the header with:

```tsx
<div className="flex items-center gap-2">
  <Button
    variant="ghost"
    size="icon"
    onClick={fetchLeads}
    className="text-slate-500 hover:text-white cursor-pointer w-8 h-8"
    title="Refresh"
  >
    <RefreshCw className="w-4 h-4" />
  </Button>
  <CSVImportDialog
    existingLeads={leads}
    onImported={handleImported}
    bulkCreate={bulkCreateLeads}
  />
  <DiscoverAgentsButton
    existingLeads={leads}
    onImported={handleImported}
    bulkCreate={bulkCreateLeads}
  />
  <CreateLeadDialog onCreate={createLead} />
</div>
```

- [ ] **Step 4: Verify TypeScript + dev server**

```bash
npx tsc --noEmit
npm run dev
```

Open http://localhost:3000. Confirm:
- Header shows: [↻] [Import CSV] [Discover Agents ⚙] [+ Add Lead]
- Settings popover opens with Count + Location fields
- Settings persist after page refresh (localStorage)

---

## Task 8: End-to-End Test

- [ ] **Step 1: Test CSV import**

Create a test file `test-agents.csv`:
```
name,email,phone,agency_name,suburb,website
John Smith,john@raywhite.com,0412345678,Ray White Canning Vale,Canning Vale,raywhite.com.au
Jane Doe,,0498765432,LJ Hooker,Cannington,ljhooker.com.au
```

Upload via Import CSV. Expected:
- Preview shows 2 new (or 1 if Vicky Yang was already imported with matching phone/email)
- After confirm: toast "Imported X agents"
- Leads appear in table

- [ ] **Step 2: Test deduplication**

Upload the same CSV again. Expected:
- Preview shows 0 new, 2 already in database (skipped)
- No duplicates inserted

- [ ] **Step 3: Test Discover Agents**

Open settings, set Location to "Canning Vale WA", Count to 5.
Click "Discover Agents". Expected:
- Loading spinner while n8n runs
- Preview modal opens with up to 5 agents
- New agents shown in list with name + agency + suburb + phone

- [ ] **Step 4: Commit**

```bash
cd /Users/ambrosevoon/Projects/realestate-outreach
git add -A
git commit -m "feat: Phase 3 — CSV import and Discover Agents with deduplication preview"
```
