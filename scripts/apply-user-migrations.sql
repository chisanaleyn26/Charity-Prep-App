-- =====================================================
-- CHARITY PREP - USER ENHANCEMENT MIGRATIONS
-- =====================================================
-- Run these migrations in your Supabase SQL Editor
-- Go to: https://app.supabase.com/project/[your-project-id]/sql
-- =====================================================

-- =====================================================
-- MIGRATION 1: Enhance user details and preferences
-- =====================================================

BEGIN;

-- Add professional details columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);

-- Add compliance preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_reminder_days INTEGER DEFAULT 30;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_reminder_time TIME DEFAULT '09:00:00';
ALTER TABLE users ADD COLUMN IF NOT EXISTS dashboard_layout VARCHAR(50) DEFAULT 'grid';
ALTER TABLE users ADD COLUMN IF NOT EXISTS compliance_areas_focus JSONB DEFAULT '["safeguarding", "overseas", "fundraising"]';

-- Add UI/UX preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'system';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Europe/London';
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY';
ALTER TABLE users ADD COLUMN IF NOT EXISTS currency_format VARCHAR(10) DEFAULT 'GBP';

-- Expand notification preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_channels JSONB DEFAULT '{
  "email": {
    "compliance_alerts": true,
    "deadline_reminders": true,
    "weekly_summary": true,
    "product_updates": false,
    "tips_and_tricks": true
  },
  "sms": {
    "urgent_compliance": true,
    "expiry_final_warning": true
  },
  "in_app": {
    "all": true
  }
}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS urgent_notifications_sms BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS report_frequency VARCHAR(20) DEFAULT 'weekly';

-- Add onboarding and help preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS feature_tours_completed JSONB DEFAULT '[]';
ALTER TABLE users ADD COLUMN IF NOT EXISTS help_preferences JSONB DEFAULT '{
  "show_tooltips": true,
  "show_guided_tours": true,
  "show_keyboard_shortcuts": true,
  "accessibility_mode": false
}';

-- Add data privacy preferences
ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_preference VARCHAR(20) DEFAULT 'standard';
ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_opt_in BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT false;

-- Add account status fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS deactivation_reason VARCHAR(255);

-- Add API access fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key_created_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS api_rate_limit INTEGER DEFAULT 1000;

-- Add constraints
ALTER TABLE users ADD CONSTRAINT chk_theme_valid 
  CHECK (theme IN ('light', 'dark', 'system'));

ALTER TABLE users ADD CONSTRAINT chk_dashboard_layout_valid 
  CHECK (dashboard_layout IN ('grid', 'list', 'compact', 'detailed'));

ALTER TABLE users ADD CONSTRAINT chk_report_frequency_valid 
  CHECK (report_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'never'));

ALTER TABLE users ADD CONSTRAINT chk_language_valid 
  CHECK (language IN ('en', 'cy', 'gd')); -- English, Welsh, Scottish Gaelic

ALTER TABLE users ADD CONSTRAINT chk_reminder_days_valid 
  CHECK (compliance_reminder_days >= 0 AND compliance_reminder_days <= 365);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_theme ON users(theme);
CREATE INDEX IF NOT EXISTS idx_users_org_role ON users(id, created_at);

-- Add comments for documentation
COMMENT ON COLUMN users.job_title IS 'User''s job title within their charity organization';
COMMENT ON COLUMN users.compliance_reminder_days IS 'Days before expiry date to start receiving reminders';
COMMENT ON COLUMN users.compliance_areas_focus IS 'JSON array of compliance areas the user focuses on';
COMMENT ON COLUMN users.notification_channels IS 'Granular notification preferences by channel and type';
COMMENT ON COLUMN users.feature_tours_completed IS 'Array of feature tour IDs that have been completed';
COMMENT ON COLUMN users.help_preferences IS 'User preferences for help and guidance features';

-- Create a function to safely update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
  p_user_id UUID,
  p_preferences JSONB
) RETURNS JSONB AS $$
DECLARE
  v_current_prefs JSONB;
  v_updated_prefs JSONB;
