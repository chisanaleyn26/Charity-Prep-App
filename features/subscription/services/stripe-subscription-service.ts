'use server'

import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { redirect } from 'next/navigation'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      'Basic compliance tracking',
      'Up to 3 team members',
      'Limited document storage (100MB)',
      'Email support'
    ]
  },
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID,
    features: [
      'Full compliance suite',
      'Up to 10 team members',
      '10GB document storage',
      'Priority email support',
      'Basic reporting'
    ]
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 79,
    stripePriceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID,
    features: [
      'Everything in Starter',
      'Unlimited team members',
      'Unlimited document storage',
      'Phone & email support',
      'Advanced reporting & analytics',
      'API access',
      'Custom integrations'
    ]
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom training',
      'SLA guarantees',
      'Custom contracts',
      'White-label options'
    ]
  }
}

/**
 * Check if organization has active subscription
 */
export async function checkSubscriptionStatus(organizationId: string) {
  const supabase = await createClient()
  
  // First check Stripe subscriptions (new)
  const { data: stripeSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .eq('provider', 'stripe')
    .single()

  if (stripeSubscription) {
    return {
      hasSubscription: true,
      subscription: stripeSubscription,
      tier: stripeSubscription.tier || 'starter',
      provider: 'stripe'
    }
  }

  // Fallback to check Paddle subscriptions (legacy)
  const { data: paddleSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('status', 'active')
    .eq('provider', 'paddle')
    .single()

  if (paddleSubscription) {
    return {
      hasSubscription: true,
      subscription: paddleSubscription,
      tier: paddleSubscription.tier || 'starter',
      provider: 'paddle',
      legacy: true
    }
  }

  // No active subscription - free tier
  return {
    hasSubscription: false,
    subscription: null,
    tier: 'free',
    provider: null
  }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  organizationId: string,
  tier: 'starter' | 'professional',
  successUrl: string,
  cancelUrl: string
) {
  const supabase = await createClient()
  
  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  if (!org) {
    throw new Error('Organization not found')
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Get or create Stripe customer
  let stripeCustomerId = org.stripe_customer_id

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email!,
      name: org.name,
      metadata: {
        organization_id: organizationId,
        organization_name: org.name
      }
    })
    
    stripeCustomerId = customer.id

    // Save customer ID
    await supabase
      .from('organizations')
      .update({ stripe_customer_id: stripeCustomerId })
      .eq('id', organizationId)
  }

  // Get price ID for selected tier
  const priceId = SUBSCRIPTION_TIERS[tier.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS].stripePriceId
  
  if (!priceId) {
    throw new Error('Invalid subscription tier')
  }

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      }
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    subscription_data: {
      metadata: {
        organization_id: organizationId,
        tier: tier
      }
    },
    metadata: {
      organization_id: organizationId,
      tier: tier
    }
  })

  return { sessionId: session.id, url: session.url }
}

/**
 * Create Stripe portal session for managing subscription
 */
export async function createPortalSession(
  organizationId: string,
  returnUrl: string
) {
  const supabase = await createClient()
  
  // Get organization with Stripe customer ID
  const { data: org } = await supabase
    .from('organizations')
    .select('stripe_customer_id')
    .eq('id', organizationId)
    .single()

  if (!org?.stripe_customer_id) {
    throw new Error('No Stripe customer found for organization')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: org.stripe_customer_id,
    return_url: returnUrl,
  })

  return { url: session.url }
}

/**
 * Handle webhook from Stripe
 */
export async function handleStripeWebhook(
  body: string,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    throw new Error('Invalid webhook signature')
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const organizationId = session.metadata?.organization_id
      const tier = session.metadata?.tier || 'starter'

      if (!organizationId) {
        console.error('No organization ID in checkout session')
        break
      }

      // Create subscription record
      await supabase
        .from('subscriptions')
        .insert({
          organization_id: organizationId,
          stripe_subscription_id: session.subscription as string,
          stripe_customer_id: session.customer as string,
          status: 'active',
          tier: tier,
          provider: 'stripe',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

      break
    }

    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      
      await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)

      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}