#!/usr/bin/env node

/**
 * Check Stripe checkout sessions
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function checkSessions() {
  console.log('🔍 Checking recent Stripe checkout sessions\n');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found');
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

  try {
    // List recent checkout sessions
    const sessions = await stripe.checkout.sessions.list({
      limit: 10,
      expand: ['data.subscription', 'data.customer']
    });

    console.log(`Found ${sessions.data.length} checkout sessions:\n`);

    for (const session of sessions.data) {
      console.log(`Session: ${session.id}`);
      console.log(`  Status: ${session.status}`);
      console.log(`  Payment Status: ${session.payment_status}`);
      console.log(`  Created: ${new Date(session.created * 1000).toLocaleString()}`);
      console.log(`  Customer Email: ${session.customer_email}`);
      console.log(`  Amount: £${(session.amount_total || 0) / 100}`);
      
      if (session.metadata) {
        console.log(`  Metadata:`, session.metadata);
      }

      if (session.subscription) {
        const sub = typeof session.subscription === 'string' 
          ? session.subscription 
          : session.subscription.id;
        console.log(`  Subscription ID: ${sub}`);
        
        if (typeof session.subscription !== 'string') {
          console.log(`  Subscription Status: ${session.subscription.status}`);
        }
      }

      console.log(`  Success URL: ${session.success_url}`);
      console.log('');
    }

    // Also check for active subscriptions
    console.log('\n📋 Active Subscriptions:\n');
    const subscriptions = await stripe.subscriptions.list({
      limit: 10,
      status: 'all'
    });

    for (const sub of subscriptions.data) {
      console.log(`Subscription: ${sub.id}`);
      console.log(`  Status: ${sub.status}`);
      console.log(`  Customer: ${sub.customer}`);
      console.log(`  Created: ${new Date(sub.created * 1000).toLocaleString()}`);
      
      if (sub.metadata) {
        console.log(`  Metadata:`, sub.metadata);
      }
      
      console.log('');
    }

  } catch (error) {
    console.error('Error checking sessions:', error.message);
  }
}

// Run check
checkSessions();