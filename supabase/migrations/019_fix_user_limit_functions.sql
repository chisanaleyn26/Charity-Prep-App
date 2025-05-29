-- Fix user limit functions to handle missing price_id column
-- and use lowercase tier values

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
BEGIN
  -- Get current user count (including accepted members only)
  SELECT COUNT(*) INTO current_user_count
  FROM organization_members
  WHERE organization_id = org_id
  AND accepted_at IS NOT NULL;

  -- Get active subscription
  SELECT s.tier, s.status INTO subscription_tier, subscription_status
  FROM subscriptions s
  WHERE s.organization_id = org_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no active subscription, allow only 1 user (free tier)
  IF subscription_tier IS NULL THEN
    user_limit := 1;
  ELSE
    -- Convert tier to uppercase for comparison
    subscription_tier := UPPER(subscription_tier);
    
    CASE subscription_tier
      WHEN 'ESSENTIALS' THEN user_limit := 10;
      WHEN 'STANDARD' THEN user_limit := 50;
      WHEN 'PREMIUM' THEN user_limit := -1; -- Unlimited
      ELSE user_limit := 1; -- Default to free tier limit
    END CASE;
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
  user_limit INTEGER;
BEGIN
  -- Get active subscription
  SELECT s.tier INTO subscription_tier
  FROM subscriptions s
  WHERE s.organization_id = org_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- If no active subscription, return free tier limit
  IF subscription_tier IS NULL THEN
    RETURN 1;
  END IF;

  -- Convert tier to uppercase for comparison
  subscription_tier := UPPER(subscription_tier);
  
  CASE subscription_tier
    WHEN 'ESSENTIALS' THEN RETURN 10;
    WHEN 'STANDARD' THEN RETURN 50;
    WHEN 'PREMIUM' THEN RETURN -1; -- Unlimited
    ELSE RETURN 1; -- Default to free tier
  END CASE;
END;
$$;

-- Add comments to document the functions
COMMENT ON FUNCTION check_organization_user_limit IS 'Checks if an organization can add more users based on their subscription tier. Returns TRUE if they can add users, FALSE if at limit.';
COMMENT ON FUNCTION get_organization_user_limit IS 'Returns the user limit for an organization based on their subscription. Returns -1 for unlimited, or the specific limit number.';