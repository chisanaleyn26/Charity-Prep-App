'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { createClient } from '@/lib/supabase/client'
import type { PostgrestError } from '@supabase/supabase-js'

export interface SubscriptionStatus {
  tier: 'essentials' | 'standard' | 'premium' | null
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' | null
  trialEndsAt: Date | null
  currentPeriodEnd: Date | null
  isTrialing: boolean
  isActive: boolean
  hasPaymentIssue: boolean
  daysUntilExpiry: number | null
  usageWarnings: {
    storage: boolean
    users: boolean
    aiRequests: boolean
  }
}

interface UseSubscriptionStatusReturn {
  subscription: SubscriptionStatus | null
  isLoading: boolean
  refreshSubscription: () => Promise<void>
  needsAttention: boolean // Critical issues requiring user attention
  warningLevel: 'none' | 'info' | 'warning' | 'critical'
}

const DEFAULT_SUBSCRIPTION: SubscriptionStatus = {
  tier: null,
  status: null,
  trialEndsAt: null,
  currentPeriodEnd: null,
  isTrialing: false,
  isActive: false,
  hasPaymentIssue: false,
  daysUntilExpiry: null,
  usageWarnings: {
    storage: false,
    users: false,
    aiRequests: false
  }
}

export function useSubscriptionStatus(): UseSubscriptionStatusReturn {
  const { currentOrganization } = useOrganization()
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate days until expiry
  const calculateDaysUntilExpiry = (endDate: Date | null): number | null => {
    if (!endDate) return null
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Determine warning level based on subscription status
  const getWarningLevel = (sub: SubscriptionStatus | null): 'none' | 'info' | 'warning' | 'critical' => {
    if (!sub) return 'none'

    // Critical: Payment issues or expired
    if (sub.hasPaymentIssue || sub.status === 'past_due' || sub.status === 'unpaid') {
      return 'critical'
    }

    // Critical: Trial ending soon (2 days or less)
    if (sub.isTrialing && sub.daysUntilExpiry !== null && sub.daysUntilExpiry <= 2) {
      return 'critical'
    }

    // Warning: Trial ending in 7 days or usage warnings
    if (sub.isTrialing && sub.daysUntilExpiry !== null && sub.daysUntilExpiry <= 7) {
      return 'warning'
    }

    if (Object.values(sub.usageWarnings).some(warning => warning)) {
      return 'warning'
    }

    // Info: Active trial or subscription
    if (sub.isTrialing || sub.isActive) {
      return 'info'
    }

    return 'none'
  }

  // Load subscription data
  const loadSubscription = async () => {
    if (!currentOrganization?.id) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      
      // Get subscription data - simplified query
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (subError) {
        // Only log actual errors, not "no rows returned"
        if (subError.code !== 'PGRST116') {
          const errorDetails = {
            message: subError.message || 'Unknown error',
            code: subError.code || 'UNKNOWN',
            details: subError.details || null,
            hint: subError.hint || null,
            organizationId: currentOrganization.id
          }
          console.error('Error loading subscription:', errorDetails)
        }
        setSubscription(DEFAULT_SUBSCRIPTION)
        return
      }

      if (!subData) {
        // No active subscription
        setSubscription(DEFAULT_SUBSCRIPTION)
        return
      }

      // Check if subscription has a valid status
      const validStatuses = ['trialing', 'active', 'past_due', 'unpaid']
      if (!validStatuses.includes(subData.status)) {
        // Subscription exists but is not in an active state (e.g., canceled)
        setSubscription(DEFAULT_SUBSCRIPTION)
        return
      }

      // TODO: Add usage data query here when usage tracking is implemented
      // For now, we'll use placeholder usage warnings
      const usageWarnings = {
        storage: false, // Could check storage usage percentage
        users: false,   // Could check user count vs limit
        aiRequests: false // Could check AI request count vs limit
      }

      const trialEndsAt = subData.trial_ends_at ? new Date(subData.trial_ends_at) : null
      const currentPeriodEnd = subData.current_period_end ? new Date(subData.current_period_end) : null
      const isTrialing = subData.status === 'trialing'
      const expiryDate = isTrialing ? trialEndsAt : currentPeriodEnd
      const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate)

      const subscriptionStatus: SubscriptionStatus = {
        tier: subData.tier as SubscriptionStatus['tier'],
        status: subData.status as SubscriptionStatus['status'],
        trialEndsAt,
        currentPeriodEnd,
        isTrialing,
        isActive: subData.status === 'active',
        hasPaymentIssue: subData.status === 'past_due' || subData.status === 'unpaid',
        daysUntilExpiry,
        usageWarnings
      }

      setSubscription(subscriptionStatus)
    } catch (error) {
      console.error('Failed to load subscription status:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        organizationId: currentOrganization?.id
      })
      setSubscription(DEFAULT_SUBSCRIPTION)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription when organization changes
  useEffect(() => {
    loadSubscription()
  }, [currentOrganization?.id])

  // Refresh subscription data
  const refreshSubscription = async (): Promise<void> => {
    await loadSubscription()
  }

  const warningLevel = getWarningLevel(subscription)
  const needsAttention = warningLevel === 'critical' || warningLevel === 'warning'

  return {
    subscription,
    isLoading,
    refreshSubscription,
    needsAttention,
    warningLevel
  }
}