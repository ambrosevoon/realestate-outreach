import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const ROOT = '/Users/ambrosevoon/Projects/realestate-outreach'
const ENV_PATH = path.join(ROOT, '.env.local')
const DEFAULT_INPUT = path.join(ROOT, '.tmp', 'agency-team-leads-clean-2026-04-02.json')

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function parseEnvFile(filePath) {
  const env = {}
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split('\n')) {
    if (!line || line.trim().startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim()
  }
  return env
}

function normalizeDatasetLocation(value) {
  return clean(value)
    .replace(/\b(?:WA|NSW|VIC|QLD|SA|TAS|ACT|NT)\b/gi, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function datasetKeyFromLocation(value) {
  return normalizeDatasetLocation(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function fetchExistingEmails(supabase) {
  const emails = new Set()
  let from = 0
  const pageSize = 1000

  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await supabase
      .from('re_outreach_leads')
      .select('email')
      .range(from, to)

    if (error) throw error
    if (!data || data.length === 0) break

    for (const row of data) {
      const email = clean(row.email).toLowerCase()
      if (email) emails.add(email)
    }

    if (data.length < pageSize) break
    from += pageSize
  }

  return emails
}

async function main() {
  const inputPath = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT
  const env = parseEnvFile(ENV_PATH)
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const source = JSON.parse(fs.readFileSync(inputPath, 'utf8'))
  const existingEmails = await fetchExistingEmails(supabase)

  const agents = Array.isArray(source.agents) ? source.agents : []
  const rows = agents
    .filter(agent => {
      const email = clean(agent.email).toLowerCase()
      return email && !existingEmails.has(email)
    })
    .map(agent => {
      const location = normalizeDatasetLocation(agent.office_location || agent.suburb)
      const datasetLabel = location || 'Imported Leads'
      const datasetKey = datasetKeyFromLocation(datasetLabel)

      return {
        name: clean(agent.name),
        agency_name: clean(agent.agency_name),
        email: clean(agent.email).toLowerCase(),
        phone: clean(agent.phone) || null,
        suburb: clean(agent.suburb || agent.office_location),
        website: clean(agent.website),
        status: 'new',
        score: 0,
        dataset_key: datasetKey ? `suburb-${datasetKey}` : 'suburb-imported-leads',
        dataset_label: datasetLabel,
        location: datasetLabel,
        owner_notes: agent.profile_url ? `Imported from public profile: ${agent.profile_url}` : '',
      }
    })

  if (rows.length === 0) {
    console.log(JSON.stringify({ inserted: 0, reason: 'No new rows to import' }, null, 2))
    return
  }

  const { data, error } = await supabase
    .from('re_outreach_leads')
    .insert(rows)
    .select('id')

  if (error) {
    console.error(JSON.stringify(error, null, 2))
    process.exit(1)
  }

  console.log(
    JSON.stringify(
      {
        inserted: data.length,
        input: inputPath,
      },
      null,
      2
    )
  )
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
