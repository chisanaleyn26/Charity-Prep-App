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