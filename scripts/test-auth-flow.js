#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create service role client for testing
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testAuthFlow() {
  console.log('🧪 Testing Auth Flow...\n');

  try {
    // 1. Test user authentication status
    console.log('1️⃣ Checking existing users with organizations...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        *,
        organization_members!inner(
          *,
          organization:organizations(*)
        )
      `)
      .limit(5);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log(`Found ${users?.length || 0} users with organizations\n`);

    if (users && users.length > 0) {
      for (const user of users) {
        console.log(`User: ${user.email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Organizations: ${user.organization_members.length}`);
        
        for (const membership of user.organization_members) {
          console.log(`    - ${membership.organization.name} (${membership.role})`);
          console.log(`      Accepted: ${membership.accepted_at ? '✅' : '❌'}`);
        }
        console.log('');
      }
    }

    // 2. Check subscription status
    console.log('2️⃣ Checking subscription statuses...');
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        organization:organizations(name)
      `)
      .eq('status', 'active')
      .limit(5);

    if (subError) {
      console.error('Error fetching subscriptions:', subError);
    } else {
      console.log(`Found ${subscriptions?.length || 0} active subscriptions\n`);
      
      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          console.log(`Organization: ${sub.organization?.name || 'Unknown'}`);
          console.log(`  Provider: ${sub.provider || 'paddle'}`);
          console.log(`  Tier: ${sub.tier || sub.plan_name || 'Unknown'}`);
          console.log(`  Status: ${sub.status}`);
          if (sub.stripe_subscription_id) {
            console.log(`  Stripe ID: ${sub.stripe_subscription_id}`);
          }
          if (sub.paddle_subscription_id) {
            console.log(`  Paddle ID: ${sub.paddle_subscription_id}`);
          }
          console.log('');
        }
      }
    }

    // 3. Check for users without organizations
    console.log('3️⃣ Checking for users without organizations...');
    const { data: orphanedUsers, error: orphanError } = await supabase
      .from('users')
      .select('*')
      .not('id', 'in', 
        supabase
          .from('organization_members')
          .select('user_id')
      )
      .limit(5);

    if (orphanError) {
      console.error('Error checking orphaned users:', orphanError);
    } else {
      console.log(`Found ${orphanedUsers?.length || 0} users without organizations`);
      if (orphanedUsers && orphanedUsers.length > 0) {
        console.log('These users would be redirected to onboarding:');
        for (const user of orphanedUsers) {
          console.log(`  - ${user.email} (${user.id})`);
        }
      }
    }

    // 4. Test organization with multiple members
    console.log('\n4️⃣ Testing multi-member organizations...');
    const { data: multiMemberOrgs, error: multiError } = await supabase
      .rpc('get_organizations_with_member_count')
      .gt('member_count', 1)
      .limit(3);

    if (multiError) {
      // Try a different approach if the RPC doesn't exist
      const { data: orgs, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members(count)
        `)
        .limit(10);

      if (!orgsError && orgs) {
        const multiOrgs = orgs.filter(org => org.organization_members[0].count > 1);
        console.log(`Found ${multiOrgs.length} organizations with multiple members`);
        for (const org of multiOrgs) {
          console.log(`  - ${org.name}: ${org.organization_members[0].count} members`);
        }
      }
    } else if (multiMemberOrgs) {
      console.log(`Found ${multiMemberOrgs.length} organizations with multiple members`);
      for (const org of multiMemberOrgs) {
        console.log(`  - ${org.name}: ${org.member_count} members`);
      }
    }

    console.log('\n✅ Auth flow test complete!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuthFlow();