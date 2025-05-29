'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { checkSubscriptionStatus, isFeatureAvailable, type SubscriptionStatus } from '@/lib/api/subscription-migration'

interface UseSubscriptionCheckResult {
  subscriptionStatus: SubscriptionStatus | null
  isLoading: boolean
  error: Error | null
  canAccessFeature: (feature: string) => boolean
  refreshSubscription: () => Promise<void>
}

export function useSubscriptionCheck(): UseSubscriptionCheckResult {
  const { currentOrganization } = useAuthStore()
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshSubscription = async () => {
    if (!currentOrganization) {
      setSubscriptionStatus(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const status = await checkSubscriptionStatus(currentOrganization.id)
      setSubscriptionStatus(status)
    } catch (err) {
      console.error('Failed to check subscription status:', err)
      setError(err instanceof Error ? err : new Error('Failed to check subscription'))
      // Set a default free tier status on error
      setSubscriptionStatus({
        hasActiveSubscription: false,
        provider: null,
        tier: 'free',
        status: 'none',
        requiresMigration: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshSubscription()
  }, [currentOrganization?.id])

  const canAccessFeature = (feature: string): boolean => {
    if (!subscriptionStatus) return false
    return isFeatureAvailable(subscriptionStatus.tier, feature)
  }

  return {
    subscriptionStatus,
    isLoading,
    error,
    canAccessFeature,
    refreshSubscription
  }
}

// Hook for feature gating
export function useFeatureGate(feature: string) {
  const { subscriptionStatus, isLoading } = useSubscriptionCheck()
  
  const isAllowed = subscriptionStatus ? isFeatureAvailable(subscriptionStatus.tier, feature) : false
  const requiresUpgrade = subscriptionStatus && !isAllowed
  
  return {
    isAllowed,
    requiresUpgrade,
    isLoading,
    tier: subscriptionStatus?.tier || 'free'
  }
}