const N8N_BASE = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.srv823907.hstgr.cloud'

type DraftPayload = {
  lead_id?: string
  name: string
  agency_name: string
  suburb?: string
  email?: string
  custom_instructions?: string
}

function isDemoDraftLead(lead: DraftPayload) {
  return lead.lead_id?.startsWith('demo-') || lead.email?.endsWith('.example')
}

function buildDemoDraft(lead: DraftPayload) {
  const locality = lead.suburb?.replace(/\s+WA$/i, '').trim() || 'Perth'
  const subject = `${locality} enquiries should not go cold`
  const introLine = lead.suburb
    ? `This is something I've been helping ${locality} agents deal with - keeping enquiry follow-up tight without having to constantly monitor email.`
    : `This is something I've been helping Perth agents deal with - keeping enquiry follow-up tight without having to constantly monitor email.`

  const body = [
    `It's Sunday evening after a full day of opens, and you've still got a stack of new enquiries waiting while you're trying to switch off for the night.`,
    '',
    introLine,
    '',
    `The problem isn't replying. It's replying before the lead goes cold. In most cases, the first agent to respond gets the momentum, but staying on top of every enquiry while managing everything else becomes a juggling act.`,
    '',
    `[[`,
    `• Weekend enquiries stack up. Monday inbox already feels behind before the week starts.`,
    `• Late-night replies. Trying to stay responsive without burning out completely.`,
    `• Hot leads cooling. Buyers lose interest faster than expected between contact attempts.`,
    `• Leads slipping through. No consistent way to track every follow-up that needs doing.`,
    `• Different platforms. Enquiries scattered across multiple channels and portals.`,
    `]]`,
    '',
    `What I've put together keeps enquiries organised and responses moving quickly, so fewer opportunities slip through while you stay focused on listings and clients.`,
    '',
    `Open to a quick 10-minute look at how this works in practice?`,
  ].join('\n')

  return { subject, body }
}

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

export async function generateDraft(lead: DraftPayload) {
  const result = await call('/generate-draft', { ...lead, _seed: Math.random().toString(36).slice(2) })

  if (!result.error && result.data && typeof result.data.subject === 'string' && typeof result.data.body === 'string') {
    return result
  }

  if (isDemoDraftLead(lead)) {
    return { data: buildDemoDraft(lead), error: null }
  }

  return result
}
