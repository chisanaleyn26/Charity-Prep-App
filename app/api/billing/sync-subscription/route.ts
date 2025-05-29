import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getStripeServer } from '@/lib/payments/stripe'
import { z } from 'zod'

const SyncSubscriptionSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { sessionId } = SyncSubscriptionSchema.parse(body)

    // Retrieve the checkout session from Stripe
    const stripe = getStripeServer()
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (!session.subscription || typeof session.subscription === 'string') {
      return NextResponse.json(
        { error: 'No subscription found for this session' },
        { status: 400 }
      )
    }

    const organizationId = session.metadata?.organizationId
    if (!organizationId) {
      return NextResponse.json(
        { error: 'No organization ID in session metadata' },
        { status: 400 }
      )
    }

    // Verify user has access to organization (use regular client for auth check)
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Extract subscription details
    const subscription = session.subscription
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id

    // Determine tier from price ID
    const priceId = subscription.items.data[0]?.price.id
    let tier = 'essentials' // default
    
    // Check price IDs to determine tier
    const essentialsPrices = [
      process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY,
      process.env.STRIPE_PRICE_ESSENTIALS_YEARLY
    ]
    const standardPrices = [
      process.env.STRIPE_PRICE_STANDARD_MONTHLY,
      process.env.STRIPE_PRICE_STANDARD_YEARLY
    ]
    const premiumPrices = [
      process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
      process.env.STRIPE_PRICE_PREMIUM_YEARLY
    ]

    if (essentialsPrices.includes(priceId)) {
      tier = 'essentials'
    } else if (standardPrices.includes(priceId)) {
      tier = 'standard'
    } else if (premiumPrices.includes(priceId)) {
      tier = 'premium'
    }

    // Call the database function to sync subscription (bypasses RLS safely)
    const { data: syncResult, error: syncError } = await supabase
      .rpc('sync_stripe_subscription', {
        p_organization_id: organizationId,
        p_user_id: user.id,
        p_stripe_subscription_id: subscription.id,
        p_stripe_customer_id: customerId || null,
        p_tier: tier,
        p_status: subscription.status,
        p_trial_ends_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
        p_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        p_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        p_canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        p_session_id: sessionId,
        p_customer_email: session.customer_email || null
      })

    if (syncError || !syncResult?.success) {
      console.error('Failed to sync subscription:', syncError || syncResult)
      return NextResponse.json(
        { error: syncResult?.error || 'Failed to update subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        tier
      }
    })

  } catch (error) {
    console.error('Subscription sync error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    )
  }
}