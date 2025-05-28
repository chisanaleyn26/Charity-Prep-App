'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { 
  getStripeServer, 
  createCheckoutSession as createStripeCheckoutSession,
  createPortalSession as createStripePortalSession,
  cancelSubscription as cancelStripeSubscription,
  resumeSubscription as resumeStripeSubscription,
  getPriceId,
  getTierFromPriceId,
  type SubscriptionTier 
} from '@/lib/payments/stripe'

// Validation schemas
const CheckoutSchema = z.object({
  tier: z.enum(['ESSENTIALS', 'STANDARD', 'PREMIUM'] as const),
  billingCycle: z.enum(['monthly', 'yearly']),
  organizationId: z.string().uuid(),
})

const PortalSchema = z.object({
  organizationId: z.string().uuid(),
})

const SubscriptionActionSchema = z.object({
  organizationId: z.string().uuid(),
})

// Server Actions

/**
 * Create a Stripe checkout session for new subscriptions
 */
export async function createCheckoutSession(data: FormData | { 
  tier: SubscriptionTier; 
  billingCycle: 'monthly' | 'yearly'; 
  organizationId: string 
}) {
  let redirectUrl: string | null = null
  
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Parse and validate input
    const input = data instanceof FormData 
      ? {
          tier: data.get('tier') as SubscriptionTier,
          billingCycle: data.get('billingCycle') as 'monthly' | 'yearly',
          organizationId: data.get('organizationId') as string,
        }
      : data

    const validatedData = CheckoutSchema.parse(input)

    // Verify user has access to organization
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', validatedData.organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      throw new Error('Access denied to organization')
    }

    // Only admins and owners can manage billing
    if (!['admin', 'owner'].includes(orgMember.role)) {
      throw new Error('Insufficient permissions to manage billing')
    }

    // Check if organization already has an active subscription
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', validatedData.organizationId)
      .eq('status', 'active')
      .single()

    if (existingSubscription) {
      throw new Error('Organization already has an active subscription. Please use the manage subscription option.')
    }

    // Get organization details
    const { data: organization } = await supabase
      .from('organizations')
      .select('name')
      .eq('id', validatedData.organizationId)
      .single()

    // Get or create Stripe customer
    let customerId: string
    
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', validatedData.organizationId)
      .single()

    const stripe = getStripeServer()

    if (existingCustomer) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
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
          email: user.email,
        })
    }

    // Create checkout session
    const priceId = getPriceId(validatedData.tier, validatedData.billingCycle)
    
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
      metadata: {
        organization_id: validatedData.organizationId,
        tier: validatedData.tier,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          organization_id: validatedData.organizationId,
          tier: validatedData.tier,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true,
      },
    })

    // Log checkout attempt
    await supabase
      .from('billing_events')
      .insert({
        organization_id: validatedData.organizationId,
        user_id: user.id,
        event_type: 'checkout_session_created',
        stripe_session_id: session.id,
        metadata: {
          tier: validatedData.tier,
          billing_cycle: validatedData.billingCycle,
        },
      })

    // Set redirect URL
    redirectUrl = session.url!

  } catch (error) {
    console.error('Checkout session creation error:', error)
    
    if (error instanceof z.ZodError) {
      throw new Error('Invalid request data')
    }
    
    throw new Error(error instanceof Error ? error.message : 'Failed to create checkout session')
  }
  
  // Redirect outside of try-catch
  if (redirectUrl) {
    redirect(redirectUrl)
  }
}

/**
 * Create a Stripe portal session for managing subscriptions
 */
