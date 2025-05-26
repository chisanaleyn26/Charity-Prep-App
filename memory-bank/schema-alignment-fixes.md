# Schema Alignment Fixes - In Progress

## Overview
This document tracks the alignment of frontend code with the actual database schema as defined in `/docs/schema.md`.

## Database Schema Reference

### Key Tables and Their Actual Structure:

1. **income_records** (not fundraising_activities)
   - id, organization_id, source, amount, date_received, financial_year
   - donor_type, donor_name, is_anonymous
   - fundraising_method, campaign_name, restricted_funds, restriction_details
   - is_related_party, related_party_relationship
   - gift_aid_eligible, gift_aid_claimed
   - reference_number, notes, receipt_document_id
   - created_by, created_at, updated_at, deleted_at

2. **overseas_activities**
   - id, organization_id, activity_name, activity_type
   - country_code (not country), partner_id
   - amount, currency, amount_gbp, exchange_rate
   - transfer_method, transfer_date, transfer_reference
   - financial_year, quarter, beneficiaries_count
   - project_code, description
   - sanctions_check_completed, requires_reporting, reported_to_commission
   - receipt_document_id, created_by, created_at, updated_at, deleted_at

3. **safeguarding_records**
   - id, organization_id, person_name, role_title, role_type, department
   - dbs_certificate_number, dbs_check_type, issue_date, expiry_date
   - reference_checks_completed, training_completed, training_date
   - works_with_children, works_with_vulnerable_adults, unsupervised_access
   - certificate_document_id, is_active, notes
   - created_by, updated_by, created_at, updated_at, deleted_at

## Fixes Applied

### Phase 1: Minimal Compilation Fixes ✅
1. Created stub components to bypass immediate compilation errors
2. Commented out problematic form fields temporarily
3. Fixed import paths and dependencies

### Phase 2: Schema Alignment ✅

#### Overseas Activities Module ✅
- Created `activities-form-aligned.tsx` with correct schema fields
- Created `activities-table-aligned.tsx` with proper field mappings
- Created `overseas-activities-aligned.ts` service with nullable handling
- Updated page to use aligned components
- Fixed field mappings:
  - `country` → `country_code`
  - Removed non-existent fields: `status`, `start_date`, `end_date`, `annual_spend`, `partner_organization`, `risk_level`, `risk_assessment_date`, `compliance_notes`
  - Added correct fields: `transfer_method`, `transfer_date`, `financial_year`, `sanctions_check_completed`, etc.

#### Fundraising Module ✅
- Already aligned to use `income_records` table
- Types use `IncomeRecord` interface with proper nullable boolean handling
- Components updated to use correct field names
- Services adapted to calculate stats from available fields

#### Issues Resolved
- Fixed nullable boolean fields (is_anonymous, restricted_funds, is_related_party, gift_aid_eligible, gift_aid_claimed, sanctions_check_completed, requires_reporting, reported_to_commission)
- Fixed nullable timestamp fields (created_at, updated_at)
- Proper handling of optional fields with null/undefined

#### Safeguarding Module ✅
- Created `safeguarding-aligned.ts` types with all database fields
- Created `safeguarding-aligned.ts` service with proper validation
- Created `safeguarding-form-aligned.tsx` with complete field set
- Created `safeguarding-table-aligned.tsx` with compliance status display
- Updated page to use aligned components as client component
- Fixed field mappings:
  - `dbs_number` → `dbs_certificate_number`
  - `role` → `role_title`
  - `dbs_type` → `dbs_check_type`
  - Added missing fields: `role_type`, `reference_checks_completed`, `training_completed`, `training_date`, `works_with_children`, `works_with_vulnerable_adults`, `unsupervised_access`, `certificate_document_id`, `is_active`, `notes`
- Added proper validation:
  - DBS certificate number must be 12 digits
  - Expiry date must be after issue date
- Proper nullable boolean handling with defaults

## Remaining Work
1. Clean up old component files that use incorrect schemas
2. Test with real Supabase data through MCP
3. Ensure all CRUD operations work correctly
4. Fix remaining TypeScript compilation errors