# Charity Prep - Functionality Specification

## Table of Contents

1. [Core Compliance Tracking](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#core-compliance-tracking)
2. [AI-Powered Features](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#ai-powered-features)
3. [Reporting & Export](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#reporting--export)
4. [User Management](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#user-management)
5. [Notifications & Reminders](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#notifications--reminders)
6. [Data Management](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#data-management)
7. [Subscription & Billing](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#subscription--billing)
8. [System Behaviors](https://claude.ai/chat/fc3a6c79-43ff-4f26-9e96-5f711b996cd9#system-behaviors)

## Core Compliance Tracking

### 1. Safeguarding Management

### 1.1 DBS Check Tracking

**Purpose**: Ensure all staff/volunteers have valid criminal record checks

**Functionality**:

- **Add DBS Record**
    - Required: Person name, role, DBS number (12 digits), issue date, expiry date
    - Optional: Department, training status, risk level flags
    - Auto-calculate: Days until expiry
    - Validation: Expiry must be after issue date, DBS format check
- **Expiry Management**
    - Status calculation:
        - Valid: >90 days remaining (Green)
        - Expiring Soon: 31-90 days (Yellow)
        - Urgent: 1-30 days (Orange)
        - Expired: ≤0 days (Red)
    - Automatic status updates daily
    - Bulk renewal actions available
- **Search & Filter**
    - By status (Valid/Expiring/Expired)
    - By department
    - By role type (Employee/Volunteer/Trustee)
    - By name (fuzzy search)
    - Export filtered results

### 1.2 Training Records

**Purpose**: Track safeguarding training completion

**Functionality**:

- Link training to DBS records
- Track completion dates and certificates
- Set renewal requirements
- Calculate training compliance percentage

### 1.3 Policy Management

**Purpose**: Ensure safeguarding policies are current

**Functionality**:

- Track policy versions and review dates
- Set review cycles (default: annual)
- Upload policy documents
- Generate review reminders

### 2. International Operations

### 2.1 Overseas Activity Tracking

**Purpose**: Record all charitable activities and spending outside the UK

**Functionality**:

- **Activity Recording**
    - Required: Country, amount, transfer date, transfer method
    - Optional: Partner organization, project code, beneficiary count
    - Currency conversion: Auto-fetch exchange rates
    - Always store GBP equivalent
- **Transfer Method Compliance**
    - Safe methods: Bank transfer, wire transfer
    - Flagged methods: Cash courier, cryptocurrency, hawala
    - Required explanation for non-bank transfers
    - Calculate percentage via non-bank methods
- **Country Risk Assessment**
    - High-risk countries highlighted (Syria, Afghanistan, etc.)
    - Sanctions check reminder for flagged countries
    - Additional documentation required for high-risk

### 2.2 Partner Organization Management

**Purpose**: Maintain due diligence on overseas partners

**Functionality**:

- Partner database with contact details
- Due diligence status tracking
- Agreement documentation
- Link activities to partners
- Risk rating per partner

### 2.3 Geographic Visualization

**Purpose**: Visual overview of international work

**Functionality**:

- Interactive world map
- Countries colored by spend level
- Click for country details
- Year-over-year comparison

### 3. Fundraising & Income

### 3.1 Income Source Tracking

**Purpose**: Categorize all income per Charity Commission requirements

**Categories**:

- Donations and Legacies
- Charitable Activities
- Other Trading Activities
- Investments

**Functionality**:

- Record individual transactions
- Bulk import from bank statements
- Auto-categorization rules
- Gift Aid tracking
- Restricted funds flagging

### 3.2 Major Donor Identification

**Purpose**: Track highest donations by type

**Functionality**:

- Automatic identification of highest:
    - Corporate donation
    - Individual donation
    - Related party donation
- Per financial year tracking
- Historical comparison
- Anonymous donor handling

### 3.3 Related Party Transactions

**Purpose**: Flag potential conflicts of interest

**Functionality**:

- Mark donors as related parties
- Relationship description required
- Automatic flagging in reports
- Trustee declaration tracking

### 3.4 Fundraising Methods Compliance

**Purpose**: Declare fundraising methods used

**Methods tracked**:

- Events
- Online campaigns
- Direct mail
- Telephone
- Street fundraising
- Professional fundraisers

**Functionality**:

- Checklist per financial year
- Professional fundraiser registration check
- Cost vs return tracking
- Compliance notes per method

## AI-Powered Features

### 1. Intelligent Data Import

### 1.1 Email Processing

**Purpose**: Extract data from forwarded emails

**Functionality**:

- **Email Parsing**
    - Dedicated email: data-{orgId}@charityprep.uk
    - Extract attachments automatically
    - Queue for processing
    - Support for receipts, invoices, donation confirmations
- **AI Extraction**
    - Identify document type
    - Extract relevant fields
    - Confidence scoring
    - Present for review/confirmation

### 1.2 Document OCR

**Purpose**: Extract data from uploaded documents

**Supported documents**:

- DBS certificates
- Training certificates
- Receipts/invoices
- Bank statements
- Donation letters

**Functionality**:

- Drag-drop or photo upload
- Real-time processing
- Field highlighting on source
- Editable extraction results
- Batch processing support

### 1.3 CSV Import with AI Mapping

**Purpose**: Import existing data from spreadsheets

**Functionality**:

- **Column Recognition**
    - AI suggests field mappings
    - Handles varied column names
    - Preview before import
    - Remember mappings per organization
- **Data Cleaning**
    - Date format standardization
    - Currency recognition
    - Duplicate detection
    - Error highlighting

### 2. Natural Language Interface

### 2.1 Smart Search

**Purpose**: Query data using natural language

**Example queries**:

- "Show all DBS checks expiring next month"
- "Total spent in Kenya last year"
- "Donations over £10,000 from companies"
- "Staff without valid training"

**Functionality**:

- Convert natural language to database queries
- Return formatted results
- Suggest follow-up queries
- Save frequent searches

### 2.2 Compliance Q&A

**Purpose**: Answer regulatory questions

**Functionality**:

- Context-aware responses
- Cite relevant regulations
- Consider organization's data
- Suggest actions
- Escalate complex questions

### 3. Intelligent Generation

### 3.1 Report Narratives

**Purpose**: Convert data into prose

**Functionality**:

- Generate trustee report sections
- Compliance summaries
- Risk assessments
- Achievement highlights
- Editable output

### 3.2 Smart Suggestions

**Purpose**: Proactive compliance help

**Functionality**:

- Task recommendations based on score
- Missing data identification
- Deadline prioritization
- Quick fix suggestions

## Reporting & Export

### 1. Annual Return Generator

### 1.1 Form Mapping

**Purpose**: Prepare data for Charity Commission submission

**Functionality**:

- **Preview Interface**
    - Show official form layout
    - Map your data to form fields
    - Highlight completed vs missing
    - Progress percentage
- **Field-by-Field Export**
    - Copy individual answers
    - Include field references
    - Format for direct paste
    - Validation warnings

### 1.2 Pre-flight Checks

**Purpose**: Ensure data quality before submission

**Checks performed**:

- Required fields complete
- Data consistency
- Unusual values flagged
- Year-over-year changes >50%
- Supporting documentation attached

### 2. Board Reporting

### 2.1 Report Pack Generation

**Purpose**: Create professional trustee reports

**Sections available**:

- Executive summary
- Compliance scorecard
- Risk overview
- Financial summary
- Upcoming deadlines
- Recommendations

**Functionality**:

- Template selection
- Section toggling
- AI narrative generation
- Charity branding
- PDF/Word export

### 2.2 Compliance Certificates

**Purpose**: Shareable compliance achievements

**Types**:

- Annual Return Ready
- X% Compliant
- All DBS Current
- Training Complete

**Features**:

- Professional design
- Charity branding
- Date stamped
- Verifiable link
- Social sharing

### 3. Data Export

### 3.1 Standard Exports

**Purpose**: Extract data for external use

**Formats**:

- CSV (per module or combined)
- Excel (formatted with sheets)
- PDF (formatted reports)
- JSON (full backup)

**Options**:

- Date range selection
- Include/exclude deleted
- Filtered data only
- Scheduled exports

### 3.2 GDPR Compliance Export

**Purpose**: Support data subject requests

**Functionality**:

- Export all data for a person
- Include audit history
- Readable format
- 30-day retention

## User Management

### 1. Organization Setup

### 1.1 Registration

**Requirements**:

- Charity name and number
- Financial year end
- Primary contact email
- Income band selection

**Validation**:

- Charity number format
- Verify against public register
- Unique email check
- Year-end date validity

### 1.2 Organization Settings

**Configurable**:

- Reminder lead times
- Email preferences
- Branding (logo, colors)
- Financial year
- Multi-charity grouping

### 2. User Roles & Permissions

### 2.1 Role Types

**Admin**:

- Full access to all data
- User management
- Billing control
- Settings management

**Member**:

- Add/edit compliance data
- Generate reports
- View all areas
- No billing access

**Viewer**:

- Read-only access
- Download reports
- No data modification
- No sensitive data

### 2.2 Invitation System

**Process**:

1. Admin enters email
2. System sends invitation
3. New user clicks link
4. Auto-associated with organization
5. Role assigned

### 3. Multi-Organization Support

### 3.1 Organization Switching

**For users in multiple charities**:

- Dropdown switcher
- Maintain context
- Separate data
- Unified billing

### 3.2 Advisor Portal

**For accountants/consultants**:

- Overview dashboard
- Bulk operations
- Comparison tools
- Consolidated reporting

## Notifications & Reminders

### 1. Automated Reminders

### 1.1 DBS Expiry Notifications

**Schedule**:

- 90 days before: First notice
- 60 days: Reminder
- 30 days: Urgent
- 14 days: Daily
- Expired: Immediate action required

**Delivery**:

- Email (primary)
- In-app notifications
- Dashboard alerts
- Optional SMS

### 1.2 Deadline Reminders

**Types**:

- Annual Return deadline
- Policy review dates
- Training renewals
- Report due dates

### 2. Achievement Notifications

### 2.1 Compliance Milestones

**Triggered by**:

- Score improvements
- 100% module completion
- First time actions
- Streak achievements

**Format**:

- In-app celebration
- Email summary
- Shareable badges

### 3. System Notifications

### 3.1 Processing Updates

**For async operations**:

- Import completed
- Report generated
- Export ready
- Errors encountered

## Data Management

### 1. Data Integrity

### 1.1 Validation Rules

**Applied at entry**:

- Required field checks
- Format validation
- Business rule enforcement
- Duplicate prevention

### 1.2 Audit Trail

**Tracked automatically**:

- All data changes
- User responsible
- Timestamp
- Previous values
- IP address

### 2. Data Retention

### 2.1 Active Data

**Retention period**: Indefinite while account active

**Includes**:

- All compliance records
- Documents
- Reports
- User activity

### 2.2 Deleted Data

**Soft delete policy**:

- Marked as deleted
- Hidden from views
- Recoverable for 90 days
- Then permanently removed

### 3. Backup & Recovery

### 3.1 Automated Backups

**Schedule**:

- Real-time replication
- Daily snapshots
- Weekly archives
- Monthly off-site

### 3.2 Recovery Options

**Available to admins**:

- Restore deleted items
- Rollback bulk operations
- Download backups
- Point-in-time recovery

## Subscription & Billing

### 1. Pricing Tiers

### 1.1 Essentials (£199/year)

**Limits**:

- 2 users
- 100MB storage
- Email support
- All core features

### 1.2 Standard (£549/year)

**Limits**:

- 5 users
- 1GB storage
- Priority support
- Advisor portal

### 1.3 Premium (£1,199+/year)

**Limits**:

- 20+ users
- 10GB storage
- Phone support
- API access
- Custom branding

### 2. Usage Tracking

### 2.1 Monitored Metrics

- Active users
- Storage used
- API calls
- Report generations

### 2.2 Limit Enforcement

**Soft limits**:

- Warning at 80%
- Email at 90%
- Suggest upgrade

**Hard limits**:

- Block new users
- Prevent uploads
- Maintain read access

### 3. Billing Operations

### 3.1 Payment Processing

**Via Paddle**:

- Card payments
- Direct debit
- Invoice option
- Auto-renewal

### 3.2 Subscription Management

**Self-service**:

- Upgrade/downgrade
- Add users
- Download invoices
- Cancel anytime

## System Behaviors

### 1. Performance Standards

### 1.1 Response Times

- Page loads: <2 seconds
- API calls: <500ms
- Reports: <30 seconds
- Exports: <60 seconds

### 1.2 Availability

- 99.9% uptime target
- Planned maintenance windows
- Status page
- Incident communication

### 2. Security Measures

### 2.1 Data Protection

- Encryption at rest
- TLS in transit
- UK data residency
- GDPR compliant

### 2.2 Access Control

- Row-level security
- Session management
- IP allowlisting (optional)
- 2FA available

### 3. Integration Capabilities

### 3.1 Data Import

**Supported sources**:

- CSV/Excel files
- Email attachments
- API (Premium)
- Direct upload

### 3.2 Data Export

**Supported targets**:

- Local download
- Email delivery
- Cloud storage
- API (Premium)

### 4. Mobile Functionality

### 4.1 Responsive Features

**Optimized for mobile**:

- Quick data entry
- Photo capture
- Dashboard viewing
- Document upload

### 4.2 Offline Capability

**When disconnected**:

- View cached data
- Queue entries
- Auto-sync on reconnection
- Conflict resolution

This comprehensive functionality specification defines every feature and behavior of Charity Prep, providing a complete reference for development, testing, and user documentation.