const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyUserLimitMigration() {
  console.log('Applying user limit migration...');
  
  const migrationSQL = `
-- Function to check if organization can add more users based on subscription
CREATE OR REPLACE FUNCTION check_organization_user_limit(org_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_count INTEGER;
  user_limit INTEGER;
  subscription_tier TEXT;
  subscription_status TEXT;
  price_id TEXT;
BEGIN
  -- Get current user count (including accepted members only)
  SELECT COUNT(*) INTO current_user_count
  FROM organization_members
  WHERE organization_id = org_id
  AND accepted_at IS NOT NULL;

  -- Get active subscription
  SELECT s.tier, s.status, s.price_id INTO subscription_tier, subscription_status, price_id
  FROM subscriptions s
  WHERE s.organization_id = org_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no active subscription, allow only 1 user (free tier)
  IF subscription_tier IS NULL THEN
    user_limit := 1;
  ELSE
    -- Check price_id for tier determination (handles both new and legacy naming)
    price_id := LOWER(COALESCE(price_id, ''));
    
    IF price_id LIKE '%essentials%' OR price_id LIKE '%starter%' THEN
      user_limit := 10;
    ELSIF price_id LIKE '%standard%' OR price_id LIKE '%growth%' OR
          price_id LIKE '%professional%' THEN
      user_limit := 50;
    ELSIF price_id LIKE '%premium%' OR price_id LIKE '%scale%' THEN
      user_limit := -1; -- Unlimited
    ELSE
      -- Default based on tier column if price_id doesn't match
      CASE subscription_tier
        WHEN 'ESSENTIALS' THEN user_limit := 10;
        WHEN 'STANDARD' THEN user_limit := 50;
        WHEN 'PREMIUM' THEN user_limit := -1;
        ELSE user_limit := 1; -- Default to free tier limit
      END CASE;
    END IF;
  END IF;

  -- Check if organization can add more users
  IF user_limit = -1 THEN
    RETURN TRUE; -- Unlimited users
  ELSE
    RETURN current_user_count < user_limit;
  END IF;
END;
$$;

-- Function to get organization user limit
CREATE OR REPLACE FUNCTION get_organization_user_limit(org_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_tier TEXT;
  price_id TEXT;
  user_limit INTEGER;
BEGIN
  -- Get active subscription
  SELECT s.tier, s.price_id INTO subscription_tier, price_id
  FROM subscriptions s
  WHERE s.organization_id = org_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no active subscription, return free tier limit
  IF subscription_tier IS NULL THEN
    RETURN 1;
  END IF;

  -- Check price_id for tier determination
  price_id := LOWER(COALESCE(price_id, ''));
  
  IF price_id LIKE '%essentials%' OR price_id LIKE '%starter%' THEN
    RETURN 10;
  ELSIF price_id LIKE '%standard%' OR price_id LIKE '%growth%' OR
        price_id LIKE '%professional%' THEN
    RETURN 50;
  ELSIF price_id LIKE '%premium%' OR price_id LIKE '%scale%' THEN
    RETURN -1; -- Unlimited
  ELSE
    -- Default based on tier column if price_id doesn't match
    CASE subscription_tier
      WHEN 'ESSENTIALS' THEN RETURN 10;
      WHEN 'STANDARD' THEN RETURN 50;
      WHEN 'PREMIUM' THEN RETURN -1;
      ELSE RETURN 1;
    END CASE;
  END IF;
END;
$$;
  `;

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    
    console.log('✅ User limit functions created successfully');
    
    // Update existing organization members to have accepted_at
    const { error: updateError } = await supabase
      .from('organization_members')
      .update({ accepted_at: supabase.raw('COALESCE(accepted_at, created_at)') })
      .is('accepted_at', null);
      
    if (updateError) {
      console.error('Error updating organization members:', updateError);
    } else {
      console.log('✅ Updated existing organization members');
    }
    
  } catch (error) {
    console.error('Failed to apply migration:', error);
  }
}

applyUserLimitMigration();