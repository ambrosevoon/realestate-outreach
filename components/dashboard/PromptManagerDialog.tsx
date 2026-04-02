'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bot, History, Loader2, PencilLine, RotateCcw, Save, Sparkles, Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  buildFallbackPromptVersion,
  buildPromptVersionName,
  EMAIL_PROMPTS_TABLE,
} from '@/lib/emailPrompts'
import { supabase } from '@/lib/supabase'
import type { EmailPromptVersion } from '@/types'

interface Props {
  className?: string
}

function formatTimestamp(value?: string) {
  if (!value) return 'Unknown'
  return new Date(value).toLocaleString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const PLACEHOLDER_TOKENS = ['[NAME]', '[AGENCY]', '[SUBURB]', '[SEED]', '[CUSTOM_INSTRUCTIONS_BLOCK]']

export function PromptManagerDialog({ className }: Props) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [versions, setVersions] = useState<EmailPromptVersion[]>([])
  const [versionName, setVersionName] = useState('')
  const [userTemplate, setUserTemplate] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')

  const activeVersion = useMemo(
    () => versions.find(version => version.is_active) || buildFallbackPromptVersion(),
    [versions]
  )

  const sortedVersions = useMemo(
    () =>
      [...versions].sort((a, b) => {
        if (a.is_active !== b.is_active) return a.is_active ? -1 : 1
        return new Date(b.activated_at || b.created_at).getTime() - new Date(a.activated_at || a.created_at).getTime()
      }),
    [versions]
  )

  const loadVersions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from(EMAIL_PROMPTS_TABLE)
      .select('*')
      .order('activated_at', { ascending: false })
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) {
      setVersions([buildFallbackPromptVersion()])
      toast.error('Prompt history could not be loaded. Showing the built-in prompt.')
      return
    }

    const rows = (data as EmailPromptVersion[]) || []
    setVersions(rows.length > 0 ? rows : [buildFallbackPromptVersion()])
  }

  useEffect(() => {
    if (open) {
      loadVersions()
      setEditing(false)
    }
  }, [open])

  const startEditing = () => {
    const nextName = buildPromptVersionName()
    setVersionName(nextName)
    setUserTemplate(activeVersion.user_prompt_template)
    setSystemPrompt(activeVersion.system_prompt)
    setEditing(true)
  }

  const cancelEditing = () => {
    setEditing(false)
    setVersionName('')
    setUserTemplate('')
    setSystemPrompt('')
  }

  const handleSave = async () => {
    const trimmedName = versionName.trim() || buildPromptVersionName()
    const trimmedUserTemplate = userTemplate.trim()
    const trimmedSystemPrompt = systemPrompt.trim()

    if (!trimmedUserTemplate || !trimmedSystemPrompt) {
      toast.error('Both prompt sections need content before saving.')
      return
    }

    setSaving(true)
    const now = new Date().toISOString()

    const { error: deactivateError } = await supabase
      .from(EMAIL_PROMPTS_TABLE)
      .update({ is_active: false })
      .eq('is_active', true)

    if (deactivateError) {
      setSaving(false)
      toast.error('Could not archive the current active prompt.')
      return
    }

    const { error: insertError } = await supabase
      .from(EMAIL_PROMPTS_TABLE)
      .insert({
        name: trimmedName,
        user_prompt_template: trimmedUserTemplate,
        system_prompt: trimmedSystemPrompt,
        is_active: true,
        activated_at: now,
      })

    setSaving(false)

    if (insertError) {
      toast.error('Could not save the new active prompt.')
      return
    }

    toast.success(`${trimmedName} is now the active draft prompt.`)
    cancelEditing()
    await loadVersions()
  }

  const handleActivate = async (version: EmailPromptVersion) => {
    if (version.is_active) return
    setActivatingId(version.id)

    const { error: deactivateError } = await supabase
      .from(EMAIL_PROMPTS_TABLE)
      .update({ is_active: false })
      .eq('is_active', true)

    if (deactivateError) {
      setActivatingId(null)
      toast.error('Could not deactivate the current prompt.')
      return
    }

    const { error: activateError } = await supabase
      .from(EMAIL_PROMPTS_TABLE)
      .update({
        is_active: true,
        activated_at: new Date().toISOString(),
      })
      .eq('id', version.id)

    setActivatingId(null)

    if (activateError) {
      toast.error('Could not reactivate that prompt version.')
      return
    }

    toast.success(`${version.name} is active again.`)
    await loadVersions()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-8 justify-center gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-100 hover:bg-violet-500/16 hover:text-white cursor-pointer ${className ?? ''}`}
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Email Prompt</span>
          <span className="sm:hidden">Prompt</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[88vh] overflow-hidden border-white/10 bg-[#07101c] p-0 text-white sm:max-w-6xl">
        <DialogHeader className="border-b border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-100">
                  Draft Engine
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-300">
                  Version Control
                </span>
              </div>
              <DialogTitle className="flex items-center gap-2 text-xl text-white">
                <Sparkles className="h-5 w-5 text-violet-300" />
                Prompt Manager
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-3xl text-sm text-slate-300">
                View the active AI draft prompt, create a new active version, and reactivate any previous version from history. New AI drafts use the active prompt immediately.
              </DialogDescription>
            </div>
            {!editing ? (
              <Button
                type="button"
                onClick={startEditing}
                className="shrink-0 bg-violet-600 text-white hover:bg-violet-500 cursor-pointer"
              >
                <PencilLine className="mr-1.5 h-4 w-4" />
                Edit Prompt
              </Button>
            ) : null}
          </div>
        </DialogHeader>

        <div className="grid gap-0 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="border-b border-white/8 lg:border-b-0 lg:border-r">
            <div className="max-h-[calc(88vh-94px)] overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center text-slate-400">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading prompt versions…
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-[1.6rem] border border-emerald-400/15 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_22%),linear-gradient(180deg,rgba(16,185,129,0.09),rgba(6,11,20,0.58))] p-5 shadow-[0_24px_80px_-52px_rgba(16,185,129,0.75)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-200">
                        Active
                      </span>
                      <h3 className="text-lg font-semibold text-white">{activeVersion.name}</h3>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-200/90">
                      This prompt is the live source of truth for AI Draft generation. Any new draft request will use this version until you activate another one.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Activated</p>
                        <p className="mt-1 text-sm text-white">
                          {formatTimestamp(activeVersion.activated_at)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-slate-400">Prompt Name</p>
                        <p className="mt-1 text-sm text-white">{activeVersion.name}</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-slate-300">
                      Activated {formatTimestamp(activeVersion.activated_at)}
                    </p>
                  </div>

                  {editing ? (
                    <div className="space-y-4">
                      <div className="rounded-[1.4rem] border border-violet-400/15 bg-violet-500/[0.08] p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-violet-100">
                          <Wand2 className="h-4 w-4 text-violet-300" />
                          Editing a new active version
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                          Saving here keeps the current prompt in history, then promotes your edited version to active immediately.
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {PLACEHOLDER_TOKENS.map(token => (
                            <span
                              key={token}
                              className="rounded-full border border-violet-400/15 bg-black/20 px-2.5 py-1 font-mono text-[11px] text-violet-100"
                            >
                              {token}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          New Version Name
                        </label>
                        <Input
                          value={versionName}
                          onChange={event => setVersionName(event.target.value)}
                          placeholder="Prompt 02 Apr 2026, 05:40 pm"
                          className="border-white/10 bg-slate-950/70 text-white placeholder:text-slate-500 focus-visible:ring-violet-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          User Prompt Template
                        </label>
                        <Textarea
                          value={userTemplate}
                          onChange={event => setUserTemplate(event.target.value)}
                          rows={10}
                          className="min-h-[220px] resize-y rounded-[1.2rem] border-white/10 bg-slate-950/80 font-mono text-[13px] leading-6 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:ring-violet-500"
                        />
                        <p className="text-xs leading-relaxed text-slate-400">
                          Use placeholders like <code>[NAME]</code>, <code>[AGENCY]</code>, <code>[SUBURB]</code>, <code>[SEED]</code>, and <code>[CUSTOM_INSTRUCTIONS_BLOCK]</code>.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          System Prompt
                        </label>
                        <Textarea
                          value={systemPrompt}
                          onChange={event => setSystemPrompt(event.target.value)}
                          rows={18}
                          className="min-h-[360px] resize-y rounded-[1.2rem] border-white/10 bg-slate-950/80 font-mono text-[13px] leading-6 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus-visible:ring-violet-500"
                        />
                      </div>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={cancelEditing}
                          className="cursor-pointer text-slate-300 hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="cursor-pointer bg-violet-600 text-white hover:bg-violet-500"
                        >
                          {saving ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
                          Save As Active Prompt
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                          Prompt Variables
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {PLACEHOLDER_TOKENS.map(token => (
                            <span
                              key={token}
                              className="rounded-full border border-white/10 bg-slate-950/70 px-2.5 py-1 font-mono text-[11px] text-slate-200"
                            >
                              {token}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          User Prompt Template
                        </label>
                        <Textarea
                          readOnly
                          value={activeVersion.user_prompt_template}
                          rows={10}
                          className="min-h-[220px] resize-y rounded-[1.2rem] border-white/10 bg-slate-950/80 font-mono text-[13px] leading-6 text-slate-100"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                          System Prompt
                        </label>
                        <Textarea
                          readOnly
                          value={activeVersion.system_prompt}
                          rows={18}
                          className="min-h-[360px] resize-y rounded-[1.2rem] border-white/10 bg-slate-950/80 font-mono text-[13px] leading-6 text-slate-100"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <aside className="max-h-[calc(88vh-94px)] overflow-y-auto bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] px-6 py-5">
            <div className="sticky top-0 z-10 -mx-6 -mt-5 border-b border-white/8 bg-[#09111d]/95 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                <History className="h-4 w-4 text-violet-300" />
                Prompt History
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                Restore any previous prompt version instantly. The active version always stays pinned at the top.
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {sortedVersions.map(version => (
                <div
                  key={version.id}
                  className={`rounded-2xl border p-4 ${
                    version.is_active
                      ? 'border-emerald-400/25 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_24%),rgba(16,185,129,0.07)]'
                      : 'border-white/8 bg-slate-950/45 transition-colors hover:border-violet-400/25 hover:bg-violet-500/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-white">{version.name}</h4>
                        {version.is_active ? (
                          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                            Active
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-400">
                        Created {formatTimestamp(version.created_at)}
                      </p>
                      <p className="text-xs leading-relaxed text-slate-400">
                        Last activated {formatTimestamp(version.activated_at)}
                      </p>
                    </div>
                    {!version.is_active ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleActivate(version)}
                        disabled={activatingId === version.id}
                        className="shrink-0 cursor-pointer border-violet-400/25 bg-violet-500/10 text-violet-100 hover:bg-violet-500/16"
                      >
                        {activatingId === version.id ? (
                          <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="mr-1.5 h-4 w-4" />
                        )}
                        Activate
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  )
}
