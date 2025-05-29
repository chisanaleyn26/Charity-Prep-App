# Comprehensive Project Understanding - Charity Prep
*Last Updated: 2025-05-29*

## Project Overview

**Charity Prep** is a SaaS platform designed to help UK charities comply with the new Charities (Annual Return) Regulations 2024. These regulations expand reporting requirements from 16 to 26+ questions, creating an urgent compliance need for 100,000+ charities.

## Business Context

### The Problem
- New UK regulations starting 2025/2026 require extensive tracking and reporting
- Charities must track safeguarding, overseas activities, and fundraising data
- First affected returns due late 2025/early 2026
- Charities are anxious about compliance and lack tools

### The Solution
- Purpose-built compliance tracking platform
- AI-powered data entry (email/photo to structured data)
- Real-time compliance scoring
- Mobile-first design for field work
- Multi-charity advisor portal

## Technical Architecture

### Core Stack
- **Frontend**: Next.js 15.2 (App Router), TypeScript, Shadcn UI
- **State Management**: Zustand (UI state only)
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **AI Integration**: 
  - Gemini 2.5 Flash via OpenRouter (general AI)
  - GPT-4 Vision (OCR tasks)
- **Infrastructure**: Vercel (London region)
- **Payments**: Stripe
- **MCP Integration**: Supabase MCP for direct database operations

### Architecture Principles
1. **Server-First**: Default to Server Components, Client Components only when needed
2. **Feature-Based Organization**: Code grouped by business domain (e.g., /features/compliance/)
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Progressive Enhancement**: Core functionality works without JavaScript
5. **Real-time First**: Live updates for compliance scores
6. **AI-Native**: LLM integration as core functionality, not an afterthought

### Performance Strategy
- Code splitting with dynamic imports
- Virtual scrolling for large datasets  
- Debounced inputs
- Request memoization
- Streaming UI with Suspense
- Image optimization with Next.js Image

## Design System (Ethereal UI)

### Color Palette
- **Primary**: Inchworm (#B1FA63) - CTAs, success states
- **Text**: Gunmetal (#243837) - Primary text
- **Warning**: Orange (#FE7733) - Deadlines, alerts
- **Accent**: Pale Violet (#B2A1FF) - Selected states
- **Background**: Honeydew (#E9FAE3) - Light theme

### Typography
- Font: Inter with -8% letter-spacing
- Scale: Display (48px) → Caption (12px)
- Line heights: 1.2 (headings) to 1.6 (body)

### Component Architecture
- Base UI components (shadcn/ui)
- Custom Ethereal components (components/custom-ui)
- Consistent 8px grid spacing
- Defined elevation system
- Motion: 100-500ms durations

## Core Features

### 1. Compliance Modules

#### Safeguarding Tracker
- DBS check management with expiry warnings
- Training record tracking
- Policy review reminders  
- Status visualization (Valid/Expiring/Expired)

#### Overseas Operations
- Country-by-country activity tracking
- Transfer method compliance
- Partner organization management
- High-risk country warnings

#### Fundraising Manager
- Income source categorization
- Major donor tracking (£25k+ threshold)
- Related party transaction flagging
- Gift Aid tracking

### 2. AI-Powered Features

#### Magic Import
- Email forwarding → structured data
- Photo capture → data extraction
- Natural language to database queries

#### Document Processing
- OCR for certificates and documents
- Auto-categorization
- Data extraction with validation

#### Smart Assistance
- Natural language search ("Show expiring DBS checks")
- Compliance Q&A with regulatory context
- Auto-generated narratives for reports

### 3. Reporting & Export

#### Annual Return Generator
- Field mapping to official forms
- Preview before submission
- Export in required formats

#### Board Pack Generator
- AI-written executive summaries
- Customizable sections
- Professional PDF output

#### Data Export
- CSV, Excel, PDF formats
- Scheduled exports
- API access for integrations

### 4. User Engagement

- Real-time compliance scoring
- Task suggestions
- Mobile quick-entry
- Weekly digest emails
- Deadline reminders

## Database Schema

### Design Principles
- Multi-tenancy with Row-Level Security (RLS)
- Soft deletes for data retention
- Complete audit trails
- UUID primary keys
- Performance indexes on foreign keys

### Key Tables
```sql
- organizations (core tenant)
- user_organization_roles (RBAC)
- safeguarding_records
- overseas_activities  
- income_records
- documents
- ai_tasks (processing queue)
- compliance_scores (materialized view)
```

## User Experience

### Target Users

#### Primary: Solo Charity Administrator
- Non-technical
- Time-poor
- Anxious about compliance
- Works across locations

#### Secondary: Charity Accountants
- Managing multiple clients
- Need bulk operations
- Require professional reports

### Key UX Principles
1. **Immediate Value**: Show issues within 5 minutes
2. **Low Friction**: Passwordless auth, smart defaults
3. **Mobile-First**: Critical tasks on phones
4. **AI Delight**: "Magic" moments saving hours
5. **Anxiety Reduction**: Clear fixes for problems

### Critical User Flows

1. **Onboarding** (<10 min)
   - Email → Magic link → Basic setup → First issue fixed

2. **Daily Usage**
   - Quick mobile entry
   - Email forwarding
   - Photo capture

3. **Compliance Management**
   - Weekly score checks
   - Expiry warnings
   - Task completion

4. **Report Generation**
   - Annual Return prep
   - Board pack creation
   - Certificate sharing

## Business Model

### Pricing Tiers
- **Essentials** (£199/year): Small charities, 2 users, core features
- **Standard** (£549/year): Medium charities, 5 users, AI features
- **Premium** (£1,199+/year): Large charities, 10+ users, API access

### Growth Strategy
- Direct marketing to charity administrators
- Referral program with incentives
- Channel partnerships with accountants
- Content marketing on compliance

### Competitive Advantages
1. **First-mover** in new regulatory space
2. **Purpose-built** vs generic tools
3. **AI differentiation** for data entry
4. **Mobile-first** design
5. **Year-round value** beyond annual return

## Development Status

### Current Sprint (5-Day Plan)
- **Day 1**: ✓ Foundation, auth, database
- **Day 2**: ✓ Compliance modules  
- **Day 3**: ✓ AI features
- **Day 4**: ✓ Reports and export
- **Day 5**: ✓ Polish and fixes

### Recent Focus Areas
- Compliance chat implementation
- Tailwind CSS configuration fixes
- Authentication flow improvements
- Form implementations for all compliance modules

### Testing Strategy
- Unit tests: Business logic (90% target)
- Integration tests: API routes (80% target)
- E2E tests: Critical user paths
- Skip: UI components, third-party integrations

## Key Success Metrics

1. **User Acquisition**: 1,000 charities in Year 1
2. **Activation**: 80% complete setup in first session
3. **Retention**: 90% annual renewal rate
4. **Engagement**: Weekly active usage
5. **Revenue**: £500k ARR by end of Year 1

## Important Notes

### Development Guidelines (from CLAUDE.md)
- Read entire files before editing
- Commit early and often at milestones
- Look up latest library syntax
- Run linting after major changes
- Optimize for code readability
- No dummy implementations
- Understand before implementing
- Follow existing patterns

### MCP Integration
- Supabase MCP available for direct database operations
- Can list projects, execute SQL, manage tables
- Useful for debugging and data operations

## Next Focus Areas
Based on current status and user needs:
1. Complete any remaining polish items
2. Ensure all forms are fully functional
3. Optimize performance for production
4. Prepare for user onboarding
5. Set up monitoring and analytics