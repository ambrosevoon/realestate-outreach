export type LeadStatus = 'new' | 'contacted' | 'replied' | 'demo_booked' | 'won' | 'lost'

export interface LeadDatasetOption {
  key: string
  label: string
  location?: string
  isLegacy?: boolean
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  agency_name: string
  suburb: string
  website?: string
  status: LeadStatus
  score: number
  last_contacted_at?: string
  next_followup_at?: string
  owner_notes?: string
  dataset_key?: string
  dataset_label?: string
  location?: string
  created_at: string
  updated_at: string
}

export interface RawAgent {
  name: string
  agency_name: string
  phone?: string
  email?: string
  suburb?: string
  website?: string
  dataset_key?: string
  dataset_label?: string
  location?: string
}

export type ActivityType = 'email_sent' | 'followup_sent' | 'reply_received' | 'call_made' | 'note'

export interface Activity {
  id: string
  lead_id: string
  type: ActivityType
  subject?: string
  content?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export interface EmailPromptVersion {
  id: string
  name: string
  user_prompt_template: string
  system_prompt: string
  is_active: boolean
  notes?: string | null
  created_at: string
  updated_at: string
  activated_at: string
}
