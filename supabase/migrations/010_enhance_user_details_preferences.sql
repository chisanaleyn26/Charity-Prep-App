-- Migration: Enhance user details and preferences
-- Description: Add comprehensive user profile fields and preferences for better personalization

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

-- Rollback script (save separately)
-- BEGIN;
-- ALTER TABLE users DROP COLUMN IF EXISTS job_title;
-- ALTER TABLE users DROP COLUMN IF EXISTS department;
-- -- ... etc for all columns
-- DROP FUNCTION IF EXISTS update_user_preferences;
-- DROP VIEW IF EXISTS user_profile_completeness;
-- COMMIT;