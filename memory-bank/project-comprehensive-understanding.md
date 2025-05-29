# Charity Prep Project Comprehensive Understanding

## Overview

This document represents the comprehensive understanding of the Charity Prep project based on deep analysis of all documentation files and the codebase structure.

## Project Vision

**Charity Prep** is a SaaS platform helping UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations require significantly more detailed reporting starting with financial years ending after January 1, 2025.

### Core Problem
- 100,000+ charities must track and report extensive new data on safeguarding, overseas expenditure, and fundraising
- Massive administrative burden for resource-limited organizations
- First affected returns due late 2025/early 2026

### Solution
- Purpose-built compliance tracking tools
- AI-powered data entry and extraction
- Automated compliance scoring
- One-click report generation

## Technical Architecture

### Stack
- **Frontend**: Next.js 15.2, TypeScript, Zustand, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI/ML**: Gemini 2.5 Flash via OpenRouter
- **Infrastructure**: Vercel, Edge Functions
- **Payments**: Stripe
- **Design**: Ethereal UI design system

### Architecture Principles
1. **Server-First**: Default to Server Components, use client components only when needed
2. **Feature-Based Organization**: Group by business domain, not technical layers
3. **Minimal Client State**: Zustand for UI state only, not server data
4. **Type Safety**: Full TypeScript coverage with Zod validation
5. **Progressive Enhancement**: Works without JavaScript

## Core Features

### 1. Compliance Modules
- **Safeguarding Tracker**: DBS checks, training, policy reviews with expiry alerts
- **Overseas Operations**: Country/partner/method tracking with risk flags
- **Fundraising Manager**: Income categorization, donor limits, method compliance
- **Document Vault**: Secure storage with OCR extraction

### 2. AI-Powered Features
- **Magic Import**: Email/photo → structured data
- **Natural Language Search**: "Show all Kenya expenses"
- **Report Writer**: Data → trustee-ready narratives
- **Compliance Q&A**: Instant regulatory guidance
- **Document OCR**: Extract data from DBS certificates, receipts

### 3. Reporting & Export
- **Annual Return Generator**: Preview and export in Commission format
- **Board Pack Generator**: One-click PDF reports with AI narratives
- **Compliance Certificates**: Shareable achievement badges
- **Data Export**: CSV, Excel, PDF formats

### 4. Engagement & Retention
- **Real-time Compliance Score**: Visual "Risk Radar"
- **Automated Reminders**: DBS expiry, deadlines
- **Weekly Digests**: Email summaries
- **Multi-charity Portal**: Manage multiple organizations

## Database Schema

### Design Philosophy
- **Multi-tenancy First**: Row-level security on all tables
- **Audit Everything**: Complete change history
- **Soft Deletes**: Never lose data
- **UUID Primary Keys**: Globally unique
- **Type Safety**: ENUMs and constraints

### Core Tables
```sql
- organizations (charities)
- users (extends Supabase auth)
- organization_members (many-to-many with roles)
- safeguarding_records (DBS checks)
- overseas_activities (international work)
- income_records (fundraising tracking)
- documents (file storage)
- ai_tasks (processing queue)
```

## User Experience Design

