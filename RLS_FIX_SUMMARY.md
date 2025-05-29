# RLS Policy Fix Summary

## The Problem
When returning from Stripe checkout, the subscription sync was failing with:
```
new row violates row-level security policy (USING expression) for table "subscriptions"
```

## Root Causes
1. **Missing UPDATE policies**: The subscriptions table had INSERT and SELECT policies but no UPDATE policy
2. **Wrong Supabase client**: The API was using the anon key which is subject to RLS policies
3. **Missing service role key**: Your `.env.local` had a placeholder instead of the actual service role key

## The Solution
Created a **database function** that bypasses RLS safely:

```sql
CREATE FUNCTION sync_stripe_subscription(...) SECURITY DEFINER
```

This function:
- Runs with elevated privileges (SECURITY DEFINER)
- Verifies the user is an admin before proceeding
- Updates subscriptions, customers, and logs events
- Returns success/error status

## Benefits of This Approach
1. ✅ **No service role key needed** - Works with regular anon key
2. ✅ **Still secure** - Function checks admin permissions
3. ✅ **Atomic operation** - All updates happen in one transaction
4. ✅ **Better error handling** - Returns structured responses

## How It Works Now
1. User completes Stripe checkout
2. Stripe redirects back with session ID
3. CheckoutSuccessHandler calls `/api/billing/sync-subscription`
4. API calls `sync_stripe_subscription` database function
5. Function bypasses RLS to update subscription
6. User sees their active subscription

## Testing
Try creating a new checkout session now. The subscription should sync properly when you return from Stripe.

## Future Considerations
When you get your actual service role key:
1. Update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
2. You can use the `createServiceClient()` approach
3. Or keep using the database function (it's actually a good pattern)