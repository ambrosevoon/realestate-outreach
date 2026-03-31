import { NextResponse } from 'next/server'
import { cleanAgencyName, cleanLeadName, normalizeRawAgent } from '@/lib/leadFormatting'
import type { RawAgent } from '@/types'

type TavilyResult = {
  title?: string
  url?: string
  content?: string
}

type TavilyResponse = {
  results?: TavilyResult[]
  error?: string
}

type CandidateAgent = RawAgent & {
  source_urls?: string[]
  source_labels?: string[]
}

type DiscoveryQuery = {
  label: string
  query: string
}

const BLOCKED_HOST_FRAGMENTS = [
  'realtor.com',
  'pagesjaunes',
  'easternontariolocal',
  'top10realestateagent',
  'oneflare.com.au',
  'allhomes.com.au',
]

const DIRECTORY_TITLE_PATTERNS = [
  /\bfind a real estate agent\b/i,
  /\btop\s+\d+\s+real estate agents?\b/i,
  /\btop\s+[a-z]+\s+real estate agencies\b/i,
  /\b\d+\s+real estate agencies active\b/i,
  /\breal estate agencies in [a-z ,0-9]+\b/i,
  /\blocal business\b/i,
  /\blistings?\s*&\s*more\b/i,
]

const GENERIC_NAME_PATTERNS = [
  /^buy$/i,
  /^sell$/i,
  /^rent$/i,
  /^home$/i,
  /^listings?(?:\s*&\s*more)?$/i,
  /^perth$/i,
  /^domain$/i,
  /^reiwa$/i,
]

const PORTAL_BRAND_PATTERNS = [/^domain$/i, /^reiwa$/i, /^realestate$/i, /^ratemyagent$/i]

const GENERIC_AGENCY_PATTERNS = [
  /^real estate$/i,
  /^property$/i,
  /^realty$/i,
  /\breal estate agent\b/i,
  /\breal estate agency\b/i,
  /\bsales associate\b/i,
  /\bsales representative\b/i,
  /\bproperty consultant\b/i,
  /\bview listings\b/i,
  /\blocal real estate agency\b/i,
  /\bcontact agent\b/i,
]

const GENERIC_EMAIL_PREFIXES = new Set([
  'admin',
  'hello',
  'info',
  'sales',
  'contact',
  'office',
  'reception',
  'enquiries',
  'enquiry',
  'support',
  'team',
  'marketing',
])

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function titleToNameAndAgency(title: string) {
  const parts = title
    .split(/[-|•·]/)
    .map(part => clean(part))
    .filter(Boolean)

  const [first = '', second = ''] = parts

  const cleanedAgency = cleanAgencyName(second || first)
  const cleanedName = cleanLeadName(first, cleanedAgency)

  if (first && second) {
    return { name: cleanedName, agency_name: cleanedAgency }
  }

  return {
    name: cleanedName || 'Unknown Agent',
    agency_name: cleanedAgency || 'Unknown Agency',
  }
}

function splitParts(value: string) {
  return value
    .split(/[-|•·:]/)
    .map(part => clean(part))
    .filter(Boolean)
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
}

function extractPhone(text: string) {
  const match = text.match(/(?:\+?61|0)[\s()\-]*\d[\d\s()\-]{7,}\d/)
  const phone = match?.[0]?.replace(/\s+/g, ' ').trim()
  if (!phone) return undefined
  const digits = normalizePhoneDigits(phone)
  if (digits.length < 8 || digits.length > 12) return undefined
  return phone
}

function normalizePhoneDigits(value?: string) {
  if (!value) return ''
  return value.replace(/\D/g, '')
}

