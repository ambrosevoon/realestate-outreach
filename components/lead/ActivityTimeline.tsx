'use client'

import { formatDistanceToNow } from 'date-fns'
import { Mail, Reply, Phone, FileText, Send, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { Activity, ActivityType } from '@/types'

const iconMap: Record<ActivityType, { Icon: React.ElementType; color: string }> = {
  email_sent: { Icon: Mail, color: 'text-blue-400' },
  followup_sent: { Icon: Send, color: 'text-violet-400' },
  reply_received: { Icon: Reply, color: 'text-green-400' },
  call_made: { Icon: Phone, color: 'text-amber-400' },
  note: { Icon: FileText, color: 'text-slate-400' },
}

const labelMap: Record<ActivityType, string> = {
  email_sent: 'Email sent',
  followup_sent: 'Follow-up sent',
  reply_received: 'Reply received',
  call_made: 'Call made',
  note: 'Note added',
}

interface Props {
  activities: Activity[]
  loading: boolean
}

export function ActivityTimeline({ activities, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-14 bg-slate-800/50 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!activities.length) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Loader2 className="w-5 h-5 text-slate-600 mb-2" />
        <p className="text-xs text-slate-600">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-700/60" />
      {activities.map(activity => {
        const { Icon, color } = iconMap[activity.type] ?? iconMap.note
        return (
          <div key={activity.id} className="flex gap-3 py-3 relative">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-300">
                  {labelMap[activity.type]}
                </span>
                <span className="text-xs text-slate-600 flex-shrink-0">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </span>
              </div>
              {activity.subject && (
                <p className="text-xs text-slate-400 truncate mt-0.5">{activity.subject}</p>
              )}
              {activity.content && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.content}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
