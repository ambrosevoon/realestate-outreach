import { Badge } from '@/components/ui/badge'
import type { LeadStatus } from '@/types'

const config: Record<LeadStatus, { label: string; className: string }> = {
  new: {
    label: 'New',
    className: 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700/60',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/20',
  },
  replied: {
    label: 'Replied',
    className: 'bg-green-500/20 text-green-300 border-green-500/40 hover:bg-green-500/20',
  },
  demo_booked: {
    label: 'Demo Booked',
    className: 'bg-violet-500/20 text-violet-300 border-violet-500/40 hover:bg-violet-500/20',
  },
  won: {
    label: 'Won',
    className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20',
  },
  lost: {
    label: 'Lost',
    className: 'bg-red-500/20 text-red-400 border-red-500/40 hover:bg-red-500/20',
  },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = config[status] ?? config.new
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  )
}
