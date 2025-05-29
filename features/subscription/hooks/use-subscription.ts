'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useOrganization } from '@/features/organizations/components/organization-provider'

export interface SubscriptionInfo {
  id: string
  tier: 'essentials' | 'standard' | 'premium'
  status: 'trialing' | 'active' | 'past_due' | 'canceled'
  payment_provider: 'paddle' | 'stripe'
  trial_ends_at: string | null
  current_period_end: string
  is_active: boolean
  days_until_trial_end: number | null
  can_access_feature: (feature: string) => boolean
}

const TIER_FEATURES = {
  essentials: [
    'compliance_tracking',
    'basic_reporting',
    'document_upload',
    'email_support',
  ],
  standard: [
    'compliance_tracking',
    'basic_reporting',
    'advanced_reporting', 
    'document_upload',
    'ai_import',
    'email_support',
    'advisor_portal',
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
    'custom_branding',
  ],
}

const TRIAL_FEATURES = [
  'compliance_tracking',
  'basic_reporting',
  'document_upload',
]

// Default function for canAccessFeature
const defaultCanAccessFeature = () => false

export function useSubscription() {
  const { currentOrganization } = useOrganization()
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!currentOrganization) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', currentOrganization.id)
          .in('status', ['active', 'trialing', 'past_due'])
          .single()

        if (error && error.code !== 'PGRST116') { // Not found is ok
          throw error
        }

        if (data) {
          try {
            const isActive = 
              data.status === 'active' || 
              (data.status === 'trialing' && 
               data.trial_ends_at && 
               new Date(data.trial_ends_at) > new Date())

            const daysUntilTrialEnd = data.trial_ends_at
              ? Math.ceil(
                  (new Date(data.trial_ends_at).getTime() - Date.now()) / 
                  (1000 * 60 * 60 * 24)
                )
              : null

            const canAccessFeature = (feature: string) => {
              if (!isActive) return false
              
              const allowedFeatures = 
                data.status === 'trialing' 
                  ? TRIAL_FEATURES 
                  : TIER_FEATURES[data.tier as keyof typeof TIER_FEATURES] || []
              
              return allowedFeatures.includes(feature)
            }

            setSubscription({
              id: data.id,
              tier: data.tier,
              status: data.status,
              payment_provider: data.payment_provider || 'stripe',
              trial_ends_at: data.trial_ends_at,
              current_period_end: data.current_period_end,
              is_active: isActive,
              days_until_trial_end: daysUntilTrialEnd,
              can_access_feature: canAccessFeature,
            })
          } catch (error) {
            console.error('Error processing subscription data:', error)
            setSubscription(null)
          }
        } else {
          setSubscription(null)
        }
      } catch (err) {
        console.error('Failed to fetch subscription:', err)
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()

    // Subscribe to changes
    const supabase = createClient()
    const subscription = supabase
      .channel('subscription_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `organization_id=eq.${currentOrganization.id}`,
        },
        () => {
          fetchSubscription()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [currentOrganization])

  return {
    subscription,
    isLoading,
    error,
    isActive: subscription?.is_active || false,
    canAccessFeature: subscription?.can_access_feature || defaultCanAccessFeature,
    needsUpgrade: !subscription || subscription.status === 'canceled',
    isInTrial: subscription?.status === 'trialing',
    daysUntilTrialEnd: subscription?.days_until_trial_end,
  }
}