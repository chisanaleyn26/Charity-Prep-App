import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export interface AuthFlowResult {
  isAuthenticated: boolean
  hasOrganization: boolean
  hasAcceptedMembership: boolean
  hasActiveSubscription: boolean
  redirectTo?: string
  user?: any
  organization?: any
  membership?: any
  subscription?: any
}

/**
 * Comprehensive auth flow service that checks:
 * 1. User authentication status
 * 2. User profile existence
 * 3. Organization membership (with accepted_at)
 * 4. Subscription status
 * 
 * Returns appropriate redirect paths based on user state
 */
export class AuthFlowService {
  private supabase: any

  constructor(supabase: any) {
    this.supabase = supabase
  }

  async checkAuthFlow(): Promise<AuthFlowResult> {
    const result: AuthFlowResult = {
      isAuthenticated: false,
      hasOrganization: false,
      hasAcceptedMembership: false,
      hasActiveSubscription: false
    }

    // Step 1: Check if user is authenticated
    const { data: { user }, error: authError } = await this.supabase.auth.getUser()
    
    if (authError || !user) {
      result.redirectTo = '/login'
      return result
    }

    result.isAuthenticated = true
    result.user = user

    // Step 2: Ensure user profile exists
    const { data: userProfile, error: profileError } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      // Create user profile if it doesn't exist
      await this.supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email!,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })
    }

    // Step 3: Check organization membership
    const { data: memberships, error: membershipError } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!membershipError && memberships && memberships.length > 0) {
      // Find membership with accepted_at
      const acceptedMembership = memberships.find((m: any) => m.accepted_at !== null)
      
      if (acceptedMembership && acceptedMembership.organization) {
        result.hasOrganization = true
        result.hasAcceptedMembership = true
        result.organization = acceptedMembership.organization
        result.membership = acceptedMembership

        // Step 4: Check subscription status
        const { data: subscription } = await this.supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', acceptedMembership.organization.id)
          .eq('status', 'active')
          .single()

        if (subscription) {
          result.hasActiveSubscription = true
          result.subscription = subscription
        }

        // User has organization - go to dashboard
        result.redirectTo = '/dashboard'
      } else {
        // User has membership but no accepted_at
        const pendingMembership = memberships[0]
        if (pendingMembership && pendingMembership.organization) {
          result.hasOrganization = true
          result.organization = pendingMembership.organization
          result.membership = pendingMembership
          // Still redirect to dashboard, but note membership not accepted
          result.redirectTo = '/dashboard'
        } else {
          // Membership exists but no organization - redirect to onboarding
          result.redirectTo = '/onboarding'
        }
      }
    } else {
      // No memberships at all - redirect to onboarding
      result.redirectTo = '/onboarding'
    }

    return result
  }

  /**
   * Get or create user organization
   * This ensures user always has an organization after auth
   */
  async ensureUserOrganization(userId: string): Promise<any> {
    // First check if user has any organization
    const { data: memberships } = await this.supabase
      .from('organization_members')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)

    if (memberships && memberships.length > 0 && memberships[0].organization) {
      // User has organization - ensure accepted_at is set
      if (!memberships[0].accepted_at) {
        await this.supabase
          .from('organization_members')
          .update({ accepted_at: new Date().toISOString() })
          .eq('id', memberships[0].id)
      }
      return memberships[0].organization
    }

    // No organization - user needs to go through onboarding
    return null
  }

  /**
   * Handle post-login redirect logic
   */
  async handlePostLoginRedirect(): Promise<string> {
    const authFlow = await this.checkAuthFlow()
    
    if (!authFlow.isAuthenticated) {
      return '/login'
    }

    if (!authFlow.hasOrganization) {
      return '/onboarding'
    }

    // User has organization - go to dashboard
    return '/dashboard'
  }
}

/**
 * Static helper to get auth flow from server components
 */
export async function getAuthFlow(): Promise<AuthFlowResult> {
  const supabase = await createClient()
  const service = new AuthFlowService(supabase)
  return service.checkAuthFlow()
}

/**
 * Static helper to ensure user has organization
 */
export async function ensureOrganization(userId: string): Promise<any> {
  const supabase = await createClient()
  const service = new AuthFlowService(supabase)
  return service.ensureUserOrganization(userId)
}

/**
 * Server action to handle redirect after login
 */
export async function redirectAfterLogin() {
  const supabase = await createClient()
  const service = new AuthFlowService(supabase)
  const redirectPath = await service.handlePostLoginRedirect()
  redirect(redirectPath)
}