function normalizeLocalityKey(value?: string) {
  return clean(value || '')
    .toLowerCase()
    .replace(/\b(?:wa|nsw|vic|qld|sa|tas|act|nt)\b/g, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSuburb(text: string, location: string) {
  const cleanedLocation = location.trim()
  if (!cleanedLocation) return undefined
  const pattern = new RegExp(`([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*)\\s+(?:WA|NSW|VIC|QLD|SA|TAS|ACT|NT)`, 'g')
  const match = pattern.exec(text)
  return match?.[0] || cleanedLocation
}

function normalizeWebsite(url?: string) {
  if (!url) return undefined
  try {
    const parsed = new URL(url)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return undefined
  }
}

function extractWebsiteHost(url?: string) {
  if (!url) return ''
  try {
    return new URL(url).host.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function isPortalHost(host: string) {
  return ['domain.com.au', 'reiwa.com.au', 'realestate.com.au', 'ratemyagent.com.au'].some(
    portal => host === portal || host.endsWith(`.${portal}`)
  )
}

function hasAgentProfilePath(url?: string) {
  if (!url) return false

  try {
    const parsed = new URL(url)
    const host = parsed.host.replace(/^www\./, '').toLowerCase()
    const path = parsed.pathname.toLowerCase()

    if (host.includes('domain.com.au')) return path.includes('/real-estate-agent/')
    if (host.includes('reiwa.com.au')) return path.includes('/real-estate-agent/')
    if (host.includes('realestate.com.au')) return path.includes('/agent/')
    if (host.includes('ratemyagent.com.au')) return path.includes('/real-estate-agent/') || path.includes('/agent-profile/')

    return true
  } catch {
    return false
  }
}

function looksLikeAgencyLabel(value?: string) {
  const cleaned = clean(value || '').toLowerCase()
  if (!cleaned) return false
  return /\b(realty|real estate|property|properties|group|agency|estate|homes|brokers?|team|partners)\b/.test(cleaned)
}

function looksLikePersonLabel(value?: string) {
  const cleaned = clean(value || '')
  if (!cleaned || cleaned.length > 48) return false
  const words = cleaned.split(/\s+/).filter(Boolean)
  if (words.length < 2 || words.length > 4) return false
  return words.every(word => /^[A-Z][a-z'’-]+$/.test(word))
}

function extractNameFromEmail(email?: string) {
  if (!email) return ''
  const local = email.split('@')[0]?.toLowerCase() || ''
  if (!local || GENERIC_EMAIL_PREFIXES.has(local)) return ''
  const parts = local.split(/[._-]+/).filter(Boolean)
  if (parts.length < 2 || parts.length > 3) return ''
  const candidate = parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  return looksLikePersonLabel(candidate) ? candidate : ''
}

function buildLocationTokenSet(location: string) {
  return new Set(
    clean(location)
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
  )
}

function isLocationLikeName(value: string, location: string) {
  const tokens = value.toLowerCase().split(/\s+/).filter(Boolean)
  const locationTokens = buildLocationTokenSet(location)
  if (tokens.length === 0) return false
  return tokens.every(token => locationTokens.has(token) || ['wa', 'nsw', 'vic', 'qld', 'sa', 'tas', 'act', 'nt', 'perth', 'south', 'north', 'east', 'west', 'canning', 'vale', 'scarborough', 'thornlie', 'maylands', 'fremantle', 'tuart', 'hill'].includes(token))
}

function resolvePersonName(result: TavilyResult, location: string, agencyName: string, email?: string) {
  const title = clean(result.title || '')

  for (const part of splitParts(title)) {
    if (!looksLikePersonLabel(part)) continue
    if (looksLikeAgencyLabel(part)) continue
    if (isLocationLikeName(part, location)) continue
    if (part.toLowerCase() === agencyName.toLowerCase()) continue
    return part
  }

  const emailName = extractNameFromEmail(email)
  if (emailName && emailName.toLowerCase() !== agencyName.toLowerCase()) return emailName

  return ''
}

function scoreName(value?: string, agency?: string) {
  const cleaned = clean(value || '')
  if (!cleaned) return 0
  if (looksLikePersonLabel(cleaned)) return 4
  if (agency && cleaned.toLowerCase() === agency.toLowerCase()) return 1
  if (looksLikeAgencyLabel(cleaned)) return 1
  return cleaned.length > 18 ? 2 : 3
}

function scoreAgency(value?: string) {
  const cleaned = clean(value || '')
  if (!cleaned) return 0
  if (PORTAL_BRAND_PATTERNS.some(pattern => pattern.test(cleaned))) return 0
  if (GENERIC_AGENCY_PATTERNS.some(pattern => pattern.test(cleaned))) return 1
  if (looksLikeAgencyLabel(cleaned)) return 4
  return cleaned.length > 18 ? 3 : 2
}

function pickBetterName(current: string | undefined, incoming: string | undefined, agency: string) {
  const currentScore = scoreName(current, agency)
  const incomingScore = scoreName(incoming, agency)
  if (incomingScore > currentScore) return incoming
  if (incomingScore === currentScore && (incoming || '').length > (current || '').length) return incoming
  return current
}

function pickBetterAgency(current?: string, incoming?: string) {
  const currentScore = scoreAgency(current)
  const incomingScore = scoreAgency(incoming)
  if (incomingScore > currentScore) return incoming
  if (incomingScore === currentScore && (incoming || '').length > (current || '').length) return incoming
  return current
}

function deriveAgencyFromHost(host: string) {
  if (!host) return ''
  const root = host
    .replace(/\.(com|com\.au|net|net\.au|org|org\.au|au)$/i, '')
    .split('.')
    .filter(Boolean)
    .pop()

  if (!root) return ''

  const humanized = root
    .replace(/realestate/gi, ' real estate ')
    .replace(/realty/gi, ' realty ')
    .replace(/properties/gi, ' properties ')
    .replace(/property/gi, ' property ')
    .replace(/group/gi, ' group ')
    .replace(/agency/gi, ' agency ')
    .replace(/[-_]+/g, ' ')
    .replace(/\b[a-z]/g, char => char.toUpperCase())

  return cleanAgencyName(humanized)
}

function deriveAgencyFromEmail(email?: string) {
  const domain = email?.split('@')[1]?.toLowerCase()
  if (!domain) return ''
  return deriveAgencyFromHost(domain)
}

function extractAgencyFromContent(content: string) {
  const patterns = [
    /part of the team at\s+([A-Z][A-Za-z0-9&' -]{2,60})/i,
    /from\s+([A-Z][A-Za-z0-9&' -]{2,60})\s+has sold/i,
    /located at .*?\b([A-Z][A-Za-z0-9&' -]{2,60})\b/i,
  ]

  for (const pattern of patterns) {
    const match = content.match(pattern)?.[1]
    const cleaned = cleanAgencyName(match)
    if (!cleaned) continue
    if (PORTAL_BRAND_PATTERNS.some(portal => portal.test(cleaned))) continue
    if (GENERIC_AGENCY_PATTERNS.some(generic => generic.test(cleaned))) continue
    return cleaned
  }

  return ''
}

function resolveAgencyName(result: TavilyResult, personName: string, fallbackAgency: string) {
  const titleParts = splitParts(result.title || '')
  const content = clean(result.content || '')

  for (const part of titleParts) {
    if (!part || part.toLowerCase() === personName.toLowerCase()) continue
    if (PORTAL_BRAND_PATTERNS.some(pattern => pattern.test(part))) continue
    if (GENERIC_AGENCY_PATTERNS.some(pattern => pattern.test(part))) continue
    if (looksLikePersonLabel(part)) continue
    return cleanAgencyName(part)
  }

  const contentAgency = extractAgencyFromContent(content)
  if (contentAgency) return contentAgency

  if (PORTAL_BRAND_PATTERNS.some(pattern => pattern.test(fallbackAgency))) return ''
  if (GENERIC_AGENCY_PATTERNS.some(pattern => pattern.test(fallbackAgency))) return ''
  return fallbackAgency
}

function isAustralianHost(host: string) {
  return /\.au$/i.test(host) || host.endsWith('.com.au')
}

function shouldSkipResult(result: TavilyResult) {
  const title = clean(result.title || '')
  const content = clean(result.content || '')
  const host = extractWebsiteHost(normalizeWebsite(result.url))

  if (!title || !host) return false
  if (BLOCKED_HOST_FRAGMENTS.some(fragment => host.includes(fragment))) return true
  if (isPortalHost(host) && !hasAgentProfilePath(result.url)) return true
  if (!isAustralianHost(host) && !host.includes('reiwa.com.au') && !host.includes('domain.com.au') && !host.includes('realestate.com.au') && !host.includes('ratemyagent.com.au')) {
    return true
  }

  return DIRECTORY_TITLE_PATTERNS.some(pattern => pattern.test(title) || pattern.test(content))
}

function sanitizeLeadName(value: string) {
  return clean(
    value
      .replace(/\b(?:WA|NSW|VIC|QLD|SA|TAS|ACT|NT)\b$/i, '')
      .replace(/\b(?:real estate agent|real estate agency|agency|agent)\b$/i, '')
      .replace(/\s{2,}/g, ' ')
  )
}

function resultToAgent(result: TavilyResult, location: string, label: string): CandidateAgent | null {
  const title = clean(result.title || '')
  const content = clean(result.content || '')
  const url = normalizeWebsite(result.url)
  const host = extractWebsiteHost(url)

  if (!title) return null
  if (shouldSkipResult(result)) return null

  const { name, agency_name } = titleToNameAndAgency(title)
  const derivedAgency = deriveAgencyFromHost(host)
  const email = extractEmail(content)
  const emailAgency = deriveAgencyFromEmail(email)
  const provisionalAgency =
    pickBetterAgency(pickBetterAgency(agency_name, derivedAgency), emailAgency) ||
    agency_name
  const personName = resolvePersonName(result, location, provisionalAgency, email)
  const resolvedAgency = personName ? resolveAgencyName(result, personName, provisionalAgency) : ''
  const bestAgency = pickBetterAgency(provisionalAgency, resolvedAgency) || resolvedAgency || provisionalAgency

  if (!personName || !bestAgency) return null

  const normalized = normalizeRawAgent({
    name: sanitizeLeadName(personName),
    agency_name: bestAgency,
    email,
    phone: extractPhone(content),
    suburb: extractSuburb(`${title} ${content}`, location),
    website: url,
  })

  if (!looksLikePersonLabel(normalized.name) || normalized.name === 'Unknown Agency') return null
  if (GENERIC_NAME_PATTERNS.some(pattern => pattern.test(normalized.name))) return null
  const fallbackAgency =
    normalized.agency_name === 'Unknown Agency'
      ? pickBetterAgency(emailAgency, derivedAgency) || emailAgency || derivedAgency || normalized.agency_name
      : normalized.agency_name

  if (!fallbackAgency || fallbackAgency === 'Unknown Agency') return null
  if (PORTAL_BRAND_PATTERNS.some(pattern => pattern.test(fallbackAgency))) return null

  if (normalized.name.toLowerCase() === fallbackAgency.toLowerCase()) return null

  const normalizedLocation = clean(location || '')
  const cleanedSuburb =
    normalized.suburb && normalized.name && normalized.suburb.toLowerCase().includes(normalized.name.toLowerCase())
      ? normalizedLocation || normalized.suburb
      : normalized.suburb

  return {
    ...normalized,
    agency_name: fallbackAgency,
    suburb: cleanedSuburb,
    source_urls: url ? [url] : [],
    source_labels: [label],
  }
}

function mergeAgents(current: CandidateAgent, incoming: CandidateAgent) {
  const mergedAgency =
    pickBetterAgency(current.agency_name, incoming.agency_name) ||
    current.agency_name ||
    incoming.agency_name ||
    'Unknown Agency'

  const mergedName =
    pickBetterName(current.name, incoming.name, mergedAgency) ||
    current.name ||
    incoming.name ||
    mergedAgency

  const source_urls = Array.from(new Set([...(current.source_urls || []), ...(incoming.source_urls || [])]))
  const source_labels = Array.from(new Set([...(current.source_labels || []), ...(incoming.source_labels || [])]))

  return normalizeRawAgent({
    name: mergedName,
    agency_name: mergedAgency,
    email: current.email || incoming.email,
    phone: current.phone || incoming.phone,
    suburb: current.suburb || incoming.suburb,
    website: current.website || incoming.website,
    source_urls,
    source_labels,
  } as CandidateAgent) as CandidateAgent
}

function candidateToRawAgent(agent: CandidateAgent): RawAgent {
  return normalizeRawAgent({
    name: agent.name,
    agency_name: agent.agency_name,
    email: agent.email,
    phone: agent.phone,
    suburb: agent.suburb,
    website: agent.website,
  })
}

function completenessScore(agent: CandidateAgent) {
  return [
    Boolean(agent.email),
    Boolean(agent.phone),
    Boolean(agent.website),
    Boolean(agent.suburb),
    Boolean(agent.name && !looksLikeAgencyLabel(agent.name)),
  ].filter(Boolean).length + (agent.source_labels?.length || 0) * 0.25
}

function agentKeys(agent: CandidateAgent) {
  const keys = new Set<string>()
  const email = clean(agent.email || '').toLowerCase()
  const phone = normalizePhoneDigits(agent.phone)
  const websiteHost = extractWebsiteHost(agent.website)
  const name = clean(agent.name).toLowerCase()
  const agency = clean(agent.agency_name).toLowerCase()
  const suburb = normalizeLocalityKey(agent.suburb)

  if (email) keys.add(`email:${email}`)
  if (phone) keys.add(`phone:${phone}`)
  if (name) keys.add(`name:${name}`)
  if (websiteHost && name) keys.add(`site-name:${websiteHost}|${name}`)
  if (websiteHost && agency) keys.add(`site-agency:${websiteHost}|${agency}`)
  if (name && agency) keys.add(`name-agency:${name}|${agency}`)
  if (name && suburb) keys.add(`name-suburb:${name}|${suburb}`)
  if (agency && suburb) keys.add(`agency-suburb:${agency}|${suburb}`)
  return Array.from(keys)
}

function buildQueries(location: string, desiredCount: number): DiscoveryQuery[] {
  const normalizedLocation = clean(location || 'Perth')
  const depthHint = desiredCount > 20 ? 'agent profile email phone team' : 'agent contact details'

  return [
    {
      label: 'agent_profiles',
      query: `real estate agent ${normalizedLocation} ${depthHint}`,
    },
    {
      label: 'agency_websites',
      query: `site:.com.au ${normalizedLocation} real estate agent profile email phone`,
    },
    {
      label: 'reiwa',
      query: `site:reiwa.com.au ${normalizedLocation} real estate agent profile`,
    },
    {
      label: 'realestate_com_au',
      query: `site:realestate.com.au ${normalizedLocation} real estate agent profile`,
    },
    {
      label: 'domain',
      query: `site:domain.com.au ${normalizedLocation} real estate agent profile`,
    },
    {
      label: 'ratemyagent',
      query: `site:ratemyagent.com.au ${normalizedLocation} real estate agent profile`,
    },
    {
      label: 'broad_search',
      query: `${normalizedLocation} property consultant sales representative real estate`,
    },
  ]
}

export async function POST(request: Request) {
  try {
    const { count, location } = await request.json()

    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'TAVILY_API_KEY is not configured' }, { status: 500 })
    }

    const desiredCount = Math.max(1, Math.min(50, Number(count) || 10))
    const queries = buildQueries(String(location || ''), desiredCount)
    const unique = new Map<string, CandidateAgent>()
    const aliases = new Map<string, string>()
    let lastError: string | null = null

    for (const { label, query } of queries) {
      const tavilyRes = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: 'advanced',
          topic: 'general',
          max_results: 20,
          include_answer: false,
          include_raw_content: false,
        }),
        cache: 'no-store',
      })

      if (!tavilyRes.ok) {
        lastError = `Tavily returned HTTP ${tavilyRes.status}`
        continue
      }

      const data = await tavilyRes.json() as TavilyResponse
      if (data.error) {
        lastError = data.error
        continue
      }

      for (const result of data.results || []) {
        const agent = resultToAgent(result, String(location || ''), label)
        if (!agent) continue

        const keys = agentKeys(agent)
        const matchedPrimaryKey = keys.find(key => aliases.has(key))

        if (matchedPrimaryKey) {
          const primaryKey = aliases.get(matchedPrimaryKey)!
          const existing = unique.get(primaryKey)
          if (existing) {
            const merged = mergeAgents(existing, agent)
            unique.set(primaryKey, merged)
            for (const key of agentKeys(merged)) aliases.set(key, primaryKey)
          }
        } else {
          const primaryKey =
            keys[0] ||
            `fallback:${agent.name.toLowerCase()}|${agent.agency_name.toLowerCase()}|${unique.size}`
          unique.set(primaryKey, agent)
          for (const key of keys) aliases.set(key, primaryKey)
        }

        if (unique.size >= desiredCount) break
      }

      if (unique.size >= desiredCount) break
    }

    if (unique.size === 0) {
      return NextResponse.json(
        { error: lastError || 'No agents found from Tavily search' },
        { status: 502 }
      )
    }

    return NextResponse.json({
      agents: Array.from(unique.values())
        .sort((a, b) => completenessScore(b) - completenessScore(a))
        .slice(0, desiredCount)
        .map(candidateToRawAgent),
      total: unique.size,
      source: 'tavily_multi_source_merge',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
