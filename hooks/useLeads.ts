'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DEMO_LEADS_TABLE, LIVE_LEADS_TABLE, SEEDED_DEMO_LEADS } from '@/lib/demoLeads'
import {
  buildLocationDataset,
  demoDataset,
  legacyLiveDataset,
  LEGACY_LIVE_DATASET_KEY,
} from '@/lib/leadDatasets'
import { normalizeLead, normalizeRawAgent } from '@/lib/leadFormatting'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadDatasetOption, LeadStatus, RawAgent } from '@/types'

type LeadMode = 'demo' | 'live'
type CreateLeadInput = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>
type StaticDatasetPayload = {
  datasets?: Array<{
    key: string
    label: string
    location?: string
    leads: Lead[]
  }>
}

function isMissingDemoTable(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '42P01'
}

function normalizeLocationMatch(value?: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b(?:wa|nsw|vic|qld|sa|tas|act|nt)\b/g, '')
    .replace(/\b\d{4}\b/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function dedupeLeads(items: Lead[]) {
  const seen = new Set<string>()
  const deduped: Lead[] = []

  for (const lead of items) {
    const email = (lead.email || '').toLowerCase().trim()
    const name = (lead.name || '').toLowerCase().trim()
    const agency = (lead.agency_name || '').toLowerCase().trim()
    const phone = (lead.phone || '').replace(/\D/g, '')
    const key = email || `${name}|${agency}|${phone}` || lead.id

    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(lead)
  }

  return deduped
}

function buildLocalDemoLead(input: Partial<CreateLeadInput> & Pick<CreateLeadInput, 'name' | 'agency_name'>): Lead {
  const now = new Date().toISOString()
  return normalizeLead({
    ...input,
    suburb: input.suburb || '',
    id: `demo-${crypto.randomUUID()}`,
    status: 'new',
    score: 0,
    created_at: now,
    updated_at: now,
  })
}

export function useLeads(mode: LeadMode = 'demo') {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [usingSeededDemoFallback, setUsingSeededDemoFallback] = useState(false)
  const [datasetColumnsAvailable, setDatasetColumnsAvailable] = useState(mode === 'demo')
  const [datasetOptions, setDatasetOptions] = useState<LeadDatasetOption[]>([mode === 'demo' ? demoDataset() : legacyLiveDataset()])
  const [selectedDatasetKey, setSelectedDatasetKey] = useState(mode === 'demo' ? demoDataset().key : legacyLiveDataset().key)
  const [staticDatasets, setStaticDatasets] = useState<Record<string, Lead[]>>({})
  const [staticDatasetOptions, setStaticDatasetOptions] = useState<LeadDatasetOption[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'last_contacted_at' | 'created_at'>('score')

  const PAGE_SIZE = 25
  const [page, setPage] = useState(1)
  const tableName = mode === 'demo' ? DEMO_LEADS_TABLE : LIVE_LEADS_TABLE

  useEffect(() => {
    if (mode === 'demo') {
      setDatasetColumnsAvailable(true)
      setDatasetOptions([demoDataset()])
      setSelectedDatasetKey(demoDataset().key)
      return
    }

    setDatasetColumnsAvailable(false)
    setDatasetOptions([legacyLiveDataset()])
    setSelectedDatasetKey(legacyLiveDataset().key)
  }, [mode])

  const activeDataset = useMemo(
    () =>
      [...datasetOptions, ...staticDatasetOptions].find(option => option.key === selectedDatasetKey) ||
      (mode === 'demo' ? demoDataset() : legacyLiveDataset()),
    [datasetOptions, mode, selectedDatasetKey, staticDatasetOptions]
  )

  const staticSelectedLeads = useMemo(
    () => staticDatasets[selectedDatasetKey] || null,
    [selectedDatasetKey, staticDatasets]
  )

  const allDatasetOptions = useMemo(() => {
    const map = new Map<string, LeadDatasetOption>()
    for (const option of datasetOptions) map.set(option.key, option)
    for (const option of staticDatasetOptions) {
      if (!map.has(option.key)) map.set(option.key, option)
    }
    return Array.from(map.values())
  }, [datasetOptions, staticDatasetOptions])

  const attachDatasetFields = useCallback(
    <T extends object>(input: T) => {
      const record = input as T & { location?: string; suburb?: string }
      if (mode === 'demo') {
        return {
          ...input,
          dataset_key: demoDataset().key,
          dataset_label: demoDataset().label,
          location: record.location ?? record.suburb ?? demoDataset().location,
        }
      }

      if (!datasetColumnsAvailable) return input

      return {
        ...input,
        dataset_key: activeDataset.key,
        dataset_label: activeDataset.label,
        location: record.location ?? record.suburb ?? activeDataset.location ?? '',
      }
    },
    [activeDataset, datasetColumnsAvailable, mode]
  )

  const fetchDatasetOptions = useCallback(async () => {
    if (mode === 'demo') {
      setDatasetColumnsAvailable(true)
      setDatasetOptions([demoDataset()])
      setSelectedDatasetKey(demoDataset().key)
      return
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('id,dataset_key,dataset_label,location,suburb')
      .order('created_at', { ascending: false })

    if (error) {
      setDatasetColumnsAvailable(false)
      setDatasetOptions([legacyLiveDataset()])
      setSelectedDatasetKey(legacyLiveDataset().key)
      return
    }

    setDatasetColumnsAvailable(true)

    const options = new Map<string, LeadDatasetOption>()
    let sawLegacy = false

    for (const row of (data as Partial<Lead>[]) || []) {
      if (!row.dataset_key || row.dataset_key === LEGACY_LIVE_DATASET_KEY) {
        sawLegacy = true
        continue
      }

      const location = row.location || row.suburb || ''
      options.set(row.dataset_key, {
        key: row.dataset_key,
        label: row.dataset_label || buildLocationDataset(location).label,
        location,
        isLegacy: false,
      })
    }

    const nextOptions = [
      ...(sawLegacy ? [legacyLiveDataset()] : []),
      ...Array.from(options.values()).sort((a, b) => a.label.localeCompare(b.label)),
    ]

    const fallbackOptions = nextOptions.length > 0 ? nextOptions : [legacyLiveDataset()]
    setDatasetOptions(fallbackOptions)
    setSelectedDatasetKey(current =>
      fallbackOptions.some(option => option.key === current)
        ? current
        : fallbackOptions[0].key
    )
  }, [mode, tableName])

  const fetchStaticDatasets = useCallback(async () => {
    if (mode !== 'live') {
      setStaticDatasets({})
      setStaticDatasetOptions([])
      return
    }

    try {
      const res = await fetch('/lead-datasets/suburb-datasets.json', { cache: 'no-store' })
      if (!res.ok) return
      const data = (await res.json()) as StaticDatasetPayload
      const datasets = data.datasets || []
      const nextMap: Record<string, Lead[]> = {}
      const nextOptions: LeadDatasetOption[] = []

      for (const dataset of datasets) {
        nextMap[dataset.key] = dataset.leads.map(normalizeLead)
        nextOptions.push({
          key: dataset.key,
          label: dataset.label,
          location: dataset.location,
          isLegacy: false,
        })
      }

      setStaticDatasets(nextMap)
      setStaticDatasetOptions(nextOptions)
    } catch {
      setStaticDatasets({})
      setStaticDatasetOptions([])
    }
  }, [mode])

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setUsingSeededDemoFallback(false)

    if (mode === 'live' && selectedDatasetKey !== LEGACY_LIVE_DATASET_KEY && staticSelectedLeads) {
      const staticLeads = staticSelectedLeads.map(normalizeLead)
      const normalizedTarget = normalizeLocationMatch(activeDataset.location || activeDataset.label)

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order(sortBy, { ascending: false })
        .order('created_at', { ascending: false })

      const legacyMatches = !error && data
        ? (data as Lead[])
            .map(normalizeLead)
            .filter(lead => {
              const suburb = normalizeLocationMatch(lead.location || lead.suburb)
              return Boolean(suburb) && suburb === normalizedTarget
            })
            .map(lead => ({
              ...lead,
              dataset_key: lead.dataset_key || selectedDatasetKey,
              dataset_label: lead.dataset_label || activeDataset.label,
              location: lead.location || activeDataset.location || activeDataset.label,
            }))
        : []

      setLeads(dedupeLeads([...legacyMatches, ...staticLeads]))
      setLoading(false)
      return
    }

    let query = supabase
      .from(tableName)
      .select('*')
      .order(sortBy, { ascending: false })
      .order('created_at', { ascending: false })

    if (mode === 'live' && datasetColumnsAvailable) {
      if (selectedDatasetKey === LEGACY_LIVE_DATASET_KEY) {
        query = query.or(`dataset_key.is.null,dataset_key.eq.${LEGACY_LIVE_DATASET_KEY}`)
      } else {
        query = query.eq('dataset_key', selectedDatasetKey)
      }
    }

    const { data, error } = await query
    if (!error && data) {
      setLeads((data as Lead[]).map(normalizeLead))
      setLoading(false)
      return
    }

    if (mode === 'live' && datasetColumnsAvailable) {
      setDatasetColumnsAvailable(false)
      setDatasetOptions([legacyLiveDataset()])
      setSelectedDatasetKey(legacyLiveDataset().key)
    }

    if (mode === 'demo' && isMissingDemoTable(error)) {
      setUsingSeededDemoFallback(true)
      setLeads(SEEDED_DEMO_LEADS.map(normalizeLead))
    }
    setLoading(false)
  }, [datasetColumnsAvailable, mode, selectedDatasetKey, sortBy, staticSelectedLeads, tableName])

  useEffect(() => {
    fetchDatasetOptions()
  }, [fetchDatasetOptions])

  useEffect(() => {
    fetchStaticDatasets()
  }, [fetchStaticDatasets])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const createLead = useCallback(async (input: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>) => {
    if (mode === 'demo' && usingSeededDemoFallback) {
      const normalizedLead = buildLocalDemoLead(attachDatasetFields(input))
      setLeads(prev => [normalizedLead, ...prev])
      return { data: normalizedLead, error: null }
    }

    const normalizedInput = normalizeRawAgent(input)
    const payload = attachDatasetFields({ ...normalizedInput, status: 'new', score: 0 })
    const { data, error } = await supabase
      .from(tableName)
      .insert(payload)
      .select()
      .single()
    if (!error && data) {
      const normalizedLead = normalizeLead(data as Lead)
      setLeads(prev => [normalizedLead, ...prev])
      return { data: normalizedLead, error: null }
    }
    return { data: null, error }
  }, [attachDatasetFields, mode, tableName, usingSeededDemoFallback])

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    if (mode === 'demo' && usingSeededDemoFallback) {
      const updatedAt = new Date().toISOString()
      let updatedLead: Lead | null = null
      setLeads(prev =>
        prev.map(lead => {
          if (lead.id !== id) return lead
          updatedLead = normalizeLead({ ...lead, ...patch, updated_at: updatedAt })
          return updatedLead
        })
      )
      return { data: updatedLead, error: null }
    }

    const { data, error } = await supabase
      .from(tableName)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      const normalizedLead = normalizeLead(data as Lead)
      setLeads(prev => prev.map(l => (l.id === id ? normalizedLead : l)))
      return { data: normalizedLead, error: null }
    }
    return { data: null, error }
  }, [mode, tableName, usingSeededDemoFallback])

  const deleteLead = useCallback(async (id: string) => {
    if (mode === 'demo' && usingSeededDemoFallback) {
      setLeads(prev => prev.filter(l => l.id !== id))
      return { error: null }
    }

    const { error } = await supabase.from(tableName).delete().eq('id', id)
    if (!error) setLeads(prev => prev.filter(l => l.id !== id))
    return { error }
  }, [mode, tableName, usingSeededDemoFallback])

  const bulkCreateLeads = useCallback(async (agents: RawAgent[]) => {
    if (mode === 'demo' && usingSeededDemoFallback) {
      const inserted = agents
        .map(agent => {
          const normalized = attachDatasetFields(normalizeRawAgent(agent))
          return buildLocalDemoLead({
            name: String(normalized.name || ''),
            agency_name: String(normalized.agency_name || ''),
            suburb: String(normalized.suburb || ''),
            website: String(normalized.website || ''),
            phone: String(normalized.phone || ''),
            email: agent.email,
            owner_notes: '',
            dataset_key: String(normalized.dataset_key || ''),
            dataset_label: String(normalized.dataset_label || ''),
            location: String(normalized.location || ''),
          })
        })
      setLeads(prev => [...inserted, ...prev])
      return { inserted: inserted.length, errors: 0 }
    }

    const results = await Promise.allSettled(
      agents.map(agent =>
        supabase
          .from(tableName)
          .insert(
            attachDatasetFields({
              ...normalizeRawAgent(agent),
              suburb: agent.suburb || activeDataset.location || '',
              email: agent.email || null,
              status: 'new',
              score: 0,
            })
          )
          .select()
          .single()
      )
    )
    const inserted: Lead[] = []
    let errors = 0
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.data) {
        inserted.push(normalizeLead(r.value.data as Lead))
      } else {
        errors++
      }
    }
    if (inserted.length > 0) {
      setLeads(prev => [...inserted, ...prev])
    }
    return { inserted: inserted.length, errors }
  }, [activeDataset.location, attachDatasetFields, mode, tableName, usingSeededDemoFallback])

  const filtered = useMemo(() => {
    let result = leads
    if (statusFilter !== 'all') result = result.filter(l => l.status === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        l =>
          l.name.toLowerCase().includes(q) ||
          l.agency_name?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.suburb?.toLowerCase().includes(q)
      )
    }
    return result
  }, [leads, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))

  const paginated = useMemo(() => {
    return filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }, [filtered, page])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, sortBy])

  return {
    leads,
    filtered,
    datasetOptions: allDatasetOptions,
    selectedDatasetKey,
    setSelectedDatasetKey,
    activeDataset,
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
    deleteLead,
    bulkCreateLeads,
    page,
    setPage,
    totalPages,
    paginated,
    usingSeededDemoFallback,
    tableName,
  }
}
