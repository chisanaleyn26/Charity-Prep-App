import { createClient } from '@/lib/supabase/client'
import { createServerClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

export interface Invitation {
  id: string
  organization_id: string
  email: string
  role: 'admin' | 'member' | 'viewer'
  invited_by: string
  invitation_token: string
  expires_at: string
  accepted_at: string | null
  accepted_by: string | null
  created_at: string
  updated_at: string
}

export interface InvitationWithInviter extends Invitation {
  inviter: {
    email: string
    full_name: string | null
  }
  organization: {
    name: string
  }
}

/**
 * Generate a secure invitation token
 */
export function generateInvitationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create and send an invitation
 */
export async function createInvitation(
  organizationId: string,
  email: string,
  role: 'admin' | 'member' | 'viewer',
  invitedBy: string,
  supabase?: SupabaseClient<Database>
) {
  // Use provided client or create a new one
  if (!supabase) {
    supabase = createClient()
  }
  
  // Check if user already exists in organization
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', (
      await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single()
    ).data?.id)
    .single()
  
  if (existingMember) {
    throw new Error('User is already a member of this organization')
  }
  
  // Check for existing pending invitation
  const { data: existingInvite } = await supabase
    .from('invitations')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('email', email)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (existingInvite) {
    throw new Error('An invitation has already been sent to this email')
  }
  
  // Create invitation
  const token = generateInvitationToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiration
  
  const { data: invitation, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email: email.toLowerCase(),
      role,
      invited_by: invitedBy,
      invitation_token: token,
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return invitation
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(token: string): Promise<InvitationWithInviter | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      inviter:invited_by(email, full_name),
      organization:organizations(name)
    `)
    .eq('invitation_token', token)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data as unknown as InvitationWithInviter
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string, userId: string) {
  const supabase = await createServerClient()
  
  // Get invitation
  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('invitation_token', token)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()
  
  if (inviteError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }
  
  // Start transaction
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
      invited_at: invitation.created_at,
      accepted_at: new Date().toISOString()
    })
  
  if (memberError) {
    // Check if already a member
    if (memberError.code === '23505') {
      throw new Error('You are already a member of this organization')
    }
    throw memberError
  }
  
  // Mark invitation as accepted
  const { error: updateError } = await supabase
    .from('invitations')
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: userId
    })
    .eq('id', invitation.id)
  
  if (updateError) {
    throw updateError
  }
  
  return invitation
}

/**
 * List invitations for an organization
 */
export async function listInvitations(organizationId: string, supabase?: SupabaseClient<Database>) {
  if (!supabase) {
    supabase = createClient()
  }
  
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      *,
      inviter:invited_by(email, full_name)
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    throw error
  }
  
  return data
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)
    .is('accepted_at', null)
  
  if (error) {
    throw error
  }
}

/**
 * Resend an invitation (generates new token)
 */
export async function resendInvitation(invitationId: string) {
  const supabase = createClient()
  
  const token = generateInvitationToken()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)
  
  const { data, error } = await supabase
    .from('invitations')
    .update({
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', invitationId)
    .is('accepted_at', null)
    .select()
    .single()
  
  if (error) {
    throw error
  }
  
  return data
}