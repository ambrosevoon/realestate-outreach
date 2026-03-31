'use client'

import { useMemo, useEffect } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { TrendingUp, Zap } from 'lucide-react'
import { format, subDays, startOfDay, parseISO, differenceInDays } from 'date-fns'
import { useAllActivities } from '@/hooks/useAllActivities'
import type { Lead } from '@/types'

interface Props {
  leads: Lead[]
}

const STATUS_COLORS: Record<string, string> = {
  new: '#64748b',
  contacted: '#3b82f6',
  replied: '#22c55e',
  demo_booked: '#a855f7',
  won: '#10b981',
  lost: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  new: 'New',
  contacted: 'Contacted',
  replied: 'Replied',
  demo_booked: 'Demo Booked',
  won: 'Won',
  lost: 'Lost',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm shadow-lg">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <p key={entry.name} style={{ color: entry.color }} className="font-medium">
          {entry.value} {entry.name}
        </p>
      ))}
    </div>
  )
}

export function AnalyticsSection({ leads }: Props) {
  const { activities, fetchAll } = useAllActivities()

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // --- Email activity chart: emails sent per day over last 14 days ---
  const emailChartData = useMemo(() => {
    const emailActivities = activities.filter(a => a.type === 'email_sent')
    const days: { date: string; label: string; emails: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i))
      const count = emailActivities.filter(a => {
        const d = startOfDay(parseISO(a.created_at))
        return d.getTime() === day.getTime()
      }).length
      days.push({
        date: day.toISOString(),
        label: format(day, 'MMM d'),
        emails: count,
      })
    }
    return days
  }, [activities])

  // --- Status breakdown ---
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const lead of leads) {
      counts[lead.status] = (counts[lead.status] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        label: STATUS_LABELS[status] ?? status,
        count,
        color: STATUS_COLORS[status] ?? '#64748b',
      }))
      .sort((a, b) => b.count - a.count)
  }, [leads])

  // --- Pace tracker ---
  const pace = useMemo(() => {
    const total = leads.length
    if (total === 0) return null

    const contacted = leads.filter(l => l.status !== 'new').length
    const remaining = total - contacted

    // Find the first email_sent activity date
    const emailActivities = activities.filter(a => a.type === 'email_sent')
    if (emailActivities.length === 0) return { contacted, remaining, total, dailyRate: 0, daysLeft: null }

    const firstDate = parseISO(emailActivities[0].created_at)
    const daysElapsed = Math.max(1, differenceInDays(new Date(), firstDate))
    const dailyRate = Math.round((contacted / daysElapsed) * 10) / 10
    const daysLeft = dailyRate > 0 ? Math.ceil(remaining / dailyRate) : null

    return { contacted, remaining, total, dailyRate, daysLeft }
  }, [leads, activities])

  // --- Reply rate over time (last 4 weeks) ---
  const replyRate = useMemo(() => {
    const replied = leads.filter(l => ['replied', 'demo_booked', 'won'].includes(l.status)).length
    const contacted = leads.filter(l => l.status !== 'new').length
    return contacted > 0 ? Math.round((replied / contacted) * 100) : 0
  }, [leads])

  const maxEmailCount = Math.max(...emailChartData.map(d => d.emails), 1)

  return (
    <div className="space-y-4">
      <div className="dashboard-section-heading flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-amber-300" />
        <h2 className="text-sm font-medium text-stone-300 uppercase tracking-[0.22em]">Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Email Activity Chart */}
        <div className="dashboard-panel lg:col-span-2 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="dashboard-panel-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">Emails Sent</p>
              <p className="dashboard-panel-value text-lg font-semibold text-white mt-0.5">
                {activities.filter(a => a.type === 'email_sent').length} total
              </p>
            </div>
            <span className="dashboard-panel-muted text-xs text-stone-500">Last 14 days</span>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={emailChartData} barSize={14} margin={{ top: 4, right: 0, bottom: 0, left: -20 }}>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: '#8a8479' }}
                tickLine={false}
                axisLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#8a8479' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                domain={[0, maxEmailCount + 1]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="emails" name="emails" radius={[3, 3, 0, 0]}>
                {emailChartData.map((entry) => (
                  <Cell
                    key={entry.date}
                    fill={entry.emails > 0 ? '#4fd1d9' : '#1a2330'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pace Tracker + Reply Rate */}
        <div className="flex flex-col gap-4">
          {/* Pace Tracker */}
          <div className="dashboard-panel flex-1 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 mb-3">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <p className="dashboard-panel-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">Pace Tracker</p>
            </div>
            {pace ? (
              <div className="space-y-3">
                <div>
                  <div className="dashboard-panel-muted mb-1 flex justify-between text-xs text-stone-500">
                    <span>{pace.contacted} contacted</span>
                    <span>{pace.remaining} left</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900/80">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all"
                      style={{ width: `${pace.total > 0 ? (pace.contacted / pace.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="dashboard-panel-inset rounded-2xl border border-white/8 bg-black/20 p-2">
                    <p className="dashboard-panel-value text-base font-semibold text-white">{pace.dailyRate}</p>
                    <p className="dashboard-panel-muted text-xs text-stone-500">per day</p>
                  </div>
                  <div className="dashboard-panel-inset rounded-2xl border border-white/8 bg-black/20 p-2">
                    <p className="dashboard-panel-value text-base font-semibold text-white">
                      {pace.daysLeft !== null ? `${pace.daysLeft}d` : '—'}
                    </p>
                    <p className="dashboard-panel-muted text-xs text-stone-500">days left</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-500">No leads yet</p>
            )}
          </div>

          {/* Reply Rate */}
          <div className="dashboard-panel rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm">
            <p className="dashboard-panel-label mb-3 text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">Reply Rate</p>
            <div className="flex items-end gap-2">
              <p className="dashboard-panel-value text-3xl font-semibold text-white">{replyRate}%</p>
              <p className="dashboard-panel-muted mb-1 text-xs text-stone-500">of contacted</p>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-900/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-300 transition-all"
                style={{ width: `${replyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="dashboard-panel rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm">
        <p className="dashboard-panel-label mb-4 text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">Status Breakdown</p>
        {statusData.length === 0 ? (
          <p className="text-sm text-stone-500">No leads yet</p>
        ) : (
          <div className="space-y-2">
            {statusData.map(({ status, label, count, color }) => (
              <div key={status} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-stone-300">{label}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900/80">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${leads.length > 0 ? (count / leads.length) * 100 : 0}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs text-stone-500">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
