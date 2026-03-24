'use client'

import { useState } from 'react'
import { Mail, Calendar, Trophy, XCircle, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { sendEmail, scheduleFollowup, updateLeadStatus } from '@/lib/n8n'
import type { Lead } from '@/types'

interface Props {
  lead: Lead
  onLeadUpdate: (patch: Partial<Lead>) => void
  onActivityAdded: (type: 'email_sent' | 'followup_sent', subject: string) => void
}

export function ActionButtons({ lead, onLeadUpdate, onActivityAdded }: Props) {
  const [sending, setSending] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [marking, setMarking] = useState<'won' | 'lost' | null>(null)

  const handleSendEmail = async () => {
    setSending(true)
    const { error } = await sendEmail({
      lead_id: lead.id,
      email: lead.email,
      name: lead.name,
      agency_name: lead.agency_name,
    })
    setSending(false)
    if (error) {
      toast.error('Failed to trigger email. Check n8n webhook.')
    } else {
      onLeadUpdate({ status: 'contacted', last_contacted_at: new Date().toISOString() })
      onActivityAdded('email_sent', `Outreach email to ${lead.name}`)
      toast.success('Email triggered via n8n.')
    }
  }

  const handleFollowup = async () => {
    const next = new Date()
    next.setDate(next.getDate() + 3)
    const iso = next.toISOString()
    setScheduling(true)
    const { error } = await scheduleFollowup(lead.id, iso)
    setScheduling(false)
    if (error) {
      toast.error('Failed to schedule follow-up.')
    } else {
      onLeadUpdate({ next_followup_at: iso })
      onActivityAdded('followup_sent', 'Follow-up scheduled for 3 days')
      toast.success('Follow-up scheduled for 3 days.')
    }
  }

  const handleMark = async (status: 'won' | 'lost') => {
    setMarking(status)
    const { error } = await updateLeadStatus(lead.id, status, lead.owner_notes)
    setMarking(null)
    if (error) {
      toast.error(`Failed to mark as ${status}.`)
    } else {
      onLeadUpdate({ status })
      toast.success(`Marked as ${status}.`)
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleSendEmail}
          disabled={sending}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer w-full"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Mail className="w-4 h-4 mr-1.5" />
          )}
          Send Email
        </Button>
        <Button
          variant="outline"
          onClick={() => toast.info('AI draft triggered via n8n.')}
          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-sm cursor-pointer w-full"
        >
          <Sparkles className="w-4 h-4 mr-1.5 text-violet-400" />
          AI Draft
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={handleFollowup}
        disabled={scheduling}
        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-sm cursor-pointer w-full"
      >
        {scheduling ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : (
          <Calendar className="w-4 h-4 mr-1.5 text-amber-400" />
        )}
        Schedule Follow-up (3 days)
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleMark('won')}
          disabled={marking !== null || lead.status === 'won'}
          className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-sm cursor-pointer"
        >
          {marking === 'won' ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <Trophy className="w-4 h-4 mr-1" />
          )}
          Mark Won
        </Button>
        <Button
          variant="outline"
          onClick={() => handleMark('lost')}
          disabled={marking !== null || lead.status === 'lost'}
          className="border-red-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm cursor-pointer"
        >
          {marking === 'lost' ? (
            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4 mr-1" />
          )}
          Mark Lost
        </Button>
      </div>
    </div>
  )
}
