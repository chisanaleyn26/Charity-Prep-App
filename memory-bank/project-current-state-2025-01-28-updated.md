# Project Current State - Updated
## Date: 2025-01-28 (Post-Error Fix)

### Project Overview
**Charity Prep** - UK charity compliance SaaS platform built with Next.js 15.2, TypeScript, Supabase, and AI integrations.

### Recent Updates

#### ✅ Fixed Major Runtime Error
- **Issue**: "Cannot read properties of undefined (reading 'call')" across all pages
- **Cause**: Improper handling of async functions and Next.js 15 server action requirements
- **Solution**: 
  - Fixed redirect() usage in server actions (moved outside try-catch)
  - Added await to all createServerClient() calls
  - Refactored subscription service to handle async initialization properly

#### ✅ Implemented Stripe Billing with Server Actions
- Created comprehensive server actions for billing in `/features/subscription/actions/billing.ts`
- Converted from traditional API routes to server-first architecture
- Implemented checkout session creation, portal session management
- Added subscription cancellation and reactivation
- Updated UI components to use server actions

### Current Technical Stack
- **Frontend**: Next.js 15.2, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI**: Gemini 2.5 Flash via OpenRouter
- **Payments**: Stripe (server actions implementation)
- **Architecture**: Server-first with selective client components

### Current Status

#### ✅ Working Features
- Authentication flow with Supabase
- Dashboard and basic navigation
- Compliance modules (Safeguarding, Overseas, Fundraising)
- Document management
- AI features (partial - some need fixes)
- Billing system with Stripe integration
- Multi-organization support

#### 🚧 Known Issues
1. **RLS Policy Error**: "infinite recursion detected in policy for relation 'organization_members'"
   - Appears during build but doesn't block compilation
   - Needs Supabase RLS policy fix

2. **Compliance Chat**: Performance issues (429 errors, slow responses)
   - Rebuild pending as per `/memory-bank/compliance-chat-rebuild-task-2025-01-28.md`

3. **Missing Frontend UIs**: 
   - Annual Return Generator
   - Board Pack Generator (partially complete)
   - Some export/import features

### Architecture Patterns Established
1. **Server Actions**: All new features use server actions, not API routes
2. **Async Handling**: Proper await usage for all async operations
3. **Error Handling**: redirect() outside try-catch blocks in server actions
4. **State Management**: Zustand for UI state only
5. **Database Access**: MCP Supabase functions for all DB operations

### Development Guidelines
- Always await createServerClient() 
- Use server actions for data mutations
- Follow feature-based file organization
- Implement proper TypeScript types
- Test builds frequently to catch errors early

### Next Steps
1. Fix RLS policy for organization_members
2. Implement missing frontend UIs
3. Fix compliance chat performance
4. Complete end-to-end testing
5. Production deployment preparation

### Memory Bank Updates
- Added comprehensive error fix documentation
- Updated with latest architectural decisions
- Documented server action patterns
- Recorded Stripe integration approach