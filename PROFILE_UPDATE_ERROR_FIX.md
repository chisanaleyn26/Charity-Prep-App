# Profile Update Error Fix - Complete JSON Response

## Changes Made

### 1. Enhanced Error Logging in `use-user-profile.ts`

```typescript
// Before - Silent error
if (error) {
  console.error('Error updating profile:', error)
  return false
}

// After - Throws error with full JSON
if (error) {
  console.error('Error updating profile:', JSON.stringify(error, null, 2))
  throw error  // Now the component can catch and display it
}
```

### 2. Detailed Error Display in `profile-completion-modal.tsx`

```typescript
catch (error: any) {
  // Log full JSON to console
  console.error('Profile completion error - Full JSON:', JSON.stringify(error, null, 2))
  
  // Extract all error details
  const errorMessage = error?.message || 'Unknown error occurred'
  const errorDetails = error?.details || error?.hint || ''
  
  // Show detailed toast notification
  toast.error('Failed to update profile', {
    description: `${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`,
    duration: 10000 // Show for 10 seconds
  })
  
  // Log structured error object
  console.error('Full error object:', {
    message: error?.message,
    code: error?.code,
    details: error?.details,
    hint: error?.hint,
    statusCode: error?.statusCode,
    stack: error?.stack
  })
}
```

## Common Supabase Error Responses

### 1. RLS Policy Violation
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy for table \"users\""
}
```

### 2. User Not Found
```json
{
  "code": "PGRST116",
  "details": "The result contains 0 rows",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

### 3. Invalid Column
```json
{
  "code": "42703",
  "details": null,
  "hint": null,
  "message": "column \"invalid_column\" of relation \"users\" does not exist"
}
```

### 4. Type Mismatch
```json
{
  "code": "22P02",
  "details": null,
  "hint": null,
  "message": "invalid input syntax for type uuid: \"invalid-uuid\""
}
```

## Debugging Steps

### 1. Run the Debug Script
```bash
node scripts/debug-profile-update.js
```

This will:
- Check authentication status
- Try to read the user profile
- Attempt update and upsert operations
- Show full JSON error responses
- Suggest RLS policy fixes

### 2. Check Browser Console
When the error occurs, you'll now see:
- Full JSON error response
- Structured error breakdown
- Detailed toast notification with error message

### 3. Common Fixes

**If you see "row violates row-level security policy":**
```sql
-- Ensure these policies exist
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

**If you see "multiple (or no) rows returned":**
- User doesn't exist in users table
- Need to create user record first

**If you see "column does not exist":**
- Check that all columns in the update match the database schema
- Run migrations to add missing columns

## Testing the Fix

1. Open the profile completion modal
2. Fill in the form
3. Submit
4. Check browser console for:
   - "Profile completion error - Full JSON:" log
   - "Full error object:" log
5. Check the toast notification for detailed error message

The error will now be fully visible in:
- Browser console (as formatted JSON)
- Toast notification (with message and details)
- Network tab (if you inspect the Supabase request)

## Next Steps

Based on the error JSON you see:
1. If it's an RLS issue - run the SQL policies above
2. If it's a missing user - ensure user is created on signup
3. If it's a schema issue - check your migrations
4. Share the full JSON error for further debugging