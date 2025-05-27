# Developer Bypass Components

This folder contains temporary components for development testing.

## ⚠️ IMPORTANT: Remove Before Production

These components provide authentication bypass for testing dashboard features in development mode.

### Files to Remove for Production:

1. **Delete this entire folder**: `/components/dev/`
2. **Remove imports from**:
   - `/features/auth/components/login-form.tsx` (line with `DevBypass` import and usage)
   - `/app/(app)/layout-client.tsx` (remove dev-auth import and related code)
   - `/app/(app)/layout.tsx` (remove development mode bypass logic)
3. **Delete utilities**: `/lib/dev/dev-auth.ts`

### Search Commands to Ensure Complete Removal:

```bash
# Search for dev bypass references
grep -r "DevBypass" .
grep -r "dev-auth" .
grep -r "dev-session" .
grep -r "getDevSession" .
```

### How It Works:

1. **DevBypass Component**: Provides buttons to instantly login as different user roles
2. **Dev Session Storage**: Stores mock session in localStorage
3. **Layout Override**: App layout detects dev session and uses mock organization data
4. **Easy Testing**: Click any user role button to bypass authentication

### Usage:

1. Go to `/login`
2. Click any user role in the "Developer Bypass" section
3. Instantly redirected to dashboard with mock data
4. Test dashboard features with different permission levels

### Mock Users Available:

- **Admin**: Full access to all features
- **Member**: Standard member access  
- **Viewer**: Read-only access

This bypass only works in development mode (`NODE_ENV !== 'production'`).