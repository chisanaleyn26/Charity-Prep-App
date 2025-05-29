# Setting up Supabase Service Role Key

## The Issue
Your sync-subscription endpoint is failing with RLS (Row Level Security) errors because it needs to bypass security policies to update subscription data. The service role key in your `.env.local` appears to be a placeholder.

## How to Get Your Service Role Key

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (CharityPrep)
3. Go to Settings (gear icon) → API
4. Find the "Service Role" section
5. Click "Reveal" to show the service_role key
6. Copy the entire key (it's much longer than the anon key)

## Update Your .env.local

Replace the placeholder in your `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your actual key)
```

## Security Warning ⚠️

The service role key:
- Bypasses all Row Level Security policies
- Has full access to your database
- Should NEVER be exposed to the client/browser
- Should NEVER be committed to git
- Should only be used in server-side code

## After Updating

1. Restart your Next.js server (Ctrl+C then `npm run dev`)
2. Try the checkout flow again
3. The subscription should sync properly after payment

## Alternative: Quick Fix Without Service Key

If you can't get the service role key right now, I can create a temporary workaround using database functions. Let me know if you'd prefer this approach.