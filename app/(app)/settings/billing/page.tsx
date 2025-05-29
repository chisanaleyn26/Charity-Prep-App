'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { BillingDashboard } from '@/features/subscription/components/billing-dashboard'
import { CheckoutSuccessHandler } from '@/features/subscription/components/checkout-success-handler'
import { PricingToggle } from '@/components/pricing-toggle'
import { useSubscription } from '@/features/subscription/hooks/use-subscription'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getPriceId } from '@/lib/payments/stripe'

export default function BillingPage() {
  const router = useRouter()
  const { subscription, isLoading } = useSubscription()
  const { currentOrganization } = useOrganization()
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false)
  const [priceIds, setPriceIds] = useState<Record<string, any> | null>(null)

  // Fetch price IDs on mount
  useEffect(() => {
    fetch('/api/billing/prices')
      .then(res => res.json())
      .then(data => setPriceIds(data))
      .catch(err => console.error('Failed to fetch price IDs:', err))
  }, [])

  const handleSelectPlan = async (tier: string, priceId: string, cycle: 'monthly' | 'yearly') => {
    try {
      setIsCreatingCheckout(true)
      
      // Get the actual price ID from the fetched data
      let actualPriceId = priceId
      if (priceIds) {
        const tierKey = tier.toLowerCase()
        actualPriceId = priceIds[tierKey]?.[cycle] || priceId
      }
      
      console.log('Creating checkout for:', { tier, cycle, actualPriceId })
      
      if (!currentOrganization) {
        throw new Error('No organization selected')
      }
      
      // Create checkout session
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: actualPriceId,
          organizationId: currentOrganization.id,
          successUrl: `${window.location.origin}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/settings/billing?canceled=true`,
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL returned')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsCreatingCheckout(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CheckoutSuccessHandler />
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Billing & Subscription</h1>
          <p className="text-gray-600 mt-2">
            Manage your subscription, billing information, and usage metrics.
          </p>
        </div>

        <Tabs defaultValue={subscription ? "overview" : "plans"}>
          <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="overview" disabled={!subscription}>Overview</TabsTrigger>
          </TabsList>

          <TabsContent value="plans" className="mt-8">
            <PricingToggle 
              onSelectPlan={handleSelectPlan}
              currentTier={subscription?.tier?.toUpperCase()}
            />
            {isCreatingCheckout && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-card p-6 rounded-lg shadow-lg flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <p>Preparing checkout...</p>
                </div>
              </div>
            )}
          </TabsContent>

          {subscription && (
            <TabsContent value="overview" className="mt-8">
              <BillingDashboard />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}