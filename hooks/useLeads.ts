'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { DEMO_LEADS_TABLE, LIVE_LEADS_TABLE, SEEDED_DEMO_LEADS } from '@/lib/demoLeads'
import { normalizeLead, normalizeRawAgent } from '@/lib/leadFormatting'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus, RawAgent } from '@/types'

type LeadMode = 'demo' | 'live'
type CreateLeadInput = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>

function isMissingDemoTable(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '42P01'
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'last_contacted_at' | 'created_at'>('score')

  const PAGE_SIZE = 25
  const [page, setPage] = useState(1)
  const tableName = mode === 'demo' ? DEMO_LEADS_TABLE : LIVE_LEADS_TABLE

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setUsingSeededDemoFallback(false)
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(sortBy, { ascending: false })
      .order('created_at', { ascending: false })
    if (!error && data) {
      setLeads((data as Lead[]).map(normalizeLead))
      setLoading(false)
      return
    }

    if (mode === 'demo' && isMissingDemoTable(error)) {
      setUsingSeededDemoFallback(true)
      setLeads(SEEDED_DEMO_LEADS.map(normalizeLead))
    }
    setLoading(false)
  }, [mode, sortBy, tableName])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const createLead = useCallback(async (input: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>) => {
    if (mode === 'demo' && usingSeededDemoFallback) {
      const normalizedLead = buildLocalDemoLead(input)
      setLeads(prev => [normalizedLead, ...prev])
      return { data: normalizedLead, error: null }
    }

    const normalizedInput = normalizeRawAgent(input)
    const { data, error } = await supabase
      .from(tableName)
      .insert({ ...normalizedInput, status: 'new', score: 0 })
      .select()
      .single()
    if (!error && data) {
      const normalizedLead = normalizeLead(data as Lead)
      setLeads(prev => [normalizedLead, ...prev])
      return { data: normalizedLead, error: null }
    }
    return { data: null, error }
  }, [mode, tableName, usingSeededDemoFallback])

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
        .map(agent =>
          buildLocalDemoLead({
            ...normalizeRawAgent(agent),
            email: agent.email,
            owner_notes: '',
          })
        )
      setLeads(prev => [...inserted, ...prev])
      return { inserted: inserted.length, errors: 0 }
    }

    const results = await Promise.allSettled(
      agents.map(agent =>
        supabase
          .from(tableName)
          .insert({ ...normalizeRawAgent(agent), email: agent.email || null, status: 'new', score: 0 })
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
  }, [mode, tableName, usingSeededDemoFallback])

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
