'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadStatus, RawAgent } from '@/types'

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'score' | 'last_contacted_at' | 'created_at'>('score')

  const PAGE_SIZE = 25
  const [page, setPage] = useState(1)

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('re_outreach_leads')
      .select('*')
      .order(sortBy, { ascending: false })
    if (!error && data) setLeads(data as Lead[])
    setLoading(false)
  }, [sortBy])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const createLead = useCallback(async (input: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>) => {
    const { data, error } = await supabase
      .from('re_outreach_leads')
      .insert({ ...input, status: 'new', score: 0 })
      .select()
      .single()
    if (!error && data) {
      setLeads(prev => [data as Lead, ...prev])
      return { data: data as Lead, error: null }
    }
    return { data: null, error }
  }, [])

  const updateLead = useCallback(async (id: string, patch: Partial<Lead>) => {
    const { data, error } = await supabase
      .from('re_outreach_leads')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error && data) {
      setLeads(prev => prev.map(l => (l.id === id ? (data as Lead) : l)))
      return { data: data as Lead, error: null }
    }
    return { data: null, error }
  }, [])

  const deleteLead = useCallback(async (id: string) => {
    const { error } = await supabase.from('re_outreach_leads').delete().eq('id', id)
    if (!error) setLeads(prev => prev.filter(l => l.id !== id))
    return { error }
  }, [])

  const bulkCreateLeads = useCallback(async (agents: RawAgent[]) => {
    const results = await Promise.allSettled(
      agents.map(agent =>
        supabase
          .from('re_outreach_leads')
          .insert({ ...agent, email: agent.email || null, status: 'new', score: 0 })
          .select()
          .single()
      )
    )
    const inserted: Lead[] = []
    let errors = 0
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.data) {
        inserted.push(r.value.data as Lead)
      } else {
        errors++
      }
    }
    if (inserted.length > 0) {
      setLeads(prev => [...inserted, ...prev])
    }
    return { inserted: inserted.length, errors }
  }, [])

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
  }
}
