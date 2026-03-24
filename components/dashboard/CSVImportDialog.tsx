'use client'

import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ImportPreviewDialog } from './ImportPreviewDialog'
import { toast } from 'sonner'
import type { Lead, RawAgent } from '@/types'

const COL_MAP: Record<string, keyof RawAgent> = {
  name: 'name', agent_name: 'name', full_name: 'name',
  email: 'email', email_address: 'email',
  phone: 'phone', mobile: 'phone', contact: 'phone',
  agency_name: 'agency_name', agency: 'agency_name', company: 'agency_name',
  suburb: 'suburb', location: 'suburb', area: 'suburb',
  website: 'website', url: 'website', web: 'website',
}

function splitCSVLine(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  let inQuote = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      cells.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur.trim())
  return cells
}

function parseCSV(text: string): RawAgent[] {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().replace(/"/g, ''))
  const fieldMap = headers.map(h => COL_MAP[h] ?? null)

  return lines.slice(1).map(line => {
    const cells = splitCSVLine(line)
    const agent: Partial<RawAgent> = {}
    fieldMap.forEach((field, i) => {
      if (field && cells[i]) (agent as Record<string, string>)[field] = cells[i]
    })
    return agent as RawAgent
  }).filter(a => a.name && a.agency_name)
}

interface Props {
  existingLeads: Lead[]
  onImported: (count: number) => void
  bulkCreate: (agents: RawAgent[]) => Promise<{ inserted: number; errors: number }>
}

export function CSVImportDialog({ existingLeads, onImported, bulkCreate }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [parsed, setParsed] = useState<RawAgent[]>([])
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const agents = parseCSV(text)
      if (agents.length === 0) {
        toast.error('No valid rows found. Check CSV has a header row with required columns: name, agency_name, and optional: email, phone, suburb, website.')
        return
      }
      setParsed(agents)
      setPreviewOpen(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleConfirm = async (newAgents: RawAgent[]) => {
    setImporting(true)
    try {
      const { inserted, errors } = await bulkCreate(newAgents)
      setPreviewOpen(false)
      if (inserted > 0) {
        toast.success(`Imported ${inserted} agent${inserted !== 1 ? 's' : ''}.`)
        onImported(inserted)
      }
      if (errors > 0) toast.error(`${errors} agent${errors !== 1 ? 's' : ''} failed to import.`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => fileRef.current?.click()}
        className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-8 text-xs cursor-pointer"
      >
        <Upload className="w-3.5 h-3.5 mr-1.5" />
        Import CSV
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />

      <ImportPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        agents={parsed}
        existingLeads={existingLeads}
        onConfirm={handleConfirm}
        importing={importing}
      />
    </>
  )
}
