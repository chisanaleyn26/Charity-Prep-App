'use client'

import { ReactNode } from 'react'
import { useSubscriptionStatus } from '@/features/subscription/hooks/use-subscription-status'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FeatureGateProps {
  feature: 'unlimited-users' | 'advanced-reports' | 'api-access' | 'priority-support'
  children: ReactNode
  fallback?: ReactNode
  showUpgradePrompt?: boolean
}

const FEATURE_REQUIREMENTS = {
  'unlimited-users': ['scale'],
  'advanced-reports': ['growth', 'scale'],
  'api-access': ['growth', 'scale'],
  'priority-support': ['scale']
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const router = useRouter()
  const { subscription } = useSubscriptionStatus()
  
  const requiredPlans = FEATURE_REQUIREMENTS[feature]
  const hasAccess = subscription?.tier && requiredPlans.includes(subscription.tier)
  
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    if (showUpgradePrompt) {
      return (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              This feature requires a {requiredPlans.join(' or ')} plan.
            </span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => router.push('/settings/billing')}
            >
              Upgrade
            </Button>
          </AlertDescription>
        </Alert>
      )
    }
    
    return null
  }
  
  return <>{children}</>
}