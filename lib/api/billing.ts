'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from './utils'
import { SUBSCRIPTION_TIERS } from '@/lib/constants'

// Paddle configuration (would be in env vars)
const PADDLE_VENDOR_ID = process.env.PADDLE_VENDOR_ID
const PADDLE_API_KEY = process.env.PADDLE_API_KEY
const PADDLE_PUBLIC_KEY = process.env.NEXT_PUBLIC_PADDLE_PUBLIC_KEY

export interface BillingInfo {
  organizationId: string
  subscriptionTier: 'free' | 'professional' | 'enterprise'
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'unpaid'
  paddleSubscriptionId?: string
  paddleCustomerId?: string
  currentPeriodEnd?: Date
  cancelAtPeriodEnd: boolean
  paymentMethod?: {
    type: string
    last4?: string
    expiryMonth?: number
    expiryYear?: number
  }
  usage: {
    records: number
    recordsLimit: number
    aiRequests: number
    aiRequestsLimit: number
    storage: number
    storageLimit: number
  }
}

export interface Invoice {
  id: string
  invoiceNumber: string
  amount: number
  currency: string
  status: 'paid' | 'open' | 'void' | 'uncollectable'
  dueDate?: Date
  paidAt?: Date
  paddleInvoiceId?: string
  lineItems: Array<{
    description: string
    amount: number
    quantity: number
  }>
}

/**
 * Get billing information for organization
 */
export async function getBillingInfo(
  organizationId: string
): Promise<{ billing?: BillingInfo; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get organization and subscription info
    const { data: org } = await supabase
      .from('organizations')
      .select(`
        *,
        subscriptions (*)
      `)
      .eq('id', organizationId)
      .single()
    
    if (!org) {
      return { error: 'Organization not found' }
    }
    
    // Get usage data
    const [
      { count: recordsCount },
      { count: aiRequestsCount },
      { data: storageData }
    ] = await Promise.all([
      // Count total records
      supabase
        .from('safeguarding_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      
      // Count AI requests this month
      supabase
        .from('ai_requests')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(new Date().setDate(1)).toISOString()),
      
      // Calculate storage usage
      supabase.rpc('calculate_storage_usage', {
        p_organization_id: organizationId
      })
    ])
    
    const tier = SUBSCRIPTION_TIERS[org.subscription_tier as keyof typeof SUBSCRIPTION_TIERS]
    
    const billing: BillingInfo = {
      organizationId,
      subscriptionTier: org.subscription_tier,
      subscriptionStatus: org.subscriptions?.[0]?.status || 'active',
      paddleSubscriptionId: org.subscriptions?.[0]?.paddle_subscription_id,
      paddleCustomerId: org.paddle_customer_id,
      currentPeriodEnd: org.subscriptions?.[0]?.current_period_end 
        ? new Date(org.subscriptions[0].current_period_end)
        : undefined,
      cancelAtPeriodEnd: org.subscriptions?.[0]?.cancel_at_period_end || false,
      usage: {
        records: recordsCount || 0,
        recordsLimit: tier.limits.records,
        aiRequests: aiRequestsCount || 0,
        aiRequestsLimit: tier.limits.aiRequests,
        storage: storageData?.[0]?.total_bytes || 0,
        storageLimit: tier.limits.storage * 1024 * 1024 * 1024 // Convert GB to bytes
      }
    }
    
    // Get payment method from Paddle if subscribed
    if (billing.paddleSubscriptionId) {
      // This would call Paddle API to get payment method
      // For now, returning mock data
      billing.paymentMethod = {
        type: 'card',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2025
      }
    }
    
    return { billing }
    
  } catch (error) {
    console.error('Get billing info error:', error)
    return { error: 'Failed to get billing information' }
  }
}

/**
 * Create checkout session
 */
export async function createCheckoutSession(
  organizationId: string,
  tier: 'professional' | 'enterprise',
  billingPeriod: 'monthly' | 'annual'
): Promise<{ checkoutUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { error: 'You do not have permission to manage billing' }
    }
    
    // Get organization
    const { data: org } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single()
    
    if (!org) {
      return { error: 'Organization not found' }
    }
    
    // Create Paddle checkout
    // This would integrate with Paddle API
    // For now, returning a mock checkout URL
    const checkoutUrl = `https://checkout.paddle.com/checkout/custom?vendor=${PADDLE_VENDOR_ID}&product=${tier}_${billingPeriod}&passthrough=${JSON.stringify({
      organizationId,
      userId: user.id,
      tier,
      billingPeriod
    })}`
    
    return { checkoutUrl }
    
  } catch (error) {
    console.error('Create checkout session error:', error)
    return { error: 'Failed to create checkout session' }
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership || membership.role !== 'owner') {
      return { error: 'Only the owner can cancel subscription' }
    }
    
    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()
    
    if (!subscription || !subscription.paddle_subscription_id) {
      return { error: 'No active subscription found' }
    }
    
    // Cancel via Paddle API
    // This would call Paddle API
    // For now, just update database
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return { error: 'Failed to cancel subscription' }
  }
}

