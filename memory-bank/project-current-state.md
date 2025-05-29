# Charity Prep - Current Project State
Last Updated: 2025-01-27

## Executive Summary
Charity Prep is a SaaS platform helping UK charities comply with new 2024 Annual Return regulations. The project is in Day 4/5 of implementation with backend mostly complete and frontend UI pending for several key features.

## Project Architecture

### Tech Stack
- **Frontend**: Next.js 15.2 (App Router), TypeScript, Zustand (UI state only), Shadcn UI + Ethereal Design
- **Backend**: Supabase (PostgreSQL with RLS, Auth, Realtime, Storage)
- **AI**: Gemini 2.5 Flash via OpenRouter for document processing
- **Infrastructure**: Vercel (London), Paddle payments, Resend email
- **MCP Integration**: Supabase MCP for database operations

### Design System
- **Primary Colors**: Inchworm (#B1FA63), Gunmetal (#243837)
- **Secondary**: Orange (#FE7733), Pale Violet (#B2A1FF)
- **Typography**: Inter with -8% letter spacing
- **Component Architecture**: Base Shadcn + Custom Ethereal components

## Implementation Status

### ✅ Completed (Backend + Some Frontend)

#### Foundation (Day 1)
- Authentication system (passwordless magic links)
- Database schema with multi-tenancy
- Core UI components and layouts
- Dashboard with compliance scoring

#### Compliance Modules (Day 2)
- **Safeguarding**: DBS tracking, expiry management, policy tracking
- **Overseas Activities**: Country spending, transfer methods, partner management
- **Fundraising**: Income sources, donor tracking, method compliance
- **Compliance Score**: Real-time calculation with category breakdown

#### AI Features (Day 3)
- Email ingestion system (data@charityprep.uk forwarding)
- Document OCR with GPT-4 Vision
- Natural language search
- Compliance Q&A chatbot
- Report narrative generation

#### Backend Infrastructure (Day 4)
- Annual Return data aggregation
- Board pack generation logic
- Export functionality (CSV, PDF, Excel)
- Multi-organization support
- Paddle payment integration
- Subscription management

### ⏳ Pending (Frontend UI)

#### Reports & Export UI
- Annual Return generator interface
- Board pack builder UI
- Export wizard
- Compliance certificates

#### Multi-Org & Billing UI
- Organization switcher
- Multi-org dashboard
- Billing/subscription pages
- Upgrade flow

## Key Features

### 1. Core Compliance Tracking
- **Safeguarding**: Track DBS checks, training, policies
- **International**: Log overseas activities with risk assessment
- **Fundraising**: Categorize income, track methods

### 2. AI-Powered Import
- Forward emails → automatic data extraction
- Photo of document → structured data

### 3. Reporting Suite
- Annual Return preparation with field mapping
- Board reports with AI narratives
- Compliance certificates for sharing

### 4. Year-Round Engagement
- Automated reminders for expiries
- Weekly compliance digests
- Real-time score updates

## Database Schema Highlights
- Multi-tenant with RLS on all tables
- UUID primary keys throughout
- Soft deletes (deleted_at timestamps)
- Complete audit trail
- Materialized views for performance

## API Design
- RESTful endpoints for all resources
- Server Actions for mutations
- Real-time subscriptions for updates
- Rate limiting implemented

## Current Working Directory State
- Many modified files in compliance modules
- New advisor and reporting features added
- Billing infrastructure in place
- Documentation comprehensive

## Critical Next Steps
1. Complete frontend UI for reports/export
2. Implement multi-org UI components
3. Finish billing/subscription UI
4. Mobile optimization pass
5. Production deployment prep

## Business Model
- **Essentials**: £199/year (small charities)
- **Standard**: £549/year (medium charities)  
- **Premium**: £1,199+/year (large charities)
- Target: 1% market penetration = 1,000 customers

## Key Success Metrics
- Time to first value: < 10 minutes
- Onboarding completion: > 80%
- Weekly active usage: > 60%
- Annual renewal: > 90%

## Development Philosophy
- Server-first with progressive enhancement
- Feature-based code organization
- Mobile-first responsive design
- AI as core differentiator
- Type safety throughout

## Risk Areas
- Annual Return deadline pressure (late 2025/early 2026)
- Need for rapid user acquisition
- Competition from generic charity software
- Regulatory changes

## Team Notes
- Using 3-developer parallel structure
- Daily integration points critical
- Focus on MVP features only
- Deploy daily to catch issues early