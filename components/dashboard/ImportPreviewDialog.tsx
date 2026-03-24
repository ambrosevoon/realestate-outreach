'use client'

import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2, SkipForward } from 'lucide-react'
import type { Lead, RawAgent } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  agents: RawAgent[]
  existingLeads: Lead[]
  onConfirm: (newAgents: RawAgent[]) => void
  importing: boolean
}

function normalizePhone(p?: string): string {
  const stripped = (p || '').replace(/[\s\-().+]/g, '').toLowerCase()
  // Normalise Australian international prefix to local format
  if (stripped.startsWith('61') && stripped.length === 11) {
    return '0' + stripped.slice(2)
  }
  return stripped
}

function isDuplicate(candidate: RawAgent, existing: Lead[]): boolean {
  const candPhone = normalizePhone(candidate.phone)
  const candEmail = (candidate.email || '').toLowerCase().trim()
  const candName = (candidate.name || '').toLowerCase().trim()
  const candAgency = (candidate.agency_name || '').toLowerCase().trim()

  return existing.some(lead => {
    const nameMatch = candName === lead.name.toLowerCase().trim()
    const agencyMatch = candAgency && candAgency === (lead.agency_name || '').toLowerCase().trim()
    const phoneMatch = candPhone && candPhone === normalizePhone(lead.phone)
    const emailMatch =
      candEmail && lead.email && candEmail === lead.email.toLowerCase().trim()
    // Match by phone+name, email, or name+agency (fallback for agents with no contact info)
    return (nameMatch && phoneMatch) || emailMatch || (nameMatch && agencyMatch)
  })
}

export function ImportPreviewDialog({
  open,
  onClose,
  agents,
  existingLeads,
  onConfirm,
  importing,
}: Props) {
  const { newAgents, duplicates } = useMemo(() => {
    const newAgents: RawAgent[] = []
    const duplicates: RawAgent[] = []
    const seen: RawAgent[] = []
    for (const a of agents) {
      if (isDuplicate(a, existingLeads) || isDuplicate(a, seen as unknown as Lead[])) {
        duplicates.push(a)
      } else {
        newAgents.push(a)
        seen.push(a)
      }
    }
    return { newAgents, duplicates }
  }, [agents, existingLeads])

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Import Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              {newAgents.length} new
            </span>
            <span className="flex items-center gap-1.5 text-slate-500">
              <SkipForward className="w-4 h-4" />
              {duplicates.length} already in database (skipped)
            </span>
          </div>

          {newAgents.length > 0 && (
            <div className="max-h-60 overflow-y-auto rounded-md border border-slate-700 divide-y divide-slate-800">
              {newAgents.map((a, i) => (
                <div key={i} className="px-3 py-2 text-sm">
                  <div className="font-medium text-white">{a.name}</div>
                  <div className="text-slate-400 text-xs">
                    {a.agency_name}{a.suburb ? ` · ${a.suburb}` : ''}{a.phone ? ` · ${a.phone}` : ''}
                  </div>
                </div>
              ))}
            </div>
          )}

          {newAgents.length === 0 && (
            <p className="text-slate-400 text-sm">
              All agents are already in your database.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(newAgents)}
            disabled={newAgents.length === 0 || importing}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {importing ? 'Importing...' : `Import ${newAgents.length} Agent${newAgents.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
