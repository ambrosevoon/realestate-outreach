'use client'

import { useState, useEffect } from 'react'
import { Globe, Settings2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { ImportPreviewDialog } from './ImportPreviewDialog'
import { discoverAgents } from '@/lib/n8n'
import { toast } from 'sonner'
import type { Lead, RawAgent } from '@/types'

const SETTINGS_KEY = 'discover_settings'

interface DiscoverSettings {
  count: number
  location: string
}

function loadSettings(): DiscoverSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { count: 20, location: '' }
}

interface Props {
  existingLeads: Lead[]
  onImported: (count: number) => void
  bulkCreate: (agents: RawAgent[]) => Promise<{ inserted: number; errors: number }>
  defaultLocation?: string
  datasetLabel: string
  className?: string
}

export function DiscoverAgentsButton({
  existingLeads,
  onImported,
  bulkCreate,
  defaultLocation,
  datasetLabel,
  className,
}: Props) {
  const [settings, setSettings] = useState<DiscoverSettings>({ count: 20, location: '' })
  const [discovering, setDiscovering] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [discovered, setDiscovered] = useState<RawAgent[]>([])
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    const saved = loadSettings()
    setSettings(current => ({
      ...current,
      ...saved,
      location: saved.location || defaultLocation || '',
    }))
  }, [defaultLocation])

  const saveSettings = (next: DiscoverSettings) => {
    setSettings(next)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  }

  const handleDiscover = async () => {
    if (!settings.location.trim()) {
      toast.error('Set a location in settings before discovering.')
      return
    }
    setDiscovering(true)
    const { data, error } = await discoverAgents(settings.count, settings.location)
    setDiscovering(false)
    if (error || !data?.agents) {
      toast.error(
        typeof data?.error === 'string'
          ? `Discovery failed: ${data.error}`
          : error
            ? `Discovery failed: ${error}`
            : 'Discovery failed. Check Tavily configuration or redeploy the app.'
      )
      return
    }
    if (!Array.isArray(data.agents)) {
      toast.error('Discovery failed: unexpected response format.')
      return
    }
    setDiscovered(data.agents as RawAgent[])
    setPreviewOpen(true)
  }

  const handleConfirm = async (newAgents: RawAgent[]) => {
    setImporting(true)
    try {
      const { inserted, errors } = await bulkCreate(newAgents)
      setPreviewOpen(false)
      if (inserted > 0) {
        toast.success(`Imported ${inserted} agent${inserted !== 1 ? 's' : ''} into ${datasetLabel}.`)
        onImported(inserted)
      }
      if (errors > 0) toast.error(`${errors} failed to import.`)
    } finally {
      setImporting(false)
    }
  }

  return (
    <>
      <div className="flex items-center">
        <Button
          size="sm"
          onClick={handleDiscover}
          disabled={discovering}
          className={`h-8 min-w-0 flex-1 justify-center rounded-r-none bg-violet-600 text-xs text-white hover:bg-violet-700 cursor-pointer ${className ?? ''}`}
        >
          {discovering ? (
            <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
          ) : (
            <Globe className="w-3.5 h-3.5 mr-1.5" />
          )}
          <span className="sm:hidden">Discover</span>
          <span className="hidden sm:inline">Discover Agents</span>
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 shrink-0 rounded-l-none border-slate-700 border-l-0 p-0 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                Discovery Settings
              </p>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Leads to pull</label>
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={settings.count}
                  onChange={e =>
                    saveSettings({ ...settings, count: Math.max(1, Math.min(200, Number(e.target.value))) })
                  }
                  className="bg-slate-800 border-slate-600 text-white h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Location</label>
                <Input
                  value={settings.location}
                  onChange={e => saveSettings({ ...settings, location: e.target.value })}
                  placeholder={defaultLocation ? `example: ${defaultLocation}` : 'example: Canning Vale WA'}
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-600 h-8 text-sm"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <ImportPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        agents={discovered}
        existingLeads={existingLeads}
        onConfirm={handleConfirm}
        importing={importing}
        datasetLabel={datasetLabel}
      />
    </>
  )
}
