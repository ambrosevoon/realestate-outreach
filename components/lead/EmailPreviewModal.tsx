'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { buildEmailHtml } from '@/lib/emailTemplate'
import type { Lead } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  lead: Lead
  subject: string
  body: string
}

export function EmailPreviewModal({ open, onClose, lead, subject, body }: Props) {
  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setMounted(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    } else {
      setVisible(false)
      const t = setTimeout(() => setMounted(false), 200)
      return () => clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!mounted) return null

  const html = buildEmailHtml(lead, body)

  const modal = (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{
        backgroundColor: visible ? 'rgba(2,6,23,0.85)' : 'rgba(2,6,23,0)',
        backdropFilter: visible ? 'blur(6px)' : 'blur(0px)',
        transition: 'background-color 200ms ease, backdrop-filter 200ms ease',
      }}
    >
      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'scale(1) translateY(0)' : 'scale(0.97) translateY(10px)',
          transition: 'opacity 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50 flex-shrink-0 bg-slate-900">
          <div className="min-w-0">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Email Preview</p>
            <p className="text-sm font-medium text-slate-200 mt-0.5 truncate">
              <span className="text-slate-500">To:</span> {lead.name} &lt;{lead.email}&gt;
            </p>
            <p className="text-sm text-slate-300 truncate">
              <span className="text-slate-500">Subject:</span> {subject}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <a
              href={`mailto:${lead.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Gmail
            </a>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email iframe */}
        <div className="flex-1 overflow-hidden bg-[#f4f6f9]">
          <iframe
            srcDoc={html}
            title="Email Preview"
            className="w-full h-full border-0"
            style={{ minHeight: '560px' }}
            sandbox="allow-same-origin"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-700/50 bg-slate-900 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
