'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Activity, ActivityType } from '@/types'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchActivities = useCallback(async (leadId: string) => {
    setLoading(true)
    const { data, error } = await supabase
      .from('re_outreach_activities')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (!error && data) setActivities(data as Activity[])
    setLoading(false)
  }, [])

  const addActivity = useCallback(async (
    leadId: string,
    type: ActivityType,
    subject?: string,
    content?: string
  ) => {
    const { data, error } = await supabase
      .from('re_outreach_activities')
      .insert({ lead_id: leadId, type, subject, content })
      .select()
      .single()
    if (!error && data) {
      setActivities(prev => [data as Activity, ...prev])
    }
    return { data, error }
  }, [])

  return { activities, loading, fetchActivities, addActivity }
}
