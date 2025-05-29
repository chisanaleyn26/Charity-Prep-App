-- Add provider column to subscriptions table to support both Paddle and Stripe
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS provider text DEFAULT 'paddle' CHECK (provider IN ('paddle', 'stripe'));

-- Add Stripe-specific columns
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
ADD COLUMN IF NOT EXISTS stripe_customer_id text,
ADD COLUMN IF NOT EXISTS tier text CHECK (tier IN ('free', 'starter', 'professional', 'enterprise')),
ADD COLUMN IF NOT EXISTS billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS migrated_to_stripe_at timestamptz;

-- Add indexes for Stripe columns
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider);

-- Add stripe_customer_id to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS stripe_customer_id text UNIQUE;

-- Create subscription_migrations table for tracking migrations
CREATE TABLE IF NOT EXISTS subscription_migrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  from_provider text NOT NULL,
  to_provider text NOT NULL,
  from_subscription_id text,
  to_customer_id text,
  to_subscription_id text,
  migrated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage_tracking table for subscription limits
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  users_count integer DEFAULT 0,
  storage_used bigint DEFAULT 0, -- in bytes
  ai_requests_count integer DEFAULT 0,
  exports_count integer DEFAULT 0,
  period_start date NOT NULL,
  period_end date NOT NULL,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, period_start)
);

-- Create function to increment usage counters
CREATE OR REPLACE FUNCTION increment_usage(
  org_id uuid,
  usage_type text,
  period_start timestamp
) RETURNS void AS $$
BEGIN
  INSERT INTO usage_tracking (organization_id, period_start, period_end, last_updated)
  VALUES (
    org_id,
    date_trunc('month', period_start)::date,
    (date_trunc('month', period_start) + interval '1 month' - interval '1 day')::date,
    now()
  )
  ON CONFLICT (organization_id, period_start) DO NOTHING;
  
  EXECUTE format('
    UPDATE usage_tracking 
    SET %I = %I + 1, last_updated = now()
    WHERE organization_id = $1 
    AND period_start = date_trunc(''month'', $2)::date
  ', usage_type, usage_type)
  USING org_id, period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for new tables
ALTER TABLE subscription_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscription migrations policies
CREATE POLICY "Users can view their organization's migration history"
  ON subscription_migrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = subscription_migrations.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

-- Usage tracking policies
CREATE POLICY "Users can view their organization's usage"
  ON usage_tracking FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = usage_tracking.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage usage tracking"
  ON usage_tracking FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Update existing subscriptions to have provider = 'paddle' if null
UPDATE subscriptions 
SET provider = 'paddle' 
WHERE provider IS NULL;

-- Add comment for clarity
COMMENT ON COLUMN subscriptions.provider IS 'Payment provider: paddle (legacy) or stripe (new)';
COMMENT ON COLUMN subscriptions.tier IS 'Subscription tier: free, starter, professional, enterprise';
COMMENT ON COLUMN organizations.stripe_customer_id IS 'Stripe customer ID for billing';