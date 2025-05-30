# Comprehensive Project Understanding - May 30, 2025

## Project Overview
Charity Prep is a SaaS platform helping UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations expanded reporting requirements from 16 to 26+ questions, creating an urgent compliance burden for 100,000+ charities in England & Wales.

## Technical Stack
- **Frontend**: Next.js 15.2, TypeScript, Zustand, Shadcn UI + Ethereal Design System
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Realtime, Storage)
- **AI**: OpenRouter (Gemini 2.5 Flash), GPT-4 Vision for OCR
- **Payments**: Stripe (test mode currently)
- **Email**: Resend
- **Hosting**: Vercel (planned for UK region)

## Core Features Implemented

### 1. Authentication & User Management ✅
- Magic link/OTP login
- Multi-organization support with org switcher
- Team management with invitations
- Role-based access control (Admin, Member, Viewer)
- User limits based on subscription tier

### 2. Subscription & Billing ✅
- Three tiers: Essentials (£290/yr), Standard (£790/yr), Premium (£1490/yr)
- Stripe integration with checkout flow
- Manual subscription sync (webhooks not implemented)
- Billing dashboard at /settings/billing

### 3. Compliance Modules ✅
- **Safeguarding**: DBS checks, training records, policy tracking
- **Fundraising**: Event management, income categorization
- **Overseas Activities**: Country/partner/method tracking
- **Compliance Score**: Real-time calculation with Risk Radar visualization

### 4. AI Features (Partial)
- **AI Report Generator**: 6 report types with customizable tone/length ✅
- **Document OCR**: Planned but not implemented ⚠️
- **Magic Import**: Email-to-data extraction planned ⚠️
- **Compliance Chat**: Needs complete rebuild due to performance issues ⚠️

### 5. Reports Module (80% Complete)
- **Annual Return**: Field mapping to Charity Commission format ✅
- **Board Pack**: AI-powered narrative generation with templates ✅
- **Certificates**: Gamified achievement badges ✅
- **Export Module**: UI complete but needs backend implementation ⚠️

## Current Issues & Gaps

### 1. Export Module Incomplete
- Missing database tables (export_templates, export_configs, export_jobs)
- No background job processing
- No scheduled export functionality
- No email delivery for completed exports

### 2. Compliance Chat Performance
- 7-9 second response times
- Rate limiting issues with OpenRouter
- No chat history persistence
- Needs complete architectural rebuild

### 3. Production Readiness
- Stripe webhooks not implemented
- Service role key using placeholder
- Some environment variables need production values
- Missing monitoring and error tracking

## Architecture Principles
1. **Server-First**: Server Components by default, Client Components only for interactivity
2. **Feature-Based Organization**: Code organized by business domain
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Progressive Enhancement**: Works without JavaScript
5. **Real-time Updates**: Via Supabase subscriptions

## Business Model
- **Target Market**: 100,000+ UK charities with income >£10,000
- **Pricing**: Annual subscriptions from £290-£1490
- **Value Prop**: Save hours on compliance, reduce anxiety, ensure accuracy
- **Differentiators**: Purpose-built for UK charities, AI-powered, mobile-first

## Development Guidelines (CLAUDE.md)
- Always read entire files before editing
- Ask before editing Tailwind config
- Commit early and often
- No dummy implementations
- Plan before implementing
- Optimize for readability
- Look up latest library syntax when unsure

## Next Priority Tasks
1. Complete Export Module backend
2. Rebuild Compliance Chat for better performance
3. Implement Stripe webhooks
4. Set up production environment
5. Complete end-to-end testing

## MCP Supabase Integration
The project has MCP integration with Supabase, allowing direct database operations, migrations, and Edge Function deployment through the MCP tools.

## Project Status
- Core functionality: ✅ 90% complete
- UI/UX: ✅ 95% complete
- Backend integrations: ⚠️ 75% complete
- Production readiness: ⚠️ 70% complete
- Overall: ~85% ready for production

The project is well-architected and mostly functional, with clear remaining tasks focused on completing the Export module, optimizing performance, and preparing for production deployment.