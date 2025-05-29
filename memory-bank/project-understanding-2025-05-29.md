# Charity Prep - Project Understanding Summary
**Date**: 2025-05-29
**Session**: Comprehensive review of all documentation

## Executive Summary

After thoroughly reviewing all documentation in `/docs` and existing memory bank files, I have gained a comprehensive understanding of **Charity Prep** - a SaaS platform helping UK charities comply with the new Charities (Annual Return) Regulations 2024.

## Core Business Context

### The Problem
- New regulations (effective 2025) expand charity reporting from 16 to 26+ questions
- 100,000+ UK charities must track detailed data on:
  - Safeguarding (DBS checks, training, policies)
  - Overseas activities (country-by-country spending, transfer methods)
  - Fundraising (income sources, major donors, methods)
- First affected returns due late 2025/early 2026 - creating urgent market need
- Massive administrative burden for resource-limited charities

### The Solution
- Purpose-built compliance platform (not generic charity software)
- AI-powered data entry (email forwarding, OCR, natural language)
- Real-time compliance scoring with visual "Risk Radar"
- One-click report generation for Annual Returns
- Year-round value to prevent post-submission churn

### Target Market
- **Primary**: Solo charity administrators (non-technical, time-poor, compliance-anxious)
- **Secondary**: Finance managers responsible for compliance
- **Tertiary**: Accountants managing multiple charity clients
- **Market Size**: 100,000+ registered charities in England & Wales

## Technical Architecture

### Core Stack
```
Frontend:    Next.js 15.2 (App Router), TypeScript, Zustand, Shadcn UI
Backend:     Supabase (PostgreSQL + Auth + Realtime + Storage)
AI/ML:       Gemini 2.5 Flash via OpenRouter, GPT-4 Vision for OCR
Payments:    Stripe (migrated from Paddle)
Infra:       Vercel (London region), Edge Functions
Design:      Ethereal UI (custom design system)
Special:     MCP integration for direct Supabase access
```

### Architectural Principles
1. **Server-First**: Default to Server Components, minimal client state
2. **Feature-Based Organization**: `/features/[domain]/` structure
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Progressive Enhancement**: Works without JavaScript
5. **Multi-Tenancy**: Row-level security from day one
6. **Real-Time**: Supabase Realtime for collaboration

### Key Technical Decisions
- **Passwordless Auth**: Magic links for simplicity
- **Zustand for UI State Only**: Server is source of truth (no server data in client stores)
- **Server Actions**: All mutations via server actions
- **Mobile-First**: Critical paths optimized for mobile
- **AI-Native**: LLM integration as core feature, not bolt-on

## Feature Overview

### 🚨 Compliance Modules

**Safeguarding Tracker**
- DBS check management with expiry alerts (30/60/90 day reminders)
- Training record tracking
- Policy review schedules
- Status indicators: Valid (green), Expiring Soon (yellow), Urgent (orange), Expired (red)

**Overseas Operations**
- Country-by-country expenditure tracking
- Transfer method compliance (flags crypto, cash courier, etc.)
- Partner organization management with due diligence
- Risk assessment by country (Syria, Afghanistan flagged)
- Interactive world map visualization

**Fundraising & Income**
- Income source categorization (donations, charitable activities, trading, investments)
- Major donor identification (auto-tracks highest by type)
- Related party transaction flagging
- Gift Aid tracking
- Fundraising method compliance checklist

### 🤖 AI-Powered Features

**Magic Import**
- Email forwarding to `data-{orgId}@charityprep.uk`
- Automatic extraction from attachments
- Confidence scoring on extracted data
- Queue for review and confirmation

**Document OCR**
- DBS certificate extraction
- Receipt/invoice processing
- Donation letter parsing
- Bank statement import
- Batch processing support

**Natural Language Interface**
- Search: "Show all DBS expiring in March"
- Queries: "Total spent in Kenya last year"
- Commands: "Donations over £5000 from companies"
- Smart suggestions based on context

**Compliance Chat**
- RAG-based on UK charity regulations
- Organization-specific context
- Cites relevant regulations
- Suggests actionable next steps

**Report Generation**
- AI-written board narratives
- Data-to-prose conversion
- Professional tone and formatting
- Customizable sections

### 📊 Reporting & Export