BEGIN
  -- Get current preferences
  SELECT 
    jsonb_build_object(
      'theme', theme,
      'language', language,
      'timezone', timezone,
      'date_format', date_format,
      'currency_format', currency_format,
      'dashboard_layout', dashboard_layout,
      'compliance_reminder_days', compliance_reminder_days,
      'notification_channels', notification_channels,
      'help_preferences', help_preferences
    ) INTO v_current_prefs
  FROM users 
  WHERE id = p_user_id;
  
  -- Merge with new preferences
  v_updated_prefs := v_current_prefs || p_preferences;
  
  -- Update the user record
  UPDATE users 
  SET 
    theme = COALESCE((v_updated_prefs->>'theme')::VARCHAR, theme),
    language = COALESCE((v_updated_prefs->>'language')::VARCHAR, language),
    timezone = COALESCE((v_updated_prefs->>'timezone')::VARCHAR, timezone),
    date_format = COALESCE((v_updated_prefs->>'date_format')::VARCHAR, date_format),
    currency_format = COALESCE((v_updated_prefs->>'currency_format')::VARCHAR, currency_format),
    dashboard_layout = COALESCE((v_updated_prefs->>'dashboard_layout')::VARCHAR, dashboard_layout),
    compliance_reminder_days = COALESCE((v_updated_prefs->>'compliance_reminder_days')::INTEGER, compliance_reminder_days),
    notification_channels = COALESCE(v_updated_prefs->'notification_channels', notification_channels),
    help_preferences = COALESCE(v_updated_prefs->'help_preferences', help_preferences),
    updated_at = NOW()
  WHERE id = p_user_id;
  
  RETURN v_updated_prefs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for user profile completeness
CREATE OR REPLACE VIEW user_profile_completeness AS
SELECT 
  id,
  email,
  CASE
    WHEN full_name IS NOT NULL 
      AND phone IS NOT NULL 
      AND job_title IS NOT NULL 
      AND department IS NOT NULL 
      AND bio IS NOT NULL 
      AND avatar_url IS NOT NULL
    THEN 100
    ELSE (
      (CASE WHEN full_name IS NOT NULL THEN 20 ELSE 0 END) +
      (CASE WHEN phone IS NOT NULL THEN 15 ELSE 0 END) +
      (CASE WHEN job_title IS NOT NULL THEN 20 ELSE 0 END) +
      (CASE WHEN department IS NOT NULL THEN 15 ELSE 0 END) +
      (CASE WHEN bio IS NOT NULL THEN 15 ELSE 0 END) +
      (CASE WHEN avatar_url IS NOT NULL THEN 15 ELSE 0 END)
    )
  END as completion_percentage,
  ARRAY_REMOVE(ARRAY[
    CASE WHEN full_name IS NULL THEN 'full_name' END,
    CASE WHEN phone IS NULL THEN 'phone' END,
    CASE WHEN job_title IS NULL THEN 'job_title' END,
    CASE WHEN department IS NULL THEN 'department' END,
    CASE WHEN bio IS NULL THEN 'bio' END,
    CASE WHEN avatar_url IS NULL THEN 'avatar_url' END
  ], NULL) as missing_fields
FROM users;

-- Update RLS policies to include new fields
-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Add trigger to update last_login_at
CREATE OR REPLACE FUNCTION update_last_login() RETURNS TRIGGER AS $$
BEGIN
  NEW.last_login_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_last_login
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (OLD.last_login_at IS DISTINCT FROM NEW.last_login_at)
  EXECUTE FUNCTION update_last_login();

COMMIT;

-- =====================================================
-- MIGRATION 2: Create organization setup function
-- =====================================================

BEGIN;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS create_organization_with_setup;

