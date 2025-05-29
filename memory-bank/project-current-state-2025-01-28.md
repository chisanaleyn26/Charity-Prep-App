# Charity Prep - Current Project State
*Last Updated: 2025-01-28*

## Project Overview
Charity Prep is a SaaS platform helping UK charities comply with new Annual Return regulations (2024). Built with Next.js 15.2, Supabase, and AI integrations for document processing and report generation.

**Target Market**: 100,000+ UK charities facing new compliance requirements
**Business Model**: £199-£1,199+ annual subscriptions based on charity size
**Key Differentiator**: AI-powered "magic" features that automate data entry and report generation

## Current Implementation Status

### ✅ Completed (Backend Strong)
- **Complete Database Schema**: Multi-tenant with RLS, audit trails, compliance scoring
- **All API Routes**: Authentication, compliance modules, AI processing, reports, webhooks
- **Server Actions**: Full CRUD for all compliance data, AI integrations
- **AI Integration**: Document OCR, compliance chat, report generation via OpenRouter
- **Payment System**: Stripe integration with webhooks
- **Email System**: Inbound processing (data@charityprep.uk), templates via Resend
- **Multi-tenancy**: Organization switching, role-based access
- **Compliance Engine**: Real-time scoring, risk assessment, deadline tracking

### 🚧 Critical Frontend Gaps
Based on docs review, these key UI pages need implementation:

1. **Annual Return Generator UI** (`/reports/annual-return`)
   - Split-screen: user data ↔ official form preview
   - Field mapping with copy-to-clipboard
   - Progress indicator (87% complete, 3 fields remaining)
   - Missing data highlights

2. **Board Pack Generator UI** (`/reports/board-pack`) 
   - Template selection grid
   - AI narrative generation interface
   - PDF preview with editing
   - Section toggles

3. **Export/Import UI** (`/reports/export`, `/import`)
   - Export format selection
   - Scheduled exports management
   - Import queue with review interface

4. **Multi-org Portal** (`/advisor`)
   - Organization switcher
   - Bulk operations dashboard
   - Comparison views
   - Consolidated reporting

5. **Billing Interface** (`/settings/billing`)
   - Stripe checkout integration
   - Usage tracking displays
   - Plan comparison
   - Upgrade flows

## Technical Architecture

### Stack Confirmed
- **Frontend**: Next.js 15.2 (App Router), TypeScript, Zustand, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage) via MCP integration
- **AI**: Gemini 2.5 Flash via OpenRouter for extraction/generation
- **Infrastructure**: Vercel hosting, Stripe payments, Resend email
- **Design**: Ethereal UI system (Inchworm #B1FA63, Gunmetal #243837)

### Architecture Principles
- Server Components by default, Client Components only when needed
- Server Actions for all mutations
- Zustand for UI state only (not server data)
- Feature-based organization (not layer-based)
- Progressive enhancement (works without JS)
- Mobile-first responsive design

## CLAUDE.md Compliance Reminders

### Must Follow Rules
1. **Always read entire files** before making changes
2. **Ask before editing** tailwind.config or related config files
3. **Commit early and often** at logical milestones
4. **Look up latest syntax** for external libraries when unsure
5. **Never skip implementations** - no dummy/placeholder code
6. **Run linting** after major changes
7. **Get plan approval** before writing code
8. **Break down large tasks** into manageable subtasks

### Project-Specific Guidelines
- Use **MCP Supabase integration** for all database operations
- Follow **Ethereal design system** colors, spacing, typography
- Maintain **feature-based file organization**
- Test with **mobile-first approach**
- Update **memory bank frequently** as we progress
- Focus on **readability** - code is read more than written

## MCP Integration Available
- Full Supabase integration available for database operations
- Can list projects, execute SQL, manage tables, apply migrations
- Use MCP functions for any database work instead of manual SQL

## Development Environment Status
- ✅ Supabase project connected
- ✅ Environment variables configured  
- ✅ Next.js 15.2 project structure
- ✅ Shadcn UI components installed
- ✅ Git repository with proper branching
- ✅ Development server functional

## Immediate Next Steps Priority

### Phase 1: Critical Frontend Implementation
1. **Annual Return UI** - Highest business value (core product offering)
2. **Document Import UI** - Key differentiator with AI magic
3. **Compliance Dashboard** - User engagement and retention
4. **Board Pack Generator** - Professional reporting feature

### Phase 2: Enhancement & Polish
1. Error boundaries and proper error handling
2. Loading states and skeleton screens throughout
3. Mobile navigation refinements
4. Performance optimizations (virtual scrolling, etc.)

### Phase 3: Production Readiness
1. E2E test coverage for critical paths
2. Security audit and penetration testing
3. Production deployment and monitoring
4. Customer onboarding and support systems

## User Experience Focus
Target users are charity administrators who are:
- Time-poor and frequently interrupted
- Non-technical (Excel-comfortable)
- Anxious about compliance deadlines
- Need mobile access for field work

UX Principles:
- Immediate value (< 10 minutes to "oh shit" moment)
- Progressive disclosure of complexity
- Auto-save everything
- Clear deadlines with consequences
- "Magic moments" that delight (email → data, photo → record)

## Current Context for Next Task
- All backend infrastructure is solid and functional
- Frontend foundation (layouts, auth, basic pages) exists
- Major gap is in the high-value frontend interfaces
- Need to prioritize based on business impact
- Ready to implement any specific feature the user requests

## Memory Bank Maintenance
This file replaces previous project state summaries. Will continue updating as we progress through implementation tasks.