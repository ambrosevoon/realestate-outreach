'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Reply, Phone, FileText, Send, Loader2, X } from 'lucide-react'
import { createPortal } from 'react-dom'
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

function EmailPreviewModal({ activity, onClose }: { activity: Activity; onClose: () => void }) {
  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(6px)' }}
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50 flex-shrink-0">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Sent Email</p>
            <p className="text-sm font-medium text-slate-200 mt-0.5 truncate">
              <span className="text-slate-500">Subject:</span> {activity.subject}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-4 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email iframe */}
        <div className="flex-1 overflow-hidden bg-[#f4f6f9]">
          <iframe
            srcDoc={activity.content ?? ''}
            title="Sent Email"
            className="w-full h-full border-0"
            style={{ minHeight: '560px' }}
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}

interface Props {
  activities: Activity[]
  loading: boolean
}

export function ActivityTimeline({ activities, loading }: Props) {
  const [previewActivity, setPreviewActivity] = useState<Activity | null>(null)

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
    <>
      {previewActivity && (
        <EmailPreviewModal activity={previewActivity} onClose={() => setPreviewActivity(null)} />
      )}
      <div className="relative space-y-0">
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-slate-700/60" />
        {activities.map(activity => {
          const { Icon, color } = iconMap[activity.type] ?? iconMap.note
          const isClickable = activity.type === 'email_sent' && !!activity.content
          return (
            <div
              key={activity.id}
              onClick={() => isClickable && setPreviewActivity(activity)}
              className={`flex gap-3 py-3 relative rounded-lg transition-colors ${isClickable ? 'cursor-pointer hover:bg-slate-800/40 -mx-2 px-2' : ''}`}
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center z-10">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-300">
                      {labelMap[activity.type]}
                    </span>
                    {isClickable && (
                      <span className="text-[10px] text-blue-400 font-medium">· View</span>
                    )}
                  </div>
                  <span className="text-xs text-slate-600 flex-shrink-0">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </span>
                </div>
                {activity.subject && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">{activity.subject}</p>
                )}
                {activity.content && activity.type !== 'email_sent' && (
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{activity.content}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
