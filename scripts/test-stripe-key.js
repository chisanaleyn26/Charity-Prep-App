#!/usr/bin/env node

/**
 * Test script to verify Stripe API key
 */

const Stripe = require('stripe');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testStripeKey() {
  console.log('🔍 Testing Stripe API Key\n');

  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    return;
  }

  // Check key format
  console.log('📋 Key Details:');
  console.log(`   Starts with: ${secretKey.substring(0, 7)}...`);
  console.log(`   Length: ${secretKey.length} characters`);
  console.log(`   Test mode: ${secretKey.startsWith('sk_test_') ? 'Yes ✅' : 'No ❌'}`);
  console.log('\n');

  try {
    // Initialize Stripe
    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    console.log('🔌 Testing connection to Stripe...\n');

    // Try to list products (this will verify the key works)
    const products = await stripe.products.list({ limit: 1 });
    
    console.log('✅ Success! API key is valid.');
    console.log(`   Found ${products.data.length} product(s) in your account`);
    
    // Also try to get account info
    const account = await stripe.accounts.retrieve();
    console.log(`   Account: ${account.business_profile?.name || account.email || 'Connected'}`);
    console.log(`   Country: ${account.country}`);
    
  } catch (error) {
    console.error('❌ API Key Test Failed:');
    console.error(`   Error Type: ${error.type}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Status Code: ${error.statusCode}`);
    
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  This usually means:');
      console.error('   1. The API key is invalid or revoked');
      console.error('   2. The key has extra spaces or hidden characters');
      console.error('   3. You\'re using a restricted key without proper permissions');
      console.error('\n💡 Try:');
      console.error('   1. Copy the key again from Stripe Dashboard');
      console.error('   2. Make sure there are no extra spaces');
      console.error('   3. Use the "Reveal test key" button to see the full key');
    }
  }
}

// Run the test
testStripeKey();