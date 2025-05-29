# Profile Update Email NULL Fix

## The Problem
```json
{
  "code": "23502",
  "details": null,
  "hint": null,
  "message": "null value in column \"email\" of relation \"users\" violates not-null constraint"
}
```

The error occurred because:
1. The `users` table has a NOT NULL constraint on the `email` column
2. When creating a new user record (via upsert), the email was not being included
3. The `user` object from the auth store didn't have the email populated

## The Solution

### 1. Always Get Email from Supabase Auth
Instead of relying on the user object from the auth store, we now fetch the authenticated user directly from Supabase Auth:

```typescript
// Get the auth user to ensure we have the email
const { data: { user: authUser } } = await supabase.auth.getUser()
if (!authUser) {
  console.error('No authenticated user found')
  return false
}
```

### 2. Use Auth User's Email and ID
The upsert now uses the auth user's email and ID directly:

```typescript
const upsertData = {
  id: authUser.id, // Use auth user ID
  email: authUser.email || '', // Auth user should always have email
  ...profileUpdates,
  updated_at: new Date().toISOString(),
  created_at: profile?.created_at || new Date().toISOString()
}
```

### 3. Debug Logging Added
The code now logs helpful debug information:
- Auth user email
- Profile email (if exists)
- User email from store
- Full upsert data being sent

## How It Works

1. **User signs up** → Exists in `auth.users` with email
2. **First profile update** → Creates record in `public.users` with email from auth
3. **Subsequent updates** → Updates existing record

## Testing

1. Try submitting the profile form again
2. Check console for debug logs:
   ```
   Debug - Auth user email: user@example.com
   Debug - Profile email: undefined
   Debug - User email: undefined
   Debug - Upsert data: {
     "id": "123-456-789",
     "email": "user@example.com",
     "full_name": "John Doe",
     ...
   }
   ```

3. The update should now succeed!

## Key Changes

### Before
- Used `user.id` and `user.email` from auth store (might be undefined)
- No fallback for missing email
- Unclear error messages

### After
- Always fetches fresh auth user from Supabase
- Uses `authUser.id` and `authUser.email` 
- Detailed error logging
- Handles case where user doesn't exist in users table yet

## Additional Notes

- Supabase Auth users always have an email (it's required for authentication)
- The public.users table is a separate table that extends auth.users
- First time users won't have a record in public.users until first update
- The upsert operation creates the record if it doesn't exist