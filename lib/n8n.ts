const N8N_BASE = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.srv823907.hstgr.cloud'

async function call(path: string, body?: object) {
  try {
    const res = await fetch(`${N8N_BASE}/webhook${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) return { data: null, error: `HTTP ${res.status}` }
    return { data: await res.json().catch(() => ({})), error: null }
  } catch (e) {
    return { data: null, error: String(e) }
  }
}

// TESTING PHASE: destination email hardcoded — remove before going live
const TEST_EMAIL = 'ambrosevoon@gmail.com'

export function sendEmail(lead: {
  lead_id: string
  email: string
  name: string
  agency_name: string
  subject?: string
  body?: string
  body_html?: string
}) {
  return call('/send-email', { ...lead, email: TEST_EMAIL })
}

export function updateLeadStatus(lead_id: string, status: string, notes?: string) {
  return call('/update-lead', { lead_id, status, notes })
}

export function scheduleFollowup(lead_id: string, next_followup_at: string) {
  return call('/schedule-followup', { lead_id, next_followup_at })
}

export function discoverAgents(count: number, location: string) {
  return fetch('/api/discover-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count, location }),
  })
    .then(async res => {
      if (!res.ok) return { data: null, error: `HTTP ${res.status}` }
      return { data: await res.json().catch(() => ({})), error: null }
    })
    .catch(error => ({ data: null, error: String(error) }))
}

export function generateDraft(lead: {
  lead_id?: string
  name: string
  agency_name: string
  suburb?: string
  email?: string
  custom_instructions?: string
}) {
  return call('/generate-draft', { ...lead, _seed: Math.random().toString(36).slice(2) })
}
