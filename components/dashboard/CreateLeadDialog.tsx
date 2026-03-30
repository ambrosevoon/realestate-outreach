'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import type { Lead } from '@/types'

type CreateInput = Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'status' | 'score'>

interface Props {
  onCreate: (input: CreateInput) => Promise<{ data: Lead | null; error: unknown }>
  className?: string
}

const empty: CreateInput = {
  name: '',
  email: '',
  phone: '',
  agency_name: '',
  suburb: '',
  website: '',
  owner_notes: '',
}

export function CreateLeadDialog({ onCreate, className }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<CreateInput>(empty)

  const set = (k: keyof CreateInput, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) return
    setLoading(true)
    const { error } = await onCreate(form)
    setLoading(false)
    if (error) {
      toast.error('Failed to create lead.')
    } else {
      toast.success(`${form.name} added to leads.`)
      setForm(empty)
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={`h-8 justify-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer ${className ?? ''}`}>
          <Plus className="w-4 h-4" />
          <span className="sm:hidden">Add</span>
          <span className="hidden sm:inline">Add Lead</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Name *</label>
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Vicky Yang"
                required
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Email *</label>
              <Input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="agent@agency.com.au"
                required
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Agency</label>
              <Input
                value={form.agency_name}
                onChange={e => set('agency_name', e.target.value)}
                placeholder="Happy Realty"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Suburb</label>
              <Input
                value={form.suburb}
                onChange={e => set('suburb', e.target.value)}
                placeholder="Canning Vale"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Phone</label>
              <Input
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="0400 000 000"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium">Website</label>
              <Input
                value={form.website}
                onChange={e => set('website', e.target.value)}
                placeholder="https://agency.com.au"
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 font-medium">Notes</label>
            <Textarea
              value={form.owner_notes}
              onChange={e => set('owner_notes', e.target.value)}
              placeholder="Any context about this lead..."
              rows={3}
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
              Add Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
