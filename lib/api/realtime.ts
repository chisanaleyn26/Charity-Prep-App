'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Subscribe to real-time updates for an organization
 * This returns the configuration for client-side subscription
 */
export async function getRealtimeConfig(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify user has access to this organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { error: 'Access denied' }
  }

  // Return configuration for client-side subscription
  return {
    channels: [
      {
        name: `org:${organizationId}:notifications`,
        table: 'notifications',
        filter: `organization_id=eq.${organizationId}`,
        events: ['INSERT', 'UPDATE']
      },
      {
        name: `org:${organizationId}:safeguarding`,
        table: 'safeguarding_records',
        filter: `organization_id=eq.${organizationId}`,
        events: ['INSERT', 'UPDATE', 'DELETE']
      },
      {
        name: `org:${organizationId}:overseas`,
        table: 'overseas_activities',
        filter: `organization_id=eq.${organizationId}`,
        events: ['INSERT', 'UPDATE', 'DELETE']
      },
      {
        name: `org:${organizationId}:income`,
        table: 'income_records',
        filter: `organization_id=eq.${organizationId}`,
        events: ['INSERT', 'UPDATE', 'DELETE']
      }
    ]
  }
}

/**
 * Broadcast a custom event to organization members
 */
export async function broadcastOrgEvent(
  organizationId: string,
  event: string,
  payload: any
) {
  const supabase = await createClient()
  
  // Broadcast custom event
  const channel = supabase.channel(`org:${organizationId}:events`)
  
  await channel.send({
    type: 'broadcast',
    event,
    payload: {
      ...payload,
      timestamp: new Date().toISOString()
    }
  })
  
  return { success: true }
}

/**
 * Track user presence in organization
 */
export async function updateUserPresence(
  organizationId: string,
  status: 'online' | 'away' | 'offline'
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const channel = supabase.channel(`org:${organizationId}:presence`)
  
  await channel.track({
    user_id: user.id,
    status,
    last_seen: new Date().toISOString()
  })
  
  return { success: true }
}

/**
 * Get online users in organization
 */
export async function getOnlineUsers(organizationId: string) {
  const supabase = await createClient()
  
  // This would be implemented client-side
  // Server just validates access
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Unauthorized' }
  }
  
  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()
  
  if (!member) {
    return { error: 'Access denied' }
  }
  
  return { success: true }
}