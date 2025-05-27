import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Test endpoint for Stripe webhooks (bypasses signature verification)
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test endpoint not available in production' },
      { status: 403 }
    );
  }

  try {
    const event = await request.json();
    const supabase = await createClient();

    // Process based on event type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Test: Checkout session completed', session);
        
        // Simulate updating subscription
        if (session.metadata?.organizationId) {
          const { error } = await supabase
            .from('subscriptions')
            .upsert({
              organization_id: session.metadata.organizationId,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              status: 'active',
              tier: session.metadata.tier || 'standard',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            });
            
          if (error) {
            console.error('Failed to update subscription:', error);
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        console.log('Test: Subscription updated', subscription);
        
        if (subscription.id) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status === 'active' ? 'active' : 'past_due',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq('stripe_subscription_id', subscription.id);
            
          if (error) {
            console.error('Failed to update subscription:', error);
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('Test: Payment succeeded', invoice);
        
        // Log payment in notifications
        if (invoice.customer) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('organization_id')
            .eq('stripe_customer_id', invoice.customer)
            .single();
            
          if (sub) {
            await supabase
              .from('notifications')
              .insert({
                organization_id: sub.organization_id,
                type: 'info',
                title: 'Payment Successful',
                message: `Payment of ${(invoice.amount_paid / 100).toFixed(2)} ${invoice.currency.toUpperCase()} processed successfully`,
                data: { invoice_id: invoice.id }
              });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        console.log('Test: Payment failed', invoice);
        
        // Update subscription and notify
        if (invoice.customer) {
          const { data: sub } = await supabase
            .from('subscriptions')
            .select('organization_id')
            .eq('stripe_customer_id', invoice.customer)
            .single();
            
          if (sub) {
            await supabase
              .from('subscriptions')
              .update({ status: 'past_due' })
              .eq('organization_id', sub.organization_id);
              
            await supabase
              .from('notifications')
              .insert({
                organization_id: sub.organization_id,
                type: 'warning',
                title: 'Payment Failed',
                message: `Payment of ${(invoice.amount_due / 100).toFixed(2)} ${invoice.currency.toUpperCase()} failed. Please update your payment method.`,
                data: { invoice_id: invoice.id }
              });
          }
        }
        break;
      }

      default:
        console.log('Test: Unhandled event type', event.type);
    }

    return NextResponse.json({ 
      received: true,
      type: event.type,
      processed: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      { error: 'Test webhook handler failed' },
      { status: 400 }
    );
  }
}