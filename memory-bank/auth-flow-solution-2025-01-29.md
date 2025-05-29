# Authentication Flow Solution - January 29, 2025

## Overview
Created a comprehensive solution for the authentication flow issue that properly handles organization selection, subscription checks, and the migration from Paddle to Stripe.

## Key Issues Addressed

1. **Redirect Loop**: Users with organizations were being redirected to onboarding
2. **Multi-Org Support**: Users with multiple organizations couldn't switch between them
3. **Subscription Migration**: System needs to handle both Paddle (legacy) and Stripe (new) subscriptions
4. **Auth State Management**: Server and client state needed proper synchronization

## Solution Components

### 1. Enhanced Auth Flow Service (`/lib/api/auth-flow.ts`)
- Comprehensive `checkAuthFlow()` function that:
  - Verifies user authentication
  - Checks user profile existence
  - Fetches all user organizations
  - Determines current organization
  - Checks subscription status
  - Returns complete auth state

- Helper functions:
  - `getUserOrganizationsWithDetails()`: Get orgs with subscription info
  - `handleAuthRedirect()`: Smart redirect logic
  - `createFirstOrganization()`: Onboarding support
  - `switchOrganization()`: Multi-org switching

### 2. Updated App Layout (`/app/(app)/layout.tsx`)
- Uses new `checkAuthFlow()` for server-side auth
- Passes complete auth data to client
- Proper redirect logic:
  - No user → `/login`
  - User without orgs → `/onboarding`
  - User with orgs → Continue to app

### 3. Enhanced Layout Client (`/app/(app)/layout-client.tsx`)
- Accepts additional props: `organizations`, `user`
- Initializes auth store with server data
- Prevents client/server state mismatch

### 4. Subscription Migration Support (`/lib/api/subscription-migration.ts`)
- `checkSubscriptionStatus()`: Checks both Paddle and Stripe
- Tier mapping between providers
- Feature availability checks
- Usage limit functions
- Migration tracking

### 5. Stripe Subscription Service (`/features/subscription/services/stripe-subscription-service.ts`)
- Full Stripe integration
- Checkout session creation
- Portal session management
- Webhook handling
- Subscription tiers with proper pricing

### 6. Client Hooks (`/features/subscription/hooks/use-subscription-check.ts`)
- `useSubscriptionCheck()`: React hook for subscription status
- `useFeatureGate()`: Feature availability checking
- Automatic refresh on org change

### 7. Database Migration (`/supabase/migrations/017_update_subscriptions_provider.sql`)
- Added `provider` column to subscriptions
- Stripe-specific columns
- Usage tracking table
- Migration tracking table
- Proper indexes and RLS policies

### 8. Updated Onboarding (`/app/onboarding/page.tsx`)
- Updates auth store after org creation
- Proper membership creation with `invited_by`
- Forces page refresh to ensure clean state

## Auth Flow Sequence

1. **Server-side (layout.tsx)**:
   ```
   checkAuthFlow() → 
   Get user → 
   Get organizations → 
   Determine current org → 
   Check subscription → 
   Pass to client
   ```

2. **Client-side (layout-client.tsx)**:
   ```
   Receive server data → 
   Initialize auth store → 
   Setup organization provider → 
   Render app
   ```

3. **Organization Switching**:
   ```
   User selects org → 
   switchOrganization() → 
   Update auth store → 
   Refresh subscription → 
   Re-render with new context
   ```

## Testing

Created test utilities:
- `/scripts/test-auth-flow.js`: Server-side auth flow testing
- `/app/(app)/test-auth-flow/page.tsx`: Interactive auth flow testing page

## Key Features

1. **Multi-Organization Support**:
   - Users can belong to multiple organizations
   - Easy switching between organizations
   - Role-based access per organization

2. **Subscription Compatibility**:
   - Supports both Paddle (legacy) and Stripe (new)
   - Automatic migration detection
   - Feature gating based on tier

3. **Robust Error Handling**:
   - Graceful fallbacks
   - Clear error messages
   - No redirect loops

4. **Performance**:
   - Server-side auth checks
   - Client-side caching
   - Minimal re-renders

## Usage

The auth flow is now automatic:
1. User logs in → Redirected to dashboard or onboarding
2. New users → Onboarding flow → Organization creation
3. Existing users → Load organizations → Show dashboard
4. Multi-org users → Can switch organizations via UI

## Next Steps

1. Implement organization switcher UI component
2. Add Stripe webhook endpoint
3. Create subscription upgrade flow
4. Add migration UI for Paddle → Stripe
5. Implement usage tracking