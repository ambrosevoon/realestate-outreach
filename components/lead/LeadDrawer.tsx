'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { format } from 'date-fns'
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Star,
  Save,
  Loader2,
  ExternalLink,
  X,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/dashboard/StatusBadge'
import { ActivityTimeline } from './ActivityTimeline'
import { ActionButtons } from './ActionButtons'
import { useActivities } from '@/hooks/useActivities'
import type { Lead, LeadStatus } from '@/types'

const STATUS_OPTIONS: { value: LeadStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'demo_booked', label: 'Demo Booked' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
]

interface Props {
  lead: Lead | null
  open: boolean
  onClose: () => void
  onUpdate: (id: string, patch: Partial<Lead>) => Promise<{ data: Lead | null; error: unknown }>
  emailEnabled?: boolean
}

export function LeadDrawer({ lead, open, onClose, onUpdate, emailEnabled = true }: Props) {
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<LeadStatus>('new')
  const [savingNotes, setSavingNotes] = useState(false)
  const [savingStatus, setSavingStatus] = useState(false)
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { activities, loading: activitiesLoading, fetchActivities, addActivity } = useActivities()

  // Mount/unmount with animation
  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 220)
      return () => clearTimeout(t)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  useEffect(() => {
    if (lead) {
      setNotes(lead.owner_notes || '')
      setStatus(lead.status)
      fetchActivities(lead.id)
    }
  }, [lead, fetchActivities])

  const saveNotes = async () => {
    if (!lead) return
    setSavingNotes(true)
    const { error } = await onUpdate(lead.id, { owner_notes: notes })
    setSavingNotes(false)
    if (error) toast.error('Failed to save notes.')
    else toast.success('Notes saved.')
  }

  const saveStatus = async (newStatus: LeadStatus) => {
    if (!lead) return
    setStatus(newStatus)
    setSavingStatus(true)
    const { error } = await onUpdate(lead.id, { status: newStatus })
    setSavingStatus(false)
    if (error) toast.error('Failed to update status.')
    else toast.success('Status updated.')
  }

  const handleLeadUpdate = async (patch: Partial<Lead>) => {
    if (lead) await onUpdate(lead.id, patch)
  }

  const handleActivityAdded = async (type: 'email_sent' | 'followup_sent', subject: string) => {
    if (lead) await addActivity(lead.id, type, subject)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  if (!mounted || !lead) return null

  const modal = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="lead-drawer-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(2, 6, 23, 0.75)' : 'rgba(2, 6, 23, 0)',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 200ms ease, backdrop-filter 200ms ease',
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(8px)',
          transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="lead-drawer relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,18,0.98),rgba(5,8,14,0.98))] shadow-2xl shadow-black/60"
      >
        {/* Header */}
        <div className="lead-drawer-header border-b border-white/8 px-6 pb-4 pt-5 flex-shrink-0 bg-[radial-gradient(circle_at_top_right,rgba(212,164,97,0.12),transparent_34%)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="lead-drawer-title text-white text-lg font-semibold truncate">{lead.name}</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <Building2 className="lead-drawer-muted-icon w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                <span className="lead-drawer-muted text-sm text-stone-300 truncate">{lead.agency_name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
              <StatusBadge status={status} />
              <button
                onClick={onClose}
                className="lead-drawer-close flex h-7 w-7 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-white/8 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-5">
          {/* Contact Info */}
          <div className="space-y-2">
            <a
              href={`mailto:${lead.email}`}
                className="lead-drawer-link flex items-center gap-2 text-sm text-cyan-300 hover:text-cyan-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {lead.email}
            </a>
            {lead.phone && (
              <div className="lead-drawer-muted flex items-center gap-2 text-sm text-stone-300">
                <Phone className="lead-drawer-muted-icon w-3.5 h-3.5 text-stone-600" />
                {lead.phone}
              </div>
            )}
            {lead.suburb && (
              <div className="lead-drawer-muted flex items-center gap-2 text-sm text-stone-300">
                <MapPin className="lead-drawer-muted-icon w-3.5 h-3.5 text-stone-600" />
                {lead.suburb}
              </div>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="lead-drawer-muted flex items-center gap-2 text-sm text-stone-300 hover:text-white transition-colors"
              >
                <Globe className="lead-drawer-muted-icon w-3.5 h-3.5 text-stone-600" />
                {lead.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Score + Dates */}
          <div className="lead-drawer-meta flex items-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Score: <span className="lead-drawer-title text-white font-medium">{lead.score}</span></span>
            </div>
            {lead.last_contacted_at && (
              <span>
                Last contact:{' '}
                <span className="lead-drawer-muted text-stone-300">
                  {format(new Date(lead.last_contacted_at), 'dd MMM yyyy')}
                </span>
              </span>
            )}
          </div>

          <Separator className="lead-drawer-separator bg-white/8" />

          {/* Status */}
          <div className="space-y-2">
            <label className="lead-drawer-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">
              Status
            </label>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={v => saveStatus(v as LeadStatus)}>
                <SelectTrigger className="lead-drawer-field flex-1 border-white/10 bg-slate-950/60 text-white focus:ring-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="lead-drawer-field-panel border-white/10 bg-slate-900/95">
                  {STATUS_OPTIONS.map(opt => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="lead-drawer-field-option cursor-pointer text-stone-300 focus:bg-white/8 focus:text-white"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {savingStatus && <Loader2 className="w-4 h-4 text-stone-500 animate-spin" />}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="lead-drawer-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add context about this lead..."
              rows={3}
              className="lead-drawer-field resize-none border-white/10 bg-slate-950/60 text-sm text-white placeholder:text-stone-500 focus-visible:ring-amber-500"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={saveNotes}
              disabled={savingNotes || notes === (lead.owner_notes ?? '')}
              className="cursor-pointer border-white/10 text-stone-300 hover:bg-white/8 hover:text-white"
            >
              {savingNotes ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save Notes
            </Button>
          </div>

          <Separator className="lead-drawer-separator bg-white/8" />

          {/* Actions */}
          <div className="space-y-2">
            <label className="lead-drawer-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">
              Actions
            </label>
          <ActionButtons
            lead={lead}
            onLeadUpdate={handleLeadUpdate}
            onActivityAdded={handleActivityAdded}
            onRefreshActivities={() => fetchActivities(lead.id)}
            onClose={onClose}
            emailEnabled={emailEnabled}
          />
          </div>

          <Separator className="lead-drawer-separator bg-white/8" />

          {/* Activity Timeline */}
          <div className="space-y-2">
            <label className="lead-drawer-label text-xs font-medium text-stone-400 uppercase tracking-[0.22em]">
              Activity
            </label>
            <ActivityTimeline activities={activities} loading={activitiesLoading} />
          </div>

          {/* Timestamps */}
          <div className="lead-drawer-meta space-y-0.5 pt-2 text-xs text-stone-600">
            <p>Created {format(new Date(lead.created_at), 'dd MMM yyyy, HH:mm')}</p>
            <p>Updated {format(new Date(lead.updated_at), 'dd MMM yyyy, HH:mm')}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
