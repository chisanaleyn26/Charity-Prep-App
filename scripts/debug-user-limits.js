const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugUserLimits() {
  console.log('🔍 Debugging User Limits for Standard Subscription\n');
  
  try {
    // First, let's find an organization with a Standard subscription
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*, organizations(id, name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (subError) {
      console.error('Error fetching subscriptions:', subError);
      return;
    }
    
    console.log('Active Subscriptions Found:', subscriptions.length);
    
    // Find Standard tier subscriptions
    const standardSubs = subscriptions.filter(s => {
      const priceId = (s.price_id || '').toLowerCase();
      const tier = (s.tier || '').toUpperCase();
      return priceId.includes('standard') || tier === 'STANDARD';
    });
    
    console.log('\nStandard Tier Subscriptions:', standardSubs.length);
    
    if (standardSubs.length > 0) {
      const testSub = standardSubs[0];
      const orgId = testSub.organization_id;
      
      console.log('\nTesting Organization:', testSub.organizations?.name || orgId);
      console.log('Price ID:', testSub.price_id);
      console.log('Tier:', testSub.tier);
      
      // Get current member count
      const { data: members, error: memberError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', orgId);
      
      if (memberError) {
        console.error('Error fetching members:', memberError);
      } else {
        console.log('\nCurrent Members:', members.length);
        console.log('Members with accepted_at:', members.filter(m => m.accepted_at).length);
      }
      
      // Test the check_organization_user_limit function
      const { data: canAddUser, error: checkError } = await supabase
        .rpc('check_organization_user_limit', { org_id: orgId });
      
      if (checkError) {
        console.error('\n❌ Error checking user limit:', checkError);
      } else {
        console.log('\n✅ Can add more users?', canAddUser);
      }
      
      // Test the get_organization_user_limit function
      const { data: userLimit, error: limitError } = await supabase
        .rpc('get_organization_user_limit', { org_id: orgId });
      
      if (limitError) {
        console.error('\n❌ Error getting user limit:', limitError);
      } else {
        console.log('User limit for this org:', userLimit === -1 ? 'Unlimited' : userLimit);
      }
      
      // Get pending invitations
      const { data: invitations, error: invError } = await supabase
        .from('invitations')
        .select('*')
        .eq('organization_id', orgId)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString());
      
      if (invError) {
        console.error('\nError fetching invitations:', invError);
      } else {
        console.log('\nPending invitations:', invitations.length);
      }
      
      // Calculate total users
      const acceptedMembers = members?.filter(m => m.accepted_at).length || 0;
      const pendingInvites = invitations?.length || 0;
      const totalUsers = acceptedMembers + pendingInvites;
      
      console.log('\n📊 Summary:');
      console.log('- Accepted members:', acceptedMembers);
      console.log('- Pending invitations:', pendingInvites);
      console.log('- Total users:', totalUsers);
      console.log('- User limit:', userLimit === -1 ? 'Unlimited' : userLimit);
      console.log('- Can add users:', canAddUser);
      
      // Test with different price_id patterns
      console.log('\n🧪 Testing price_id patterns:');
      const testPatterns = [
        'standard',
        'growth',
        'professional',
        testSub.price_id
      ];
      
      for (const pattern of testPatterns) {
        const isStandard = pattern.toLowerCase().includes('standard') || 
                          pattern.toLowerCase().includes('growth') || 
                          pattern.toLowerCase().includes('professional');
        console.log(`- "${pattern}" matches Standard tier:`, isStandard);
      }
      
    } else {
      console.log('\n⚠️  No Standard tier subscriptions found');
      
      // List all active subscriptions for debugging
      console.log('\nAll Active Subscriptions:');
      subscriptions.forEach(s => {
        console.log(`- ${s.organizations?.name || s.organization_id}: ${s.tier} (${s.price_id})`);
      });
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

debugUserLimits();