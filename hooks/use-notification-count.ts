'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { getUnreadNotificationCount } from '@/lib/api/notifications'
import { createClient } from '@/lib/supabase/client'

export function useNotificationCount() {
  const [count, setCount] = useState(0)
  const { currentOrganization } = useOrganization()

  // Load initial count
  useEffect(() => {
    if (!currentOrganization?.id) return

    const loadCount = async () => {
      const unreadCount = await getUnreadNotificationCount(currentOrganization.id)
      setCount(unreadCount)
    }

    loadCount()
  }, [currentOrganization?.id])

  // Set up real-time subscription
  useEffect(() => {
    if (!currentOrganization?.id) return

    const supabase = createClient()
    
    // Subscribe to notification changes
    const subscription = supabase
      .channel('notification-count')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `organization_id=eq.${currentOrganization.id}`
        },
        async () => {
          // Reload count when any notification changes
          const unreadCount = await getUnreadNotificationCount(currentOrganization.id)
          setCount(unreadCount)
        }
      )
      .subscribe()

    // Cleanup subscription
    return () => {
      subscription.unsubscribe()
    }
  }, [currentOrganization?.id])

  return count
}