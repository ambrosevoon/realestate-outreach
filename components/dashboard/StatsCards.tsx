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
        color: 'text-stone-200',
        bg: 'bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]',
        border: 'border-white/10',
      },
      {
        label: 'Contacted',
        value: total ? `${Math.round((contacted / total) * 100)}%` : '0%',
        sub: `${contacted} of ${total}`,
        icon: Mail,
        color: 'text-cyan-300',
        bg: 'bg-[linear-gradient(180deg,rgba(56,189,248,0.16),rgba(7,18,28,0.24))]',
        border: 'border-cyan-400/20',
      },
      {
        label: 'Replied',
        value: total ? `${Math.round((replied / total) * 100)}%` : '0%',
        sub: `${replied} responses`,
        icon: MessageSquare,
        color: 'text-emerald-300',
        bg: 'bg-[linear-gradient(180deg,rgba(52,211,153,0.16),rgba(7,18,28,0.24))]',
        border: 'border-emerald-400/20',
      },
      {
        label: 'Demo Booked',
        value: total ? `${Math.round((demo / total) * 100)}%` : '0%',
        sub: `${demo} demos`,
        icon: Calendar,
        color: 'text-amber-200',
        bg: 'bg-[linear-gradient(180deg,rgba(212,164,97,0.2),rgba(7,18,28,0.22))]',
        border: 'border-amber-300/20',
      },
    ]
  }, [leads])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ label, value, sub, icon: Icon, color, bg, border }) => (
        <div
          key={label}
          className={`dashboard-card rounded-[1.6rem] border ${border} ${bg} p-5 flex flex-col gap-3 backdrop-blur-sm shadow-[0_24px_80px_-48px_rgba(0,0,0,0.9)]`}
        >
          <div className="flex items-center justify-between">
            <span className="dashboard-card-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">
              {label}
            </span>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="dashboard-card-value text-2xl font-semibold text-white">{value}</p>
            <p className="dashboard-card-sub mt-0.5 text-xs text-stone-500">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
