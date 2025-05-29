#!/usr/bin/env node

/**
 * Manually sync a subscription from Stripe
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function syncSubscription(sessionId) {
  console.log('🔄 Syncing subscription from session:', sessionId, '\n');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found');
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

  try {
    // Get the session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    });

    console.log('✅ Found session:');
    console.log(`   Status: ${session.status}`);
    console.log(`   Payment Status: ${session.payment_status}`);
    console.log(`   Organization ID: ${session.metadata?.organizationId}`);

    if (!session.subscription || typeof session.subscription === 'string') {
      console.error('❌ No subscription found in session');
      return;
    }

    const subscription = session.subscription;
    const organizationId = session.metadata?.organizationId;
    const customerId = typeof session.customer === 'string' 
      ? session.customer 
      : session.customer?.id;

    // Determine tier from price
    const priceId = subscription.items.data[0]?.price.id;
    let tier = 'essentials';

    const priceMap = {
      'price_1RU8JlFqLaCwMbaKEraYuFdq': 'essentials', // monthly
      'price_1RU8BAFqLaCwMbaKy4Z1Fcqu': 'essentials', // yearly
      'price_1RU8JPFqLaCwMbaK1MCWbApS': 'standard',   // monthly
      'price_1RU8BWFqLaCwMbaKdpIAOcXP': 'standard',   // yearly
      'price_1RU8K0FqLaCwMbaKRJGw0GVk': 'premium',    // monthly
      'price_1RU8ByFqLaCwMbaKK9t2z3N1': 'premium',    // yearly
    };

    tier = priceMap[priceId] || 'essentials';

    console.log(`\n📋 Subscription details:`);
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Price ID: ${priceId}`);

    // Store customer
    if (customerId) {
      const { error: customerError } = await supabase
        .from('stripe_customers')
        .upsert({
          organization_id: organizationId,
          stripe_customer_id: customerId,
          email: session.customer_email || session.customer_details?.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id'
        });

      if (customerError) {
        console.error('❌ Failed to store customer:', customerError);
      } else {
        console.log('✅ Customer stored');
      }
    }

    // Update subscription
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        organization_id: organizationId,
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        tier,
        status: subscription.status,
        payment_provider: 'stripe',
        trial_ends_at: subscription.trial_end 
          ? new Date(subscription.trial_end * 1000).toISOString() 
          : null,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        canceled_at: subscription.canceled_at 
          ? new Date(subscription.canceled_at * 1000).toISOString() 
          : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'organization_id'
      });

    if (subError) {
      console.error('❌ Failed to update subscription:', subError);
    } else {
      console.log('✅ Subscription synced to database');
    }

    // Log event
    const { error: eventError } = await supabase
      .from('billing_events')
      .insert({
        organization_id: organizationId,
        user_id: session.metadata?.user_id,
        event_type: 'manual_subscription_sync',
        stripe_session_id: sessionId,
        metadata: {
          subscription_id: subscription.id,
          status: subscription.status,
          tier
        }
      });

    if (eventError) {
      console.error('⚠️  Failed to log event:', eventError.message);
    }

    console.log('\n✅ Sync complete!');

  } catch (error) {
    console.error('❌ Error syncing subscription:', error.message);
  }
}

// Get session ID from command line
const sessionId = process.argv[2];

if (!sessionId) {
  console.log('Usage: node manual-sync-subscription.js <session_id>');
  console.log('\nYour completed session ID: cs_test_b1xo76fJkgWqea6Ert2eNpqqn0OlawdZlrrvUJqAl2uC1MA3c4pmjJZjtV');
} else {
  syncSubscription(sessionId);
}