/**
 * Resume cancelled subscription
 */
export async function resumeSubscription(
  organizationId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership || membership.role !== 'owner') {
      return { error: 'Only the owner can manage subscription' }
    }
    
    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .eq('cancel_at_period_end', true)
      .single()
    
    if (!subscription) {
      return { error: 'No cancelled subscription found' }
    }
    
    // Resume via Paddle API
    // This would call Paddle API
    // For now, just update database
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
    
    if (error) throw error
    
    return { success: true }
    
  } catch (error) {
    console.error('Resume subscription error:', error)
    return { error: 'Failed to resume subscription' }
  }
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
  organizationId: string
): Promise<{ updateUrl?: string; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Check permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single()
    
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return { error: 'You do not have permission to manage billing' }
    }
    
    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .single()
    
    if (!subscription || !subscription.paddle_subscription_id) {
      return { error: 'No active subscription found' }
    }
    
    // Generate Paddle update URL
    // This would use Paddle API
    const updateUrl = `https://checkout.paddle.com/subscription/update?subscription=${subscription.paddle_subscription_id}`
    
    return { updateUrl }
    
  } catch (error) {
    console.error('Update payment method error:', error)
    return { error: 'Failed to update payment method' }
  }
}

/**
 * Get invoices
 */
export async function getInvoices(
  organizationId: string,
  options?: {
    status?: 'paid' | 'open' | 'void' | 'uncollectable'
    limit?: number
  }
): Promise<{ invoices?: Invoice[]; error?: string }> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
    
    if (options?.status) {
      query = query.eq('status', options.status)
    }
    
    if (options?.limit) {
      query = query.limit(options.limit)
    }
    
    const { data: invoices, error } = await query
    
    if (error) throw error
    
    return { 
      invoices: invoices?.map(inv => ({
        ...inv,
        dueDate: inv.due_date ? new Date(inv.due_date) : undefined,
        paidAt: inv.paid_at ? new Date(inv.paid_at) : undefined,
        lineItems: inv.line_items || []
      })) || []
    }
    
  } catch (error) {
    console.error('Get invoices error:', error)
    return { error: 'Failed to get invoices' }
  }
}

/**
 * Download invoice PDF
 */
export async function downloadInvoice(
  invoiceId: string
): Promise<{ pdf?: Buffer; error?: string }> {
  try {
    const supabase = await createClient()
    const user = await requireAuth()
    
    // Get invoice
    const { data: invoice } = await supabase
      .from('invoices')
      .select(`
        *,
        organizations (
          name,
          charity_number,
          address
        )
      `)
      .eq('id', invoiceId)
      .single()
    
    if (!invoice) {
      return { error: 'Invoice not found' }
    }
    
    // Check permissions
    const { data: membership } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', invoice.organization_id)
      .eq('user_id', user.id)
      .single()
    
    if (!membership) {
      return { error: 'You do not have access to this invoice' }
    }
    
    // Generate invoice PDF
    // This would create a proper invoice PDF
    // For now, returning placeholder
    const pdfBuffer = Buffer.from(`Invoice ${invoice.invoice_number}`)
    
    return { pdf: pdfBuffer }
    
  } catch (error) {
    console.error('Download invoice error:', error)
    return { error: 'Failed to download invoice' }
  }
}

/**
 * Handle Paddle webhook
 */
export async function handlePaddleWebhook(
  event: any
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Verify webhook signature
    // This would verify the webhook came from Paddle
    
    switch (event.alert_name) {
      case 'subscription_created':
      case 'subscription_updated':
        // Update subscription in database
        await supabase
          .from('subscriptions')
          .upsert({
            organization_id: event.passthrough.organizationId,
            paddle_subscription_id: event.subscription_id,
            paddle_plan_id: event.subscription_plan_id,
            status: event.status,
            current_period_end: event.next_bill_date,
            cancel_at_period_end: event.cancelled_at ? true : false,
            updated_at: new Date().toISOString()
          })
        break
        
      case 'subscription_cancelled':
        // Mark subscription as cancelled
        await supabase
          .from('subscriptions')
          .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString()
          })
          .eq('paddle_subscription_id', event.subscription_id)
        break
        
      case 'subscription_payment_succeeded':
        // Create invoice record
        await supabase
          .from('invoices')
          .insert({
            organization_id: event.passthrough.organizationId,
            paddle_invoice_id: event.invoice_id,
            invoice_number: `INV-${event.invoice_id}`,
            amount: parseFloat(event.sale_gross),
            currency: event.currency,
            status: 'paid',
            paid_at: new Date().toISOString(),
            line_items: [{
              description: event.product_name,
              amount: parseFloat(event.sale_gross),
              quantity: 1
            }]
          })
        break
        
      case 'subscription_payment_failed':
        // Update subscription status
        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('paddle_subscription_id', event.subscription_id)
        break
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Paddle webhook error:', error)
    return { error: 'Failed to process webhook' }
  }
}