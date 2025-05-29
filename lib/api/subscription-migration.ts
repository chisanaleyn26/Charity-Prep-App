'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Subscription provider migration utilities
 * Handles transition from Paddle to Stripe while maintaining compatibility
 */

export interface SubscriptionStatus {
  hasActiveSubscription: boolean
  provider: 'stripe' | 'paddle' | null
  tier: string
  status: string
  requiresMigration: boolean
  subscriptionId?: string
  customerId?: string
}

/**
 * Check subscription status across all providers
 */
export async function checkSubscriptionStatus(organizationId: string): Promise<SubscriptionStatus> {
  const supabase = await createClient()
  
  // Check for active Stripe subscription (new system)
  const { data: stripeSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('provider', 'stripe')
    .in('status', ['active', 'trialing'])
    .single()

  if (stripeSubscription) {
    return {
      hasActiveSubscription: true,
      provider: 'stripe',
      tier: stripeSubscription.tier || 'starter',
      status: stripeSubscription.status,
      requiresMigration: false,
      subscriptionId: stripeSubscription.stripe_subscription_id,
      customerId: stripeSubscription.stripe_customer_id
    }
  }

  // Check for active Paddle subscription (legacy system)
  const { data: paddleSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('provider', 'paddle')
    .eq('status', 'active')
    .single()

  if (paddleSubscription) {
    return {
      hasActiveSubscription: true,
      provider: 'paddle',
      tier: paddleSubscription.tier || 'starter',
      status: paddleSubscription.status,
      requiresMigration: true, // Paddle subscriptions need migration
      subscriptionId: paddleSubscription.paddle_subscription_id
    }
  }

  // No active subscription
  return {
    hasActiveSubscription: false,
    provider: null,
    tier: 'free',
    status: 'none',
    requiresMigration: false
  }
}

/**
 * Map Paddle plan to Stripe tier
 */
function mapPaddleToStripeTier(paddlePlanId?: string): string {
  // Map based on Paddle plan IDs or names
  const paddleToStripe: Record<string, string> = {
    'basic': 'starter',
    'pro': 'professional',
    'enterprise': 'enterprise',
    // Add actual Paddle plan IDs here
  }
  
  return paddleToStripe[paddlePlanId || ''] || 'starter'
}

/**
 * Create migration record for Paddle to Stripe transition
 */
export async function createMigrationRecord(
  organizationId: string,
  paddleSubscriptionId: string,
  stripeCustomerId: string
) {
  const supabase = await createClient()
  
  // Store migration record for audit trail
  const { error } = await supabase
    .from('subscription_migrations')
    .insert({
      organization_id: organizationId,
      from_provider: 'paddle',
      to_provider: 'stripe',
      from_subscription_id: paddleSubscriptionId,
      to_customer_id: stripeCustomerId,
      migrated_at: new Date().toISOString(),
      status: 'pending'
    })

  if (error) {
    console.error('Failed to create migration record:', error)
    throw error
  }
}

/**
 * Mark Paddle subscription as migrated
 */
export async function markPaddleSubscriptionMigrated(
  organizationId: string,
  paddleSubscriptionId: string
) {
  const supabase = await createClient()
  
  // Update Paddle subscription status
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'migrated',
      migrated_to_stripe_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('organization_id', organizationId)
    .eq('paddle_subscription_id', paddleSubscriptionId)
    .eq('provider', 'paddle')

  if (error) {
    console.error('Failed to mark Paddle subscription as migrated:', error)
    throw error
  }
}

/**
 * Get subscription features based on tier
 */
export async function getSubscriptionFeatures(tier: string): Promise<string[]> {
  const features: Record<string, string[]> = {
    free: [
      'Basic compliance tracking',
      'Up to 3 team members',
      'Limited document storage (100MB)',
      'Email support'
    ],
    starter: [
      'Full compliance suite',
      'Up to 10 team members',
      '10GB document storage',
      'Priority email support',
      'Basic reporting',
      'Calendar integration',
      'Deadline reminders'
    ],
    professional: [
      'Everything in Starter',
      'Unlimited team members',
      'Unlimited document storage',
      'Phone & email support',
      'Advanced reporting & analytics',
      'API access',
      'Custom integrations',
      'AI-powered insights',
      'Bulk operations',
      'Custom fields'
    ],
    enterprise: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom training',
      'SLA guarantees',
      'Custom contracts',
      'White-label options',
      'Advanced security features',
      'Audit logs',
      'SSO/SAML'
    ]
  }
  
  return features[tier] || features.free
}

/**
 * Check if feature is available in tier
 */
export async function isFeatureAvailable(tier: string, feature: string): Promise<boolean> {
  const tierFeatures: Record<string, string[]> = {
    free: ['basic_compliance', 'manual_entry', 'basic_reports'],
    starter: [
      'basic_compliance', 'manual_entry', 'basic_reports',
      'full_compliance', 'document_upload', 'team_collaboration',
      'calendar', 'reminders', 'basic_export'
    ],
    professional: [
      'basic_compliance', 'manual_entry', 'basic_reports',
      'full_compliance', 'document_upload', 'team_collaboration',
      'calendar', 'reminders', 'basic_export',
      'ai_features', 'advanced_reports', 'api_access',
      'bulk_operations', 'custom_fields', 'integrations'
    ],
    enterprise: [
      // All features
      'all'
    ]
  }
  
  const features = tierFeatures[tier] || tierFeatures.free
  return features.includes('all') || features.includes(feature)
}

/**
 * Get usage limits for tier
 */
export async function getTierLimits(tier: string) {
  const limits: Record<string, any> = {
    free: {
      users: 3,
      storage: 100 * 1024 * 1024, // 100MB in bytes
      aiRequests: 0,
      exports: 5,
      documents: 50
    },
    starter: {
      users: 10,
      storage: 10 * 1024 * 1024 * 1024, // 10GB in bytes
      aiRequests: 100,
      exports: 50,
      documents: 1000
    },
    professional: {
      users: -1, // Unlimited
      storage: -1, // Unlimited
      aiRequests: 1000,
      exports: -1, // Unlimited
      documents: -1 // Unlimited
    },
    enterprise: {
      users: -1,
      storage: -1,
      aiRequests: -1,
      exports: -1,
      documents: -1
    }
  }
  
  return limits[tier] || limits.free
}