-- Create the function that the onboarding page is calling
CREATE OR REPLACE FUNCTION create_organization_with_setup(
  p_name VARCHAR,
  p_charity_number VARCHAR DEFAULT NULL,
  p_income_band VARCHAR,
  p_financial_year_end DATE,
  p_primary_email VARCHAR,
  p_phone VARCHAR DEFAULT NULL,
  p_website VARCHAR DEFAULT NULL,
  p_address_line1 VARCHAR DEFAULT NULL,
  p_city VARCHAR DEFAULT NULL,
  p_postcode VARCHAR DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_org_id UUID;
  v_subscription_id UUID;
  v_error_message TEXT;
BEGIN
  -- Get the current user
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not authenticated'
    );
  END IF;
  
  -- Get user email from auth
  SELECT email INTO v_user_email 
  FROM auth.users 
  WHERE id = v_user_id;
  
  -- Start transaction
  BEGIN
    -- Ensure user record exists in public.users table
    INSERT INTO users (id, email, created_at, updated_at)
    VALUES (v_user_id, v_user_email, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE
    SET 
      email = EXCLUDED.email,
      updated_at = NOW(),
      last_login_at = NOW();
    
    -- Create the organization
    INSERT INTO organizations (
      name,
      charity_number,
      income_band,
      financial_year_end,
      primary_email,
      phone,
      website,
      address_line1,
      city,
      postcode,
      created_at,
      updated_at
    ) VALUES (
      p_name,
      NULLIF(p_charity_number, ''),
      p_income_band::organization_size,
      p_financial_year_end,
      p_primary_email,
      NULLIF(p_phone, ''),
      NULLIF(p_website, ''),
      NULLIF(p_address_line1, ''),
      NULLIF(p_city, ''),
      NULLIF(p_postcode, ''),
      NOW(),
      NOW()
    ) RETURNING id INTO v_org_id;
    
    -- Create organization membership (user as admin)
    INSERT INTO organization_members (
      organization_id,
      user_id,
      role,
      accepted_at,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      v_user_id,
      'admin'::user_role,
      NOW(),
      NOW(),
      NOW()
    );
    
    -- Create trial subscription
    INSERT INTO subscriptions (
      organization_id,
      tier,
      status,
      trial_ends_at,
      current_period_start,
      current_period_end,
      created_at,
      updated_at
    ) VALUES (
      v_org_id,
      'essentials'::subscription_tier,
      'trialing'::subscription_status,
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW() + INTERVAL '14 days',
      NOW(),
      NOW()
    ) RETURNING id INTO v_subscription_id;
    
    -- Return success with organization details
    RETURN jsonb_build_object(
      'success', true,
      'organization_id', v_org_id,
      'subscription_id', v_subscription_id,
      'user_role', 'admin',
      'trial_ends_at', (NOW() + INTERVAL '14 days')::TEXT
    );
    
  EXCEPTION
    WHEN unique_violation THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      RETURN jsonb_build_object(
        'success', false,
        'error', 'Organization with this charity number already exists'
      );
    WHEN check_violation THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      IF v_error_message LIKE '%chk_charity_number_format%' THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Invalid charity number format. Must be 6-8 digits, optionally followed by hyphen and 1-2 digits'
        );
      ELSIF v_error_message LIKE '%chk_year_end_valid%' THEN
        RETURN jsonb_build_object(
          'success', false,
          'error', 'Financial year end must be on the 1st or 31st of a month'
        );
      ELSE
        RETURN jsonb_build_object(
          'success', false,
          'error', v_error_message
        );
      END IF;
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;
      -- Rollback will happen automatically
      RETURN jsonb_build_object(
        'success', false,
        'error', v_error_message
      );
  END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_organization_with_setup TO authenticated;

