import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { User } from '@supabase/supabase-js'

export interface AuthFlowResult {
  user: User
  organizations: UserOrganization[]
  currentOrganization: UserOrganization | null
  subscription: SubscriptionInfo | null
  requiresOnboarding: boolean
  requiresOrgSelection: boolean
}

export interface UserOrganization {
  id: string
  name: string
  charity_number: string | null
  role: 'admin' | 'member' | 'viewer'
  is_preferred: boolean
  is_last_active: boolean
  subscription: SubscriptionInfo | null
}

export interface SubscriptionInfo {
  id: string
  tier: 'essentials' | 'standard' | 'premium'
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  payment_provider: 'paddle' | 'stripe'
  trial_ends_at: string | null
  current_period_end: string
  has_active_subscription: boolean
}

export class AuthFlowService {
  /**
   * Main auth flow check - determines where user should go
   */
  static async checkAuthFlow(): Promise<AuthFlowResult> {
    const supabase = createServerClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect('/login')
    }

    // Get all user's organizations with subscription info
    const { data: userOrgs, error } = await supabase
      .from('user_organizations_with_subscription')
      .select('*')
      .eq('user_id', user.id)
      .order('accepted_at', { ascending: false })

    if (error) {
      console.error('Error fetching user organizations:', error)
      throw new Error('Failed to fetch user organizations')
    }

    // Check if user has any organizations
    if (!userOrgs || userOrgs.length === 0) {
      return {
        user,
        organizations: [],
        currentOrganization: null,
        subscription: null,
        requiresOnboarding: true,
        requiresOrgSelection: false
      }
    }

    // Get user's preferences
    const { data: userProfile } = await supabase
      .from('users')
      .select('preferred_organization_id, last_active_organization_id')
      .eq('id', user.id)
      .single()

    // Transform organizations
    const organizations: UserOrganization[] = userOrgs.map(org => ({
      id: org.organization_id,
      name: org.organization_name,
      charity_number: org.charity_number,
      role: org.role,
      is_preferred: org.organization_id === userProfile?.preferred_organization_id,
      is_last_active: org.organization_id === userProfile?.last_active_organization_id,
      subscription: org.subscription_id ? {
        id: org.subscription_id,
        tier: org.subscription_tier,
        status: org.subscription_status,
        payment_provider: org.payment_provider || 'paddle',
        trial_ends_at: org.trial_ends_at,
        current_period_end: org.current_period_end,
        has_active_subscription: org.has_active_subscription
      } : null
    }))

    // Determine current organization
    let currentOrganization: UserOrganization | null = null

    // Priority order:
    // 1. Preferred organization
    // 2. Last active organization  
    // 3. Organization with active subscription
    // 4. Most recently created organization

    currentOrganization = organizations.find(org => org.is_preferred) || null

    if (!currentOrganization) {
      currentOrganization = organizations.find(org => org.is_last_active) || null
    }

    if (!currentOrganization) {
      currentOrganization = organizations.find(org => 
        org.subscription?.has_active_subscription
      ) || null
    }

    if (!currentOrganization) {
      currentOrganization = organizations[0] // Most recent
    }

    return {
      user,
      organizations,
      currentOrganization,
      subscription: currentOrganization?.subscription || null,
      requiresOnboarding: false,
      requiresOrgSelection: organizations.length > 1 && !userProfile?.preferred_organization_id
    }
  }

  /**
   * Update user's last active organization
   */
  static async updateLastActiveOrganization(userId: string, organizationId: string) {
    const supabase = createServerClient()
    
    await supabase
      .from('users')
      .update({ 
        last_active_organization_id: organizationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }

  /**
   * Set user's preferred organization
   */
  static async setPreferredOrganization(userId: string, organizationId: string) {
    const supabase = createServerClient()
    
    await supabase
      .from('users')
      .update({ 
        preferred_organization_id: organizationId,
        last_active_organization_id: organizationId,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
  }

  /**
   * Check if user has access to specific features based on subscription
   */
  static canAccessFeature(
    subscription: SubscriptionInfo | null, 
    feature: string
  ): boolean {
    // No subscription = trial/limited access
    if (!subscription || !subscription.has_active_subscription) {
      return this.isTrialFeature(feature)
    }

    // Check feature availability by tier
    const tierFeatures = {
      essentials: [
        'compliance_tracking',
        'basic_reporting',
        'document_upload',
        'email_support'
      ],
      standard: [
        'compliance_tracking',
        'basic_reporting',
        'advanced_reporting',
        'document_upload',
        'ai_import',
        'email_support',
        'advisor_portal'
      ],
      premium: [
        'compliance_tracking',
        'basic_reporting',
        'advanced_reporting',
        'document_upload',
        'ai_import',
        'ai_chat',
        'api_access',
        'phone_support',
        'advisor_portal',
        'custom_branding'
      ]
    }

    const allowedFeatures = tierFeatures[subscription.tier] || []
    return allowedFeatures.includes(feature)
  }

  /**
   * Features available during trial
   */
  static isTrialFeature(feature: string): boolean {
    const trialFeatures = [
      'compliance_tracking',
      'basic_reporting',
      'document_upload'
    ]
    return trialFeatures.includes(feature)
  }

  /**
   * Get subscription limits by tier
   */
  static getSubscriptionLimits(tier: string) {
    const limits = {
      essentials: {
        users: 2,
        storage_mb: 100,
        documents_per_month: 50,
        api_calls_per_month: 0
      },
      standard: {
        users: 5,
        storage_mb: 1000,
        documents_per_month: 500,
        api_calls_per_month: 0
      },
      premium: {
        users: 20,
        storage_mb: 10000,
        documents_per_month: -1, // unlimited
        api_calls_per_month: 10000
      },
      trial: {
        users: 2,
        storage_mb: 50,
        documents_per_month: 20,
        api_calls_per_month: 0
      }
    }

    return limits[tier as keyof typeof limits] || limits.trial
  }
}