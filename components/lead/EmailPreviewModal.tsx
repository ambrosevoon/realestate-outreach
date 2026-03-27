'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Lead } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  lead: Lead
  subject: string
  body: string
}

function buildEmailHtml(lead: Lead, body: string) {
  // Parse body: lines between [[ and ]] become a styled pain-points box
  const lines = body.split('\n')
  let inBox = false
  const segments: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (line === '[[') {
      inBox = true
      segments.push(`<table width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-radius:10px;overflow:hidden;border:1.5px solid #e0e7ff;background:#f5f3ff;">
        <tr><td style="padding:16px 20px 8px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#6366f1;text-transform:uppercase;">What most agents deal with</p>`)
      continue
    }
    if (line === ']]') {
      inBox = false
      segments.push(`</td></tr></table>`)
      continue
    }
    if (inBox) {
      const text = line.startsWith('•') ? line.slice(1).trim() : line
      segments.push(`<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
        <div style="width:6px;height:6px;background:#6366f1;border-radius:50%;margin-top:6px;flex-shrink:0;"></div>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-weight:500;">${text}</p>
      </div>`)
    } else {
      if (line === '') {
        segments.push('<br/>')
      } else {
        segments.push(`<p style="margin:0 0 16px;font-size:15px;color:#4b5563;line-height:1.8;">${line}</p>`)
      }
    }
  }

  const bodyHtml = segments.join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:32px 16px;">
  <tr>
    <td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Hero Banner -->
        <tr>
          <td style="padding:0;margin:0;">
            <img src="https://cloud.inference.sh/app/files/u/64cky3p22fmmvttcyq2q640b1s/01kmqcj2zqr8xpc28rbk3824wx.png"
                 alt="Header"
                 width="600"
                 style="display:block;width:100%;max-width:600px;height:auto;" />
          </td>
        </tr>

        <!-- Header text -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);padding:24px 40px 26px;">
            <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;line-height:1.3;letter-spacing:0.3px;">24/7 EMAIL AUTOMATION FOR REAL ESTATE AGENTS</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#a5b4fc;">From Ambrose Voon</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 24px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://cal.com/ambrose-voon-5qy2sm"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#7c3aed);color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
              Book a Quick Chat →
            </a>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px;">
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px 36px;">
            <p style="margin:0;font-size:14px;font-weight:600;color:#1f2937;">Ambrose Voon</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Real Estate Tech Advisor</p>
            <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">
              <a href="tel:0478495661" style="color:#6366f1;text-decoration:none;">0478 495 661</a>
              &nbsp;·&nbsp;
              <a href="mailto:ambrosevoon@gmail.com" style="color:#6366f1;text-decoration:none;">ambrosevoon@gmail.com</a>
            </p>
            <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">You're receiving this because your agency was suggested as a great fit for smarter outreach. No hard feelings if it's not for you — just reply "unsubscribe" and I'll remove you immediately.</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
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
