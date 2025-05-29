#!/usr/bin/env node

/**
 * Verify Stripe Price IDs exist
 */

const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

async function verifyPrices() {
  console.log('🔍 Verifying Stripe Price IDs\n');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found');
    return;
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  });

  const priceIds = {
    'Essentials Monthly': process.env.STRIPE_PRICE_ESSENTIALS_MONTHLY,
    'Essentials Yearly': process.env.STRIPE_PRICE_ESSENTIALS_YEARLY,
    'Standard Monthly': process.env.STRIPE_PRICE_STANDARD_MONTHLY,
    'Standard Yearly': process.env.STRIPE_PRICE_STANDARD_YEARLY,
    'Premium Monthly': process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    'Premium Yearly': process.env.STRIPE_PRICE_PREMIUM_YEARLY,
  };

  console.log('📋 Checking Price IDs:\n');

  for (const [name, priceId] of Object.entries(priceIds)) {
    if (!priceId) {
      console.log(`❌ ${name}: Not configured`);
      continue;
    }

    try {
      const price = await stripe.prices.retrieve(priceId);
      const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
      const interval = price.recurring ? price.recurring.interval : 'one-time';
      
      console.log(`✅ ${name}: ${priceId}`);
      console.log(`   Amount: £${amount} ${price.currency?.toUpperCase()}`);
      console.log(`   Interval: ${interval}`);
      console.log(`   Active: ${price.active ? 'Yes' : 'No'}`);
      
      if (price.product) {
        const product = await stripe.products.retrieve(price.product);
        console.log(`   Product: ${product.name}`);
      }
      console.log('');
    } catch (error) {
      console.log(`❌ ${name}: ${priceId}`);
      console.log(`   Error: ${error.message}`);
      console.log('');
    }
  }

  console.log('\n💡 Tips:');
  console.log('   - If prices are missing, create them in Stripe Dashboard');
  console.log('   - Make sure prices are active and not archived');
  console.log('   - Update .env.local with the correct Price IDs');
}

// Run verification
verifyPrices();