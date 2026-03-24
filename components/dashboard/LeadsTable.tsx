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
import { StatusBadge } from './StatusBadge'
import type { Lead } from '@/types'

interface Props {
  leads: Lead[]
  loading: boolean
  onRowClick: (lead: Lead) => void
  sortBy: string
  setSortBy: (s: 'score' | 'last_contacted_at' | 'created_at') => void
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

export function LeadsTable({ leads, loading, onRowClick, sortBy, setSortBy }: Props) {
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-slate-500 text-sm">No leads found.</p>
        <p className="text-slate-600 text-xs mt-1">Add your first lead to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-700/50 hover:bg-transparent">
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium">
              Agent
            </TableHead>
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium hidden md:table-cell">
              Email
            </TableHead>
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium hidden lg:table-cell">
              <div className="flex items-center gap-2">
                Score
                <SortBtn field="score" current={sortBy} onSort={() => setSortBy('score')} />
              </div>
            </TableHead>
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium">
              Status
            </TableHead>
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium hidden lg:table-cell">
              <div className="flex items-center gap-2">
                Last Contact
                <SortBtn
                  field="last_contacted_at"
                  current={sortBy}
                  onSort={() => setSortBy('last_contacted_at')}
                />
              </div>
            </TableHead>
            <TableHead className="text-slate-500 text-xs uppercase tracking-wider font-medium hidden xl:table-cell">
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
              className="border-slate-700/40 hover:bg-slate-800/40 cursor-pointer transition-colors group"
            >
              <TableCell>
                <div>
                  <p className="text-sm font-medium text-white">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.agency_name}</p>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <a
                  href={`mailto:${lead.email}`}
                  onClick={e => e.stopPropagation()}
                  className="text-sm text-slate-300 hover:text-blue-400 flex items-center gap-1 transition-colors"
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
                      ? 'text-blue-400'
                      : 'text-slate-400'
                  }`}
                >
                  {lead.score}
                </span>
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-slate-500">
                {lead.last_contacted_at
                  ? format(new Date(lead.last_contacted_at), 'dd MMM yyyy')
                  : '—'}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-sm text-slate-500">
                {lead.next_followup_at ? (
                  <span
                    className={
                      new Date(lead.next_followup_at) < new Date()
                        ? 'text-red-400'
                        : 'text-slate-400'
                    }
                  >
                    {format(new Date(lead.next_followup_at), 'dd MMM yyyy')}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>
              <TableCell>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
