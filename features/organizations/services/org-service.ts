'use client'

import { createClient } from '@/lib/supabase/client'
import type { Organization, OrganizationMember, User } from '@/lib/types/app.types'

/**
 * Client-side organization service for multi-org functionality
 */

/**
 * Get organization details by ID
 */
export async function getOrganization(organizationId: string): Promise<Organization | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    if (error) {
      console.error('Error fetching organization:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getOrganization:', error)
    return null
  }
}

/**
 * Get organizations for a specific user
 */
export async function getUserOrganizations(userId: string): Promise<OrganizationMember[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user organizations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserOrganizations:', error)
    return []
  }
}

/**
 * Get organization members with user details
 */
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        user:users(*),
        invited_by_user:users!organization_members_invited_by_fkey(email, full_name)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching organization members:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getOrganizationMembers:', error)
    return []
  }
}

/**
 * Check if user can access organization
 */
export async function canUserAccessOrganization(userId: string, organizationId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select('id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in canUserAccessOrganization:', error)
    return false
  }
}

/**
 * Get user role in organization
 */
export async function getUserRoleInOrganization(userId: string, organizationId: string): Promise<string | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()

    if (error) {
      return null
    }

    return data?.role || null
  } catch (error) {
    console.error('Error in getUserRoleInOrganization:', error)
    return null
  }
}

/**
 * Get organizations where user is admin
 */
export async function getAdvisedOrganizations(userId: string): Promise<OrganizationMember[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching advised organizations:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAdvisedOrganizations:', error)
    return []
  }
}

/**
 * Subscribe to organization changes for real-time updates
 */
export function subscribeToOrganizationChanges(
  organizationId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()
  
  return supabase
    .channel(`organization:${organizationId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'organizations',
        filter: `id=eq.${organizationId}`,
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'organization_members',
        filter: `organization_id=eq.${organizationId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * Initialize organization context for authenticated user
 */
export async function initializeUserContext(user: User): Promise<{
  organizations: OrganizationMember[]
  defaultOrganization: Organization | null
}> {
  try {
    // Get user's organizations
    const organizations = await getUserOrganizations(user.id)
    
    // Get default organization (first one user is admin/owner of, or first available)
    let defaultOrganization: Organization | null = null
    
    if (organizations.length > 0) {
      // Prioritize organizations where user is admin
      const adminOrgs = organizations.filter(org => 
        org.role === 'admin'
      )
      
      const targetOrg = adminOrgs.length > 0 ? adminOrgs[0] : organizations[0]
      defaultOrganization = await getOrganization(targetOrg.organization_id)
    }
    
    return {
      organizations,
      defaultOrganization
    }
  } catch (error) {
    console.error('Error in initializeUserContext:', error)
    return {
      organizations: [],
      defaultOrganization: null
    }
  }
}

/**
 * Get organization statistics for advisor dashboard
 */
export async function getOrganizationStats(organizationId: string) {
  try {
    const supabase = createClient()
    
    // Get basic org info
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()

    // Get member count
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    // Get compliance scores (simplified)
    const { data: safeguardingCount } = await supabase
      .from('safeguarding_records')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    const { data: overseasCount } = await supabase
      .from('overseas_activities')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    return {
      organization: org,
      memberCount: memberCount || 0,
      safeguardingRecords: safeguardingCount || 0,
      overseasActivities: overseasCount || 0,
    }
  } catch (error) {
    console.error('Error in getOrganizationStats:', error)
    return null
  }
}