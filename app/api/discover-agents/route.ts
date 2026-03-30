import { NextResponse } from 'next/server'
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

function clean(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

function titleToNameAndAgency(title: string) {
  const parts = title
    .split(/[-|•·]/)
    .map(part => clean(part))
    .filter(Boolean)

  const [first = '', second = ''] = parts

  if (first && second) {
    return { name: first, agency_name: second }
  }

  return { name: first || 'Unknown Agent', agency_name: second || first || 'Unknown Agency' }
}

function extractEmail(text: string) {
  return text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0]
}

function extractPhone(text: string) {
  const match = text.match(/(?:\+?61|0)[\s()\-]*\d[\d\s()\-]{7,}\d/)
  return match?.[0]?.replace(/\s+/g, ' ').trim()
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

function resultToAgent(result: TavilyResult, location: string): RawAgent | null {
  const title = clean(result.title || '')
  const content = clean(result.content || '')
  const url = normalizeWebsite(result.url)

  if (!title) return null

  const { name, agency_name } = titleToNameAndAgency(title)

  if (!name || !agency_name) return null

  return {
    name,
    agency_name,
    email: extractEmail(content),
    phone: extractPhone(content),
    suburb: extractSuburb(`${title} ${content}`, location),
    website: url,
  }
}

export async function POST(request: Request) {
  try {
    const { count, location } = await request.json()

    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'TAVILY_API_KEY is not configured' }, { status: 500 })
    }

    const desiredCount = Math.max(1, Math.min(50, Number(count) || 10))
    const queries = [
      `real estate agents ${location} contact email phone agency website`,
      `property agents ${location} real estate agency contact details`,
      `realty group ${location} sales agent email phone`,
      `top real estate agencies ${location} agent profiles`,
      `independent real estate agent ${location} WA`,
    ]

    const unique = new Map<string, RawAgent>()
    let lastError: string | null = null

    for (const query of queries) {
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
        const agent = resultToAgent(result, String(location || ''))
        if (!agent) continue
        const key = `${agent.name.toLowerCase()}|${agent.agency_name.toLowerCase()}`
        if (!unique.has(key)) unique.set(key, agent)
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
      agents: Array.from(unique.values()),
      total: unique.size,
      source: 'tavily',
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
