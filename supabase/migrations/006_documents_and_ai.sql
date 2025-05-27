-- Document storage
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- File details
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    storage_path TEXT NOT NULL, -- Supabase storage path

    -- Categorization
    category VARCHAR(50), -- dbs_certificate, policy, receipt, etc
    tags TEXT[],

    -- Extraction status
    is_processed BOOLEAN DEFAULT false,
    extracted_data JSONB,
    extraction_error TEXT,

    -- Security
    is_sensitive BOOLEAN DEFAULT false,
    encryption_key_id VARCHAR(100),

    -- Metadata
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_size_limit CHECK (size_bytes <= 52428800) -- 50MB limit
);

-- AI processing queue
CREATE TABLE ai_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Task details
    task_type VARCHAR(50) NOT NULL, -- extract_document, generate_narrative, import_csv, etc
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- Input/Output
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_message TEXT,
    error_details JSONB,

    -- Processing details
    model_used VARCHAR(50),
    tokens_used INTEGER,
    cost_pennies INTEGER,

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- User tracking
    requested_by UUID REFERENCES users(id),

    CONSTRAINT chk_status_valid CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

-- Create indexes
CREATE INDEX idx_documents_org_category ON documents(organization_id, category) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', filename || ' ' || COALESCE(tags::text, '')));
CREATE INDEX idx_ai_tasks_pending ON ai_tasks(organization_id, created_at) WHERE status = 'pending';
CREATE INDEX idx_ai_tasks_org_type ON ai_tasks(organization_id, task_type, created_at DESC);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Users can view their organization's documents" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can upload documents" ON documents
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Members can update documents" ON documents
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Admins can delete documents" ON documents
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'admin'
        )
    );

-- AI tasks policies
CREATE POLICY "Users can view their organization's AI tasks" ON ai_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_tasks.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can create AI tasks" ON ai_tasks
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_tasks.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'member')
        )
    );

CREATE POLICY "Members can update AI tasks" ON ai_tasks
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = ai_tasks.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('admin', 'member')
        )
    );