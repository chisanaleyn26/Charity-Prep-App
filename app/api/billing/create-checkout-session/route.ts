import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createCheckoutSession, getStripeServer } from '@/lib/payments/stripe'
import { z } from 'zod'
import { rateLimit, RateLimitConfigs } from '@/lib/security/rate-limiter'

const CreateCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  organizationId: z.string().min(1, 'Organization ID is required'),
  successUrl: z.string().url('Valid success URL is required'),
  cancelUrl: z.string().url('Valid cancel URL is required'),
  customerEmail: z.string().email('Valid email is required').optional(),
  metadata: z.record(z.string()).optional(),
  allowPromotionCodes: z.boolean().optional(),
  automaticTax: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  // Apply rate limiting to prevent checkout abuse
  const rateLimitResponse = await rateLimit({
    ...RateLimitConfigs.billing.createCheckout,
    keyPrefix: 'billing:checkout'
  })
  
  if (rateLimitResponse) {
    return rateLimitResponse
  }

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
    const validatedData = CreateCheckoutSchema.parse(body)

    // Verify user has access to organization
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', validatedData.organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      return NextResponse.json(
        { error: 'Access denied to organization' },
        { status: 403 }
      )
    }

    // Only admins and owners can manage billing
    if (!['admin', 'owner'].includes(orgMember.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to manage billing' },
        { status: 403 }
      )
    }

    // Check if organization already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', validatedData.organizationId)
      .eq('status', 'active')
      .single()

    // Get or create Stripe customer
    let customerId: string
    
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', validatedData.organizationId)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      // Create new Stripe customer
      const stripe = getStripeServer()
      
      const { data: organization } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', validatedData.organizationId)
        .single()

      const customer = await stripe.customers.create({
        email: validatedData.customerEmail || user.email,
        name: organization?.name || `Organization ${validatedData.organizationId}`,
        metadata: {
          organization_id: validatedData.organizationId,
          user_id: user.id,
        },
      })

      customerId = customer.id

      // Store customer ID in database
      await supabase
        .from('stripe_customers')
        .insert({
          organization_id: validatedData.organizationId,
          stripe_customer_id: customerId,
          email: validatedData.customerEmail || user.email,
        })
    }

    // Create checkout session
    const checkoutData = await createCheckoutSession({
      priceId: validatedData.priceId,
      organizationId: validatedData.organizationId,
      successUrl: validatedData.successUrl,
      cancelUrl: validatedData.cancelUrl,
      customerEmail: validatedData.customerEmail,
      metadata: {
        user_id: user.id,
        existing_subscription: existingSubscription ? 'true' : 'false',
        ...validatedData.metadata,
      },
      allowPromotionCodes: validatedData.allowPromotionCodes,
      automaticTax: validatedData.automaticTax,
    })

    // Log checkout attempt
    await supabase
      .from('billing_events')
      .insert({
        organization_id: validatedData.organizationId,
        user_id: user.id,
        event_type: 'checkout_session_created',
        stripe_session_id: checkoutData.sessionId,
        metadata: {
          price_id: validatedData.priceId,
          success_url: validatedData.successUrl,
          cancel_url: validatedData.cancelUrl,
        },
      })

    return NextResponse.json({
      sessionId: checkoutData.sessionId,
      url: checkoutData.url,
    })

  } catch (error) {
    console.error('Checkout session creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors.map(e => ({ 
            field: e.path.join('.'), 
            message: e.message 
          }))
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}