### Design System (Ethereal UI)
- **Primary Color**: Inchworm (#B1FA63) - CTAs and positive actions
- **Text**: Gunmetal (#243837) - primary text
- **Warnings**: Orange (#FE7733) - deadlines and alerts
- **Success**: Pale Violet (#B2A1FF) - achievements
- **Typography**: Inter with -8% letter spacing

### Key User Flows
1. **Onboarding**: Email → Magic Link → Setup (5 min) → First Value
2. **Daily Usage**: Quick entry forms, email forwarding, photo capture
3. **Compliance Check**: Weekly email → Dashboard → Fix issues
4. **Report Generation**: Select sections → AI generation → Download PDF

### Mobile-First Features
- Quick DBS photo capture
- Receipt forwarding
- Compliance score checking
- Offline mode with sync

## Business Model

### Pricing Tiers (Annual)
1. **Essentials** (£199/year): Small charities, 2 users, core features
2. **Standard** (£549/year): Medium charities, 5 users, documents
3. **Premium** (£1,199+/year): Large charities, 10+ users, API access

### Growth Strategy
- Direct marketing to charity administrators
- Referral incentives
- Partner with charity accountants

## Development Timeline (5-Day Sprint)

### Day 1: Foundation
- Project setup, Supabase configuration
- Authentication flow
- Basic UI components
- Dashboard shell

### Day 2: Compliance Modules
- Safeguarding/DBS tracking
- Overseas activities
- Fundraising/income
- Compliance score calculation

### Day 3: AI Magic Features
- Email ingestion
- Document OCR
- Natural language search
- Compliance Q&A

### Day 4: Reports & Export
- Annual Return generator
- Board pack creation
- Compliance certificates
- Multi-charity portal
- Subscription/billing

### Day 5: Polish & Deploy
- Mobile optimization
- Error handling
- Performance tuning
- Production deployment

## Key Implementation Patterns

### Server Components (Default)
```typescript
export default async function Page() {
  const data = await fetchDataOnServer()
  return <Component initialData={data} />
}
```

### Server Actions
```typescript
'use server'
export async function createRecord(formData: FormData) {
  const validated = schema.parse(formData)
  const result = await supabase.insert(validated)
  revalidatePath('/path')
  return { success: true, data: result }
}
```

### Client State (UI Only)
```typescript
const useUIStore = create((set) => ({
  sidebarOpen: false,
  selectedTab: 'overview',
  toggleSidebar: () => set(state => ({ 
    sidebarOpen: !state.sidebarOpen 
  }))
}))
```

## Testing Strategy

### Focus Areas
- **Unit Tests**: Business logic (compliance calculations)
- **Integration Tests**: API routes with Supabase
- **E2E Tests**: Critical user journeys
- **Skip**: UI component testing (time constraint)

### Critical Paths to Test
1. Signup → First compliance issue found
2. Add DBS record → Score update
3. Generate Annual Return
4. Process payment

## Security & Compliance

### Data Protection
- Encryption at rest and in transit
- UK data residency
- GDPR compliant
- Row-level security on all data

### Audit Trail
- All changes logged
- User tracking
- IP addresses
- Timestamps

## Success Metrics

### Launch Goals (Month 1)
- 50 beta users
- 10 paying customers
- <5 min onboarding time
- 80% data import success rate

### Growth Goals (Year 1)
- 1,000 paying customers
- <5% monthly churn
- 50+ accountant partners
- 95% compliance achievement rate

## Risk Mitigation

1. **Regulation Changes**: Alert system for updates
2. **Churn After Annual Return**: Year-round value features
3. **Data Security**: UK hosting, SOC2 roadmap
4. **Competition**: First-mover advantage

## Current Implementation Status

### Backend (Complete)
- ✅ Database schema and migrations
- ✅ Authentication system
- ✅ All API routes
- ✅ AI integrations
- ✅ Stripe billing
- ✅ Email system

### Frontend (In Progress)
- ✅ Basic layout and routing
- ✅ Authentication pages
- 🚧 Dashboard components
- 🚧 Compliance module UIs
- 🚧 AI feature interfaces
- 🚧 Report generation UIs
- ❌ Mobile optimization
- ❌ Error boundaries

## Key Insights

1. **Market Timing**: Urgent need with regulatory deadline approaching
2. **AI Differentiation**: Magic import features create "wow" moments
3. **User Anxiety**: Design reduces compliance stress
4. **Technical Choices**: Server-first architecture proving effective
5. **Business Model**: Annual pricing aligns with compliance cycle

## Next Steps

### Immediate Priorities
1. Complete frontend UI components
2. Implement real-time updates
3. Add comprehensive error handling
4. Mobile responsive design
5. Production deployment

### Post-Launch
1. Customer feedback integration
2. Charity Commission API integration
3. Advanced analytics
4. Expand to Scotland/NI

## Conclusion

Charity Prep addresses an immediate, mandatory need for UK charities with a well-architected solution. The combination of compliance tracking, AI automation, and user-friendly design creates significant value. The 5-day build timeline demonstrates the power of AI-accelerated development with modern tooling.