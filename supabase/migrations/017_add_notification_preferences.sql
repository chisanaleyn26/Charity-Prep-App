-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Notification settings
    dbs_expiry_reminder BOOLEAN DEFAULT true,
    dbs_expiry_days INTEGER DEFAULT 30,
    overseas_reporting_reminder BOOLEAN DEFAULT true,
    income_documentation_reminder BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one preference per user per organization
    UNIQUE(user_id, organization_id)
);

-- Create RLS policies for notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own preferences
CREATE POLICY "Users can view their preferences" ON notification_preferences
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their preferences" ON notification_preferences
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their preferences" ON notification_preferences
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Create default preferences for existing users
INSERT INTO notification_preferences (user_id, organization_id)
SELECT DISTINCT om.user_id, om.organization_id
FROM organization_members om
WHERE NOT EXISTS (
    SELECT 1 FROM notification_preferences np 
    WHERE np.user_id = om.user_id 
    AND np.organization_id = om.organization_id
);

-- Add indexes
CREATE INDEX idx_notification_preferences_user_org ON notification_preferences(user_id, organization_id);
CREATE INDEX idx_notification_preferences_org ON notification_preferences(organization_id);