#!/usr/bin/env node

/**
 * Test the sync_stripe_subscription database function
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

async function testSyncFunction() {
  console.log('🧪 Testing sync_stripe_subscription function\n');

  // Create Supabase client with anon key
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // First, sign in as a test user (you'll need to replace with actual credentials)
  console.log('📝 Note: This test requires you to be signed in as an admin user');
  console.log('   The function will check your permissions before syncing\n');

  // Test data
  const testData = {
    p_organization_id: '4c24aad5-7856-4e1b-a859-5043f73b7de6',
    p_user_id: '8c8902bd-3a1f-4488-b1e8-bef15f3a1f2c',
    p_stripe_subscription_id: 'sub_test_' + Date.now(),
    p_stripe_customer_id: 'cus_test_' + Date.now(),
    p_tier: 'essentials',
    p_status: 'active',
    p_trial_ends_at: null,
    p_current_period_start: new Date().toISOString(),
    p_current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    p_canceled_at: null,
    p_session_id: 'cs_test_' + Date.now(),
    p_customer_email: 'test@example.com'
  };

  console.log('🔄 Calling sync_stripe_subscription with test data...\n');

  try {
    const { data, error } = await supabase
      .rpc('sync_stripe_subscription', testData);

    if (error) {
      console.error('❌ Function call failed:', error);
      return;
    }

    if (data?.success) {
      console.log('✅ Success! Function returned:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Function returned error:', data?.error || 'Unknown error');
    }

    // Check if subscription was created
    console.log('\n🔍 Checking if subscription was created...');
    const { data: sub, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', testData.p_organization_id)
      .single();

    if (sub) {
      console.log('✅ Subscription found in database');
      console.log(`   Stripe ID: ${sub.stripe_subscription_id}`);
      console.log(`   Status: ${sub.status}`);
      console.log(`   Tier: ${sub.tier}`);
    } else {
      console.log('❌ Subscription not found:', subError?.message);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Run the test
testSyncFunction();