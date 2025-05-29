-- Migration to add Stripe fields to subscriptions table while keeping Paddle for migration
BEGIN;

-- Add Stripe fields to subscriptions table
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_provider VARCHAR(20) DEFAULT 'paddle' CHECK (payment_provider IN ('paddle', 'stripe')),
ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

-- Add index for Stripe lookup
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Add user's preferred organization to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS preferred_organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS last_active_organization_id UUID REFERENCES organizations(id);

-- Create a function to get user's active subscription
CREATE OR REPLACE FUNCTION get_user_active_subscription(p_user_id UUID)
RETURNS TABLE (
    organization_id UUID,
    subscription_id UUID,
    tier subscription_tier,
    status subscription_status,
    payment_provider VARCHAR,
    trial_ends_at TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.organization_id,
        s.id as subscription_id,
        s.tier,
        s.status,
        s.payment_provider,
        s.trial_ends_at,
        s.current_period_end
    FROM subscriptions s
    INNER JOIN organization_members om ON om.organization_id = s.organization_id
    WHERE om.user_id = p_user_id
    AND om.accepted_at IS NOT NULL
    AND s.status IN ('trialing', 'active')
    ORDER BY 
        CASE WHEN s.status = 'active' THEN 0 ELSE 1 END,
        s.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user's organizations with subscription info
CREATE OR REPLACE VIEW user_organizations_with_subscription AS
SELECT 
    om.user_id,
    om.organization_id,
    om.role,
    om.accepted_at,
    o.name as organization_name,
    o.charity_number,
    s.id as subscription_id,
    s.tier as subscription_tier,
    s.status as subscription_status,
    s.payment_provider,
    s.trial_ends_at,
    s.current_period_end,
    CASE 
        WHEN s.status = 'active' THEN true
        WHEN s.status = 'trialing' AND s.trial_ends_at > NOW() THEN true
        ELSE false
    END as has_active_subscription
FROM organization_members om
INNER JOIN organizations o ON o.id = om.organization_id
LEFT JOIN subscriptions s ON s.organization_id = om.organization_id
WHERE om.accepted_at IS NOT NULL;

-- Add RLS policy for the view
ALTER VIEW user_organizations_with_subscription OWNER TO authenticated;

COMMIT;