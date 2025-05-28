# Charity Prep - Comprehensive Project Understanding

## Last Updated: January 2025

## Project Overview
Charity Prep is a SaaS platform designed to help UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations significantly expanded reporting requirements, creating an urgent need for specialized compliance software for 100,000+ registered charities in England & Wales.

## Technical Stack
- **Frontend**: Next.js 15.2, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI/LLM**: Gemini 2.5 Flash via OpenRouter
- **Design**: Ethereal UI (Inchworm #B1FA63, Gunmetal #243837)
- **Architecture**: Server-first, feature-based organization, minimal client state

## Core Features
1. **Compliance Modules**: Safeguarding, International Operations, Fundraising
2. **AI Features**: Magic Import, Natural Language Search, Document OCR, Report Generation
3. **Reporting**: Annual Return Generator, Board Pack Generator, Compliance Certificates
4. **Multi-tenancy**: Organization switching, advisor portal support

## Implementation Status
- Days 1-2: Foundation and compliance modules ✅
- Day 3: AI features (partially complete)
- Day 4: Reports and exports (backend complete, some frontend pending)
- Day 5: Polish and deployment (pending)

## Key Architecture Decisions
- Server Components by default (Next.js 15.2)
- Zustand for UI state only (not server data)
- Row-level security on all tables
- Feature-based file organization
- Type safety with TypeScript + Zod

## Business Context
- Pricing: £199-1,199+/year based on charity size
- Target: UK charities facing new compliance requirements
- First-mover advantage in greenfield market
- Designed for non-technical charity administrators

## Integration Points
- Supabase with MCP integration available
- OpenRouter for AI capabilities
- Stripe for payment processing
- Resend for email services

## User Experience Principles
- Immediate value (< 10 minutes to first insight)
- Mobile-first for critical flows
- AI-powered "magic moments"
- Anxiety reduction through clear guidance
- Progressive enhancement approach

## Critical Success Factors
- Compliance score calculation accuracy
- Annual Return form mapping
- DBS expiry tracking and reminders
- AI extraction reliability
- Mobile responsiveness

This understanding will guide all development decisions and ensure alignment with project goals.