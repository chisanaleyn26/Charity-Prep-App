-- Migration to update Paddle references to Stripe
-- This migration renames columns from paddle_* to stripe_*

-- Rename columns in subscriptions table
ALTER TABLE subscriptions 
  RENAME COLUMN paddle_subscription_id TO stripe_subscription_id;

ALTER TABLE subscriptions 
  RENAME COLUMN paddle_customer_id TO stripe_customer_id;

-- Update any existing comments
COMMENT ON COLUMN subscriptions.stripe_subscription_id IS 'Stripe subscription ID for billing management';
COMMENT ON COLUMN subscriptions.stripe_customer_id IS 'Stripe customer ID for the organization';

-- If there are any invoices table references, update those too
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'invoices' 
    AND column_name = 'paddle_invoice_id'
  ) THEN
    ALTER TABLE invoices 
      RENAME COLUMN paddle_invoice_id TO stripe_invoice_id;
    
    COMMENT ON COLUMN invoices.stripe_invoice_id IS 'Stripe invoice ID for payment tracking';
  END IF;
END $$;

-- Update any indexes that may reference the old column names
DO $$ 
BEGIN
  -- Check and rename index on stripe_subscription_id if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_subscriptions_paddle_subscription_id'
  ) THEN
    ALTER INDEX idx_subscriptions_paddle_subscription_id 
      RENAME TO idx_subscriptions_stripe_subscription_id;
  END IF;
  
  -- Check and rename index on stripe_customer_id if it exists
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_subscriptions_paddle_customer_id'
  ) THEN
    ALTER INDEX idx_subscriptions_paddle_customer_id 
      RENAME TO idx_subscriptions_stripe_customer_id;
  END IF;
END $$;

-- Add comment to track migration
COMMENT ON TABLE subscriptions IS 'Organization subscription records - Updated from Paddle to Stripe integration';