**Annual Return Generator**
- Preview in official Charity Commission format
- Field-by-field mapping with progress tracking
- Copy individual answers or export all
- Pre-flight checks for data quality
- Highlights missing/problematic data

**Board Pack Generator**
- Template selection (Quick, Detailed, Trustee-friendly)
- AI narrative generation for each section
- Charity branding applied
- Export as PDF or Word
- Email to trustees option

**Compliance Certificates**
- "97% Compliant" achievement badges
- Annual Return Ready certificate
- Social sharing integration
- Verifiable links

**Data Export**
- CSV per module or combined
- Excel with formatted sheets
- JSON for full backup
- GDPR-compliant personal data export

## Database Architecture

### Design Philosophy
- **Multi-tenancy**: `organization_id` on every table with RLS
- **Audit Everything**: Complete change history in `audit_log`
- **Soft Deletes**: `deleted_at` timestamps, never lose data
- **UUID Primary Keys**: Global uniqueness
- **Type Safety**: Extensive use of ENUMs and constraints

### Core Tables
```sql
organizations          -- Main tenant (charity details)
users                  -- Extended from Supabase auth.users
organization_members   -- Many-to-many with roles (admin/member/viewer)
safeguarding_records   -- DBS checks, training, policies
overseas_activities    -- International operations
income_records         -- Fundraising and donations
documents             -- File storage with OCR status
ai_tasks              -- Processing queue for AI operations
subscriptions         -- Stripe subscription management
compliance_scores     -- Materialized view for performance
audit_log             -- Complete change tracking
notifications         -- Reminder and alert queue
```

### Key Constraints
- `charity_number`: Must match `^\d{6,8}(-\d{1,2})?$`
- `financial_year_end`: Must be 1st or 31st of month
- `dbs_number`: 12 digits exactly
- Transfer methods: ENUM with risk flags
- Income sources: Match Charity Commission categories

## User Experience Design

