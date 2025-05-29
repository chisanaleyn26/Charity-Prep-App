const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking Subscriptions Table Schema\n');
  
  try {
    // Get one subscription record to see all fields
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)
      .single();
      
    if (error) {
      console.error('Error fetching subscription:', error);
      return;
    }
    
    console.log('Sample subscription record:');
    console.log(JSON.stringify(subscription, null, 2));
    
    console.log('\nAvailable columns:');
    console.log(Object.keys(subscription || {}));
    
    // Check for price_id variations
    console.log('\nChecking for price_id fields:');
    const fields = Object.keys(subscription || {});
    console.log('- price_id:', fields.includes('price_id'));
    console.log('- stripe_price_id:', fields.includes('stripe_price_id'));
    console.log('- stripe_product_id:', fields.includes('stripe_product_id'));
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkSchema();