import { createServerClient } from '@/lib/supabase/server'
import { 
  getStripeServer, 
  getSubscription as getStripeSubscription,
  updateSubscription as updateStripeSubscription,
  cancelSubscription as cancelStripeSubscription,
  STRIPE_PRODUCTS,
  type SubscriptionTier,
  type SubscriptionData,
  getTierFromPriceId,
  handleStripeError
} from '@/lib/payments/stripe'
import { z } from 'zod'

// Subscription status from our database
export const DatabaseSubscriptionSchema = z.object({
  id: z.string(),
  organization_id: z.string(),
  stripe_customer_id: z.string(),
  stripe_subscription_id: z.string(),
  tier: z.enum(['ESSENTIALS', 'STANDARD', 'PREMIUM']),
  status: z.enum(['active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid']),
  billing_cycle: z.enum(['monthly', 'yearly']),
  current_period_start: z.string().transform(str => new Date(str)),
  current_period_end: z.string().transform(str => new Date(str)),
  cancel_at_period_end: z.boolean(),
  created_at: z.string().transform(str => new Date(str)),
  updated_at: z.string().transform(str => new Date(str)),
  trial_end: z.string().transform(str => new Date(str)).nullable(),
  metadata: z.record(z.string()).nullable(),
})

export type DatabaseSubscription = z.infer<typeof DatabaseSubscriptionSchema>

// Usage tracking schema
export const UsageTrackingSchema = z.object({
  organization_id: z.string(),
  users_count: z.number(),
  storage_used: z.number(),
  ai_requests_count: z.number(),
  exports_count: z.number(),
  period_start: z.date(),
  period_end: z.date(),
  last_updated: z.date(),
})

export type UsageTracking = z.infer<typeof UsageTrackingSchema>

// Feature access result
export interface FeatureAccessResult {
  allowed: boolean
  reason?: string
  limit?: number
  current?: number
  upgradeRequired?: boolean
  gracePeriodEnd?: Date
}

// Subscription service class
export class SubscriptionService {
  private supabase = createServerClient()
  private stripe = getStripeServer()

  // Get subscription for organization
  async getSubscription(organizationId: string): Promise<DatabaseSubscription | null> {
    try {
      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null
        }
        throw error
      }

