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