### Design System: Ethereal UI
- **Primary**: Inchworm (#B1FA63) - CTAs and positive actions
- **Text**: Gunmetal (#243837) - Primary text color
- **Warning**: Orange (#FE7733) - Deadlines and alerts  
- **Success**: Pale Violet (#B2A1FF) - Achievements
- **Typography**: Inter with -8% letter spacing globally
- **Spacing**: 8px base grid system
- **Motion**: Subtle animations (100-500ms durations)

### Critical User Flows

**Onboarding (Target: 5 minutes)**
1. Landing page with risk calculator
2. Email capture (passwordless)
3. Magic link login
4. Charity details (auto-filled from API)
5. Import existing data (CSV/spreadsheet)
6. See compliance score immediately

**Daily Usage**
- Quick mobile entry for field workers
- Photo capture → OCR → auto-save
- Email forward → magical data entry
- Voice notes for quick capture

**Weekly Compliance Check**
- Email digest with score changes
- Dashboard shows urgent actions
- One-click fixes for common issues
- Progress tracking and celebrations

**Annual Return Generation**
- Progress bar shows readiness
- Preview official form layout
- Copy fields individually
- Export all data as CSV
- Pre-flight validation checks

### Mobile-First Features
- Bottom navigation for thumb reach
- Camera-first document capture
- Offline mode with sync queue
- Large touch targets (44px minimum)
- Swipe actions for common tasks

## Business Model

### Pricing Tiers (Annual)
| Tier | Target | Price | Features |
|------|--------|-------|----------|
| **Essentials** | Income < £100k | £199/year | 2 users, core compliance, email support |
| **Standard** | Income £100k-1M | £549/year | 5 users, documents, advisor portal |
| **Premium** | Income > £1M | £1,199+/year | 20+ users, API access, phone support |

### Revenue Model
- 14-day free trial (no credit card)
- Annual billing only (reduces churn)
- Target: 1% market penetration = 1,000 customers
- Average revenue per user: £400
- Year 1 goal: £400,000 ARR

### Growth Strategy
1. **Direct**: LinkedIn/Google ads targeting charity admins
2. **Referral**: Charity-to-charity recommendations
3. **Channel**: Partner with charity accountants
4. **Content**: SEO on compliance topics

## Current Implementation Status

### ✅ Completed
- Project setup and configuration
- Complete database schema with migrations
- Authentication system (magic links + OTP)
- All backend API routes (100+ endpoints)
- Stripe billing integration
- Basic dashboard with KPI cards
- User profile and preferences system
- Organization management with multi-tenancy
- Settings pages structure
- UI component library (Shadcn + Ethereal)
- State management setup (Zustand)
- MCP Supabase integration

### 🚧 In Progress
- AI feature implementations
- Report generation UI (Annual Return, Board Pack)
- Compliance module frontends
- Mobile responsive layouts
- Real-time collaboration features
- Error boundary implementations
- Performance optimizations

### ❌ Not Started
- Email ingestion system
- Notification/reminder system
- Full compliance chat UI
- Data export UI
- Compliance certificates
- Production deployment
- Monitoring and analytics

## Known Issues & Technical Debt

### Critical Issues
1. **RLS Policy Recursion**: Some policies use recursive `user_organization_role()` function
2. **Component Errors**: KPICards has undefined property access issues
3. **Date Validation**: Financial year end must be 1st or 31st of month

### Technical Debt
- Certificate generation removed (react-pdf issues)
- Board pack generation needs refactoring
- Some settings pages have placeholder content
- Email processor not implemented
- Missing error boundaries in key areas

### Performance Considerations
- Need to implement Next.js 15 caching strategies
- Streaming and Suspense for progressive loading
- Dynamic imports for heavy components (PDF, charts)
- Database indexes need optimization
- Bundle size target: < 500KB initial JS

## Development Guidelines (CLAUDE.md)

### Core Principles
1. **Always read entire files** - Don't assume, know what's there
2. **Don't edit Tailwind config** without explicit permission
3. **Commit early and often** - After each working milestone
4. **Look up library syntax** - Don't assume API knowledge
5. **Run linting** after major changes
6. **Optimize for readability** - Code is read more than written
7. **No dummy implementations** - Build real features
8. **Get clarity before starting** - Ask questions
9. **No large refactors** without explicit instruction
10. **Plan architecture first** - Think, then code

### Code Organization
- Feature-based structure (`/features/[domain]/`)
- Separation of concerns (components, actions, services, types)
- Server Components by default
- Client Components only for interactivity
- Zustand for UI state only (never server data)

## MCP Supabase Integration

We have direct database access via MCP (Model Context Protocol):

### Available Commands
- Organization management
- Project operations
- SQL execution
- Migration application
- Table introspection
- Log viewing
- Branch management

### Usage Pattern
```
mcp__supabase__list_organizations
mcp__supabase__execute_sql
mcp__supabase__apply_migration
```

This enables direct database queries and management during development.

## Next Steps & Priorities

### Immediate (This Week)
1. Fix KPICards component errors
2. Complete AI feature implementations
3. Implement report generation UI
4. Add notification system
5. Mobile responsive testing

### Short Term (Next 2 Weeks)
1. Email ingestion system
2. Full compliance chat UI
3. Performance optimization pass
4. E2E test suite
5. Production deployment prep

### Medium Term (Next Month)
1. Charity Commission API integration
2. Advanced analytics dashboard
3. Multi-language support (Welsh)
4. Partner integrations
5. Beta user onboarding

## Key Success Factors

1. **Regulatory Timing**: First-mover before mandatory deadline
2. **AI Differentiation**: "Magic" moments that delight users
3. **Anxiety Reduction**: Clear deadlines and progress tracking
4. **Mobile Accessibility**: Field workers can contribute
5. **Year-Round Value**: Not just Annual Return time

## Risk Mitigation

1. **Regulation Changes**: Flexible schema, rapid updates
2. **Competition**: Purpose-built vs generic software
3. **User Adoption**: Progressive onboarding, immediate value
4. **Technical Scaling**: Multi-tenant architecture ready
5. **Data Security**: UK hosting, GDPR compliance, RLS

## Important Reminders

- Always validate against database constraints
- Check for undefined/null with optional chaining
- Test with multiple organizations (multi-tenancy)
- Consider mobile experience in all features
- Follow established naming conventions
- Use Server Actions for all mutations
- Keep Zustand for UI state only
- Implement loading and error states

## Conclusion

Charity Prep is a well-architected solution addressing an urgent market need. The technical foundation is solid with modern best practices, the UX is designed for non-technical users, and the business model aligns with market opportunity. 

The backend is largely complete with comprehensive API coverage. The main work remaining is frontend implementation, AI feature completion, and performance optimization. With the regulatory deadline approaching, there's strong market timing for launch.