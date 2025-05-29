import { createClient } from '@/lib/supabase/client'
import { createServiceClient } from '@/lib/supabase/admin'

export interface TeamMember {
  id: string
  user_id: string
  organization_id: string
  role: 'admin' | 'member' | 'viewer'
  invited_at: string
  accepted_at: string | null
  last_active_at: string | null
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface TeamStats {
  totalMembers: number
  activeMembers: number
  pendingInvitations: number
  membersByRole: {
    admin: number
    member: number
    viewer: number
  }
}

/**
 * Get all team members for an organization
 */
export async function getTeamMembers(organizationId: string): Promise<TeamMember[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      users!inner(
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching team members:', error)
    throw error
  }
  
  // Transform the data to match the expected format
  const members = (data || []).map(member => ({
    ...member,
    user: member.users
  }))
  
  // Filter out members without accepted_at
  const acceptedMembers = members.filter(member => member.accepted_at !== null)
  
  return acceptedMembers as unknown as TeamMember[]
}

/**
 * Get team statistics
 */
export async function getTeamStats(organizationId: string): Promise<TeamStats> {
  const supabase = createClient()
  
  // Get members
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select('role, last_active_at')
    .eq('organization_id', organizationId)
    .not('accepted_at', 'is', null)
  
  if (membersError) {
    throw membersError
  }
  
  // Get pending invitations
  const { count: pendingCount, error: inviteError } = await supabase
    .from('invitations')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
  
  if (inviteError) {
    throw inviteError
  }
  
  // Calculate stats
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const stats: TeamStats = {
    totalMembers: members.length,
    activeMembers: members.filter(m => 
      m.last_active_at && new Date(m.last_active_at) > thirtyDaysAgo
    ).length,
    pendingInvitations: pendingCount || 0,
    membersByRole: {
      admin: members.filter(m => m.role === 'admin').length,
      member: members.filter(m => m.role === 'member').length,
      viewer: members.filter(m => m.role === 'viewer').length
    }
  }
  
  return stats
}

/**
 * Update member role
 */
export async function updateMemberRole(
  organizationId: string,
  userId: string,
  newRole: 'admin' | 'member' | 'viewer',
  updatedBy: string
) {
  const supabase = createClient()
  
  // Check if trying to remove last admin
  if (newRole !== 'admin') {
    const { count, error: countError } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'admin')
      .neq('user_id', userId)
    
    if (countError) {
      throw countError
    }
    
    if (count === 0) {
      throw new Error('Cannot remove the last admin from the organization')
    }
  }
  
  // Update role
  const { error } = await supabase
    .from('organization_members')
    .update({ 
      role: newRole,
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
  
  if (error) {
    throw error
  }
  
  // Log audit event
  await logAuditEvent({
    organizationId,
    userId: updatedBy,
    action: 'member.role_changed',
    resourceType: 'organization_member',
    resourceId: userId,
    changes: { role: newRole }
  })
}

/**
 * Remove member from organization
 */
export async function removeMember(
  organizationId: string,
  userId: string,
  removedBy: string
) {
  const supabase = createClient()
  
  // Check if trying to remove last admin
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()
  
  if (member?.role === 'admin') {
    const { count, error: countError } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('role', 'admin')
      .neq('user_id', userId)
    
    if (countError) {
      throw countError
    }
    
    if (count === 0) {
      throw new Error('Cannot remove the last admin from the organization')
    }
  }
  
  // Remove member
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
  
  if (error) {
    throw error
  }
  
  // Log audit event
  await logAuditEvent({
    organizationId,
    userId: removedBy,
    action: 'member.removed',
    resourceType: 'organization_member',
    resourceId: userId
  })
}

/**
 * Log audit event
 */
export async function logAuditEvent(event: {
  organizationId: string
  userId: string
  action: string
  resourceType?: string
  resourceId?: string
  changes?: any
  ipAddress?: string
  userAgent?: string
}) {
  // Use service client to bypass RLS
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      organization_id: event.organizationId,
      user_id: event.userId,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      changes: event.changes,
      ip_address: event.ipAddress,
      user_agent: event.userAgent
    })
  
  if (error) {
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Track user activity
 */
export async function trackActivity(activity: {
  organizationId: string
  userId: string
  activityType: string
  resourceType?: string
  resourceId?: string
  metadata?: any
}) {
  // Use service client to bypass RLS
  const supabase = createServiceClient()
  
  const { error } = await supabase
    .from('user_activities')
    .insert({
      organization_id: activity.organizationId,
      user_id: activity.userId,
      activity_type: activity.activityType,
      resource_type: activity.resourceType,
      resource_id: activity.resourceId,
      metadata: activity.metadata
    })
  
  if (error) {
    console.error('Failed to track activity:', error)
  }
  
  // Update last active timestamp
  await supabase
    .from('organization_members')
    .update({ last_active_at: new Date().toISOString() })
    .eq('organization_id', activity.organizationId)
    .eq('user_id', activity.userId)
}