-- Create a function to get user's organizations with role
CREATE OR REPLACE FUNCTION get_user_organizations(p_user_id UUID DEFAULT NULL)
RETURNS TABLE (
  organization_id UUID,
  organization_name VARCHAR,
  charity_number VARCHAR,
  user_role user_role,
  joined_at TIMESTAMPTZ,
  subscription_tier subscription_tier,
  subscription_status subscription_status
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.charity_number,
    om.role,
    om.accepted_at,
    s.tier,
    s.status
  FROM organizations o
  JOIN organization_members om ON o.id = om.organization_id
  LEFT JOIN subscriptions s ON o.id = s.organization_id
  WHERE om.user_id = COALESCE(p_user_id, auth.uid())
    AND o.deleted_at IS NULL
    AND om.accepted_at IS NOT NULL
  ORDER BY om.created_at DESC;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_organizations TO authenticated;

-- Create helper function to check if user is member of organization
CREATE OR REPLACE FUNCTION is_organization_member(
  p_organization_id UUID,
  p_user_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM organization_members 
    WHERE organization_id = p_organization_id
      AND user_id = COALESCE(p_user_id, auth.uid())
      AND accepted_at IS NOT NULL
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION is_organization_member TO authenticated;

COMMIT;

-- =====================================================
-- MIGRATION 3: Create test auth function
-- =====================================================

BEGIN;

-- Create simple test function for authentication
CREATE OR REPLACE FUNCTION test_create_org_simple(p_name VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Get current user ID
  v_user_id := auth.uid();
  
  -- Get user email if authenticated
  IF v_user_id IS NOT NULL THEN
    SELECT email INTO v_user_email 
    FROM auth.users 
    WHERE id = v_user_id;
  END IF;
  
  RETURN jsonb_build_object(
    'is_authenticated', v_user_id IS NOT NULL,
    'user_id', v_user_id,
    'user_email', v_user_email,
    'test_name', p_name,
    'timestamp', NOW()
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION test_create_org_simple TO authenticated;
GRANT EXECUTE ON FUNCTION test_create_org_simple TO anon;

COMMIT;

-- =====================================================
-- VERIFICATION QUERIES - Run these to check if migrations worked
-- =====================================================

-- Check if new columns were added to users table
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('job_title', 'department', 'bio', 'theme', 'compliance_reminder_days')
ORDER BY ordinal_position;

-- Check if functions were created
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('create_organization_with_setup', 'get_user_organizations', 'update_user_preferences', 'test_create_org_simple');

-- Check if view was created
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name = 'user_profile_completeness';

-- Test the profile completeness view (should show your user)
SELECT * FROM user_profile_completeness;

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================
-- Copy and save this separately in case you need to undo changes

/*
BEGIN;

-- Drop functions
DROP FUNCTION IF EXISTS update_user_preferences;
DROP FUNCTION IF EXISTS create_organization_with_setup;
DROP FUNCTION IF EXISTS get_user_organizations;
DROP FUNCTION IF EXISTS is_organization_member;
DROP FUNCTION IF EXISTS test_create_org_simple;
DROP FUNCTION IF EXISTS update_last_login;

-- Drop view
DROP VIEW IF EXISTS user_profile_completeness;

-- Drop trigger
DROP TRIGGER IF EXISTS update_user_last_login ON users;

-- Remove constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_theme_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_dashboard_layout_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_report_frequency_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_language_valid;
ALTER TABLE users DROP CONSTRAINT IF EXISTS chk_reminder_days_valid;

-- Drop indexes
DROP INDEX IF EXISTS idx_users_active;
DROP INDEX IF EXISTS idx_users_theme;
DROP INDEX IF EXISTS idx_users_org_role;

-- Drop columns (be careful - this will delete data!)
ALTER TABLE users DROP COLUMN IF EXISTS job_title;
ALTER TABLE users DROP COLUMN IF EXISTS department;
ALTER TABLE users DROP COLUMN IF EXISTS bio;
ALTER TABLE users DROP COLUMN IF EXISTS linkedin_url;
ALTER TABLE users DROP COLUMN IF EXISTS compliance_reminder_days;
ALTER TABLE users DROP COLUMN IF EXISTS preferred_reminder_time;
ALTER TABLE users DROP COLUMN IF EXISTS dashboard_layout;
ALTER TABLE users DROP COLUMN IF EXISTS compliance_areas_focus;
ALTER TABLE users DROP COLUMN IF EXISTS theme;
ALTER TABLE users DROP COLUMN IF EXISTS language;
ALTER TABLE users DROP COLUMN IF EXISTS timezone;
ALTER TABLE users DROP COLUMN IF EXISTS date_format;
ALTER TABLE users DROP COLUMN IF EXISTS currency_format;
ALTER TABLE users DROP COLUMN IF EXISTS notification_channels;
ALTER TABLE users DROP COLUMN IF EXISTS urgent_notifications_sms;
ALTER TABLE users DROP COLUMN IF EXISTS report_frequency;
ALTER TABLE users DROP COLUMN IF EXISTS onboarding_completed;
ALTER TABLE users DROP COLUMN IF EXISTS onboarding_step;
ALTER TABLE users DROP COLUMN IF EXISTS feature_tours_completed;
ALTER TABLE users DROP COLUMN IF EXISTS help_preferences;
ALTER TABLE users DROP COLUMN IF EXISTS data_retention_preference;
ALTER TABLE users DROP COLUMN IF EXISTS analytics_opt_in;
ALTER TABLE users DROP COLUMN IF EXISTS marketing_opt_in;
ALTER TABLE users DROP COLUMN IF EXISTS is_active;
ALTER TABLE users DROP COLUMN IF EXISTS deactivated_at;
ALTER TABLE users DROP COLUMN IF EXISTS deactivation_reason;
ALTER TABLE users DROP COLUMN IF EXISTS api_key_hash;
ALTER TABLE users DROP COLUMN IF EXISTS api_key_created_at;
ALTER TABLE users DROP COLUMN IF EXISTS api_rate_limit;

COMMIT;
*/