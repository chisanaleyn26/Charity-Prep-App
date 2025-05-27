'use client'

import React, { ReactNode, useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Lock, 
  Crown, 
  Zap, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  X
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { checkFeatureAccess, checkUsageLimit } from '@/features/subscription/services/subscription-service'
import { STRIPE_PRODUCTS, type SubscriptionTier } from '@/lib/payments/stripe'
import { UpgradeModal } from './upgrade-modal'
import { toast } from 'sonner'

export interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  usageType?: 'users' | 'storage' | 'ai_requests' | 'exports'
  softLimit?: boolean
  showUpgradePrompt?: boolean
  requiredTier?: SubscriptionTier
  className?: string
}

interface FeatureAccessState {
  allowed: boolean
  loading: boolean
  reason?: string
  upgradeRequired?: boolean
  gracePeriodEnd?: Date
  usageInfo?: {
    current: number
    limit: number
    percentage: number
  }
}

export function FeatureGate({
  feature,
  children,
  fallback,
  usageType,
  softLimit = false,
  showUpgradePrompt = true,
  requiredTier,
  className
}: FeatureGateProps) {
  const [accessState, setAccessState] = useState<FeatureAccessState>({
    allowed: false,
    loading: true
  })
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  
  const { currentOrganization } = useAuthStore()

  useEffect(() => {
    checkAccess()
  }, [currentOrganization?.id, feature, usageType])

  const checkAccess = async () => {
    if (!currentOrganization?.id) {
      setAccessState({
        allowed: false,
        loading: false,
        reason: 'No organization selected',
        upgradeRequired: true
      })
      return
    }

    setAccessState(prev => ({ ...prev, loading: true }))

    try {
      // Check feature access
      const featureAccess = await checkFeatureAccess(currentOrganization.id, feature)
      
      // Check usage limits if specified
      let usageAccess = { allowed: true }
      let usageInfo
      
      if (usageType) {
        usageAccess = await checkUsageLimit(currentOrganization.id, usageType)
        if (usageAccess.current !== undefined && usageAccess.limit !== undefined) {
          const limit = usageAccess.limit === -1 ? Infinity : usageAccess.limit
          usageInfo = {
            current: usageAccess.current,
            limit: usageAccess.limit,
            percentage: limit === Infinity ? 0 : Math.min((usageAccess.current / limit) * 100, 100)
          }
        }
      }

      // Determine final access
      const finalAllowed = featureAccess.allowed && (softLimit || usageAccess.allowed)
      
      setAccessState({
        allowed: finalAllowed,
        loading: false,
        reason: !featureAccess.allowed ? featureAccess.reason : usageAccess.reason,
        upgradeRequired: featureAccess.upgradeRequired || usageAccess.upgradeRequired,
        gracePeriodEnd: featureAccess.gracePeriodEnd,
        usageInfo
      })

      // Show warning for soft limits
      if (softLimit && !usageAccess.allowed && usageInfo) {
        toast.warning(`Approaching ${usageType} limit (${usageInfo.current}/${usageInfo.limit})`)
      }

    } catch (error) {
      console.error('Error checking feature access:', error)
      setAccessState({
        allowed: false,
        loading: false,
        reason: 'Error checking access',
        upgradeRequired: false
      })
    }
  }

  // Show loading state
  if (accessState.loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg" />
      </div>
    )
  }

  // Show children if access is allowed
  if (accessState.allowed) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt
  if (accessState.upgradeRequired && showUpgradePrompt && !dismissed) {
    return (
      <div className={className}>
        <FeatureUpgradePrompt
          feature={feature}
          reason={accessState.reason}
          requiredTier={requiredTier}
          usageInfo={accessState.usageInfo}
          gracePeriodEnd={accessState.gracePeriodEnd}
          onUpgrade={() => setShowUpgradeModal(true)}
          onDismiss={() => setDismissed(true)}
        />
        
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false)
            checkAccess()
          }}
        />
      </div>
    )
  }

  // Show simple blocked message
  return (
    <div className={`flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
      <div className="text-center">
        <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600">Feature not available</p>
        {accessState.reason && (
          <p className="text-sm text-gray-500 mt-1">{accessState.reason}</p>
        )}
      </div>
    </div>
  )
}

interface FeatureUpgradePromptProps {
  feature: string
  reason?: string
  requiredTier?: SubscriptionTier
  usageInfo?: {
    current: number
    limit: number
    percentage: number
  }
  gracePeriodEnd?: Date
  onUpgrade: () => void
  onDismiss?: () => void
}

function FeatureUpgradePrompt({
  feature,
  reason,
  requiredTier,
  usageInfo,
  gracePeriodEnd,
  onUpgrade,
  onDismiss
}: FeatureUpgradePromptProps) {
  const getFeatureDisplayName = (feature: string) => {
    const names: Record<string, string> = {
      'ai_processing': 'AI Processing',
      'multi_charity': 'Multi-Charity Support',
      'advanced_reporting': 'Advanced Reporting',
      'api_access': 'API Access',
      'white_label': 'White Label Features',
      'custom_reporting': 'Custom Reporting',
      'priority_support': 'Priority Support'
    }
    return names[feature] || feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getRequiredTierInfo = () => {
    if (!requiredTier) return null
    return STRIPE_PRODUCTS[requiredTier]
  }

  const tierInfo = getRequiredTierInfo()
  const isUsageLimit = usageInfo && usageInfo.percentage >= 100
  const isGracePeriod = gracePeriodEnd && new Date() < gracePeriodEnd

  return (
    <Card className="border-2 border-dashed border-yellow-300 bg-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            {isUsageLimit ? (
              <TrendingUp className="w-6 h-6 text-orange-500 mt-1" />
            ) : isGracePeriod ? (
              <Clock className="w-6 h-6 text-blue-500 mt-1" />
            ) : (
              <Crown className="w-6 h-6 text-yellow-500 mt-1" />
            )}
            <div>
              <CardTitle className="text-lg">
                {isUsageLimit ? 'Usage Limit Reached' : 
                 isGracePeriod ? 'Grace Period Active' :
                 'Upgrade Required'}
              </CardTitle>
              <CardDescription className="mt-1">
                {isUsageLimit 
                  ? `You've reached your monthly limit for this feature`
                  : isGracePeriod
                    ? `Your subscription has expired but you have until ${gracePeriodEnd.toLocaleDateString()} to renew`
                    : `${getFeatureDisplayName(feature)} requires a higher plan`
                }
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Usage Information */}
        {usageInfo && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Usage</span>
              <span className="font-medium">
                {usageInfo.current} / {usageInfo.limit === -1 ? '∞' : usageInfo.limit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all ${
                  usageInfo.percentage >= 100 ? 'bg-red-500' :
                  usageInfo.percentage >= 80 ? 'bg-orange-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(usageInfo.percentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Grace Period Alert */}
        {isGracePeriod && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your subscription ended but you have until <strong>{gracePeriodEnd.toLocaleDateString()}</strong> to renew without losing access to your data.
            </AlertDescription>
          </Alert>
        )}

        {/* Required Tier Information */}
        {tierInfo && (
          <div className="p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{tierInfo.name}</Badge>
              <span className="text-sm text-gray-600">required</span>
            </div>
            <div className="text-sm text-gray-700">
              Starting at <strong>{STRIPE_PRODUCTS[requiredTier!].price.monthly ? 
                `${(STRIPE_PRODUCTS[requiredTier!].price.monthly / 100).toFixed(0)}/month` : 
                'Custom pricing'}</strong>
            </div>
          </div>
        )}

        {/* Reason */}
        {reason && !usageInfo && (
          <p className="text-sm text-gray-600">{reason}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onUpgrade} className="flex-1">
            {isGracePeriod ? 'Renew Subscription' : 
             isUsageLimit ? 'Upgrade Plan' :
             'View Plans'}
          </Button>
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Hook for programmatic feature access checking
export function useFeatureAccess(feature: string, usageType?: 'users' | 'storage' | 'ai_requests' | 'exports') {
  const [accessState, setAccessState] = useState<FeatureAccessState>({
    allowed: false,
    loading: true
  })
  
  const { currentOrganization } = useAuthStore()

  useEffect(() => {
    checkAccess()
  }, [currentOrganization?.id, feature, usageType])

  const checkAccess = async () => {
    if (!currentOrganization?.id) {
      setAccessState({
        allowed: false,
        loading: false,
        reason: 'No organization selected',
        upgradeRequired: true
      })
      return
    }

    setAccessState(prev => ({ ...prev, loading: true }))

    try {
      const featureAccess = await checkFeatureAccess(currentOrganization.id, feature)
      
      let usageAccess = { allowed: true }
      let usageInfo
      
      if (usageType) {
        usageAccess = await checkUsageLimit(currentOrganization.id, usageType)
        if (usageAccess.current !== undefined && usageAccess.limit !== undefined) {
          const limit = usageAccess.limit === -1 ? Infinity : usageAccess.limit
          usageInfo = {
            current: usageAccess.current,
            limit: usageAccess.limit,
            percentage: limit === Infinity ? 0 : Math.min((usageAccess.current / limit) * 100, 100)
          }
        }
      }

      setAccessState({
        allowed: featureAccess.allowed && usageAccess.allowed,
        loading: false,
        reason: !featureAccess.allowed ? featureAccess.reason : usageAccess.reason,
        upgradeRequired: featureAccess.upgradeRequired || usageAccess.upgradeRequired,
        gracePeriodEnd: featureAccess.gracePeriodEnd,
        usageInfo
      })

    } catch (error) {
      console.error('Error checking feature access:', error)
      setAccessState({
        allowed: false,
        loading: false,
        reason: 'Error checking access',
        upgradeRequired: false
      })
    }
  }

  return {
    ...accessState,
    refetch: checkAccess
  }
}

// Higher-order component for feature gating
export function withFeatureGate<P extends object>(
  Component: React.ComponentType<P>,
  feature: string,
  options?: Omit<FeatureGateProps, 'feature' | 'children'>
) {
  return function FeatureGatedComponent(props: P) {
    return (
      <FeatureGate feature={feature} {...options}>
        <Component {...props} />
      </FeatureGate>
    )
  }
}