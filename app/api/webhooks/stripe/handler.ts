import { NextRequest } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-10-28.acacia'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function handleStripeWebhook(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook signature verification failed', { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string
          const customerId = session.customer as string
          const organizationId = session.metadata?.organization_id
          
          if (!organizationId) {
            console.error('No organization_id in checkout session metadata')
            return new Response('Missing organization_id', { status: 400 })
          }

          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ['items.data.price.product']
          })

          const product = subscription.items.data[0].price.product as Stripe.Product
          const tier = product.metadata.tier || 'essentials'

          // Create or update subscription record
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              organization_id: organizationId,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              status: subscription.status,
              tier,
              payment_provider: 'stripe',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_ends_at: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              metadata: {
                stripe_price_id: subscription.items.data[0].price.id,
                stripe_product_id: product.id,
              }
            }, {
              onConflict: 'organization_id'
            })

          if (error) {
            console.error('Error creating subscription:', error)
            throw error
          }
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Find organization by stripe_customer_id
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (!existingSub) {
          console.log('No existing subscription found for:', subscription.id)
          break
        }

        const product = subscription.items.data[0].price.product as Stripe.Product
        const tier = product.metadata.tier || 'essentials'

        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_ends_at: subscription.trial_end 
              ? new Date(subscription.trial_end * 1000).toISOString() 
              : null,
            cancel_at: subscription.cancel_at
              ? new Date(subscription.cancel_at * 1000).toISOString()
              : null,
            canceled_at: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : null,
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error updating subscription:', error)
          throw error
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)

        if (error) {
          console.error('Error canceling subscription:', error)
          throw error
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.billing_reason === 'subscription_cycle') {
          // Update subscription payment status
          const subscriptionId = invoice.subscription as string
          
          const { error } = await supabase
            .from('subscriptions')
            .update({
              last_payment_date: new Date().toISOString(),
              last_payment_status: 'succeeded',
            })
            .eq('stripe_subscription_id', subscriptionId)

          if (error) {
            console.error('Error updating payment status:', error)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string
        
        // Update subscription to show payment failed
        const { error } = await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
            last_payment_status: 'failed',
            last_payment_error: invoice.last_payment_error?.message,
          })
          .eq('stripe_subscription_id', subscriptionId)

        if (error) {
          console.error('Error updating failed payment:', error)
        }

        // TODO: Send email notification about failed payment
        break
      }

      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer
        
        // Update customer info if needed
        if (customer.metadata.organization_id) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              stripe_customer_id: customer.id,
              metadata: {
                customer_email: customer.email,
                customer_name: customer.name,
              }
            })
            .eq('organization_id', customer.metadata.organization_id)

          if (error) {
            console.error('Error updating customer:', error)
          }
        }
        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`)
    }

    return new Response('Webhook processed', { status: 200 })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }
}