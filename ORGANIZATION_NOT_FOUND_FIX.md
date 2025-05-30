# Organization Not Found Error Fix

## Issue
When generating reports (board pack, export, etc.), the system was throwing "Organization not found" errors because it was incorrectly trying to find organizations using `eq('user_id', user.id)` on the organizations table.

## Root Cause
The `organizations` table doesn't have a `user_id` column. The relationship between users and organizations is through the `organization_members` table:
- Users can belong to multiple organizations
- Each membership has a role (admin, member, viewer)
- The current organization is tracked in the `users` table as `current_organization_id`

## Database Structure
```sql
-- organizations table
id, name, charity_number, etc. (NO user_id column)

-- organization_members table  
id, organization_id, user_id, role, accepted_at, etc.

-- users table
id, email, current_organization_id, etc.
```

## Fix Applied

### 1. Board Pack Actions (`/features/reports/board-pack/actions/board-pack.ts`)
```typescript
// Before - INCORRECT
const { data: org } = await supabase
  .from('organizations')
  .select('*')
  .eq('user_id', user.id)
  .single()

// After - CORRECT
import { getCurrentUserOrganization } from '@/lib/supabase/server'

const currentOrgData = await getCurrentUserOrganization()
if (!currentOrgData || !currentOrgData.organization) {
  throw new Error('Organization not found')
}
const org = currentOrgData.organization
```

### 2. Export Actions (`/features/reports/export/actions/export.ts`)
Fixed 4 instances where the same incorrect pattern was used.

## How getCurrentUserOrganization Works
The helper function in `/lib/supabase/server.ts`:
1. Gets the authenticated user
2. Fetches the user's `current_organization_id` from the users table
3. Joins with `organization_members` to get the organization details and user's role
4. Returns both the organization and the user's role in that organization

## Best Practices
1. Always use `getCurrentUserOrganization()` when you need the user's current organization
2. Never try to query organizations by user_id (this column doesn't exist)
3. Remember that users can belong to multiple organizations
4. The current organization is tracked in the users table, not derived from memberships

## Testing
After these fixes:
- Board pack generation should work without "Organization not found" errors
- Export functionality should properly identify the user's current organization
- All report modules should correctly access organization data

## Other Report Modules Status
- ✅ Annual Return - Already using `getCurrentUserOrganization()`
- ✅ Board Pack - Fixed
- ✅ Export - Fixed
- ✅ Other services - Take organizationId as a parameter (correct approach)