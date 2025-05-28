'use client'

import React, { useState, useEffect } from 'react'
import { Link } from '@/components/ui/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Check, Crown, Zap } from 'lucide-react'
import { STRIPE_PRODUCTS, formatPrice, getPriceId, getStripeClient, createCheckoutSession, type SubscriptionTier } from '@/lib/payments/stripe'
import { useAuthStore } from '@/stores/auth-store'
import { getSubscriptionOverview } from '@/features/subscription/services/subscription-service'
import { toast } from 'sonner'

interface CurrentSubscription {
  tier: SubscriptionTier | null
  status: string | null
  billingCycle: 'monthly' | 'yearly' | null
}

export function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [currentSubscription, setCurrentSubscription] = useState<CurrentSubscription>({
    tier: null,
    status: null,
    billingCycle: null
  })
  
  const { user, currentOrganization } = useAuthStore()

  // Load current subscription status
  useEffect(() => {
    async function loadSubscription() {
      if (!currentOrganization?.id) return
      
      try {
        const overview = await getSubscriptionOverview(currentOrganization.id)
        setCurrentSubscription({
          tier: overview?.tier || null,
          status: overview?.status || null,
          billingCycle: overview?.billingCycle || null
        })
      } catch (error) {
        console.error('Error loading subscription:', error)
        // Gracefully handle error - don't break the component
      }
    }
    
    if (typeof window !== 'undefined') {
      loadSubscription()
    }
  }, [currentOrganization?.id])

  const plans = [
    {
      tier: 'ESSENTIALS' as const,
      name: 'Essentials',
      description: 'Perfect for small charities getting started',
      note: 'Great for charities under £100k income',
      popular: false,
      icon: <Zap className="w-6 h-6" />,
      price: STRIPE_PRODUCTS.ESSENTIALS.price,
      features: STRIPE_PRODUCTS.ESSENTIALS.features,
      limits: STRIPE_PRODUCTS.ESSENTIALS.limits
    },
    {
      tier: 'STANDARD' as const,
      name: 'Standard',
      description: 'Most popular for growing charities',
      note: 'Perfect for charities £100k - £1M income',
      popular: true,
      icon: <Crown className="w-6 h-6" />,
      price: STRIPE_PRODUCTS.STANDARD.price,
      features: STRIPE_PRODUCTS.STANDARD.features,
      limits: STRIPE_PRODUCTS.STANDARD.limits
    },
    {
      tier: 'PREMIUM' as const,
      name: 'Premium',
      description: 'For large charities and multi-charity advisors',
      note: 'Unlimited features for complex needs',
      popular: false,
      icon: <Crown className="w-6 h-6 text-yellow-500" />,
      price: STRIPE_PRODUCTS.PREMIUM.price,
      features: STRIPE_PRODUCTS.PREMIUM.features,
      limits: STRIPE_PRODUCTS.PREMIUM.limits
    },
  ]

  const handleSubscribe = async (tier: SubscriptionTier) => {
    if (!user || !currentOrganization) {
      toast.error('Please log in first')
      return
    }

    if (currentSubscription.tier === tier) {
      toast.info('You are already subscribed to this plan')
      return
    }

    setIsLoading(tier)

    try {
      const priceId = getPriceId(tier, billingCycle)
      
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          organizationId: currentOrganization.id,
          successUrl: `${window.location.origin}/dashboard?checkout=success`,
          cancelUrl: `${window.location.origin}/?checkout=canceled`,
          customerEmail: user.email,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      const stripe = await getStripeClient()
      
      if (!stripe) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })
      
      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setIsLoading(null)
    }
  }

  const getButtonText = (tier: SubscriptionTier) => {
    if (!user) return 'Sign up'
    if (currentSubscription.tier === tier) {
      return currentSubscription.status === 'active' ? 'Current plan' : 'Reactivate'
    }
    if (currentSubscription.tier && currentSubscription.tier !== tier) {
      return 'Upgrade'
    }
    return 'Subscribe'
  }

  const getButtonVariant = (tier: SubscriptionTier, popular: boolean) => {
    if (currentSubscription.tier === tier && currentSubscription.status === 'active') {
      return 'outline'
    }
    return popular ? 'default' : 'outline'
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section id="pricing" className="py-32 px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-5xl lg:text-6xl font-light text-foreground leading-tight tracking-tight mb-8"
          >
            Simple
            <br />
            <span className="font-medium">pricing</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-xl text-muted-foreground font-light mb-8"
          >
            Choose what works for your charity.
          </motion.p>
          
          {/* Billing cycle toggle */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="flex items-center justify-center gap-4 p-4 bg-white rounded-full border border-gray-200 max-w-xs mx-auto"
          >
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
              <Badge variant="secondary" className="ml-2 text-xs">2 months free</Badge>
            </Label>
          </motion.div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto"
        >
          {plans.map((plan, index) => {
            const currentPrice = billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly
            const isCurrentPlan = currentSubscription.tier === plan.tier
            
            return (
              <motion.div
                key={plan.tier}
                variants={cardVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`bg-white border rounded-2xl p-8 transition-all duration-200 hover:shadow-lg flex flex-col h-full relative ${
                  plan.popular 
                    ? 'border-ethereal shadow-md ring-2 ring-ethereal/20' 
                    : isCurrentPlan 
                      ? 'border-blue-200 ring-2 ring-blue-200/20'
                      : 'border-gray-200 hover:border-ethereal'
                }`}
              >
                {/* Current plan indicator */}
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 hover:bg-blue-500">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                {/* Fixed height badge area */}
                <div className="h-8 mb-6">
                  {plan.popular && !isCurrentPlan && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                      className="inline-block bg-ethereal text-foreground text-xs font-medium px-3 py-1 rounded-full"
                    >
                      Most Popular
                    </motion.div>
                  )}
                </div>
                
                {/* Fixed height header area */}
                <div className="mb-8 min-h-[140px]">
                  <div className="flex items-center gap-3 mb-3">
                    {plan.icon}
                    <h3 className="text-2xl font-medium text-foreground">
                      {plan.name}
                    </h3>
                  </div>
                  <div className="mb-3">
                    <span className="text-4xl font-light text-foreground">
                      {formatPrice(currentPrice)}
                    </span>
                    <span className="text-muted-foreground ml-2">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    {billingCycle === 'yearly' && (
                      <div className="text-sm text-green-600 font-medium mt-1">
                        Save {formatPrice(plan.price.monthly * 12 - plan.price.yearly)} per year
                      </div>
                    )}
                  </div>
                  <p className="text-muted-foreground font-light mb-1">{plan.description}</p>
                  <p className="text-sm text-muted-foreground/70 font-light">{plan.note}</p>
                </div>
                
                {/* Features list with consistent spacing */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <motion.li 
                      key={featureIndex} 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.6 + featureIndex * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-foreground font-light text-sm">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
                
                {/* Usage limits */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Plan includes:</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>Users: {plan.limits.users === -1 ? 'Unlimited' : plan.limits.users}</div>
                    <div>Storage: {plan.limits.storage === -1 ? 'Unlimited' : `${Math.round(plan.limits.storage / (1024 * 1024))}MB`}</div>
                    <div>AI Requests: {plan.limits.aiRequests === -1 ? 'Unlimited' : plan.limits.aiRequests}/month</div>
                    <div>Exports: {plan.limits.exports === -1 ? 'Unlimited' : plan.limits.exports}/month</div>
                  </div>
                </div>
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => user ? handleSubscribe(plan.tier) : null}
                    disabled={isLoading === plan.tier || (isCurrentPlan && currentSubscription.status === 'active')}
                    variant={getButtonVariant(plan.tier, plan.popular)}
                    className={`w-full ${
                      plan.popular && !isCurrentPlan
                        ? 'bg-ethereal text-foreground hover:bg-ethereal/90 border-ethereal'
                        : ''
                    }`}
                    asChild={!user}
                  >
                    {!user ? (
                      <Link href="/login">
                        {getButtonText(plan.tier)}
                      </Link>
                    ) : (
                      <span>
                        {isLoading === plan.tier ? 'Loading...' : getButtonText(plan.tier)}
                      </span>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            )
          })}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground/70 font-light">
            <span>30-day free trial</span>
            <span className="w-1 h-1 bg-border rounded-full hidden sm:block"></span>
            <span>No credit card required for trial</span>
            <span className="w-1 h-1 bg-border rounded-full hidden sm:block"></span>
            <span>Cancel anytime</span>
            <span className="w-1 h-1 bg-border rounded-full hidden sm:block"></span>
            <span>Secure payments by Stripe</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}