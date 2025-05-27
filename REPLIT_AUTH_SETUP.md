# Replit Authentication Setup Guide

## Overview
This guide explains how to configure Supabase Magic Link authentication to work properly with Replit's dynamic URLs.

## The Problem
Replit uses different URLs for different contexts:
- **Preview URL**: Long format like `https://19f5a34c-019d-4867-967d-73f478342e62-00-hrbhe62bmaqs.pike.replit.dev`
- **Development URL**: Format like `https://projectname-username.repl.co`
- **Custom domains**: If configured

Magic links require the callback URL to be whitelisted in Supabase, but Replit's dynamic nature makes this challenging.

## The Solution
We've implemented a dynamic callback URL system that:
1. Detects the current environment
2. Generates the correct callback URL
3. Handles multiple Replit URL formats

## Setup Instructions

### 1. Configure Supabase
Add ALL of these URLs to your Supabase project's redirect URLs:

```
https://19f5a34c-019d-4867-967d-73f478342e62-00-hrbhe62bmaqs.pike.replit.dev/api/auth/callback
https://your-project-your-username.repl.co/api/auth/callback
http://localhost:3000/api/auth/callback
```

To add these URLs:
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to Authentication → URL Configuration
4. Add each URL to the "Redirect URLs" section
5. Save changes

### 2. Environment Variables
Ensure your `.env.local` file has:
```env
NEXT_PUBLIC_SITE_URL=https://19f5a34c-019d-4867-967d-73f478342e62-00-hrbhe62bmaqs.pike.replit.dev
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Setup Script
We've provided a helper script to verify your configuration:

```bash
node scripts/setup-supabase-auth.js
```

This will:
- Show all possible callback URLs
- Verify your current configuration
- Provide setup instructions

## How It Works

### Dynamic Callback URL Generation
The `getAuthCallbackUrl()` function in `/lib/utils/auth-helpers.ts`:
- Checks for Replit environment variables
- Falls back to configured SITE_URL
- Handles different URL formats

### Updated Auth Flow
1. User enters email on login page
2. System detects current URL dynamically
3. Magic link is sent with correct callback URL
4. User clicks link and is redirected back to the app

## Troubleshooting

### "Redirect URL not allowed" Error
This means the callback URL isn't whitelisted in Supabase:
1. Check the browser's network tab for the exact redirect URL
2. Add that URL to Supabase's redirect URLs
3. Try again

### Email Not Arriving
1. Check spam folder
2. Verify Supabase email settings
3. Check Supabase logs for errors

### Wrong Domain After Login
This happens when the callback URL doesn't match the current domain:
1. Clear browser cookies
2. Use the same URL throughout the auth flow
3. Don't switch between preview/published URLs during auth

## Testing
To test the authentication:
1. Open your app at the Replit preview URL
2. Enter your email on the login page
3. Check your email for the magic link
4. Click the link - you should be redirected back to the dashboard

## Important Notes
- Always use the same URL throughout the auth process
- Add new URLs to Supabase when Replit generates new preview URLs
- The preview URL changes when you fork or recreate the Repl
- Published apps will have stable URLs