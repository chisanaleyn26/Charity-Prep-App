# Charity Prep - Comprehensive Project Understanding
*Updated: 2025-01-27*

## Project Overview
Charity Prep is a SaaS platform helping UK charities comply with new Charities (Annual Return) Regulations 2024. These regulations expand reporting requirements from 16 to 26+ core questions, creating an urgent need for specialized compliance software.

## Business Context
- **Target Market**: 100,000+ UK charities with income > £10,000
- **Problem**: New regulations require detailed tracking of safeguarding, overseas expenditure, and fundraising methods
- **Solution**: AI-powered compliance management with year-round tracking and one-click report generation
- **Pricing**: £199-1199+/year based on charity size

## Technical Architecture

### Stack
- **Frontend**: Next.js 15.2, TypeScript, Tailwind CSS, Shadcn UI, Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI**: Gemini 2.5 Flash via OpenRouter for document extraction, chat, report generation
- **Infrastructure**: Vercel (London region), Edge Functions
- **Payments**: Stripe (migrated from Paddle)
- **Email**: Resend
- **MCP Integration**: Supabase MCP for database operations

### Architecture Patterns
- Server Components by default
- Server Actions for mutations
- Feature-based file organization
- Row-level security on all tables
- Zustand for UI state only (not server state)
- Progressive enhancement approach
- Mobile-first design

### Database Schema
- Multi-tenancy with organization_id on all tables
- UUID primary keys throughout
- Soft deletes (deleted_at timestamps)
- Comprehensive audit logging
- Key tables: organizations, users, safeguarding_records, overseas_activities, income_records, documents, ai_tasks

## Design System (Ethereal UI)

### Colors
- **Primary**: Inchworm (#B1FA63) - CTAs, interactive elements
- **Dark**: Gunmetal (#243837) - Text, dark backgrounds
- **Warning**: Orange (#FE7733) - Alerts, notifications
- **Accent**: Pale Violet (#B2A1FF) - Selected states

### Typography
- Font: Inter with -8% letter spacing
- Consistent spacing scale (8px base grid)
- Radius system: 4px (sm), 8px (md), 12px (lg)

### Component Architecture
- Base components in `/components/ui/` (standard Shadcn)
- Custom Ethereal components in `/components/custom-ui/` (brand-specific)
- Components prefixed with `ethereal-` for brand versions

## Core Features

### 1. Compliance Modules
- **Safeguarding**: DBS check tracking, training records, policy management
- **Overseas Activities**: Country-by-country spending, transfer methods, partner management
- **Fundraising**: Income categorization, donor tracking, method compliance

### 2. AI-Powered Features
- Document OCR extraction (DBS certificates, receipts)
- Email-to-data processing (forward to data-{orgId}@charityprep.uk)
- Natural language search
- Compliance Q&A chatbot
- Report narrative generation

### 3. Reporting & Export
- Annual Return generator with form mapping
- Board pack generation with AI narratives
- Compliance certificates
- Multi-format exports (CSV, Excel, PDF)

### 4. User Management
- Passwordless authentication (magic links)
- Role-based access (admin, member, viewer)
- Multi-organization support
- Advisor portal for accountants

## Current Implementation Status

### ✅ Backend Complete
- Database schema with RLS policies
- All API routes and server actions
- AI integration endpoints
- Payment webhook handling
- Email processing system

### ✅ Frontend Infrastructure
- Project setup and configuration
- UI component library (Shadcn + Ethereal)
- State management (Zustand)
- Layout components

### 🚧 Frontend Pages Pending
1. Annual Return UI (`/reports/annual-return`)
2. Board Pack UI (`/reports/board-pack`)
3. Export UI (`/reports/export`)
4. Multi-org UI (`/advisor`)
5. Billing UI (`/settings/billing`)

### 🐛 Current Errors to Fix
1. **Login Page Issues**:
   - Dev bypass functionality errors
   - Potential hydration mismatches
   - Cookie/session handling problems

2. **Webpack/Build Errors**:
   - Module resolution issues
   - Self is not defined errors (being addressed in next.config.ts)

3. **Component Errors**:
   - Error boundaries causing issues (removed temporarily)
   - FormErrorBoundary integration problems

## Development Guidelines (from CLAUDE.md)
1. Always read entire files before making changes
2. Commit early and often at logical milestones
3. Look up latest library syntax when unsure
4. Never skip implementations or make dummy versions
5. Run linting after major changes
6. Optimize code for readability
7. Get plan approval before implementing
8. Break down large tasks into subtasks
9. Use MCP Supabase integration for database operations
10. Update memory bank frequently

## UX Flow Principles
- Immediate value (show problems within 5 minutes)
- Low friction (passwordless, auto-detect, smart defaults)
- Mobile-first for critical tasks
- AI delight moments that save hours
- Anxiety reduction with clear deadlines and fixes

## Key Success Metrics
- Time to first value: < 10 minutes
- Setup completion: > 80%
- Weekly active usage: > 60%
- Annual renewal: > 90%

## Next Priority Actions
1. Fix login page and dev bypass errors
2. Implement pending frontend pages
3. Add comprehensive error handling
4. Complete mobile optimizations
5. Run E2E test suite
6. Deploy to production