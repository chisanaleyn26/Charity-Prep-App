'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User, Organization, OrganizationMember } from '@/lib/types/app.types'

interface AuthFlowResult {
  user: User | null
  organizations: OrganizationMember[]
  currentOrganization: Organization | null
  needsOnboarding: boolean
  hasSubscription: boolean
  subscription: {
    tier: string | null
    price_id: string | null
    status: string | null
  } | null
}

/**
 * Comprehensive auth flow that handles all edge cases
 */
export async function checkAuthFlow(): Promise<AuthFlowResult> {
  const supabase = await createClient()
  
  // 1. Check if user is authenticated
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  if (!authUser) {
    return {
      user: null,
      organizations: [],
      currentOrganization: null,
      needsOnboarding: false,
      hasSubscription: false,
      subscription: null
    }
  }

  // 2. Get full user profile
  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    // User exists in auth but not in users table - needs onboarding
    return {
      user: null,
      organizations: [],
      currentOrganization: null,
      needsOnboarding: true,
      hasSubscription: false,
      subscription: null
    }
  }

  // 3. Get all user's organizations with accepted invitations
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(*)
    `)
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .order('created_at', { ascending: false })

  const organizations = memberships || []

  // 4. Determine current organization
  let currentOrganization: Organization | null = null
  
  if (organizations.length === 0) {
    // No organizations - needs onboarding
    return {
      user,
      organizations: [],
      currentOrganization: null,
      needsOnboarding: true,
      hasSubscription: false,
      subscription: null
    }
  }

  // 5. Get the user's organization (first one, since we don't support multiple)
  const membership = organizations[0]
  currentOrganization = membership.organization

  // 6. Check subscription status for current organization
  let hasSubscription = false
  let subscription = null
  
  if (currentOrganization) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .in('status', ['active', 'trialing'])
      .single()

    subscription = sub
    
    // Check if subscription is valid (active or in trial period)
    if (sub) {
      if (sub.status === 'active') {
        hasSubscription = true
      } else if (sub.status === 'trialing' && sub.trial_ends_at) {
        // Check if trial is still valid
        const trialEndDate = new Date(sub.trial_ends_at)
        hasSubscription = trialEndDate > new Date()
      }
    }
  }

  return {
    user,
    organizations,
    currentOrganization,
    needsOnboarding: false,
    hasSubscription,
    subscription: subscription ? {
      tier: subscription.tier,
      price_id: subscription.price_id,
      status: subscription.status
    } : null
  }
}

/**
 * Get user's organizations with detailed information
 */
export async function getUserOrganizationsWithDetails(userId: string) {
  const supabase = await createClient()
  
  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      *,
      organization:organizations(
        *,
        subscriptions(*)
      )
    `)
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .order('created_at', { ascending: false })

  if (!memberships) return []

  // Process memberships to include subscription status
  return memberships.map(membership => ({
    ...membership,
    organization: {
      ...membership.organization,
      hasActiveSubscription: membership.organization.subscriptions?.some(
        (sub: any) => sub.status === 'active'
      ) || false
    }
  }))
}

/**
 * Handle post-authentication redirect
 */
export async function handleAuthRedirect(path?: string): Promise<string> {
  const authFlow = await checkAuthFlow()

  if (!authFlow.user) {
    return '/login'
  }

  if (authFlow.needsOnboarding) {
    return '/onboarding'
  }

  // If user has organizations but no subscription, might redirect to billing
  if (authFlow.currentOrganization && !authFlow.hasSubscription) {
    // For now, allow access but they might see upgrade prompts
    console.log('User has no active subscription')
  }

  // Return requested path or dashboard
  return path || '/dashboard'
}

/**
 * Create first organization during onboarding
 */
export async function createFirstOrganization(
  userId: string,
  organizationData: {
    name: string
    charity_number?: string
    website?: string
  }
) {
  const supabase = await createClient()
  
  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: organizationData.name,
      charity_number: organizationData.charity_number,
      website: organizationData.website,
    })
    .select()
    .single()

  if (orgError) {
    console.error('Failed to create organization:', orgError)
    throw orgError
  }

  // Add user as admin member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: org.id,
      user_id: userId,
      role: 'admin',
      invited_by: userId,
      accepted_at: new Date().toISOString()
    })

  if (memberError) {
    console.error('Failed to add user to organization:', memberError)
    // Try to clean up
    await supabase.from('organizations').delete().eq('id', org.id)
    throw memberError
  }

  return org
}

/**
 * Switch to a different organization
 */
export async function switchOrganization(
  userId: string,
  organizationId: string
): Promise<boolean> {
  const supabase = await createClient()
  
  // Verify user has access to this organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('*')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .not('accepted_at', 'is', null)
    .single()

  if (!membership) {
    console.error('User does not have access to organization:', organizationId)
    return false
  }

  // Update last accessed timestamp (optional - for tracking)
  await supabase
    .from('organization_members')
    .update({ updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('organization_id', organizationId)

  return true
}