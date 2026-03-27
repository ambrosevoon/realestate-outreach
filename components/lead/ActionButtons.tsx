'use client'

import { useState } from 'react'
import { Mail, Calendar, Trophy, XCircle, Sparkles, Loader2, Copy, Check, RefreshCw, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { sendEmail, scheduleFollowup, updateLeadStatus, generateDraft } from '@/lib/n8n'
import { EmailPreviewModal } from './EmailPreviewModal'
import type { Lead } from '@/types'

interface Props {
  lead: Lead
  onLeadUpdate: (patch: Partial<Lead>) => void
  onActivityAdded: (type: 'email_sent' | 'followup_sent', subject: string) => void
  onClose?: () => void
}

interface Draft {
  subject: string
  body: string
}

export function ActionButtons({ lead, onLeadUpdate, onActivityAdded, onClose }: Props) {
  const [sending, setSending] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [marking, setMarking] = useState<'won' | 'lost' | null>(null)

  // AI Draft state
  const [draft, setDraft] = useState<Draft | null>(null)
  const [draftLoading, setDraftLoading] = useState(false)
  const [customInstructions, setCustomInstructions] = useState('')
  const [copied, setCopied] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleSendEmail = async () => {
    setSending(true)
    const { error } = await sendEmail({
      lead_id: lead.id,
      email: lead.email ?? '',
      name: lead.name,
      agency_name: lead.agency_name,
    })
    setSending(false)
    if (error) {
      toast.error('Failed to trigger email. Check n8n webhook.')
    } else {
      onLeadUpdate({ status: 'contacted', last_contacted_at: new Date().toISOString() })
      onActivityAdded('email_sent', `Outreach email to ${lead.name}`)
      toast.success('Email sent! Closing…')
      setTimeout(() => onClose?.(), 1200)
    }
  }

  const handleGenerateDraft = async () => {
    setDraftLoading(true)
    const { data, error } = await generateDraft({
      name: lead.name,
      agency_name: lead.agency_name,
      suburb: lead.suburb,
      email: lead.email,
      custom_instructions: customInstructions.trim() || undefined,
    })
    setDraftLoading(false)
    if (error || !data?.subject) {
      toast.error('Failed to generate draft. Try again.')
      return
    }
    setDraft({ subject: data.subject, body: data.body })
  }

  const handleCopy = async () => {
    if (!draft) return
    const text = `Subject: ${draft.subject}\n\n${draft.body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied to clipboard.')
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
    <>
    {draft && (
      <EmailPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        lead={lead}
        subject={draft.subject}
        body={draft.body}
      />
    )}
    <div className="space-y-3">
      {/* Primary action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleSendEmail}
          disabled={sending}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer w-full active:scale-[0.96] transition-transform duration-100"
        >
          {sending ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Mail className="w-4 h-4 mr-1.5" />}
          Send Email
        </Button>
        <Button
          variant="outline"
          onClick={handleGenerateDraft}
          disabled={draftLoading}
          className="border-violet-700/50 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 text-sm cursor-pointer w-full active:scale-[0.96] transition-transform duration-100"
        >
          {draftLoading ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
          AI Draft
        </Button>
      </div>

      {/* AI Draft preview pane — appears after first generation */}
      {(draft || draftLoading) && (
        <div
          style={{
            opacity: draft || draftLoading ? 1 : 0,
            transform: draft || draftLoading ? 'translateY(0)' : 'translateY(-6px)',
            transition: 'opacity 200ms ease, transform 200ms ease',
          }}
          className="rounded-xl border border-violet-700/30 bg-violet-950/20 overflow-hidden"
        >
          {/* Draft header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-violet-700/20">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">AI Draft</span>
            </div>
            {draft && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            )}
          </div>

          {/* Draft content */}
          <div className="px-3 py-3 space-y-2">
            {draftLoading && !draft ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-700 rounded w-3/4" />
                <div className="h-2 bg-slate-800 rounded w-full mt-3" />
                <div className="h-2 bg-slate-800 rounded w-5/6" />
                <div className="h-2 bg-slate-800 rounded w-4/5" />
                <div className="h-2 bg-slate-800 rounded w-full" />
                <div className="h-2 bg-slate-800 rounded w-2/3" />
              </div>
            ) : draft ? (
              <>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Subject</div>
                <p className="text-sm text-slate-200 font-medium">{draft.subject}</p>
                <div className="h-px bg-violet-700/20 my-2" />
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Body</div>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{draft.body}</p>
              </>
            ) : null}
          </div>

          {/* Custom instructions + re-generate */}
          <div className="px-3 pb-3 space-y-2 border-t border-violet-700/20 pt-3">
            <label className="text-xs text-slate-500 font-medium uppercase tracking-wider">
              Custom instructions
            </label>
            <Textarea
              value={customInstructions}
              onChange={e => setCustomInstructions(e.target.value)}
              placeholder="e.g. focus on their suburban market, mention our 30-day free trial..."
              rows={2}
              className="bg-slate-900/80 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-violet-500 resize-none text-xs"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateDraft}
              disabled={draftLoading}
              className="border-violet-700/50 text-violet-300 hover:bg-violet-500/10 hover:text-violet-200 cursor-pointer w-full text-xs h-8 active:scale-[0.96] transition-transform duration-100"
            >
              {draftLoading
                ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                : <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              }
              {draftLoading ? 'Generating…' : 'Re-generate'}
            </Button>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        onClick={handleFollowup}
        disabled={scheduling}
        className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white text-sm cursor-pointer w-full active:scale-[0.96] transition-transform duration-100"
      >
        {scheduling ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <Calendar className="w-4 h-4 mr-1.5 text-amber-400" />}
        Schedule Follow-up (3 days)
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleMark('won')}
          disabled={marking !== null || lead.status === 'won'}
          className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-sm cursor-pointer active:scale-[0.96] transition-transform duration-100"
        >
          {marking === 'won' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trophy className="w-4 h-4 mr-1" />}
          Mark Won
        </Button>
        <Button
          variant="outline"
          onClick={() => handleMark('lost')}
          disabled={marking !== null || lead.status === 'lost'}
          className="border-red-700/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-sm cursor-pointer active:scale-[0.96] transition-transform duration-100"
        >
          {marking === 'lost' ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <XCircle className="w-4 h-4 mr-1" />}
          Mark Lost
        </Button>
      </div>
    </div>
    </>
  )
}
