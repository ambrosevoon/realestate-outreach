'use client'

import { format } from 'date-fns'
import { ArrowUpDown, ExternalLink, ChevronRight } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from './StatusBadge'
import type { Lead } from '@/types'

interface Props {
  leads: Lead[]
  loading: boolean
  onRowClick: (lead: Lead) => void
  sortBy: string
  setSortBy: (s: 'score' | 'last_contacted_at' | 'created_at') => void
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (ids: string[], checked: boolean) => void
}

function SortBtn({
  field,
  current,
  onSort,
}: {
  field: string
  current: string
  onSort: () => void
}) {
  return (
    <button
      onClick={onSort}
      className={`flex items-center gap-1 cursor-pointer hover:text-white transition-colors ${
        current === field ? 'text-white' : 'text-slate-500'
      }`}
    >
      <ArrowUpDown className="w-3 h-3" />
    </button>
  )
}

export function LeadsTable({ leads, loading, onRowClick, sortBy, setSortBy, selectedIds, onToggle, onToggleAll }: Props) {
  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id))
  const someSelected = leads.some(l => selectedIds.has(l.id)) && !allSelected
  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full bg-slate-800/50 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!leads.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[1.75rem] border border-white/8 bg-white/[0.03] py-20 text-center backdrop-blur-sm">
        <p className="text-sm text-stone-300">No leads found.</p>
        <p className="mt-1 text-xs text-stone-500">Add your first lead to get started.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] backdrop-blur-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-white/8 hover:bg-transparent">
            <TableHead className="w-10 pl-4">
              <Checkbox
                checked={someSelected ? 'indeterminate' : allSelected}
                onCheckedChange={checked => onToggleAll(leads.map(l => l.id), checked === true)}
                className="border-stone-600 data-[state=checked]:border-amber-400 data-[state=checked]:bg-amber-400 data-[state=indeterminate]:border-amber-400 data-[state=indeterminate]:bg-amber-400/70"
              />
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Agent
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-500 md:table-cell">
              Phone
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-500 md:table-cell">
              Email
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-500 lg:table-cell">
              <div className="flex items-center gap-2">
                Score
                <SortBtn field="score" current={sortBy} onSort={() => setSortBy('score')} />
              </div>
            </TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
              Status
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-500 lg:table-cell">
              <div className="flex items-center gap-2">
                Last Contact
                <SortBtn
                  field="last_contacted_at"
                  current={sortBy}
                  onSort={() => setSortBy('last_contacted_at')}
                />
              </div>
            </TableHead>
            <TableHead className="hidden text-xs font-medium uppercase tracking-[0.2em] text-stone-500 xl:table-cell">
              Next Follow-up
            </TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map(lead => (
            <TableRow
              key={lead.id}
              onClick={() => onRowClick(lead)}
              className={`group cursor-pointer border-white/8 transition-colors hover:bg-white/[0.045] ${selectedIds.has(lead.id) ? 'bg-white/[0.05]' : ''}`}
            >
              <TableCell className="pl-4" onClick={e => { e.stopPropagation(); onToggle(lead.id) }}>
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  className="border-stone-600 data-[state=checked]:border-amber-400 data-[state=checked]:bg-amber-400"
                />
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-white">{lead.name}</p>
                  {lead.agency_name && lead.agency_name.toLowerCase() !== lead.name.toLowerCase() ? (
                    <p className="text-xs text-stone-500">{lead.agency_name}</p>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="hidden text-sm text-stone-200 md:table-cell">
                {lead.phone ? (
                  <a
                    href={`tel:${lead.phone}`}
                    onClick={e => e.stopPropagation()}
                    className="transition-colors hover:text-cyan-300"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-stone-600">—</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <a
                  href={`mailto:${lead.email}`}
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-1 text-sm text-stone-200 transition-colors hover:text-cyan-300"
                >
                  {lead.email}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-60" />
                </a>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span
                  className={`text-sm font-medium ${
                    lead.score >= 80
                      ? 'text-emerald-400'
                      : lead.score >= 50
                      ? 'text-cyan-300'
                      : 'text-stone-300'
                  }`}
                >
                  {lead.score}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="hidden text-sm text-stone-500 lg:table-cell">
                {lead.last_contacted_at
                  ? format(new Date(lead.last_contacted_at), 'dd MMM yyyy')
                  : '—'}
              </TableCell>
              <TableCell className="hidden text-sm text-stone-500 xl:table-cell">
                {lead.next_followup_at ? (
                  <span
                    className={
                      new Date(lead.next_followup_at) < new Date()
                        ? 'text-red-400'
                        : 'text-stone-300'
                    }
                  >
                    {format(new Date(lead.next_followup_at), 'dd MMM yyyy')}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <ChevronRight className="w-4 h-4 text-stone-600 transition-colors group-hover:text-stone-300" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
