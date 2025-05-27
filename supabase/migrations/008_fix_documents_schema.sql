-- Fix documents table schema to match frontend expectations
-- Drop and recreate the documents table with correct column names

DROP TABLE IF EXISTS documents CASCADE;

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- File details (matching frontend expectations)
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    storage_path TEXT NOT NULL UNIQUE, -- Supabase storage path

    -- Document classification
    document_type VARCHAR(50) NOT NULL, -- policy, certificate, report, form, other
    category VARCHAR(50), -- Safeguarding, Financial, Legal, HR, Operations, Fundraising, Governance
    description TEXT,
    tags TEXT[],

    -- Document lifecycle
    expires_at TIMESTAMPTZ,
    is_public BOOLEAN DEFAULT false,

    -- AI processing
    extracted_data JSONB,
    is_processed BOOLEAN DEFAULT false,
    extraction_error TEXT,

    -- Security
    is_sensitive BOOLEAN DEFAULT false,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_size_limit CHECK (file_size <= 52428800), -- 50MB limit
    CONSTRAINT chk_document_type_valid CHECK (document_type IN ('policy', 'certificate', 'report', 'form', 'other'))
);

-- Create indexes for performance
CREATE INDEX idx_documents_org_type ON documents(organization_id, document_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_category ON documents(organization_id, category) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_expires ON documents(expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_search ON documents USING gin(to_tsvector('english', file_name || ' ' || COALESCE(description, '') || ' ' || COALESCE(array_to_string(tags, ' '), '')));

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

CREATE POLICY "Members can update their organization's documents" ON documents
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

-- Storage bucket setup (these would need to be run in Supabase Dashboard or via API)
-- CREATE BUCKET 'documents' WITH (public = false, file_size_limit = 52428800, allowed_mime_types = array['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']);

-- For now, add comments on how to set up storage
COMMENT ON TABLE documents IS 'Storage bucket "documents" must be created in Supabase with: public=false, file_size_limit=52428800 (50MB), allowed_mime_types=[image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain]';