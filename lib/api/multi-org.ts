'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from './utils'

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  joined_at: string
  organizations?: {
    id: string
    name: string
    charity_number?: string
    subscription_tier: string
  }
  users?: {
    id: string
    email: string
    full_name?: string
  }
}

export interface OrganizationInvite {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  token: string
  expires_at: string
  created_by: string
  accepted_at?: string
}

/**
 * Get user's organizations
 */
export async function getUserOrganizations(
  userId?: string
): Promise<{ organizations?: OrganizationMember[]; error?: string }> {
  try {
    const supabase = await createClient()
    const targetUserId = userId || (await requireAuth()).id
    
    const { data: memberships, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        organizations (
          id,
          name,
          charity_number,
          subscription_tier,
          created_at
        )
      `)
      .eq('user_id', targetUserId)
      .order('joined_at', { ascending: false })
    
    if (error) throw error
    
    return { organizations: memberships || [] }
    
  } catch (error) {
    console.error('Get user organizations error:', error)
    return { error: 'Failed to get organizations' }
  }
}

/**
 * Switch active organization
 */
export async function switchOrganization(
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Verify user has access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership) {
      return { error: 'You do not have access to this organization' }
    }
    
    // Update user's active organization
    const { error } = await supabase
      .from('users')
      .update({ active_organization_id: organizationId })
      .eq('id', user.id)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Switch organization error:', error)
    return { error: 'Failed to switch organization' }
  }
}

/**
 * Create organization invite
 */
export async function createInvite(
  organizationId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer'
): Promise<{ invite?: OrganizationInvite; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check user has permission
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { error: 'You do not have permission to invite users' }
    }
    
    // Check if user already exists
    const { data: existingMember } = await supabase
      .from('organization_members')
      .select('*, users!inner(email)')
      .eq('organization_id', organizationId)
      .eq('users.email', email)
      .single()
    
    if (existingMember) {
      return { error: 'User is already a member of this organization' }
    }
    
    // Generate invite token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDays(expiresAt.getDate() + 7) // 7 day expiry
    
    // Create invite
    const { data: invite, error } = await supabase
      .from('organization_invites')
      .insert({
        organization_id: organizationId,
        email,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        created_by: user.id
      })
      .select()
      .single()
    
    if (error) throw error
    
    // TODO: Send invite email
    
    return { invite }
    
  } catch (error) {
    console.error('Create invite error:', error)
    return { error: 'Failed to create invite' }
  }
}

/**
 * Accept organization invite
 */
export async function acceptInvite(
  token: string
): Promise<{ organizationId?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Get invite
    const { data: invite } = await supabase
      .from('organization_invites')
      .select('*')
      .eq('token', token)
      .single()
    
    if (!invite) {
      return { error: 'Invalid invite token' }
    }
    
    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
      return { error: 'Invite has expired' }
    }
    
    // Check if already accepted
    if (invite.accepted_at) {
      return { error: 'Invite has already been accepted' }
    }
    
    // Check email matches
    const { data: userData } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()
    
    if (userData?.email !== invite.email) {
      return { error: 'Invite is for a different email address' }
    }
    
    // Add user to organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: invite.organization_id,
        user_id: user.id,
        role: invite.role,
        joined_at: new Date().toISOString()
      })
    
    if (memberError) throw memberError
    
    // Mark invite as accepted
    await supabase
      .from('organization_invites')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invite.id)
    
    return { organizationId: invite.organization_id }
    
  } catch (error) {
    console.error('Accept invite error:', error)
    return { error: 'Failed to accept invite' }
  }
}

/**
 * Get organization members
 */
export async function getOrganizationMembers(
  organizationId: string
): Promise<{ members?: OrganizationMember[]; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check user has access
    const { data: membership } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership) {
      return { error: 'You do not have access to this organization' }
    }
    
    // Get members
    const { data: members, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('organization_id', organizationId)
      .order('joined_at', { ascending: true })
    
    if (error) throw error
    
    return { members: members || [] }
    
  } catch (error) {
    console.error('Get organization members error:', error)
    return { error: 'Failed to get members' }
  }
}

/**
 * Update member role
 */
export async function updateMemberRole(
  organizationId: string,
  memberId: string,
  newRole: 'admin' | 'member' | 'viewer'
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check user has permission
    const { data: userMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return { error: 'You do not have permission to update member roles' }
    }
    
    // Check target member
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('id', memberId)
      .single()
    
    if (!targetMember) {
      return { error: 'Member not found' }
    }
    
    // Cannot change owner role
    if (targetMember.role === 'owner') {
      return { error: 'Cannot change owner role' }
    }
    
    // Update role
    const { error } = await supabase
      .from('organization_members')
      .update({ role: newRole })
      .eq('id', memberId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Update member role error:', error)
    return { error: 'Failed to update member role' }
  }
}

/**
 * Remove member from organization
 */
export async function removeMember(
  organizationId: string,
  memberId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check user has permission
    const { data: userMembership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!userMembership || !['owner', 'admin'].includes(userMembership.role)) {
      return { error: 'You do not have permission to remove members' }
    }
    
    // Check target member
    const { data: targetMember } = await supabase
      .from('organization_members')
      .select('role, user_id')
      .eq('organization_id', organizationId)
      .eq('id', memberId)
      .single()
    
    if (!targetMember) {
      return { error: 'Member not found' }
    }
    
    // Cannot remove owner
    if (targetMember.role === 'owner') {
      return { error: 'Cannot remove organization owner' }
    }
    
    // Cannot remove self
    if (targetMember.user_id === user.id) {
      return { error: 'Cannot remove yourself from the organization' }
    }
    
    // Remove member
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('id', memberId)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Remove member error:', error)
    return { error: 'Failed to remove member' }
  }
}

/**
 * Leave organization
 */
export async function leaveOrganization(
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check membership
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership) {
      return { error: 'You are not a member of this organization' }
    }
    
    // Cannot leave if owner
    if (membership.role === 'owner') {
      return { error: 'Organization owner cannot leave. Transfer ownership first.' }
    }
    
    // Remove membership
    const { error } = await supabase
      .from('organization_members')
      .delete()
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
    
    if (error) throw error
    
    // Update active organization if needed
    const { data: userData } = await supabase
      .from('users')
      .select('active_organization_id')
      .eq('id', user.id)
      .single()
    
    if (userData?.active_organization_id === organizationId) {
      // Switch to another organization
      const { data: otherOrgs } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      
      if (otherOrgs) {
        await supabase
          .from('users')
          .update({ active_organization_id: otherOrgs.organization_id })
          .eq('id', user.id)
      }
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Leave organization error:', error)
    return { error: 'Failed to leave organization' }
  }
}

/**
 * Transfer organization ownership
 */
export async function transferOwnership(
  organizationId: string,
  newOwnerId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check current user is owner
    const { data: currentOwnership } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single()
    
    if (!currentOwnership) {
      return { error: 'Only the owner can transfer ownership' }
    }
    
    // Check new owner is member
    const { data: newOwnerMembership } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('user_id', newOwnerId)
      .single()
    
    if (!newOwnerMembership) {
      return { error: 'New owner must be a member of the organization' }
    }
    
    // Transfer ownership
    await supabase.rpc('transfer_organization_ownership', {
      p_organization_id: organizationId,
      p_new_owner_id: newOwnerId,
      p_current_owner_id: user.id
    })
    
    return { success: true }
    
  } catch (error) {
    console.error('Transfer ownership error:', error)
    return { error: 'Failed to transfer ownership' }
  }
}