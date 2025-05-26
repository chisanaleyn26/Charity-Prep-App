# Charity Prep - Project Overview

## Executive Summary

Charity Prep is a SaaS platform that helps UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations require significantly more detailed reporting starting with financial years ending after January 1, 2025, creating an urgent need for specialized compliance software.

**Problem**: 100,000+ charities in England & Wales must now track and report extensive new data on safeguarding, overseas expenditure, and fundraising methods - a massive administrative burden for organizations with limited resources.

**Solution**: Charity Prep provides purpose-built tools to track required data year-round, with AI-powered features for intelligent data entry, automated compliance scoring, and one-click report generation.

**Opportunity**: First-mover advantage in a greenfield market with immediate, mandatory demand and no direct competition.

## The Regulatory Driver

The Charities (Annual Return) Regulations 2024 expand reporting requirements from 16 to 26+ core questions, with new focus on:

- **Safeguarding**: Detailed DBS check tracking, training records, policy reviews
- **International Operations**: Country-by-country expenditure, transfer methods, partner details
- **Fundraising**: Income source breakdown, major donor disclosure, methods used
- **Financial Transparency**: Related party transactions, highest donations, grant analysis

First affected returns are due late 2025/early 2026, creating immediate urgency for preparation tools.

## Target Market

### Primary Segment

- Registered charities in England & Wales with income > £10,000
- All Charitable Incorporated Organisations (CIOs)
- ~100,000 potential customers

### User Personas

1. **Solo Charity Administrator** (primary): Wearing multiple hats, non-technical, time-poor
2. **Finance Manager**: Responsible for compliance, reports to trustees
3. **Compliance Consultant**: Managing multiple charity clients

### Market Characteristics

- Limited technical expertise
- Excel/paper-based current processes
- High compliance anxiety
- Budget-conscious

## Core Value Proposition

### For Charities

1. **Compliance Confidence**: Real-time "Risk Radar" shows exactly where they stand
2. **Time Savings**: Hours to minutes for Annual Return preparation
3. **Year-Round Value**: Not just December panic - continuous tracking and reminders
4. **AI Magic**: Forward receipts to data@charityprep.uk → automatic data entry

### Key Differentiators

- **Purpose-built** for new regulations (not generic charity software)
- **AI-powered** data entry and report writing
- **Mobile-first** for volunteer data collection
- **Advisor Portal** for accountants managing multiple charities

## Feature Set

### 🚨 Compliance Modules

- **Safeguarding Tracker**: DBS checks, training, policy reviews with expiry alerts
- **Overseas Operations**: Country/partner/method tracking with risk flags
- **Fundraising Manager**: Income categorization, donor limits, method compliance
- **Document Vault**: Secure storage with OCR extraction

### 🤖 AI-Powered Features

- **Magic Import**: Email/photo → structured data
- **Natural Language Search**: "Show all Kenya expenses"
- **Report Writer**: Data → trustee-ready narratives
- **Compliance Q&A**: Instant regulatory guidance
- **Anomaly Detection**: Flags unusual patterns

### 📊 Reporting & Export

- **Annual Return Generator**: Preview and export in Commission format
- **Board Pack Generator**: One-click PDF reports with AI narratives
- **Compliance Certificates**: Shareable achievement badges
- **Multi-year Comparisons**: Track changes over time

### 🔒 Engagement & Retention

- **Weekly Digests**: Automated email summaries
- **Task Suggestions**: AI-generated action items
- **Regulatory Alerts**: Plain-English update notifications
- **Multi-charity Portal**: Manage multiple organizations

## Technical Architecture

### Stack

- **Frontend**: Next.js 15, TypeScript, Shadcn UI, Zustand
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI/ML**: Gemini 2.5 Flash via OpenRouter, Embeddings
- **Infrastructure**: Vercel, Edge Functions
- **Payments**: Paddle (handles UK VAT)
- **Testing**: Playwright (E2E), Jest

### Key Technical Decisions

- **Passwordless auth** for simplicity
- **Realtime** compliance scoring
- **Offline-first** mobile experience
- **Multi-tenancy** from day one
- **Feature flags** for tier management

## Business Model

### Pricing Tiers (Annual)

| Tier | Target | Price | Features |
| --- | --- | --- | --- |
| **Essentials** | Income < £100k | £199/year | Core compliance, 2 users |
| **Standard** | Income £100k-1M | £549/year | + 5 users, documents |
| **Premium** | Income > £1M | £1,199+/year | + 10 users, priority support |

### Revenue Projections

- 1% market penetration = 1,000 customers
- Average revenue per user: £400
- Year 1 target: £400,000 ARR

### Growth Strategy

1. **Direct**: LinkedIn/Google ads targeting charity admins
2. **Referral**: Incentivize charity-to-charity recommendations
3. **Channel**: Partner with charity accountants (advisor portal)

## Development Timeline

### 5-Day Blitz Build (AI-Accelerated)

- **Day 1**: Foundation, auth, complete database schema
- **Day 2**: All compliance modules and dashboards
- **Day 3**: AI features and magic import
- **Day 4**: Reports, exports, advisor portal
- **Day 5**: Polish, billing, deployment

### Post-Launch Roadmap

- **Month 1**: Customer feedback integration
- **Month 2**: Charity Commission API integration
- **Month 3**: Advanced analytics dashboard
- **Month 6**: Expand to Scotland/NI regulations

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
- 95% compliance score achievement

## Risk Mitigation

### Identified Risks

1. **Regulation changes**: Built-in alert system and rapid update capability
2. **Churn after annual return**: Year-round value features, multi-year lock-in
3. **Data security concerns**: UK-only hosting, SOC2 roadmap
4. **Competition from incumbents**: First-mover advantage, purpose-built solution

## Team & Resources

- **Development**: 2-3 developers using AI acceleration
- **Domain Expertise**: Charity sector advisors
- **Go-to-Market**: Focused on direct sales initially

## Summary

Charity Prep addresses an immediate, mandatory need for 100,000+ UK charities facing complex new compliance requirements. By combining purpose-built workflows with AI-powered automation, we transform a painful annual burden into a streamlined, year-round process. The 5-day build timeline enables first-mover advantage in a greenfield market with clear monetization potential.