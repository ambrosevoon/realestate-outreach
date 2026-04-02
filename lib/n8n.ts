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

function pickOne<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function buildDemoDraft(lead: DraftPayload) {
  const locality = lead.suburb?.replace(/\s+WA$/i, '').trim() || 'Perth'
  const subject = pickOne([
    `${locality} enquiries should not go cold`,
    `Still following up leads by hand?`,
    `What happens after hours in ${locality}?`,
    `How many enquiries cooled off today?`,
    `A better follow up rhythm for ${locality}`,
    `The reply delay costing inspections`,
  ])

  const hook = pickOne([
    `It is Sunday evening after a full day of opens, and there are still fresh enquiries waiting for a reply.`,
    `Monday starts with a weekend backlog, and some buyer enquiries are already cooling off.`,
    `You finish the last open home, check your phone, and there are still leads waiting.`,
    `It is late in the day, and new enquiries are still landing while you are trying to switch off.`,
  ])

  const introLine = pickOne([
    `I have been helping ${locality} agents keep follow up tighter without being stuck in their inbox.`,
    `This is something I have been helping ${locality} agents deal with when enquiry flow gets patchy.`,
    `I have been helping agents around ${locality} keep response times tighter without adding more admin.`,
  ])

  const problemLine = pickOne([
    `The problem is not replying. It is replying before the lead goes cold. The first agent to respond usually gets the momentum.`,
    `The issue is not effort. It is speed. When follow up drifts, good enquiries lose heat fast.`,
    `Most leads are not lost because nobody replies. They are lost because the reply comes too late.`,
  ])

  const painSets = [
    [
      `• Weekend enquiries stack up. Monday starts behind before the day even settles.`,
      `• Late replies drag on. Good buyers move faster than the inbox does.`,
      `• Follow ups get scattered. Some sit in portals. Others sit in email.`,
      `• Hot leads cool off. Interest fades between contact attempts.`,
      `• Too much manual chasing. Too much time spent checking what still needs action.`,
    ],
    [
      `• After hours messages pile up. The catch up never really finishes.`,
      `• Inspection days get busy. Follow up slips while everything else moves.`,
      `• Buyer intent changes quickly. Delay costs attention.`,
      `• Enquiries arrive in different places. Nothing feels fully under control.`,
      `• Time goes into admin. Less time goes into real conversations.`,
    ],
    [
      `• Weekend demand rolls into Monday. The inbox already feels heavy.`,
      `• Slower replies lose urgency. Buyers keep moving.`,
      `• Manual follow up is easy to miss when the day gets noisy.`,
      `• New leads and old leads compete for attention.`,
      `• Response pressure stays high long after business hours.`,
    ],
  ]

  const solutionLine = pickOne([
    `What I put in place keeps responses moving and follow up organised, so fewer good opportunities slip away.`,
    `The result is a steadier follow up rhythm, faster replies, and less need to keep checking every channel.`,
    `It helps keep enquiry flow under control, so the week feels tighter and less reactive.`,
  ])

  const cta = pickOne([
    `Open to a quick 10 minute look at how this works?`,
    `Would you be open to a quick 10 minute walkthrough?`,
    `Open to seeing what this could look like for your workflow?`,
  ])

  const body = [
    hook,
    '',
    introLine,
    '',
    problemLine,
    '',
    `[[`,
    ...pickOne(painSets),
    `]]`,
    '',
    solutionLine,
    '',
    cta,
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

export const SAFE_TEST_EMAIL = TEST_EMAIL

export function sendEmail(lead: {
  lead_id: string
  email: string
  name: string
  agency_name: string
  subject?: string
  body?: string
  body_html?: string
  send_real_email?: boolean
}) {
  const recipient = lead.send_real_email ? lead.email : TEST_EMAIL
  return call('/send-email', { ...lead, email: recipient })
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
