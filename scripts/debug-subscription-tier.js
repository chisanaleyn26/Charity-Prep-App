const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSubscriptionTier(orgId) {
  console.log('🔍 Debugging Subscription Tier\n');
  
  try {
    // If no orgId provided, get the first organization with a subscription
    if (!orgId) {
      const { data: orgs, error: orgError } = await supabase
        .from('subscriptions')
        .select('organization_id, organizations(name)')
        .eq('status', 'active')
        .limit(1);
        
      if (orgError || !orgs?.length) {
        console.error('No active subscriptions found');
        return;
      }
      
      orgId = orgs[0].organization_id;
      console.log('Using organization:', orgs[0].organizations?.name || orgId);
    }
    
    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('organization_id', orgId)
      .eq('status', 'active')
      .single();
      
    if (subError) {
      console.error('Error fetching subscription:', subError);
      return;
    }
    
    console.log('\nSubscription Details:');
    console.log('- ID:', subscription.id);
    console.log('- Organization ID:', subscription.organization_id);
    console.log('- Status:', subscription.status);
    console.log('- Tier:', subscription.tier);
    console.log('- Price ID:', subscription.price_id);
    console.log('- Provider:', subscription.provider);
    console.log('- Created:', new Date(subscription.created_at).toLocaleDateString());
    
    // Test the database functions
    console.log('\n📊 Testing Database Functions:');
    
    const { data: canAdd, error: canAddError } = await supabase
      .rpc('check_organization_user_limit', { org_id: orgId });
      
    console.log('- Can add users:', canAdd, canAddError ? `(Error: ${canAddError.message})` : '');
    
    const { data: limit, error: limitError } = await supabase
      .rpc('get_organization_user_limit', { org_id: orgId });
      
    console.log('- User limit:', limit === -1 ? 'Unlimited' : limit, limitError ? `(Error: ${limitError.message})` : '');
    
    // Get member count
    const { data: members, error: memberError } = await supabase
      .from('organization_members')
      .select('id, accepted_at')
      .eq('organization_id', orgId);
      
    if (!memberError) {
      const acceptedCount = members.filter(m => m.accepted_at).length;
      console.log('- Current members:', acceptedCount);
      console.log('- Total member records:', members.length);
    }
    
    // Pattern matching tests
    console.log('\n🧪 Pattern Matching Tests:');
    const priceId = subscription.price_id?.toLowerCase() || '';
    const tier = subscription.tier?.toUpperCase() || '';
    
    console.log('Price ID patterns:');
    console.log('- Contains "standard":', priceId.includes('standard'));
    console.log('- Contains "growth":', priceId.includes('growth'));
    console.log('- Contains "professional":', priceId.includes('professional'));
    
    console.log('\nTier field:');
    console.log('- Equals "STANDARD":', tier === 'STANDARD');
    console.log('- Raw tier value:', JSON.stringify(subscription.tier));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Get orgId from command line argument
const orgId = process.argv[2];
debugSubscriptionTier(orgId);