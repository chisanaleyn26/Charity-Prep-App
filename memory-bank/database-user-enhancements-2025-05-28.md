# Database User Enhancements - Comprehensive Update
**Date**: 2025-05-28

## Summary
Enhanced the users table with comprehensive profile fields and preferences to support a complete charity compliance platform experience. Created migrations, RPC functions, TypeScript types, and service layer for managing user data.

## Database Schema Enhancements

### 1. User Profile Fields Added
```sql
-- Professional details
job_title VARCHAR(100)
department VARCHAR(100)
bio TEXT
linkedin_url VARCHAR(255)

-- Compliance preferences
compliance_reminder_days INTEGER DEFAULT 30
preferred_reminder_time TIME DEFAULT '09:00:00'
dashboard_layout VARCHAR(50) DEFAULT 'grid'
compliance_areas_focus JSONB DEFAULT '["safeguarding", "overseas", "fundraising"]'

-- UI/UX preferences
theme VARCHAR(20) DEFAULT 'system'
language VARCHAR(10) DEFAULT 'en'
timezone VARCHAR(50) DEFAULT 'Europe/London'
date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY'
currency_format VARCHAR(10) DEFAULT 'GBP'

-- Enhanced notification preferences
notification_channels JSONB -- Granular control
urgent_notifications_sms BOOLEAN DEFAULT true
report_frequency VARCHAR(20) DEFAULT 'weekly'

-- Onboarding & help
onboarding_completed BOOLEAN DEFAULT false
onboarding_step INTEGER DEFAULT 0
feature_tours_completed JSONB DEFAULT '[]'
help_preferences JSONB

-- Data privacy
data_retention_preference VARCHAR(20) DEFAULT 'standard'
analytics_opt_in BOOLEAN DEFAULT true
marketing_opt_in BOOLEAN DEFAULT false

-- Account status
is_active BOOLEAN DEFAULT true
deactivated_at TIMESTAMPTZ
deactivation_reason VARCHAR(255)

-- API access
api_key_hash VARCHAR(255)
api_key_created_at TIMESTAMPTZ
api_rate_limit INTEGER DEFAULT 1000
```

### 2. Database Functions Created

#### create_organization_with_setup
- Ensures user exists in users table
- Creates organization with proper validation
- Adds user as admin member
- Creates trial subscription
- Returns comprehensive result with error handling

#### get_user_organizations
- Returns all organizations a user belongs to
- Includes role and subscription information

#### is_organization_member
- Helper function to check membership

#### update_user_preferences
- Safe preferences update with JSON merging

#### test_create_org_simple
- Debug function to test authentication

### 3. Views Created

#### user_profile_completeness
- Calculates profile completion percentage
- Lists missing fields
- Used by UI to show profile status

## TypeScript Integration

### 1. Created Comprehensive Types (`/lib/types/user.types.ts`)
```typescript
export interface UserProfile {
  // Basic info
  id: string
  email: string
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  
  // Professional details
  job_title?: string | null
  department?: string | null
  bio?: string | null
  linkedin_url?: string | null
  
  // Compliance preferences
  compliance_reminder_days: number
  preferred_reminder_time: string
  dashboard_layout: 'grid' | 'list' | 'compact' | 'detailed'
  compliance_areas_focus: string[]
  
  // UI/UX preferences
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'cy' | 'gd'
  timezone: string
  date_format: string
  currency_format: string
  
  // ... more fields
}
```

### 2. Created Service Layer (`/features/user/services/user-preferences.service.ts`)
- `updatePreferences()` - Update user preferences
- `updateNotificationPreferences()` - Granular notification control
- `updateHelpPreferences()` - Help and tour settings
- `completeFeatureTour()` - Track completed tours
- `updateOnboardingProgress()` - Track onboarding
- `formatDate()` - User-preferred date formatting
- `formatCurrency()` - User-preferred currency formatting

## Onboarding Flow Updates

The onboarding page has been simplified to:
1. Check user authentication
2. Ensure user profile exists
3. Create organization directly
4. Create membership as admin
5. Create trial subscription

## Key Design Decisions

### 1. JSONB for Flexible Data
- `notification_channels` - Allows granular control without schema changes
- `help_preferences` - Extensible help settings
- `compliance_areas_focus` - Dynamic focus areas
- `feature_tours_completed` - Array of completed tour IDs

### 2. Sensible Defaults
- UK-centric defaults (timezone, currency, date format)
- Opt-in for most notifications
- 30-day reminder period
- Grid dashboard layout

### 3. Privacy First
- Analytics opt-in (default true for product improvement)
- Marketing opt-in (default false)
- Data retention preferences
- Granular notification control

### 4. Professional Context
- Job title and department for charity context
- LinkedIn for professional networking
- Bio for team collaboration
- Compliance area focus for role-based experience

## Migration Files Created

1. **010_enhance_user_details_preferences.sql**
   - Adds all new columns
   - Creates constraints
   - Adds indexes
   - Creates update function
   - Creates completeness view

2. **011_create_organization_setup_function.sql**
   - RPC function for onboarding
   - Helper functions for organization management
   - Proper error handling

3. **012_test_auth_function.sql**
   - Simple auth test function
   - Helps debug authentication issues

## Integration Points

### 1. User Profile Hook
- Extended to use new UserProfile type
- Tracks additional fields for completion
- Handles preferences updates

### 2. Settings Pages
- Profile settings can edit all new fields
- Preferences page for UI/UX settings
- Notification preferences with granular control

### 3. Dashboard
- Uses dashboard_layout preference
- Shows compliance_areas_focus
- Respects notification preferences

### 4. Compliance Modules
- Use compliance_reminder_days for alerts
- Filter by compliance_areas_focus
- Send notifications based on preferences

## Next Steps

1. **UI Implementation**
   - Update profile settings page to show new fields
   - Create preferences management UI
   - Add onboarding progress tracking

2. **Notification System**
   - Implement notification service using preferences
   - Respect time zones and reminder times
   - Handle SMS notifications for urgent items

3. **Personalization**
   - Apply theme preferences
   - Use date/currency formatting
   - Show/hide features based on focus areas

4. **API Access**
   - Implement API key generation
   - Apply rate limiting
   - Create API documentation

## Important Notes

1. All new columns have sensible defaults - no breaking changes
2. RLS policies updated to allow users to update their own data
3. Triggers added to maintain updated_at timestamp
4. Profile completion is calculated dynamically, not stored
5. MCP integration allows direct database management for testing