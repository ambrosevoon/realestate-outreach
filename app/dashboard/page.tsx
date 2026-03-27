'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, RefreshCw, LogOut, Trash2 } from 'lucide-react'
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
    <div className="min-h-screen bg-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">SF</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white leading-none">SmartFlow</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Outreach Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-slate-500 hover:text-white cursor-pointer w-8 h-8"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchLeads}
              className="text-slate-500 hover:text-white cursor-pointer w-8 h-8"
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
        {/* Stats */}
        <StatsCards leads={leads} />

        {/* Analytics */}
        <AnalyticsSection leads={leads} />

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, agency, email..."
              className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-blue-500 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-600" />
            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as LeadStatus | 'all')}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-slate-300 focus:ring-blue-500 h-9 w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {STATUS_FILTERS.map(opt => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-slate-300 focus:bg-slate-700 focus:text-white cursor-pointer"
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
                className="border-red-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer h-9 gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {deleting ? 'Deleting…' : `Delete ${selectedIds.size}`}
              </Button>
            )}
            <span className="text-xs text-slate-600">
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
          <div className="flex items-center justify-between text-sm text-slate-500">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
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
              className="text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
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
