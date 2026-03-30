import type { Lead, RawAgent } from '@/types'

const GENERIC_SEGMENTS = [
  'home',
  'homepage',
  'contact',
  'contact us',
  'about',
  'about us',
  'our team',
  'team',
  'agents',
  'agent',
  'agent profile',
  'agent profiles',
  'real estate agents',
  'real estate agent',
  'property',
  'properties',
  'real estate',
]

const GENERIC_DESCRIPTOR_REGEX =
  /\b(home|homepage|contact(?: us)?|about(?: us)?|team|agents?|agent profiles?|real estate agents?|property|properties)\b/i

const AGENCY_HINT_REGEX =
  /\b(realty|real estate|properties|property|group|agency|estate|homes|brokers?|sotheby'?s|lj hooker|ray white|harcourts)\b/i

function cleanWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

function trimDecorativePunctuation(value: string) {
  return cleanWhitespace(
    value
      .replace(/[“”"]/g, '')
      .replace(/\.\.\.$/, '')
      .replace(/[|•·]+$/g, '')
      .replace(/\s+[-:|•·–—]\s*$/g, '')
  )
}

function splitTitle(value: string) {
  return trimDecorativePunctuation(value)
    .split(/\s*[-|•·–—:]\s*/)
    .map(part => trimDecorativePunctuation(part))
    .filter(Boolean)
}

function isGenericSegment(value: string) {
  const normalized = cleanWhitespace(value).toLowerCase()
  return GENERIC_SEGMENTS.includes(normalized) || GENERIC_DESCRIPTOR_REGEX.test(value)
}

function looksLikePersonName(value: string) {
  const cleaned = trimDecorativePunctuation(value)
  if (!cleaned || cleaned.length > 40) return false
  if (isGenericSegment(cleaned) || AGENCY_HINT_REGEX.test(cleaned)) return false

  const words = cleaned.split(' ').filter(Boolean)
  if (words.length < 2 || words.length > 4) return false

  return words.every(word => /^[A-Z][a-z'’-]+$/.test(word))
}

export function cleanAgencyName(value?: string) {
  const cleaned = trimDecorativePunctuation(value || '')
  if (!cleaned) return 'Unknown Agency'

  const segments = splitTitle(cleaned)
  const agencySegment = segments.find(segment => AGENCY_HINT_REGEX.test(segment)) || segments[0] || cleaned
  return trimDecorativePunctuation(agencySegment)
}

export function cleanLeadName(value?: string, agencyName?: string) {
  const cleaned = trimDecorativePunctuation(value || '')
  const cleanedAgency = cleanAgencyName(agencyName)

  if (!cleaned) return cleanedAgency

  const segments = splitTitle(cleaned)
  const personSegment = segments.find(looksLikePersonName)
  if (personSegment) return personSegment

  const firstMeaningfulSegment = segments.find(segment => !isGenericSegment(segment))
  const candidate = trimDecorativePunctuation(firstMeaningfulSegment || cleaned)

  if (!candidate || isGenericSegment(candidate)) return cleanedAgency
  if (candidate.length > 48 && AGENCY_HINT_REGEX.test(candidate)) return cleanedAgency
  if (candidate.toLowerCase() === cleanedAgency.toLowerCase()) return cleanedAgency

  return candidate
}

export function normalizeRawAgent(agent: RawAgent): RawAgent {
  const agency_name = cleanAgencyName(agent.agency_name || agent.name)
  const name = cleanLeadName(agent.name, agency_name)

  return {
    ...agent,
    name,
    agency_name,
  }
}

export function normalizeLead(lead: Lead): Lead {
  const agency_name = cleanAgencyName(lead.agency_name || lead.name)
  const name = cleanLeadName(lead.name, agency_name)

  return {
    ...lead,
    name,
    agency_name,
  }
}
