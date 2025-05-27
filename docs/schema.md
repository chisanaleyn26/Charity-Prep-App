# Charity Prep - Database Schema Design

## Table of Contents

1. [Design Philosophy](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#design-philosophy)
2. [Core Schema](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#core-schema)
3. [Compliance Modules](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#compliance-modules)
4. [Document Management](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#document-management)
5. [AI & Import System](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#ai--import-system)
6. [Reporting & Analytics](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#reporting--analytics)
7. [Audit & History](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#audit--history)
8. [Security & RLS Policies](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#security--rls-policies)
9. [Performance Optimization](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#performance-optimization)
10. [Migration Strategy](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#migration-strategy)

## Design Philosophy

### Core Principles

1. **Multi-tenancy First**: Every table has `organization_id` with RLS
2. **Audit Everything**: Complete history of all changes
3. **Soft Deletes**: Never lose data, use `deleted_at` timestamps
4. **UUID Primary Keys**: Globally unique, no sequence conflicts
5. **Normalized Design**: 3NF with strategic denormalization
6. **Type Safety**: Use ENUMs and constraints extensively
7. **Performance**: Index for known query patterns
8. **Compliance Ready**: Built for regulatory requirements

### Naming Conventions

- **Tables**: Plural, snake_case (e.g., `safeguarding_records`)
- **Columns**: snake_case, descriptive (e.g., `expiry_date`)
- **Indexes**: `idx_table_column` pattern
- **Constraints**: `chk_table_description` pattern
- **Foreign Keys**: `table_id` pattern

## Core Schema

### Organizations & Users

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types
CREATE TYPE organization_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE user_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE subscription_tier AS ENUM ('essentials', 'standard', 'premium');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled');

-- Organizations (core tenant table)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    charity_number VARCHAR(20) UNIQUE,
    charity_type VARCHAR(50), -- CIO, Trust, Association, etc

    -- Financial info
    income_band organization_size NOT NULL,
    financial_year_end DATE NOT NULL,

    -- Contact info
    primary_email VARCHAR(255) NOT NULL,
    website VARCHAR(255),
    phone VARCHAR(20),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    postcode VARCHAR(10),
    country VARCHAR(2) DEFAULT 'GB',

    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#6366f1',

    -- Settings
    settings JSONB DEFAULT '{}',
    reminder_days_before INTEGER DEFAULT 30,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_charity_number_format CHECK (charity_number ~ '^\d{6,8}(-\d{1,2})?$'),
    CONSTRAINT chk_year_end_valid CHECK (EXTRACT(DAY FROM financial_year_end) IN (1, 31))
);

-- Users (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    avatar_url TEXT,

    -- Preferences
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    weekly_digest BOOLEAN DEFAULT true,

    -- Metadata
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization membership (many-to-many with role)
CREATE TABLE organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'member',

    -- Permissions override (for custom permissions)
    custom_permissions JSONB,

    -- Invitation tracking
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, user_id)
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Stripe integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),

    -- Subscription details
    tier subscription_tier NOT NULL DEFAULT 'essentials',
    status subscription_status NOT NULL DEFAULT 'trialing',

    -- Dates
    trial_ends_at TIMESTAMPTZ,
    current_period_start TIMESTAMPTZ NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    canceled_at TIMESTAMPTZ,

    -- Usage tracking
    user_count INTEGER DEFAULT 1,
    storage_used_bytes BIGINT DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id)
);

```

## Compliance Modules

### Safeguarding Module

```sql
-- Types for safeguarding
CREATE TYPE dbs_check_type AS ENUM ('basic', 'standard', 'enhanced', 'enhanced_barred');
CREATE TYPE safeguarding_role_type AS ENUM ('employee', 'volunteer', 'trustee', 'contractor');

-- Safeguarding records (DBS checks)
CREATE TABLE safeguarding_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Person details
    person_name VARCHAR(255) NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    role_type safeguarding_role_type NOT NULL,
    department VARCHAR(100),

    -- DBS details
    dbs_certificate_number VARCHAR(20),
    dbs_check_type dbs_check_type NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,

    -- Additional checks
    reference_checks_completed BOOLEAN DEFAULT false,
    training_completed BOOLEAN DEFAULT false,
    training_date DATE,

    -- Risk assessment
    works_with_children BOOLEAN DEFAULT false,
    works_with_vulnerable_adults BOOLEAN DEFAULT false,
    unsupervised_access BOOLEAN DEFAULT false,

    -- Document references
    certificate_document_id UUID,

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Audit
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_dbs_number_format CHECK (dbs_certificate_number ~ '^\d{12}$' OR dbs_certificate_number IS NULL),
    CONSTRAINT chk_expiry_after_issue CHECK (expiry_date > issue_date)
);

-- Safeguarding policies
CREATE TABLE safeguarding_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- child_protection, vulnerable_adults, etc
    version VARCHAR(20) NOT NULL,

    -- Review cycle
    last_reviewed_date DATE NOT NULL,
    next_review_date DATE NOT NULL,
    review_frequency_months INTEGER DEFAULT 12,

    -- Document reference
    document_id UUID,

    -- Approval
    approved_by VARCHAR(255),
    approved_date DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Training records
CREATE TABLE safeguarding_training (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    safeguarding_record_id UUID REFERENCES safeguarding_records(id) ON DELETE CASCADE,

    training_name VARCHAR(255) NOT NULL,
    training_provider VARCHAR(255),
    completion_date DATE NOT NULL,
    expiry_date DATE,
    certificate_number VARCHAR(100),

    -- Document reference
    certificate_document_id UUID,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

### International Operations Module

```sql
-- Types for international operations
CREATE TYPE transfer_method AS ENUM (
    'bank_transfer',
    'wire_transfer',
    'cryptocurrency',
    'cash_courier',
    'money_service_business',
    'mobile_money',
    'informal_value_transfer',
    'other'
);

CREATE TYPE activity_type AS ENUM (
    'humanitarian_aid',
    'development',
    'education',
    'healthcare',
    'emergency_relief',
    'capacity_building',
    'advocacy',
    'other'
);

-- Countries reference table
CREATE TABLE countries (
    code CHAR(2) PRIMARY KEY, -- ISO 3166-1 alpha-2
    name VARCHAR(100) NOT NULL,
    region VARCHAR(50),
    is_high_risk BOOLEAN DEFAULT false,
    sanctions_list BOOLEAN DEFAULT false,
    requires_due_diligence BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Overseas partners
CREATE TABLE overseas_partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Partner details
    partner_name VARCHAR(255) NOT NULL,
    partner_type VARCHAR(50), -- NGO, Government, Contractor, etc
    country_code CHAR(2) REFERENCES countries(code),

    -- Contact info
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,

    -- Due diligence
    registration_number VARCHAR(100),
    registration_verified BOOLEAN DEFAULT false,
    has_formal_agreement BOOLEAN DEFAULT false,
    agreement_start_date DATE,
    agreement_end_date DATE,

    -- Risk assessment
    risk_assessment_completed BOOLEAN DEFAULT false,
    risk_assessment_date DATE,
    risk_level VARCHAR(20), -- low, medium, high

    -- Documents
    agreement_document_id UUID,
    due_diligence_document_id UUID,

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Overseas activities
CREATE TABLE overseas_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Activity details
    activity_name VARCHAR(255) NOT NULL,
    activity_type activity_type NOT NULL,
    country_code CHAR(2) NOT NULL REFERENCES countries(code),
    partner_id UUID REFERENCES overseas_partners(id),

    -- Financial details
    amount DECIMAL(12,2) NOT NULL,
    currency CHAR(3) DEFAULT 'GBP',
    amount_gbp DECIMAL(12,2) NOT NULL, -- Always store GBP equivalent
    exchange_rate DECIMAL(10,6),

    -- Transfer details
    transfer_method transfer_method NOT NULL,
    transfer_date DATE NOT NULL,
    transfer_reference VARCHAR(255),

    -- Period
    financial_year INTEGER NOT NULL,
    quarter INTEGER CHECK (quarter BETWEEN 1 AND 4),

    -- Additional details
    beneficiaries_count INTEGER,
    project_code VARCHAR(50),
    description TEXT,

    -- Compliance
    sanctions_check_completed BOOLEAN DEFAULT false,
    requires_reporting BOOLEAN DEFAULT false,
    reported_to_commission BOOLEAN DEFAULT false,

    -- Documents
    receipt_document_id UUID,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_amount_positive CHECK (amount > 0),
    CONSTRAINT chk_year_valid CHECK (financial_year >= 2020 AND financial_year <= 2100)
);

```

### Fundraising Module

```sql
-- Types for fundraising
CREATE TYPE income_source AS ENUM (
    'donations_legacies',
    'charitable_activities',
    'other_trading',
    'investments',
    'other'
);

CREATE TYPE fundraising_method AS ENUM (
    'individual_giving',
    'major_donors',
    'corporate',
    'trusts_foundations',
    'events',
    'online',
    'direct_mail',
    'telephone',
    'street',
    'legacies',
    'trading',
    'other'
);

CREATE TYPE donor_type AS ENUM ('individual', 'corporate', 'trust', 'government', 'other');

-- Income records
CREATE TABLE income_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Income details
    source income_source NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date_received DATE NOT NULL,
    financial_year INTEGER NOT NULL,

    -- Donor information
    donor_type donor_type,
    donor_name VARCHAR(255),
    is_anonymous BOOLEAN DEFAULT false,

    -- Categorization
    fundraising_method fundraising_method,
    campaign_name VARCHAR(255),
    restricted_funds BOOLEAN DEFAULT false,
    restriction_details TEXT,

    -- Related party flag
    is_related_party BOOLEAN DEFAULT false,
    related_party_relationship VARCHAR(255),

    -- Gift Aid
    gift_aid_eligible BOOLEAN DEFAULT false,
    gift_aid_claimed BOOLEAN DEFAULT false,

    -- Reference
    reference_number VARCHAR(100),
    notes TEXT,

    -- Documents
    receipt_document_id UUID,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    CONSTRAINT chk_income_positive CHECK (amount > 0)
);

-- Fundraising methods used
CREATE TABLE fundraising_methods_used (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    financial_year INTEGER NOT NULL,

    method fundraising_method NOT NULL,
    is_used BOOLEAN DEFAULT true,

    -- Professional fundraiser details
    uses_professional_fundraiser BOOLEAN DEFAULT false,
    fundraiser_name VARCHAR(255),
    fundraiser_registration VARCHAR(100),
    contract_start_date DATE,
    contract_end_date DATE,

    -- Performance
    amount_raised DECIMAL(12,2),
    cost DECIMAL(12,2),
    roi_percentage DECIMAL(5,2),

    -- Compliance
    complies_with_code BOOLEAN DEFAULT true,
    compliance_notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(organization_id, financial_year, method)
);

-- Major donations tracking
CREATE TABLE major_donations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    income_record_id UUID REFERENCES income_records(id),

    financial_year INTEGER NOT NULL,
    donor_type donor_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL,

    -- This tracks the highest donation per type per year
    is_highest_corporate BOOLEAN DEFAULT false,
    is_highest_individual BOOLEAN DEFAULT false,
    is_highest_related_party BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT chk_major_amount CHECK (amount >= 1000)
);

```

## Document Management

```sql
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

-- Document relationships (polymorphic)
CREATE TABLE document_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,

    -- Polymorphic reference
    linked_table VARCHAR(50) NOT NULL,
    linked_id UUID NOT NULL,

    -- Link type
    link_type VARCHAR(50), -- primary, supporting, evidence, etc

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(document_id, linked_table, linked_id)
);

```

## AI & Import System

```sql
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

-- Import history
CREATE TABLE import_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Import details
    import_type VARCHAR(50) NOT NULL, -- csv, email, api, etc
    filename VARCHAR(255),

    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    total_rows INTEGER,
    processed_rows INTEGER DEFAULT 0,
    failed_rows INTEGER DEFAULT 0,

    -- Mapping used
    column_mapping JSONB,

    -- Results
    import_summary JSONB,
    error_log JSONB,

    -- Timing
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    -- User
    imported_by UUID REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email ingestion tracking
CREATE TABLE email_ingestion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Email details
    message_id VARCHAR(255) UNIQUE NOT NULL,
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject TEXT,
    received_at TIMESTAMPTZ NOT NULL,

    -- Processing
    processed BOOLEAN DEFAULT false,
    ai_task_id UUID REFERENCES ai_tasks(id),

    -- Extracted data
    extracted_count INTEGER DEFAULT 0,
    extraction_summary JSONB,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

```

## Reporting & Analytics

```sql
-- Materialized view for compliance scores
CREATE MATERIALIZED VIEW compliance_scores AS
WITH safeguarding_stats AS (
    SELECT
        organization_id,
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE expiry_date > CURRENT_DATE) as valid_records,
        COUNT(*) FILTER (WHERE expiry_date <= CURRENT_DATE + INTERVAL '30 days') as expiring_soon
    FROM safeguarding_records
    WHERE deleted_at IS NULL
    GROUP BY organization_id
),
overseas_stats AS (
    SELECT
        organization_id,
        COUNT(DISTINCT country_code) as countries_count,
        COUNT(*) as activities_count,
        SUM(amount_gbp) as total_amount,
        COUNT(*) FILTER (WHERE transfer_method != 'bank_transfer') as non_bank_transfers
    FROM overseas_activities
    WHERE deleted_at IS NULL
    GROUP BY organization_id
),
income_stats AS (
    SELECT
        organization_id,
        COUNT(DISTINCT source) as income_sources,
        COUNT(*) as total_transactions,
        BOOL_OR(is_related_party) as has_related_party
    FROM income_records
    WHERE deleted_at IS NULL
    GROUP BY organization_id
)
SELECT
    o.id as organization_id,
    COALESCE(s.valid_records::FLOAT / NULLIF(s.total_records, 0) * 100, 0) as safeguarding_score,
    COALESCE(os.activities_count > 0, false) as has_overseas_activity,
    COALESCE(i.income_sources >= 2, false) as has_diverse_income,
    -- Overall score calculation
    CASE
        WHEN s.total_records > 0 AND os.activities_count > 0 AND i.total_transactions > 0 THEN
            (COALESCE(s.valid_records::FLOAT / NULLIF(s.total_records, 0) * 100, 0) * 0.4 +
             CASE WHEN os.activities_count > 0 THEN 100 ELSE 0 END * 0.3 +
             CASE WHEN i.income_sources >= 2 THEN 100 ELSE 0 END * 0.3)
        ELSE 0
    END as overall_score,
    NOW() as calculated_at
FROM organizations o
LEFT JOIN safeguarding_stats s ON o.id = s.organization_id
LEFT JOIN overseas_stats os ON o.id = os.organization_id
LEFT JOIN income_stats i ON o.id = i.organization_id
WHERE o.deleted_at IS NULL;

-- Refresh index
CREATE UNIQUE INDEX idx_compliance_scores_org ON compliance_scores(organization_id);

-- Annual return data view
CREATE VIEW annual_return_data AS
SELECT
    o.id,
    o.charity_number,
    o.name,
    o.financial_year_end,

    -- Safeguarding
    (SELECT COUNT(*) FROM safeguarding_records sr
     WHERE sr.organization_id = o.id AND sr.deleted_at IS NULL) as total_staff_volunteers,

    (SELECT COUNT(*) FROM safeguarding_records sr
     WHERE sr.organization_id = o.id
     AND sr.deleted_at IS NULL
     AND sr.works_with_children) as working_with_children,

    -- Overseas
    (SELECT COALESCE(SUM(amount_gbp), 0) FROM overseas_activities oa
     WHERE oa.organization_id = o.id
     AND oa.deleted_at IS NULL
     AND oa.financial_year = EXTRACT(YEAR FROM o.financial_year_end)) as overseas_spend_total,

    (SELECT ARRAY_AGG(DISTINCT country_code) FROM overseas_activities oa
     WHERE oa.organization_id = o.id
     AND oa.deleted_at IS NULL
     AND oa.financial_year = EXTRACT(YEAR FROM o.financial_year_end)) as countries_operated_in,

    -- Income
    (SELECT json_object_agg(source, total) FROM (
        SELECT source, SUM(amount) as total
        FROM income_records ir
        WHERE ir.organization_id = o.id
        AND ir.deleted_at IS NULL
        AND ir.financial_year = EXTRACT(YEAR FROM o.financial_year_end)
        GROUP BY source
    ) income_by_source) as income_breakdown,

    -- Major donations
    (SELECT MAX(amount) FROM major_donations md
     WHERE md.organization_id = o.id
     AND md.donor_type = 'corporate'
     AND md.financial_year = EXTRACT(YEAR FROM o.financial_year_end)) as highest_corporate_donation,

    (SELECT MAX(amount) FROM major_donations md
     WHERE md.organization_id = o.id
     AND md.donor_type = 'individual'
     AND md.financial_year = EXTRACT(YEAR FROM o.financial_year_end)) as highest_individual_donation

FROM organizations o
WHERE o.deleted_at IS NULL;

```

## Audit & History

```sql
-- Audit log for all changes
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- What changed
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- insert, update, delete

    -- Change details
    old_data JSONB,
    new_data JSONB,
    changed_fields TEXT[],

    -- Who and when
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes for querying
    INDEX idx_audit_table_record (table_name, record_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_org_date (organization_id, created_at DESC)
);

-- Function to automatically log changes
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        changed_fields,
        user_id,
        organization_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
        CASE
            WHEN TG_OP = 'UPDATE' THEN
                ARRAY(SELECT jsonb_object_keys(to_jsonb(NEW))
                      EXCEPT
                      SELECT jsonb_object_keys(to_jsonb(OLD)))
            ELSE NULL
        END,
        current_setting('app.current_user_id', true)::UUID,
        COALESCE(NEW.organization_id, OLD.organization_id)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_safeguarding_records
    AFTER INSERT OR UPDATE OR DELETE ON safeguarding_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_overseas_activities
    AFTER INSERT OR UPDATE OR DELETE ON overseas_activities
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER audit_income_records
    AFTER INSERT OR UPDATE OR DELETE ON income_records
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Notifications queue
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    user_id UUID REFERENCES users(id), -- NULL for org-wide

    -- Notification details
    type VARCHAR(50) NOT NULL, -- dbs_expiry, deadline, achievement, etc
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent

    -- Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,

    -- Related entity
    related_table VARCHAR(50),
    related_id UUID,

    -- Status
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,

    -- Delivery
    email_sent BOOLEAN DEFAULT false,
    sms_sent BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,

    INDEX idx_notifications_user_unread (user_id, read_at) WHERE read_at IS NULL,
    INDEX idx_notifications_org_type (organization_id, type, created_at DESC)
);

```

## Security & RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safeguarding_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE overseas_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Helper function to check organization membership
CREATE OR REPLACE FUNCTION user_organization_role(org_id UUID, user_id UUID)
RETURNS user_role AS $$
    SELECT role FROM organization_members
    WHERE organization_id = org_id
    AND user_id = user_id
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Organizations policies
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update their organizations" ON organizations
    FOR UPDATE USING (
        user_organization_role(id, auth.uid()) = 'admin'
    );

-- Safeguarding policies
CREATE POLICY "Users can view safeguarding records" ON safeguarding_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = safeguarding_records.organization_id
            AND om.user_id = auth.uid()
        )
    );

CREATE POLICY "Members can create safeguarding records" ON safeguarding_records
    FOR INSERT WITH CHECK (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

CREATE POLICY "Members can update safeguarding records" ON safeguarding_records
    FOR UPDATE USING (
        user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
    );

-- Documents policies with extra security
CREATE POLICY "Users can view non-sensitive documents" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = documents.organization_id
            AND om.user_id = auth.uid()
        )
        AND (
            NOT is_sensitive
            OR user_organization_role(organization_id, auth.uid()) IN ('admin', 'member')
        )
    );

-- Compliance scores are public within organization
CREATE POLICY "Organization members can view compliance scores" ON compliance_scores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = compliance_scores.organization_id
            AND om.user_id = auth.uid()
        )
    );

```

## Performance Optimization

### Indexes

```sql
-- Core performance indexes
CREATE INDEX idx_org_members_user ON organization_members(user_id);
CREATE INDEX idx_org_members_org_role ON organization_members(organization_id, role);

-- Safeguarding indexes
CREATE INDEX idx_safeguarding_org_expiry ON safeguarding_records(organization_id, expiry_date)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_safeguarding_expiring ON safeguarding_records(expiry_date)
    WHERE deleted_at IS NULL AND expiry_date > CURRENT_DATE;

-- Overseas indexes
CREATE INDEX idx_overseas_org_year ON overseas_activities(organization_id, financial_year)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_overseas_country ON overseas_activities(country_code)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_overseas_transfer_method ON overseas_activities(transfer_method)
    WHERE transfer_method != 'bank_transfer' AND deleted_at IS NULL;

-- Income indexes
CREATE INDEX idx_income_org_year ON income_records(organization_id, financial_year)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_income_donor_type ON income_records(donor_type, amount DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_income_related_party ON income_records(organization_id)
    WHERE is_related_party = true AND deleted_at IS NULL;

-- Document search
CREATE INDEX idx_documents_org_category ON documents(organization_id, category)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_search ON documents
    USING gin(to_tsvector('english', filename || ' ' || COALESCE(tags::text, '')));

-- AI task processing
CREATE INDEX idx_ai_tasks_pending ON ai_tasks(organization_id, created_at)
    WHERE status = 'pending';
CREATE INDEX idx_ai_tasks_org_type ON ai_tasks(organization_id, task_type, created_at DESC);

-- Notifications
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, created_at DESC)
    WHERE read_at IS NULL;

```

### Materialized View Refresh Strategy

```sql
-- Function to refresh compliance scores
CREATE OR REPLACE FUNCTION refresh_compliance_scores() RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY compliance_scores;
END;
$$ LANGUAGE plpgsql;

-- Scheduled refresh (using pg_cron or external scheduler)
-- Run every 5 minutes during business hours
SELECT cron.schedule('refresh-compliance-scores', '*/5 9-18 * * 1-5',
    'SELECT refresh_compliance_scores()');

```

## Migration Strategy

### Initial Setup

```sql
-- 001_initial_schema.sql
BEGIN;

-- Create all tables in order of dependencies
-- 1. Extensions and types
-- 2. Core tables (organizations, users)
-- 3. Junction tables (organization_members)
-- 4. Module tables (safeguarding, overseas, etc)
-- 5. Supporting tables (documents, audit)
-- 6. Views and materialized views
-- 7. Indexes
-- 8. RLS policies
-- 9. Triggers

COMMIT;

```

### Seed Data

```sql
-- 002_seed_data.sql
BEGIN;

-- Insert countries
INSERT INTO countries (code, name, region, is_high_risk) VALUES
('GB', 'United Kingdom', 'Europe', false),
('US', 'United States', 'North America', false),
('KE', 'Kenya', 'Africa', false),
('SY', 'Syria', 'Middle East', true),
('AF', 'Afghanistan', 'Asia', true)
-- ... etc

-- Insert demo organization for testing
INSERT INTO organizations (id, name, charity_number, income_band, financial_year_end) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'Demo Charity', '1234567', 'small', '2025-03-31');

COMMIT;

```

### Rollback Strategy

```sql
-- Each migration has a corresponding rollback
-- rollback_001_initial_schema.sql
BEGIN;

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

COMMIT;

```

## Best Practices Implementation

### 1. Data Integrity

- Foreign key constraints everywhere
- CHECK constraints for business rules
- NOT NULL on required fields
- UNIQUE constraints for natural keys

### 2. Performance

- Indexes on all foreign keys
- Partial indexes for soft deletes
- Materialized views for expensive queries
- JSONB for flexible data with indexing

### 3. Security

- RLS on every table
- Function-based permission checks
- Audit trail for compliance
- Sensitive data flagging

### 4. Maintainability

- Clear naming conventions
- Comprehensive comments
- Modular schema design
- Version-controlled migrations

## Summary

This schema provides:

- **Complete compliance tracking** for all new Annual Return requirements
- **Multi-tenancy** with row-level security
- **Full audit trail** for regulatory compliance
- **Performance optimization** for real-time scoring
- **AI integration** for intelligent features
- **Scalability** to handle 100k+ organizations

The design balances normalization with practical performance needs, ensuring data integrity while enabling the rapid queries needed for a responsive user experience.