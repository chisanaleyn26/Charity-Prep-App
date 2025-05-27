# Dev Authentication Bypass

This feature allows developers to bypass authentication during development for faster iteration.

## How it Works

### Option 1: Auto-Login (Recommended)
1. Set `NEXT_PUBLIC_AUTO_LOGIN=true` in `.env.local`
2. Visit any protected page (e.g., `/dashboard`)
3. You'll be automatically redirected to `/api/dev-auto-login`
4. A dev session cookie is set
5. You're redirected to the dashboard as `dev@charityprep.uk`

### Option 2: Manual Dev Bypass
1. Go to `/login`
2. Click one of the dev bypass buttons (Admin/Member/Viewer)
3. You'll be logged in with that role

## Features

- **Dev Toolbar**: Shows at bottom-right in dev mode with current user and logout
- **No Database Required**: Works without Supabase authentication
- **Instant Access**: No waiting for magic links
- **Role Testing**: Easy switching between admin/member/viewer roles

## Configuration

In `.env.local`:
```env
# Enable auto-login on protected pages
NEXT_PUBLIC_AUTO_LOGIN=true

# Or use manual bypass buttons
NEXT_PUBLIC_AUTO_LOGIN=false
```

## Logout

- Click "Logout" in the dev toolbar
- Or visit `/api/dev-logout`
- This clears the dev session cookie

## Security

- Only works when `NODE_ENV=development`
- Dev routes return 404 in production
- Sessions expire after 24 hours
- No real user data is exposed

## Troubleshooting

If auto-login isn't working:
1. Check `.env.local` has `NEXT_PUBLIC_AUTO_LOGIN=true`
2. Restart Next.js server after changing env vars
3. Clear cookies and try again
4. Check browser console for `[DEV AUTO-LOGIN]` logs

## Disabling

To use real Supabase auth in development:
1. Set `NEXT_PUBLIC_AUTO_LOGIN=false`
2. Remove the `showDevBypass={true}` prop from LoginForm
3. Clear the `dev-auth-session` cookie