      return DatabaseSubscriptionSchema.parse(data)
    } catch (error) {
      console.error('Error fetching subscription:', error)
      return null
    }
  }

  // Get subscription with Stripe data
  async getSubscriptionWithStripeData(organizationId: string) {
    const subscription = await this.getSubscription(organizationId)
    if (!subscription) return null

    try {
      const stripeSubscription = await getStripeSubscription(subscription.stripe_subscription_id)
      return {
        ...subscription,
        stripe: stripeSubscription
      }
    } catch (error) {
      console.error('Error fetching Stripe subscription:', error)
      return subscription
    }
  }

  // Create or update subscription from Stripe webhook
  async upsertSubscription(stripeSubscription: any, customerId: string): Promise<void> {
    try {
      // Get organization from customer metadata or create one
      const customer = await this.stripe.customers.retrieve(customerId)
      
      if (!customer || customer.deleted) {
        throw new Error('Customer not found')
      }

      const organizationId = (customer.metadata as any)?.organization_id
      if (!organizationId) {
        throw new Error('Organization ID not found in customer metadata')
      }

      // Parse tier from price ID
      const priceId = stripeSubscription.items.data[0]?.price?.id
      const tierInfo = getTierFromPriceId(priceId)
      
      if (!tierInfo) {
        throw new Error(`Unknown price ID: ${priceId}`)
      }

      const subscriptionData = {
        organization_id: organizationId,
        stripe_customer_id: customerId,
        stripe_subscription_id: stripeSubscription.id,
        tier: tierInfo.tier,
        status: stripeSubscription.status,
        billing_cycle: tierInfo.cycle,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: stripeSubscription.cancel_at_period_end,
        trial_end: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000).toISOString() : null,
        metadata: stripeSubscription.metadata,
        updated_at: new Date().toISOString(),
      }

      const { error } = await this.supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'stripe_subscription_id'
        })

      if (error) {
        throw error
      }

      // Initialize usage tracking for new subscriptions
      if (stripeSubscription.status === 'active') {
        await this.initializeUsageTracking(organizationId)
      }

    } catch (error) {
      console.error('Error upserting subscription:', error)
      throw error
    }
  }

  // Initialize usage tracking
  async initializeUsageTracking(organizationId: string): Promise<void> {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    try {
      const { error } = await this.supabase
        .from('usage_tracking')
        .upsert({
          organization_id: organizationId,
          users_count: 0,
          storage_used: 0,
          ai_requests_count: 0,
          exports_count: 0,
          period_start: monthStart.toISOString(),
          period_end: monthEnd.toISOString(),
          last_updated: now.toISOString(),
        }, {
          onConflict: 'organization_id,period_start'
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error initializing usage tracking:', error)
    }
  }

  // Get current usage for organization
  async getUsage(organizationId: string): Promise<UsageTracking | null> {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const { data, error } = await this.supabase
        .from('usage_tracking')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('period_start', monthStart.toISOString().split('T')[0])
        .single()

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return null
        }
        throw error
      }

      return UsageTrackingSchema.parse({
        ...data,
        period_start: new Date(data.period_start),
        period_end: new Date(data.period_end),
        last_updated: new Date(data.last_updated),
      })
    } catch (error) {
      console.error('Error fetching usage:', error)
      return null
    }
  }

  // Update usage metrics
  async updateUsage(organizationId: string, updates: Partial<UsageTracking>): Promise<void> {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const { error } = await this.supabase
        .from('usage_tracking')
        .upsert({
          organization_id: organizationId,
          period_start: monthStart.toISOString(),
          last_updated: now.toISOString(),
          ...updates,
        }, {
          onConflict: 'organization_id,period_start'
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error updating usage:', error)
      throw error
    }
  }

  // Check feature access
  async checkFeatureAccess(organizationId: string, feature: string): Promise<FeatureAccessResult> {
    const subscription = await this.getSubscription(organizationId)
    
    // No subscription = free tier with basic features only
    if (!subscription) {
      const basicFeatures = ['basic_compliance', 'manual_entry']
      return {
        allowed: basicFeatures.includes(feature),
        reason: basicFeatures.includes(feature) ? undefined : 'Subscription required',
        upgradeRequired: !basicFeatures.includes(feature)
      }
    }

    // Check subscription status
    if (subscription.status !== 'active' && subscription.status !== 'trialing') {
      // Grace period check
      const gracePeriodEnd = new Date(subscription.current_period_end)
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7) // 7-day grace period

      if (new Date() > gracePeriodEnd) {
        return {
          allowed: false,
          reason: 'Subscription inactive',
          upgradeRequired: true
        }
      }

      return {
        allowed: true,
        reason: 'Grace period active',
        gracePeriodEnd
      }
    }

    const tierLimits = STRIPE_PRODUCTS[subscription.tier]
    
    // Check specific feature access
    switch (feature) {
      case 'ai_processing':
        if (subscription.tier === 'ESSENTIALS') {
          return {
            allowed: false,
            reason: 'AI processing requires Standard or Premium plan',
            upgradeRequired: true
          }
        }
        break

      case 'multi_charity':
        if (subscription.tier !== 'PREMIUM') {
          return {
            allowed: false,
            reason: 'Multi-charity support requires Premium plan',
            upgradeRequired: true
          }
        }
        break

      case 'advanced_reporting':
        if (subscription.tier === 'ESSENTIALS') {
          return {
            allowed: false,
            reason: 'Advanced reporting requires Standard or Premium plan',
            upgradeRequired: true
          }
        }
        break
    }

    return { allowed: true }
  }

  // Check usage limits
  async checkUsageLimit(organizationId: string, limitType: keyof UsageTracking): Promise<FeatureAccessResult> {
    const subscription = await this.getSubscription(organizationId)
    const usage = await this.getUsage(organizationId)

    if (!subscription) {
      return {
        allowed: false,
        reason: 'Subscription required',
        upgradeRequired: true
      }
    }

    if (!usage) {
      return { allowed: true } // No usage data means under limits
    }

    const tierLimits = STRIPE_PRODUCTS[subscription.tier].limits
    const limit = tierLimits[limitType as keyof typeof tierLimits] as number
    const current = usage[limitType] as number

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true }
    }

    const isAtLimit = current >= limit
    const isNearLimit = current >= limit * 0.8 // 80% of limit

    return {
      allowed: !isAtLimit,
      reason: isAtLimit ? `${limitType} limit exceeded` : isNearLimit ? `Approaching ${limitType} limit` : undefined,
      limit,
      current,
      upgradeRequired: isAtLimit
    }
  }

  // Increment usage counter
  async incrementUsage(organizationId: string, type: 'users' | 'ai_requests' | 'exports'): Promise<void> {
    try {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const columnMap = {
        users: 'users_count',
        ai_requests: 'ai_requests_count',
        exports: 'exports_count'
      }

      const column = columnMap[type]

      const { error } = await this.supabase.rpc('increment_usage', {
        org_id: organizationId,
        usage_type: column,
        period_start: monthStart.toISOString()
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error incrementing usage:', error)
      throw error
    }
  }

  // Update storage usage
  async updateStorageUsage(organizationId: string, bytesUsed: number): Promise<void> {
    try {
      await this.updateUsage(organizationId, {
        storage_used: bytesUsed
      })
    } catch (error) {
      console.error('Error updating storage usage:', error)
      throw error
    }
  }

  // Change subscription tier
  async changeSubscriptionTier(
    organizationId: string, 
    newTier: SubscriptionTier, 
    newCycle: 'monthly' | 'yearly'
  ): Promise<void> {
    const subscription = await this.getSubscription(organizationId)
    if (!subscription) {
      throw new Error('No active subscription found')
    }

    try {
      // Get new price ID
      const newPriceId = STRIPE_PRODUCTS[newTier].price[newCycle === 'monthly' ? 'monthly' : 'yearly']

      // Update Stripe subscription
      const stripeSubscription = await updateStripeSubscription(subscription.stripe_subscription_id, {
        items: [{
          id: subscription.stripe_subscription_id,
          price: newPriceId.toString()
        }],
        proration_behavior: 'create_prorations'
      })

      // Update local database
      await this.upsertSubscription(stripeSubscription, subscription.stripe_customer_id)

    } catch (error) {
      console.error('Error changing subscription tier:', error)
      throw handleStripeError(error)
    }
  }

  // Cancel subscription
  async cancelSubscription(organizationId: string, immediate = false): Promise<void> {
    const subscription = await this.getSubscription(organizationId)
    if (!subscription) {
      throw new Error('No active subscription found')
    }

    try {
      const stripeSubscription = await cancelStripeSubscription(
        subscription.stripe_subscription_id, 
        !immediate
      )

      // Update local database
      await this.upsertSubscription(stripeSubscription, subscription.stripe_customer_id)

    } catch (error) {
      console.error('Error canceling subscription:', error)
      throw handleStripeError(error)
    }
  }

  // Reactivate subscription
  async reactivateSubscription(organizationId: string): Promise<void> {
    const subscription = await this.getSubscription(organizationId)
    if (!subscription) {
      throw new Error('No subscription found')
    }

    try {
      const stripeSubscription = await updateStripeSubscription(subscription.stripe_subscription_id, {
        cancel_at_period_end: false
      })

      // Update local database
      await this.upsertSubscription(stripeSubscription, subscription.stripe_customer_id)

    } catch (error) {
      console.error('Error reactivating subscription:', error)
      throw handleStripeError(error)
    }
  }

  // Get subscription overview for dashboard
  async getSubscriptionOverview(organizationId: string) {
    const subscription = await this.getSubscription(organizationId)
    const usage = await this.getUsage(organizationId)

    if (!subscription) {
      return {
        hasSubscription: false,
        tier: null,
        status: null,
        usage: null,
        limits: null
      }
    }

    const tierLimits = STRIPE_PRODUCTS[subscription.tier].limits
    const tierFeatures = STRIPE_PRODUCTS[subscription.tier].features

    return {
      hasSubscription: true,
      tier: subscription.tier,
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      usage: usage ? {
        users: { current: usage.users_count, limit: tierLimits.users },
        storage: { current: usage.storage_used, limit: tierLimits.storage },
        aiRequests: { current: usage.ai_requests_count, limit: tierLimits.aiRequests },
        exports: { current: usage.exports_count, limit: tierLimits.exports }
      } : null,
      limits: tierLimits,
      features: tierFeatures
    }
  }

  // Clean up expired subscriptions
  async cleanupExpiredSubscriptions(): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('subscriptions')
        .update({ status: 'expired' })
        .lt('current_period_end', new Date().toISOString())
        .in('status', ['past_due', 'unpaid'])

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error cleaning up expired subscriptions:', error)
    }
  }
}

// Singleton instance
const subscriptionService = new SubscriptionService()
export default subscriptionService

// Convenience functions
export const getSubscription = (orgId: string) => subscriptionService.getSubscription(orgId)
export const checkFeatureAccess = (orgId: string, feature: string) => subscriptionService.checkFeatureAccess(orgId, feature)
export const checkUsageLimit = (orgId: string, limitType: keyof UsageTracking) => subscriptionService.checkUsageLimit(orgId, limitType)
export const incrementUsage = (orgId: string, type: 'users' | 'ai_requests' | 'exports') => subscriptionService.incrementUsage(orgId, type)
export const getSubscriptionOverview = (orgId: string) => subscriptionService.getSubscriptionOverview(orgId)