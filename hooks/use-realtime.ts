'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

interface RealtimeConfig {
  channels: Array<{
    name: string
    table: string
    filter?: string
    events: Array<'INSERT' | 'UPDATE' | 'DELETE'>
  }>
}

interface UseRealtimeOptions {
  organizationId: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  onPresence?: (state: any) => void
  enabled?: boolean
}

export function useRealtime({
  organizationId,
  onInsert,
  onUpdate,
  onDelete,
  onPresence,
  enabled = true
}: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [channels, setChannels] = useState<RealtimeChannel[]>([])
  const supabase = createClient()

  const handleChange = useCallback((
    payload: RealtimePostgresChangesPayload<any>
  ) => {
    switch (payload.eventType) {
      case 'INSERT':
        onInsert?.(payload.new)
        break
      case 'UPDATE':
        onUpdate?.(payload.new)
        break
      case 'DELETE':
        onDelete?.(payload.old)
        break
    }
  }, [onInsert, onUpdate, onDelete])

  useEffect(() => {
    if (!enabled || !organizationId) return

    const setupChannels = async () => {
      try {
        // Set up database change subscriptions
        const notificationsChannel = supabase
          .channel(`org:${organizationId}:notifications`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `organization_id=eq.${organizationId}`
            },
            handleChange
          )

        const safeguardingChannel = supabase
          .channel(`org:${organizationId}:safeguarding`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'safeguarding_records',
              filter: `organization_id=eq.${organizationId}`
            },
            handleChange
          )

        const overseasChannel = supabase
          .channel(`org:${organizationId}:overseas`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'overseas_activities',
              filter: `organization_id=eq.${organizationId}`
            },
            handleChange
          )

        const incomeChannel = supabase
          .channel(`org:${organizationId}:income`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'income_records',
              filter: `organization_id=eq.${organizationId}`
            },
            handleChange
          )

        // Set up presence channel for online users
        const presenceChannel = supabase
          .channel(`org:${organizationId}:presence`)
          .on('presence', { event: 'sync' }, () => {
            const state = presenceChannel.presenceState()
            onPresence?.(state)
          })

        // Subscribe to all channels
        await Promise.all([
          notificationsChannel.subscribe(),
          safeguardingChannel.subscribe(),
          overseasChannel.subscribe(),
          incomeChannel.subscribe(),
          presenceChannel.subscribe()
        ])

        setChannels([
          notificationsChannel,
          safeguardingChannel,
          overseasChannel,
          incomeChannel,
          presenceChannel
        ])
        setIsConnected(true)
      } catch (error) {
        console.error('Failed to setup realtime channels:', error)
        setIsConnected(false)
      }
    }

    setupChannels()

    // Cleanup
    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
      setIsConnected(false)
    }
  }, [organizationId, enabled, supabase])

  return { isConnected, channels }
}

// Hook for tracking user presence
export function usePresence(organizationId: string) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({})
  const supabase = createClient()

  useEffect(() => {
    if (!organizationId) return

    const channel = supabase.channel(`org:${organizationId}:presence`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        setOnlineUsers(state)
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        setOnlineUsers(prev => ({ ...prev, [key]: newPresences }))
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => {
          const updated = { ...prev }
          delete updated[key]
          return updated
        })
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user's presence
          const { data: { user } } = await supabase.auth.getUser()
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
              user_agent: navigator.userAgent
            })
          }
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [organizationId, supabase])

  return { onlineUsers }
}

// Hook for broadcasting custom events
export function useBroadcast(organizationId: string) {
  const supabase = createClient()
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!organizationId) return

    const broadcastChannel = supabase.channel(`org:${organizationId}:events`)
    broadcastChannel.subscribe()
    setChannel(broadcastChannel)

    return () => {
      supabase.removeChannel(broadcastChannel)
    }
  }, [organizationId, supabase])

  const broadcast = useCallback(async (event: string, payload: any) => {
    if (!channel) return

    await channel.send({
      type: 'broadcast',
      event,
      payload: {
        ...payload,
        timestamp: new Date().toISOString()
      }
    })
  }, [channel])

  const onBroadcast = useCallback((event: string, callback: (payload: any) => void) => {
    if (!channel) return () => {}

    channel.on('broadcast', { event }, callback)
    
    return () => {
      channel.unsubscribe()
    }
  }, [channel])

  return { broadcast, onBroadcast }
}