import { createClient } from '@/lib/supabase/client'

/**
 * Simple version of team management service for debugging
 */

export async function getTeamMembersSimple(organizationId: string) {
  const supabase = createClient()
  
  // First get organization members
  const { data: members, error: membersError } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)
  
  if (membersError) {
    console.error('Error fetching members:', membersError)
    return []
  }
  
  if (!members || members.length === 0) {
    console.log('No members found for organization:', organizationId)
    return []
  }
  
  // Get user details separately
  const userIds = members.map(m => m.user_id)
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds)
  
  if (usersError) {
    console.error('Error fetching users:', usersError)
    return []
  }
  
  // Combine the data
  const membersWithUsers = members.map(member => {
    const user = users?.find(u => u.id === member.user_id)
    return {
      ...member,
      user: user || {
        id: member.user_id,
        email: 'Unknown',
        full_name: null,
        avatar_url: null
      }
    }
  })
  
  return membersWithUsers.filter(m => m.accepted_at !== null)
}

export async function getInvitationsSimple(organizationId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching invitations:', error)
    return []
  }
  
  return data || []
}