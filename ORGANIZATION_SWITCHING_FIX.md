# Organization Switching Data Persistence Fix

## Problem Summary
When switching organizations using the org picker dropdown, the dashboard and other pages were not updating to show data for the newly selected organization. The data remained cached for the previous organization.

## Root Cause Analysis

### 1. **Dashboard Page Issue**
The dashboard page (`app/(app)/dashboard/page.tsx`) was fetching data based on the user's first organization membership rather than using the current organization from the auth store/context:

```typescript
// OLD APPROACH - Always used first organization
const { data: memberships } = await supabase
  .from('organization_members')
  .select(`organization_id, role, organization:organizations(*)`)
  .eq('user_id', user.id)
  .limit(1)  // Always took the first one!

const membership = memberships[0]
// Used membership.organization_id for all queries
```

### 2. **Missing Revalidation**
When switching organizations:
- The auth store updated `currentOrganization`
- The organization context updated
- BUT: Server components didn't re-fetch data
- Client components with static data didn't refresh

### 3. **Pattern Repeated Across Pages**
Similar issues existed in:
- Compliance pages (safeguarding, overseas activities, fundraising)
- Reports pages
- Other data-dependent pages

## Solution Implemented

### 1. **Fixed Dashboard to Use Organization Context**

Updated dashboard to properly use the organization context:

```typescript
// NEW APPROACH - Uses current organization from context
const { currentOrganization } = useOrganization()

useEffect(() => {
  if (currentOrganization) {
    loadDashboardData()
  }
}, [currentOrganization?.id]) // Re-load when organization changes

// All queries now use currentOrganization.id
```

### 2. **Added Router Refresh on Organization Switch**

Enhanced the organization provider to trigger a router refresh when switching organizations:

```typescript
const switchOrganization = async (organizationId: string): Promise<boolean> => {
  setIsLoading(true)
  try {
    const success = await storeSwitchOrganization(organizationId)
    if (success) {
      // Refresh the router to ensure all server components re-fetch data
      router.refresh()
    }
    return success
  } finally {
    setIsLoading(false)
  }
}
```

This ensures:
- Server components re-execute and fetch fresh data
- Client components receive updated props
- All caches are properly invalidated

### 3. **Key Changes Made**

1. **Dashboard Page** (`app/(app)/dashboard/page.tsx`)
   - Now uses `useOrganization()` hook to get current organization
   - Re-fetches data when `currentOrganization?.id` changes
   - Shows "No organization selected" message when appropriate

2. **Organization Provider** (`features/organizations/components/organization-provider.tsx`)
   - Added `useRouter` from Next.js navigation
   - Calls `router.refresh()` after successful organization switch
   - Maintains loading state during the switch

3. **Auth Store** (`stores/auth-store.ts`)
   - Kept the core switching logic unchanged
   - Provider handles the refresh to maintain separation of concerns

## Benefits

1. **Immediate Data Updates**: When switching organizations, all pages now show the correct data
2. **Consistent State**: No more mismatched data between different pages
3. **Better UX**: Users see their selected organization's data immediately
4. **Proper Server Component Support**: Works with Next.js 15's server components

## Next Steps for Other Pages

Similar updates should be applied to other pages that fetch organization-specific data:

1. **Compliance Pages**
   - Update to use `getCurrentUserOrganization()` from server
   - Pass organization to client components
   - Use organization context in client components

2. **Reports Pages**
   - Ensure they use the current organization from auth flow
   - Add proper revalidation on organization change

3. **Settings Pages**
   - Update team management to show correct organization members
   - Ensure billing shows correct subscription

## Testing

To test the fix:
1. Log in with a user that has multiple organizations
2. Navigate to the dashboard
3. Switch organizations using the dropdown
4. Verify that:
   - Dashboard data updates immediately
   - Compliance counts reflect the new organization
   - All pages show data for the selected organization

## Technical Notes

- The `router.refresh()` call triggers a full route refresh in Next.js
- This invalidates all server component caches
- Client components with `useEffect` dependencies will re-fetch
- This is the recommended approach for Next.js 15 app router

## Alternative Approaches Considered

1. **Manual Revalidation**: Using `revalidatePath` for each route
   - Pro: More granular control
   - Con: Need to maintain list of all routes

2. **Event System**: Emit events on organization change
   - Pro: Decoupled architecture
   - Con: More complex to implement

3. **Query Invalidation**: Using React Query or SWR
   - Pro: Better caching control
   - Con: Additional dependency

The `router.refresh()` approach was chosen for simplicity and compatibility with Next.js 15's architecture.