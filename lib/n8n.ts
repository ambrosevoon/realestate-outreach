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

export function sendEmail(lead: {
  lead_id: string
  email: string
  name: string
  agency_name: string
  subject?: string
}) {
  return call('/send-email', lead)
}

export function updateLeadStatus(lead_id: string, status: string, notes?: string) {
  return call('/update-lead', { lead_id, status, notes })
}

export function scheduleFollowup(lead_id: string, next_followup_at: string) {
  return call('/schedule-followup', { lead_id, next_followup_at })
}

export function discoverAgents(count: number, location: string) {
  return call('/discover-agents', { count, location })
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
