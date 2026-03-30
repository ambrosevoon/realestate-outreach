'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, RefreshCw, LogOut, Trash2, Sparkles } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SmartFlowLogo } from '@/components/brand/SmartFlowLogo'
import { ShaderBackdrop } from '@/components/ui/hero'
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
    <div className="dashboard-page relative min-h-screen overflow-hidden bg-[#02040a] text-white">
      <ShaderBackdrop variant="full" className="fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.58)_46%,rgba(2,4,10,0.88)_100%)]" />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/6 bg-black/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:h-14 sm:py-0">
          <div className="flex items-start justify-between gap-3 sm:items-center">
            <SmartFlowLogo size="sm" className="min-w-0 shrink" />
            <div className="flex items-center gap-2 sm:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 shrink-0 cursor-pointer text-stone-500 hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchLeads}
                className="h-8 w-8 shrink-0 cursor-pointer text-stone-500 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-0 sm:flex sm:flex-nowrap sm:items-center sm:justify-end">
            <div className="hidden items-center gap-2 sm:flex">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-8 w-8 shrink-0 cursor-pointer text-stone-500 hover:text-white"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchLeads}
                className="h-8 w-8 shrink-0 cursor-pointer text-stone-500 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <CSVImportDialog
              existingLeads={leads}
              onImported={handleImported}
              bulkCreate={bulkCreateLeads}
              className="w-full sm:w-auto"
            />
            <DiscoverAgentsButton
              existingLeads={leads}
              onImported={handleImported}
              bulkCreate={bulkCreateLeads}
              className="w-full sm:w-auto"
            />
            <CreateLeadDialog onCreate={createLead} className="col-span-2 w-full sm:col-span-1 sm:w-auto" />
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-8 pt-10 md:pt-12 space-y-6">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-stone-200 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Premium outbound system
          </div>
          <div className="max-w-5xl">
            <h1 className="text-5xl font-semibold leading-[0.92] tracking-[-0.06em] text-white md:text-7xl lg:text-[6.2rem]">
              <span className="block bg-[linear-gradient(135deg,#f8edd4_0%,#92edf0_28%,#d6a15c_72%,#ffffff_100%)] bg-[length:180%_180%] bg-clip-text text-transparent">
                SmartFlow
              </span>
              <span className="block font-black text-white">Outreach</span>
              <span className="block font-light italic text-white/78">Command Center</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-stone-200/88 md:text-xl">
              Discover agents, launch AI-assisted email campaigns, and manage follow-up from a single premium operating layer built to sell automation before the first demo.
            </p>
          </div>
        </section>

        {/* Stats */}
        <div id="analytics">
          <StatsCards leads={leads} />
        </div>

        {/* Analytics */}
        <AnalyticsSection leads={leads} />

        {/* Toolbar */}
        <div id="pipeline" className="flex flex-col sm:flex-row gap-3 items-start sm:items-center rounded-[1.75rem] border border-white/8 bg-white/[0.05] px-4 py-4 backdrop-blur-md shadow-[0_30px_80px_-52px_rgba(0,0,0,0.95)]">
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
        <div className="rounded-[2rem] border border-white/6 bg-black/8 backdrop-blur-[2px]">
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
        </div>

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
