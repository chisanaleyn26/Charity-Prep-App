'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Check, 
  Crown, 
  Zap, 
  X,
  ArrowUp,
  ArrowDown,
  Calculator,
  CreditCard
} from 'lucide-react'
import { 
  STRIPE_PRODUCTS, 
  formatPrice, 
  getPriceId, 
  getStripeClient,
  type SubscriptionTier 
} from '@/lib/payments/stripe'
import { useAuthStore } from '@/stores/auth-store'
import { createCheckoutSession } from '@/features/subscription/actions/billing'
import { toast } from 'sonner'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentTier?: SubscriptionTier | null
  onUpgrade?: () => void
}

interface ProrationPreview {
  immediateCharge: number
  nextBillingAmount: number
  nextBillingDate: string
  prorationCredit: number
}

export function UpgradeModal({ isOpen, onClose, currentTier, onUpgrade }: UpgradeModalProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('STANDARD')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isLoading, setIsLoading] = useState(false)
  const [prorationPreview, setProrationPreview] = useState<ProrationPreview | null>(null)
  const [showProration, setShowProration] = useState(false)
  
  const { currentOrganization } = useAuthStore()

  useEffect(() => {
    if (currentTier && isOpen) {
      // If user has a subscription, default to upgrading to the next tier
      const tiers = ['ESSENTIALS', 'STANDARD', 'PREMIUM'] as const
      const currentIndex = tiers.indexOf(currentTier)
      if (currentIndex !== -1 && currentIndex < tiers.length - 1) {
        setSelectedTier(tiers[currentIndex + 1])
      }
    }
  }, [currentTier, isOpen])

  useEffect(() => {
    if (currentTier && selectedTier !== currentTier) {
      loadProrationPreview()
    } else {
      setProrationPreview(null)
      setShowProration(false)
    }
  }, [selectedTier, billingCycle, currentTier])

  const loadProrationPreview = async () => {
    if (!currentOrganization?.id || !currentTier) return

    try {
      const response = await fetch('/api/billing/proration-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: currentOrganization.id,
          newTier: selectedTier,
          newCycle: billingCycle
        })
      })

      if (response.ok) {
        const preview = await response.json()
        setProrationPreview(preview)
        setShowProration(true)
      }
    } catch (error) {
      console.error('Error loading proration preview:', error)
    }
  }

  const handleUpgrade = async () => {
    if (!currentOrganization?.id) return

    setIsLoading(true)
    try {
      if (currentTier) {
        // Existing subscription - upgrade/downgrade
        const response = await fetch('/api/billing/change-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organizationId: currentOrganization.id,
            newTier: selectedTier,
            newCycle: billingCycle
          })
        })

        if (!response.ok) {
          throw new Error('Failed to change subscription')
        }

        toast.success('Subscription updated successfully!')
        onUpgrade?.()
        onClose()
      } else {
        // New subscription - server action will handle redirect
        await createCheckoutSession({
          tier: selectedTier,
          billingCycle,
          organizationId: currentOrganization.id
        })
      }
    } catch (error) {
      console.error('Upgrade error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to process upgrade')
      setIsLoading(false)
    }
  }

  const plans = [
    {
      tier: 'ESSENTIALS' as const,
      name: 'Essentials',
      description: 'Perfect for small charities',
      icon: <Zap className="w-5 h-5" />,
      price: STRIPE_PRODUCTS.ESSENTIALS.price,
      features: STRIPE_PRODUCTS.ESSENTIALS.features,
      limits: STRIPE_PRODUCTS.ESSENTIALS.limits
    },
    {
      tier: 'STANDARD' as const,
      name: 'Standard',
      description: 'Most popular for growing charities',
      icon: <Crown className="w-5 h-5" />,
      price: STRIPE_PRODUCTS.STANDARD.price,
      features: STRIPE_PRODUCTS.STANDARD.features,
      limits: STRIPE_PRODUCTS.STANDARD.limits,
      popular: true
    },
    {
      tier: 'PREMIUM' as const,
      name: 'Premium',
      description: 'For large charities and advisors',
      icon: <Crown className="w-5 h-5 text-yellow-500" />,
      price: STRIPE_PRODUCTS.PREMIUM.price,
      features: STRIPE_PRODUCTS.PREMIUM.features,
      limits: STRIPE_PRODUCTS.PREMIUM.limits
    },
  ]

  const getChangeDirection = (tier: SubscriptionTier) => {
    if (!currentTier) return null
    const tiers = ['ESSENTIALS', 'STANDARD', 'PREMIUM'] as const
    const currentIndex = tiers.indexOf(currentTier)
    const newIndex = tiers.indexOf(tier)
    
    if (newIndex > currentIndex) return 'upgrade'
    if (newIndex < currentIndex) return 'downgrade'
    return 'same'
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {currentTier ? 'Change Subscription Plan' : 'Choose Your Plan'}
          </DialogTitle>
          <DialogDescription>
            {currentTier 
              ? 'Upgrade or downgrade your subscription at any time'
              : 'Select the plan that best fits your charity\'s needs'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="billing-toggle" className={`text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={billingCycle === 'yearly'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
            />
            <Label htmlFor="billing-toggle" className={`text-sm font-medium transition-colors ${
              billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'
            }`}>
              Yearly
              <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
            </Label>
          </div>

          {/* Plan Selection */}
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const currentPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
              const isSelected = selectedTier === plan.tier
              const isCurrent = currentTier === plan.tier
              const changeDirection = getChangeDirection(plan.tier)
              
              return (
                <Card 
                  key={plan.tier}
                  className={`cursor-pointer transition-all relative ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 border-blue-500' 
                      : isCurrent
                        ? 'ring-2 ring-green-500 border-green-500'
                        : 'hover:border-gray-300'
                  } ${plan.popular ? 'border-yellow-400' : ''}`}
                  onClick={() => setSelectedTier(plan.tier)}
                >
                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 hover:bg-green-500">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  {/* Popular Badge */}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-yellow-500 hover:bg-yellow-500 text-black">
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      {plan.icon}
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      {changeDirection === 'upgrade' && (
                        <ArrowUp className="w-4 h-4 text-green-500" />
                      )}
                      {changeDirection === 'downgrade' && (
                        <ArrowDown className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{plan.description}</p>
                    
                    <div className="mt-4">
                      <div className="text-3xl font-light">
                        {formatPrice(currentPrice)}
                      </div>
                      <p className="text-sm text-gray-500">
                        per {billingCycle === 'monthly' ? 'month' : 'year'}
                      </p>
                      {billingCycle === 'yearly' && (
                        <p className="text-xs text-green-600 font-medium">
                          Save {formatPrice(plan.price.monthly * 12 - plan.price.yearly)} per year
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Plan Limits */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between">
                        <span>Users:</span>
                        <span className="font-medium">
                          {plan.limits.users === -1 ? '∞' : plan.limits.users}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage:</span>
                        <span className="font-medium">
                          {plan.limits.storage === -1 ? '∞' : formatBytes(plan.limits.storage)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AI/month:</span>
                        <span className="font-medium">
                          {plan.limits.aiRequests === -1 ? '∞' : plan.limits.aiRequests}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exports/month:</span>
                        <span className="font-medium">
                          {plan.limits.exports === -1 ? '∞' : plan.limits.exports}
                        </span>
                      </div>
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      {plan.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 4 && (
                        <p className="text-xs text-gray-500">
                          +{plan.features.length - 4} more features
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Proration Preview */}
          {showProration && prorationPreview && (
            <Alert>
              <Calculator className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">Billing Preview:</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Immediate charge:</span>
                    <span className="float-right font-medium">
                      {formatPrice(prorationPreview.immediateCharge)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Next billing:</span>
                    <span className="float-right font-medium">
                      {formatPrice(prorationPreview.nextBillingAmount)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Next billing date:</span>
                    <span className="float-right font-medium">
                      {new Date(prorationPreview.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpgrade}
            disabled={isLoading || (currentTier === selectedTier)}
            className="min-w-[120px]"
          >
            {isLoading ? (
              'Processing...'
            ) : currentTier ? (
              getChangeDirection(selectedTier) === 'upgrade' ? 'Upgrade Plan' :
              getChangeDirection(selectedTier) === 'downgrade' ? 'Downgrade Plan' :
              'Current Plan'
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Subscribe
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}