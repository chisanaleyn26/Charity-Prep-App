# Charity Prep - Project Understanding Summary (2025-05-28)

## What I've Learned

After thoroughly reviewing all documentation in the `/docs` folder, I now have a comprehensive understanding of the **Charity Prep** project. Here's my summary:

## Project Overview

**Charity Prep** is a SaaS platform designed to help UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations dramatically expand reporting requirements from 16 to 26+ core questions, creating urgent need for specialized compliance software.

### The Problem
- 100,000+ charities in England & Wales must track extensive new data on safeguarding, overseas expenditure, and fundraising
- First affected Annual Returns due late 2025/early 2026
- Massive administrative burden for resource-limited organizations
- Current tools are generic charity software, not purpose-built for new regulations

### The Solution
- **Purpose-built compliance tracking** for specific Annual Return requirements
- **AI-powered data entry** and extraction from emails/photos
- **Real-time compliance scoring** with visual "Risk Radar"
- **One-click report generation** for Annual Returns and board packs
- **Year-round value** to reduce churn after annual submission

## Technical Architecture

### Core Stack
- **Frontend**: Next.js 15.2 (App Router), TypeScript, Zustand, Shadcn UI
- **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **AI**: Gemini 2.5 Flash via OpenRouter, GPT-4 Vision for OCR
- **Infrastructure**: Vercel, Edge Functions
- **Payments**: Stripe
- **Design System**: Custom "Ethereal UI" with Inchworm (#B1FA63) primary color

### Architecture Principles
1. **Server-First**: Default to Server Components, minimal client state
2. **Feature-Based Organization**: Group by business domain (compliance/ai/reports)
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Progressive Enhancement**: Works without JavaScript
5. **Multi-tenancy**: Row-level security from day one

### Key Design Decisions
- **Passwordless auth** for simplicity
- **Zustand for UI state only** (not server data)
- **Server Actions** for all mutations
- **Real-time updates** via Supabase
- **Mobile-first** critical paths

## Core Features

### 🚨 Compliance Modules
1. **Safeguarding Tracker**: DBS checks, training records, policy reviews with expiry alerts
2. **Overseas Operations**: Country-by-country tracking with risk flags and partner management
3. **Fundraising Manager**: Income categorization, major donor tracking, method compliance
4. **Document Vault**: Secure storage with AI-powered OCR extraction

### 🤖 AI-Powered Features
1. **Magic Import**: Forward receipts to data@charityprep.uk → automatic data entry
2. **Document OCR**: Extract data from DBS certificates, receipts, donation letters
3. **Natural Language Search**: "Show all Kenya expenses" type queries
4. **Compliance Q&A**: Context-aware regulatory guidance
5. **Report Generation**: AI-written board narratives

### 📊 Reporting & Export
1. **Annual Return Generator**: Maps data to official form fields with copy buttons
2. **Board Pack Generator**: Professional PDFs with AI narratives
3. **Compliance Certificates**: Shareable achievement badges
4. **Data Export**: CSV, Excel, JSON backup formats

## User Experience Design

### Design System (Ethereal UI)
- **Primary**: Inchworm (#B1FA63) for CTAs and positive actions
- **Text**: Gunmetal (#243837) for primary text
- **Warning**: Orange (#FE7733) for deadlines and alerts
- **Success**: Pale Violet (#B2A1FF) for achievements
- **Typography**: Inter with -8% letter spacing globally

### Key User Flows
1. **Onboarding**: Landing → Email capture → Magic link → 5-min setup → First value
2. **Daily Usage**: Quick mobile entry, email forwarding, photo capture
3. **Compliance Check**: Weekly email digest → Dashboard → Fix urgent issues
4. **Report Generation**: Select sections → AI processing → Professional PDF

### Target Users
1. **Primary**: Solo charity administrator (non-technical, time-poor, anxious about compliance)
2. **Secondary**: Finance manager responsible for compliance
3. **Tertiary**: Compliance consultant managing multiple charity clients

## Database Schema

### Design Philosophy
- **Multi-tenancy first** with organization_id on all tables
- **Audit everything** for regulatory compliance
- **Soft deletes** - never lose data
- **UUID primary keys** for global uniqueness
- **Comprehensive constraints** for data integrity

### Core Tables
```sql
organizations          -- Charities (main tenant)
users                  -- Extends Supabase auth
organization_members   -- Many-to-many with roles
safeguarding_records   -- DBS checks and training
overseas_activities    -- International operations
income_records         -- Fundraising and donations
documents             -- File storage with OCR
ai_tasks              -- Processing queue
audit_log             -- Complete change history
```

## Business Model

### Pricing Tiers (Annual)
1. **Essentials** (£199/year): Small charities (<£100k income), 2 users, core features
2. **Standard** (£549/year): Medium charities (£100k-1M), 5 users, documents
3. **Premium** (£1,199+/year): Large charities (>£1M), 10+ users, API access

### Revenue Projections
- Target: 1% market penetration = 1,000 customers
- Average revenue per user: £400
- Year 1 goal: £400,000 ARR

## Development Strategy

### 5-Day Sprint Plan
- **Day 1**: Foundation (auth, UI, database)
- **Day 2**: Compliance modules (all CRUD operations)
- **Day 3**: AI features (import, OCR, search)
- **Day 4**: Reports & export (Annual Return, board packs)
- **Day 5**: Polish & deploy (mobile, errors, production)

### Testing Strategy
- **Unit**: Business logic and calculations
- **Integration**: API routes with Supabase
- **E2E**: Critical user journeys
- **Skip**: UI components (time constraint)

## Current Status

Based on the codebase structure, I can see:

### ✅ Complete
- Project structure and configuration
- Database schema and migrations
- Core UI components (Shadcn + Ethereal system)
- Authentication system
- Basic routing structure

### 🚧 In Progress
- Feature components (compliance modules)
- AI integration services
- Report generation
- Mobile optimization

### ❌ Pending
- Full UI implementation
- Real-time updates
- Production deployment
- Error handling

## Key Success Factors

1. **Regulatory Timing**: First-mover advantage with mandatory deadline approaching
2. **AI Differentiation**: "Magic" features create memorable moments
3. **Anxiety Reduction**: Design specifically addresses compliance stress
4. **Year-Round Value**: Prevents churn after Annual Return submission
5. **Mobile-First**: Critical for volunteer data collection

## Risk Mitigation

1. **Regulation Changes**: Built-in alert system and rapid update capability
2. **Competition**: Purpose-built for new regulations vs. generic tools
3. **Churn**: Year-round features beyond just Annual Return
4. **Technical**: Server-first architecture with proven stack

## Next Immediate Steps

Based on my understanding, the project needs:

1. **Complete frontend implementation** of all compliance modules
2. **Real-time updates** for collaborative editing
3. **Mobile responsive design** for field work
4. **Error boundaries and handling** for production readiness
5. **Performance optimization** for large datasets

## Architectural Insights

The codebase demonstrates excellent architectural decisions:
- **Server Components by default** reduces complexity
- **Feature-based organization** enables parallel development
- **Comprehensive type safety** prevents runtime errors
- **Multi-tenancy from day one** scales without refactoring
- **AI-native design** integrates seamlessly with business logic

This project represents a well-designed solution to a real, urgent market need with strong technical foundations and clear go-to-market strategy.