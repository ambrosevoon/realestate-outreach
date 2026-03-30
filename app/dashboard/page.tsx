'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, RefreshCw, LogOut, Trash2 } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SmartFlowLogo } from '@/components/brand/SmartFlowLogo'
import ShaderShowcase from '@/components/ui/hero'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { AnalyticsSection } from '@/components/dashboard/AnalyticsSection'
import { LeadsTable } from '@/components/dashboard/LeadsTable'
import { CreateLeadDialog } from '@/components/dashboard/CreateLeadDialog'
import { CSVImportDialog } from '@/components/dashboard/CSVImportDialog'
import { DiscoverAgentsButton } from '@/components/dashboard/DiscoverAgentsButton'
import { LeadDrawer } from '@/components/lead/LeadDrawer'
import { useLeads } from '@/hooks/useLeads'
import type { Lead, LeadStatus } from '@/types'

const STATUS_FILTERS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'demo_booked', label: 'Demo Booked' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

export default function DashboardPage() {
  const {
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
  } = useLeads()

  const router = useRouter()

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead)
    setDrawerOpen(true)
  }

  const handleLeadUpdate = async (id: string, patch: Partial<Lead>) => {
    const result = await updateLead(id, patch)
    if (result.data && selectedLead?.id === id) {
      setSelectedLead(result.data)
    }
    return result
  }

  const handleToggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleToggleAll = (ids: string[], checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      ids.forEach(id => checked ? next.add(id) : next.delete(id))
      return next
    })
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    setDeleting(true)
    await Promise.all([...selectedIds].map(id => deleteLead(id)))
    setSelectedIds(new Set())
    setDeleting(false)
  }

  const handleImported = (_count: number) => {
    fetchLeads()
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(86,214,222,0.08),transparent_24%),radial-gradient(circle_at_top_right,rgba(212,164,97,0.12),transparent_18%),linear-gradient(180deg,#02040a_0%,#08101b_100%)]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#04070d]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <SmartFlowLogo size="sm" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-8 w-8 cursor-pointer text-stone-500 hover:text-white"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchLeads}
              className="h-8 w-8 cursor-pointer text-stone-500 hover:text-white"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <CSVImportDialog
              existingLeads={leads}
              onImported={handleImported}
              bulkCreate={bulkCreateLeads}
            />
            <DiscoverAgentsButton
              existingLeads={leads}
              onImported={handleImported}
              bulkCreate={bulkCreateLeads}
            />
            <CreateLeadDialog onCreate={createLead} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <ShaderShowcase
          variant="compact"
          eyebrow="Automation command center"
          title="Premium outbound operations for real-estate growth."
          description="Track lead flow, launch AI-assisted outreach, and keep every follow-up polished enough to sell the system before the demo even starts."
          navLinks={[
            { label: 'Pipeline', href: '#pipeline' },
            { label: 'Activity', href: '#pipeline' },
            { label: 'Follow-up', href: '#pipeline' },
          ]}
          primaryAction={{ label: 'Open pipeline', href: '#pipeline' }}
          secondaryAction={{ label: 'Review metrics', href: '#analytics' }}
          stats={[
            { label: 'Leads', value: String(leads.length) },
            { label: 'Filtered', value: String(filtered.length) },
            { label: 'Status', value: statusFilter === 'all' ? 'All' : statusFilter.replace('_', ' ') },
            { label: 'Sort', value: sortBy.replaceAll('_', ' ') },
          ]}
        />

        {/* Stats */}
        <div id="analytics">
          <StatsCards leads={leads} />
        </div>

        {/* Analytics */}
        <AnalyticsSection leads={leads} />

        {/* Toolbar */}
        <div id="pipeline" className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-[1.75rem] border border-white/8 bg-white/[0.03] px-4 py-4 backdrop-blur-sm">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, agency, email..."
              className="h-10 rounded-xl border-white/10 bg-slate-950/55 pl-9 text-white placeholder:text-stone-500 focus-visible:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-stone-500" />
            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as LeadStatus | 'all')}
            >
              <SelectTrigger className="h-10 w-44 rounded-xl border-white/10 bg-slate-950/55 text-stone-200 focus:ring-amber-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900/95 backdrop-blur-xl">
                {STATUS_FILTERS.map(opt => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer text-stone-300 focus:bg-white/8 focus:text-white"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {selectedIds.size > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteSelected}
                disabled={deleting}
                className="h-10 gap-1.5 rounded-xl border-red-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
              </Button>
            )}
            <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
              {filtered.length} of {leads.length} leads
            </span>
          </div>
        </div>

        {/* Table */}
        <LeadsTable
          leads={paginated}
          loading={loading}
          onRowClick={handleRowClick}
          sortBy={sortBy}
          setSortBy={setSortBy}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onToggleAll={handleToggleAll}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between rounded-[1.5rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-stone-400 backdrop-blur-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="cursor-pointer text-stone-300 hover:text-white disabled:opacity-30"
            >
              ← Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="cursor-pointer text-stone-300 hover:text-white disabled:opacity-30"
            >
              Next →
            </Button>
          </div>
        )}
      </main>

      {/* Lead Drawer */}
      <LeadDrawer
        lead={selectedLead}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={handleLeadUpdate}
      />
    </div>
  )
}
