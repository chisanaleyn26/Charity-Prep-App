-- Documents table for file management
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('policy', 'certificate', 'report', 'form', 'other')),
    category TEXT,
    description TEXT,
    tags TEXT[],
    uploaded_by UUID REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Tasks table for import processing
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    task_type TEXT NOT NULL CHECK (task_type IN ('email_extraction', 'csv_mapping', 'document_analysis', 'ocr_extraction')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_message TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table for alerts and reminders
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    type TEXT NOT NULL CHECK (type IN ('deadline_reminder', 'expiry_warning', 'compliance_alert', 'system_update', 'user_action')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
    action_url TEXT,
    action_label TEXT,
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Calendar events for deadline tracking
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL CHECK (event_type IN ('deadline', 'reminder', 'review', 'renewal', 'meeting')),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    all_day BOOLEAN DEFAULT false,
    location TEXT,
    attendees TEXT[],
    related_record_type TEXT,
    related_record_id UUID,
    reminder_minutes INTEGER[],
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    deadline_reminders BOOLEAN DEFAULT true,
    weekly_summary BOOLEAN DEFAULT true,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    timezone TEXT DEFAULT 'UTC',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization settings table
CREATE TABLE organization_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
    compliance_review_frequency INTEGER DEFAULT 90, -- days
    auto_reminders BOOLEAN DEFAULT true,
    retention_policy_days INTEGER DEFAULT 2555, -- 7 years default
    default_dbs_validity_months INTEGER DEFAULT 36,
    require_two_factor BOOLEAN DEFAULT false,
    allowed_file_types TEXT[] DEFAULT ARRAY['pdf', 'doc', 'docx', 'jpg', 'png'],
    max_file_size_mb INTEGER DEFAULT 10,
    custom_fields JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_expires_at ON documents(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_ai_tasks_organization_id ON ai_tasks(organization_id);
CREATE INDEX idx_ai_tasks_user_id ON ai_tasks(user_id);
CREATE INDEX idx_ai_tasks_status ON ai_tasks(status);
CREATE INDEX idx_ai_tasks_task_type ON ai_tasks(task_type);

CREATE INDEX idx_notifications_organization_id ON notifications(organization_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_calendar_events_organization_id ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_event_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_events_related_record ON calendar_events(related_record_type, related_record_id) WHERE related_record_type IS NOT NULL;

-- Enable RLS on new tables
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Users can view documents in their organization" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can manage documents" ON documents
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

-- RLS Policies for ai_tasks
CREATE POLICY "Users can view AI tasks in their organization" ON ai_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_tasks.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their own AI tasks" ON ai_tasks
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (
        user_id = auth.uid() OR (
            user_id IS NULL AND EXISTS (
                SELECT 1 FROM organization_members om
                WHERE om.organization_id = notifications.organization_id
                AND om.user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage organization notifications" ON notifications
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) = 'admin'
    );

-- RLS Policies for calendar_events
CREATE POLICY "Users can view calendar events in their organization" ON calendar_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = calendar_events.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can manage calendar events" ON calendar_events
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

-- RLS Policies for user_settings
CREATE POLICY "Users can manage their own settings" ON user_settings
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for organization_settings
CREATE POLICY "Users can view organization settings" ON organization_settings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_settings.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage organization settings" ON organization_settings
    FOR ALL USING (
        user_organization_role(organization_id, auth.uid()) = 'admin'
    );

-- Create function to automatically create user settings
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to automatically create organization settings
CREATE OR REPLACE FUNCTION create_organization_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organization_settings (organization_id)
    VALUES (NEW.id)
    ON CONFLICT (organization_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_create_user_settings
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_settings();

CREATE TRIGGER trigger_create_organization_settings
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_organization_settings();