'use client'

import { useMemo } from 'react'
import { Users, Mail, MessageSquare, Calendar } from 'lucide-react'
import type { Lead } from '@/types'

interface Props {
  leads: Lead[]
}

export function StatsCards({ leads }: Props) {
  const stats = useMemo(() => {
    const total = leads.length
    const contacted = leads.filter(l => l.status !== 'new').length
    const replied = leads.filter(l =>
      ['replied', 'demo_booked', 'won'].includes(l.status)
    ).length
    const demo = leads.filter(l => l.status === 'demo_booked').length

    return [
      {
        label: 'Total Leads',
        value: total,
        sub: 'in database',
        icon: Users,
        color: 'text-slate-400',
        bg: 'bg-slate-800/50',
        border: 'border-slate-700/50',
      },
      {
        label: 'Contacted',
        value: total ? `${Math.round((contacted / total) * 100)}%` : '0%',
        sub: `${contacted} of ${total}`,
        icon: Mail,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
      },
      {
        label: 'Replied',
        value: total ? `${Math.round((replied / total) * 100)}%` : '0%',
        sub: `${replied} responses`,
        icon: MessageSquare,
        color: 'text-green-400',
        bg: 'bg-green-500/10',
        border: 'border-green-500/20',
      },
      {
        label: 'Demo Booked',
        value: total ? `${Math.round((demo / total) * 100)}%` : '0%',
        sub: `${demo} demos`,
        icon: Calendar,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
      },
    ]
  }, [leads])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`rounded-xl border ${border} ${bg} p-5 flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {label}
            </span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
