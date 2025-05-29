'use client'

import { useState } from 'react'
import { Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { STRIPE_PRODUCTS } from '@/lib/payments/stripe'

interface PricingToggleProps {
  onSelectPlan?: (tier: string, priceId: string, cycle: 'monthly' | 'yearly') => void
  currentTier?: string
  className?: string
}

export function PricingToggle({ onSelectPlan, currentTier, className }: PricingToggleProps) {
  const [isYearly, setIsYearly] = useState(true) // Default to yearly for savings

  const plans = [
    {
      tier: 'ESSENTIALS',
      name: 'Essentials',
      description: 'Perfect for small charities under £100k',
      monthlyPrice: 29,
      yearlyPrice: 290, // 2 months free
      savings: 58,
      features: STRIPE_PRODUCTS.ESSENTIALS.features,
      popular: false
    },
    {
      tier: 'STANDARD',
      name: 'Standard',
      description: 'For growing charities £100k-1M',
      monthlyPrice: 79,
      yearlyPrice: 790, // 2 months free
      savings: 158,
      features: STRIPE_PRODUCTS.STANDARD.features,
      popular: true
    },
    {
      tier: 'PREMIUM',
      name: 'Premium',
      description: 'For large charities over £1M',
      monthlyPrice: 149,
      yearlyPrice: 1490, // 2 months free
      savings: 298,
      features: STRIPE_PRODUCTS.PREMIUM.features,
      popular: false
    }
  ]

  const handleSelectPlan = (tier: string) => {
    if (onSelectPlan) {
      // You'll need to map to actual Stripe price IDs
      const cycle = isYearly ? 'yearly' : 'monthly'
      const priceId = `price_${tier.toLowerCase()}_${cycle}` // Replace with actual price IDs
      onSelectPlan(tier, priceId, cycle)
    }
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <Label htmlFor="yearly-toggle" className={cn(
          "text-base transition-colors",
          !isYearly ? "text-foreground" : "text-muted-foreground"
        )}>
          Monthly
        </Label>
        <Switch
          id="yearly-toggle"
          checked={isYearly}
          onCheckedChange={setIsYearly}
          className="data-[state=checked]:bg-primary"
        />
        <div className="flex items-center gap-2">
          <Label htmlFor="yearly-toggle" className={cn(
            "text-base transition-colors",
            isYearly ? "text-foreground" : "text-muted-foreground"
          )}>
            Yearly
          </Label>
          {isYearly && (
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              Save 2 months
            </Badge>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card 
            key={plan.tier}
            className={cn(
              "relative transition-all",
              plan.popular && "ring-2 ring-primary shadow-lg scale-105",
              currentTier === plan.tier && "ring-2 ring-green-500"
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
            )}
            
            {currentTier === plan.tier && (
              <Badge variant="secondary" className="absolute -top-3 right-4 bg-green-100 text-green-700">
                Current Plan
              </Badge>
            )}

            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    £{isYearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                
                {isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    £{plan.yearlyPrice}/year (Save £{plan.savings})
                  </p>
                )}
                
                {!isYearly && (
                  <p className="text-sm text-muted-foreground mt-1">
                    £{plan.monthlyPrice * 12}/year when billed monthly
                  </p>
                )}
              </div>

              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Button 
                className="w-full"
                variant={currentTier === plan.tier ? "outline" : "default"}
                onClick={() => handleSelectPlan(plan.tier)}
                disabled={currentTier === plan.tier}
              >
                {currentTier === plan.tier ? (
                  'Current Plan'
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {currentTier ? 'Switch Plan' : 'Get Started'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>All plans include 14-day free trial • No credit card required</p>
        <p>Cancel anytime • Prices exclude VAT where applicable</p>
      </div>
    </div>
  )
}