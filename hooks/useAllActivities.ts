'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Activity } from '@/types'

export function useAllActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('re_outreach_activities')
      .select('*')
      .order('created_at', { ascending: true })
    if (!error && data) setActivities(data as Activity[])
    setLoading(false)
  }, [])

  return { activities, loading, fetchAll }
}