export async function createPortalSession(data: FormData | { organizationId: string }) {
  let redirectUrl: string | null = null
  
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Parse and validate input
    const input = data instanceof FormData 
      ? { organizationId: data.get('organizationId') as string }
      : data

    const validatedData = PortalSchema.parse(input)

    // Verify user has access to organization
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', validatedData.organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember) {
      throw new Error('Access denied to organization')
    }

    // Only admins and owners can manage billing
    if (!['admin', 'owner'].includes(orgMember.role)) {
      throw new Error('Insufficient permissions to manage billing')
    }

    // Get Stripe customer ID
    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', validatedData.organizationId)
      .single()

    if (customerError || !customer) {
      throw new Error('No billing information found for this organization')
    }

    // Create portal session
    const session = await createStripePortalSession({
      customerId: customer.stripe_customer_id,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    })

    // Log portal access
    await supabase
      .from('billing_events')
      .insert({
        organization_id: validatedData.organizationId,
        user_id: user.id,
        event_type: 'portal_session_created',
        metadata: {
          portal_session_id: session.id,
        },
      })

    // Set redirect URL
    redirectUrl = session.url

  } catch (error) {
    console.error('Portal session creation error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to create portal session')
  }
  
  // Redirect outside of try-catch
  if (redirectUrl) {
    redirect(redirectUrl)
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(data: FormData | { organizationId: string }) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Parse and validate input
    const input = data instanceof FormData 
      ? { organizationId: data.get('organizationId') as string }
      : data

    const validatedData = SubscriptionActionSchema.parse(input)

    // Verify permissions
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', validatedData.organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember || !['admin', 'owner'].includes(orgMember.role)) {
      throw new Error('Insufficient permissions')
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', validatedData.organizationId)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      throw new Error('No active subscription found')
    }

    // Cancel in Stripe
    await cancelStripeSubscription(subscription.stripe_subscription_id)

    // Update database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', validatedData.organizationId)

    // Log cancellation
    await supabase
      .from('billing_events')
      .insert({
        organization_id: validatedData.organizationId,
        user_id: user.id,
        event_type: 'subscription_canceled',
        metadata: {
          stripe_subscription_id: subscription.stripe_subscription_id,
        },
      })

    revalidatePath('/settings/billing')
    
    return { success: true, message: 'Subscription will be canceled at the end of the current period' }

  } catch (error) {
    console.error('Cancel subscription error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to cancel subscription')
  }
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(data: FormData | { organizationId: string }) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      throw new Error('Authentication required')
    }

    // Parse and validate input
    const input = data instanceof FormData 
      ? { organizationId: data.get('organizationId') as string }
      : data

    const validatedData = SubscriptionActionSchema.parse(input)

    // Verify permissions
    const { data: orgMember, error: orgError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', validatedData.organizationId)
      .eq('user_id', user.id)
      .single()

    if (orgError || !orgMember || !['admin', 'owner'].includes(orgMember.role)) {
      throw new Error('Insufficient permissions')
    }

    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', validatedData.organizationId)
      .eq('cancel_at_period_end', true)
      .single()

    if (subError || !subscription) {
      throw new Error('No canceled subscription found')
    }

    // Resume in Stripe
    await resumeStripeSubscription(subscription.stripe_subscription_id)

    // Update database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', validatedData.organizationId)

    // Log reactivation
    await supabase
      .from('billing_events')
      .insert({
        organization_id: validatedData.organizationId,
        user_id: user.id,
        event_type: 'subscription_reactivated',
        metadata: {
          stripe_subscription_id: subscription.stripe_subscription_id,
        },
      })

    revalidatePath('/settings/billing')
    
    return { success: true, message: 'Subscription reactivated successfully' }

  } catch (error) {
    console.error('Reactivate subscription error:', error)
    throw new Error(error instanceof Error ? error.message : 'Failed to reactivate subscription')
  }
}

/**
 * Get subscription overview with usage data
 */
export async function getSubscriptionOverview(organizationId: string) {
  try {
    const supabase = await createServerClient()

    // Get subscription data
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (subError || !subscription) {
      return {
        hasSubscription: false,
        tier: null,
        status: null,
        billingCycle: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        usage: null,
      }
    }

    // Get usage data
    const { data: usage } = await supabase
      .from('usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    // Get organization member count
    const { count: memberCount } = await supabase
      .from('organization_members')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)

    // Calculate current usage
    const currentUsage = {
      users: { current: memberCount || 0, limit: subscription.user_limit || -1 },
      storage: { current: usage?.storage_used || 0, limit: subscription.storage_limit || -1 },
      aiRequests: { current: usage?.ai_requests_this_month || 0, limit: subscription.ai_requests_limit || -1 },
      exports: { current: usage?.exports_this_month || 0, limit: subscription.exports_limit || -1 },
    }

    return {
      hasSubscription: true,
      tier: subscription.tier,
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodEnd: subscription.current_period_end,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      usage: currentUsage,
    }

  } catch (error) {
    console.error('Get subscription overview error:', error)
    throw new Error('Failed to load subscription information')
  }
}

/**
 * Get invoices for an organization
 */
export async function getInvoices(organizationId: string) {
  try {
    const supabase = await createServerClient()
    
    // Get Stripe customer ID
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .single()

    if (!customer) {
      return { invoices: [] }
    }

    // Get invoices from Stripe
    const stripe = getStripeServer()
    const invoices = await stripe.invoices.list({
      customer: customer.stripe_customer_id,
      limit: 100,
    })

    return {
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        amount: (invoice.amount_paid || 0) / 100, // Convert from cents
        status: invoice.status,
        paidAt: invoice.status === 'paid' ? new Date(invoice.status_transitions.paid_at! * 1000).toISOString() : undefined,
        hostedUrl: invoice.hosted_invoice_url,
      }))
    }

  } catch (error) {
    console.error('Get invoices error:', error)
    return { invoices: [] }
  }
}

/**
 * Get payment method for an organization
 */
export async function getPaymentMethod(organizationId: string) {
  try {
    const supabase = await createServerClient()
    
    // Get Stripe customer ID
    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .single()

    if (!customer) {
      return { paymentMethod: null }
    }

    // Get payment methods from Stripe
    const stripe = getStripeServer()
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.stripe_customer_id,
      type: 'card',
    })

    if (paymentMethods.data.length === 0) {
      return { paymentMethod: null }
    }

    const defaultMethod = paymentMethods.data[0]
    
    return {
      paymentMethod: {
        brand: defaultMethod.card!.brand,
        last4: defaultMethod.card!.last4,
        expMonth: defaultMethod.card!.exp_month,
        expYear: defaultMethod.card!.exp_year,
      }
    }

  } catch (error) {
    console.error('Get payment method error:', error)
    return { paymentMethod: null }
  }
}