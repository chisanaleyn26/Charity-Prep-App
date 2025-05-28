# Next.js 15 "Cannot read properties of undefined (reading 'call')" Error Fix

## Date: 2025-01-28

### Problem
The error "Cannot read properties of undefined (reading 'call')" was occurring across all pages in the Next.js 15 application.

### Root Causes

1. **Server Actions with `redirect()` in try-catch blocks**
   - Next.js 15 doesn't allow `redirect()` to be called inside try-catch blocks
   - This is a breaking change from previous versions

2. **Async `createServerClient()` not awaited**
   - The Supabase server client creation is async but was being called without `await`
   - This caused undefined values when trying to use the client

3. **Class property initialization with async function**
   - The subscription service was initializing a class property with an unresolved Promise
   - `private supabase = createServerClient()` // Wrong - returns Promise, not client

### Solutions Applied

1. **Fixed server actions** (`/features/subscription/actions/billing.ts`):
   ```typescript
   // Before (wrong):
   try {
     // ... code
     redirect(session.url!)
   } catch (error) {
     // ...
   }

   // After (correct):
   let redirectUrl: string | null = null
   try {
     // ... code
     redirectUrl = session.url!
   } catch (error) {
     // ...
   }
   // Redirect outside try-catch
   if (redirectUrl) {
     redirect(redirectUrl)
   }
   ```

2. **Fixed async client creation**:
   ```typescript
   // Before (wrong):
   const supabase = createServerClient()

   // After (correct):
   const supabase = await createServerClient()
   ```

3. **Fixed subscription service** (`/features/subscription/services/subscription-service.ts`):
   ```typescript
   // Before (wrong):
   export class SubscriptionService {
     private supabase = createServerClient() // Promise, not client!
   
   // After (correct):
   export class SubscriptionService {
     private async getSupabase() {
       return await createServerClient()
     }
     
     async someMethod() {
       const supabase = await this.getSupabase()
       // ... use supabase
     }
   }
   ```

### Key Takeaways

1. Always check Next.js 15 migration guide for breaking changes
2. Server actions have specific requirements about error handling and redirects
3. Async functions must be properly awaited, especially in initialization contexts
4. Class properties cannot be initialized with async function results directly

### Files Modified
- `/features/subscription/actions/billing.ts`
- `/features/subscription/services/subscription-service.ts`

### Remaining Issues
- RLS policy error: "infinite recursion detected in policy for relation 'organization_members'" - This is a separate Supabase configuration issue