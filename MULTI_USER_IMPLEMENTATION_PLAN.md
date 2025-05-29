# Multi-User Organization Management Implementation Plan

## Overview
Transform Charity Prep into a full multi-user platform with invitation system, role management, usage tracking, and proper access controls.

## Phase 1: Database Schema Updates

### 1.1 Invitations Table
```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 User Activity Tracking
```sql
CREATE TABLE user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  activity_type VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.3 Organization Settings Enhancement
```sql
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "allow_member_invites": false,
  "require_2fa": false,
  "allowed_email_domains": []
}';
```

### 1.4 Audit Log
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Phase 2: Core Features Implementation

### 2.1 User Invitation System

#### Components Needed:
1. **Invitation API Routes**
   - POST `/api/organizations/[orgId]/invitations` - Send invitation
   - GET `/api/organizations/[orgId]/invitations` - List invitations
   - DELETE `/api/invitations/[id]` - Cancel invitation
   - POST `/api/invitations/accept` - Accept invitation

2. **UI Components**
   - `InviteUserModal` - Form to invite new users
   - `InvitationsList` - Table showing pending/accepted invitations
   - `AcceptInvitationPage` - Landing page for invitation links

3. **Email Integration**
   - Invitation email template
   - Resend invitation functionality
   - Expiration reminders

### 2.2 Team Management Dashboard

#### Location: `/settings/team`

#### Features:
1. **Members List**
   - Show all organization members
   - Display role, join date, last active
   - Search and filter capabilities
   - Bulk actions support

2. **Role Management**
   - Change user roles (admin only)
   - Define custom permissions (future)
   - Role change confirmation modal

3. **Member Actions**
   - Remove from organization
   - Resend invitation
   - View activity history
   - Send direct message (future)

### 2.3 Usage Tracking & Analytics

#### Components:
1. **Usage Tracking Service**
   - Track API calls
   - Monitor feature usage
   - Count AI requests
   - Calculate storage usage

2. **Usage Dashboard**
   - Organization-wide metrics
   - Per-user breakdown
   - Usage trends over time
   - Approaching limit warnings

3. **Limit Enforcement**
   - Check limits before actions
   - Show usage warnings
   - Block actions when over limit
   - Upgrade prompts

### 2.4 Enhanced Access Control

#### Implementation:
1. **Middleware Updates**
   - Check user role for protected routes
   - Redirect non-admins from billing
   - Show appropriate UI elements

2. **Component Guards**
   - `RequireRole` wrapper component
   - `CanAccess` permission checker
   - Feature flags based on subscription

3. **API Protection**
   - Verify permissions in all routes
   - Log unauthorized attempts
   - Rate limiting per organization

## Phase 3: UI/UX Implementation

### 3.1 Navigation Updates
- Add "Team" item to settings sidebar
- Show member count in org switcher
- Add quick invite button for admins

### 3.2 Dashboard Enhancements
- Show team activity feed
- Display organization health metrics
- Quick actions for team management

### 3.3 Mobile Optimization
- Responsive team management table
- Mobile-friendly invitation flow
- Touch-optimized role selectors

## Phase 4: Integration Points

### 4.1 Existing Features to Update
1. **Organization Switcher**
   - Show member count
   - Indicate role in each org

2. **Dashboard**
   - Add team overview widget
   - Show recent team activity

3. **Settings**
   - New "Team" section
   - Organization preferences
   - Invitation settings

4. **Billing Page**
   - Show user count vs limit
   - Per-user cost breakdown
   - Upgrade prompts when near limit

### 4.2 New Integrations
1. **Slack/Discord Webhooks**
   - New member notifications
   - Usage alerts
   - Important team events

2. **Calendar Integration**
   - Onboarding sessions
   - Team meetings
   - Training schedules

## Phase 5: Security & Compliance

### 5.1 Security Measures
1. **Invitation Security**
   - Secure token generation
   - Expiration enforcement
   - Single-use tokens
   - IP verification option

2. **Audit Trail**
   - Log all admin actions
   - Track permission changes
   - Exportable audit logs
   - Compliance reporting

### 5.2 Data Protection
1. **User Data Isolation**
   - Enforce RLS policies
   - Separate user workspaces
   - Data export per user

2. **GDPR Compliance**
   - User data export
   - Right to deletion
   - Activity history management

## Implementation Order

### Week 1: Foundation
1. Database migrations
2. Invitation system backend
3. Basic invitation UI
4. Email integration

### Week 2: Team Management
1. Team management page
2. Role change functionality
3. Member removal
4. Activity tracking

### Week 3: Usage & Limits
1. Usage tracking service
2. Usage dashboard
3. Limit enforcement
4. Warning system

### Week 4: Polish & Integration
1. Access control refinement
2. Mobile optimization
3. Integration with existing features
4. Testing and bug fixes

## Success Metrics
- Time to invite and onboard new member < 2 minutes
- Role changes take effect immediately
- Usage tracking accuracy > 99%
- Zero unauthorized access incidents
- User satisfaction score > 4.5/5

## Rollback Plan
Each phase can be rolled back independently:
1. Keep database migrations reversible
2. Feature flag new functionality
3. Maintain backward compatibility
4. Archive old data before modifications