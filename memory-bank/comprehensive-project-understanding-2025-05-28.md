# Charity Prep - Comprehensive Project Understanding
**Last Updated**: 2025-05-28

## Project Overview

**Charity Prep** is a SaaS platform helping UK charities comply with the Charities (Annual Return) Regulations 2024. These new regulations require significantly more detailed reporting starting with financial years ending after January 1, 2025.

### Core Problem Solved
- 100,000+ charities must track and report extensive new data on safeguarding, overseas expenditure, and fundraising
- New regulations expand reporting from 16 to 26+ core questions
- Creates massive administrative burden for resource-limited charities

### Target Market
- Small to medium UK charities (£100k - £1M annual income)
- Charity administrators who are time-poor and compliance-anxious
- Non-technical users who need simple, intuitive tools

## Technical Architecture

### Tech Stack
**Frontend:**
- Next.js 15.2 (App Router)
- TypeScript 5.x (strict mode enabled)
- Shadcn UI + custom Ethereal Design System
- Zustand (UI state only - no server data)
- React Hook Form + Zod validation
- Tailwind CSS for styling

**Backend:**
- Supabase (PostgreSQL 15, Auth, Realtime, Storage)
- Next.js API Routes
- Vercel Edge Functions
- Row-Level Security (RLS) for multi-tenancy
- MCP integration with Supabase

**AI/ML:**
- Gemini 2.5 Flash via OpenRouter
- GPT-4 Vision for OCR
- OpenAI embeddings for vector search
- Supabase pgvector for RAG

**Payments:**
- Stripe integration (previously Paddle)
- Annual subscription model
- 14-day free trial

## Database Schema

### Core Design Principles
1. **Multi-tenancy First**: Every table has `organization_id` with RLS
2. **Soft Deletes**: Use `deleted_at` timestamps, never lose data
3. **UUID Primary Keys**: Globally unique identifiers
4. **Audit Everything**: Complete history trail
5. **Type Safety**: ENUMs and constraints extensively used

### Key Tables
- `organizations` - Core tenant table with charity details
- `users` - Extended from Supabase auth.users
- `organization_members` - Multi-org support with roles (admin/member/viewer)
- `safeguarding_records` - DBS checks and training tracking
- `overseas_activities` - International operations tracking
- `income_records` - Fundraising and donation tracking
- `documents` - Secure file storage
- `subscriptions` - Stripe subscription management
- `ai_tasks` - AI processing queue
- `compliance_scores` - Materialized view for performance

### Important Constraints
- **charity_number**: Must match regex `^\d{6,8}(-\d{1,2})?$`
- **financial_year_end**: Must be 1st or 31st of any month
- **income_band**: ENUM ('small', 'medium', 'large')

## Key Features

### 1. Compliance Modules

**Safeguarding Tracker:**
- DBS check management with expiry alerts
- Training record tracking
- Policy review management
- Automatic reminders 30 days before expiry

**Overseas Activities:**
- Country-by-country expenditure tracking
- Transfer method compliance (flags high-risk methods)
- Partner organization management
- Interactive world map visualization

**Fundraising & Income:**
- Income source categorization
- Major donor identification (£5,000+)
- Related party transaction flagging
- Gift Aid tracking

### 2. AI-Powered Features

**Magic Import:**
- Email forwarding to data@charityprep.uk
- OCR from photos/PDFs (DBS certificates, receipts)
- Natural language data entry

**Compliance Chat:**
- AI assistant trained on UK charity regulations
- Natural language search capabilities
- Compliance Q&A with regulatory knowledge
- Context-aware suggestions

### 3. Reporting & Export

**Annual Return Generator:**
- Preview in official form format
- Field-by-field mapping
- Export all data as CSV
- Copy individual answers

**Board Pack Generator:**
- Professional PDF reports
- AI-generated narratives
- Customizable sections
- Charity branding support

## Design System (Ethereal UI)

### Color Palette
- **Primary**: Inchworm (#B1FA63) - CTAs and positive actions
- **Gunmetal**: (#243837) - Primary text
- **Warning**: Orange (#FE7733) - Urgency and alerts
- **Success**: Pale Violet (#B2A1FF) - Achievements
- **Mist**: (#B4C5BD) - Secondary elements

### Typography
- Font: Inter with -8% letter spacing
- Clear hierarchy from Display (48px) to Caption (12px)
- Consistent spacing and readability

### Component Architecture
- Base components: `/components/ui/` (Shadcn)
- Custom branded: `/components/custom-ui/`
- Feature components: `/features/[module]/components/`

## Current Implementation Status

### ✅ Completed
- Authentication system (magic links/OTP)
- Database schema and migrations
- API endpoints for all compliance modules
- Stripe billing integration
- Basic dashboard with KPI cards
- Onboarding flow
- Organization management
- User profile system
- Settings pages

### 🚧 In Progress
- AI features (document extraction, chat)
- Report generation (Annual Return, Board Pack)
- Mobile optimization
- Performance optimizations

### ❌ Not Started
- Email ingestion system
- Notification system
- Data export functionality
- Compliance certificates

## Common Issues & Solutions

### 1. TypeError: Cannot read properties of undefined
**Issue**: KPICards component accessing nested properties without proper checks
**Solution**: Added type guards and early returns for error cases

### 2. RLS Policy Errors
**Issue**: Infinite recursion in user_organization_role() function
**Solution**: Removed recursive function, created simpler policies

### 3. Date Format Validation
**Issue**: financial_year_end must be 1st or 31st of month
**Solution**: Use dropdown with valid options only

### 4. Charity Number Format
**Issue**: Must match specific regex pattern
**Solution**: Clear format hints and examples in UI

## Performance Considerations

### Next.js 15 Optimizations
- Server Components by default
- Streaming and Suspense for progressive rendering
- Route segment configuration
- Automatic fetch() caching

### Database Optimizations
- Materialized view for compliance scores
- Strategic indexes on foreign keys and query patterns
- Partial indexes for soft deletes
- JSONB for flexible data with indexing

### Bundle Size
- Dynamic imports for heavy components (PDF, charts)
- Lazy loading with loading states
- Target: < 500KB initial JS

## Security Model

### Row-Level Security (RLS)
- Every table has RLS enabled
- Organization-based isolation
- Role-based permissions (admin/member/viewer)
- Function-based permission checks

### Authentication
- Supabase Auth with magic links
- OTP support for passwordless login
- Session management
- Multi-organization support

## Business Model

### Pricing Tiers
1. **Essentials** (£199/year): Small charities < £100k
2. **Standard** (£549/year): Medium charities £100k-1M
3. **Premium** (£1,199+/year): Large charities > £1M

### Key Metrics
- 14-day free trial
- Annual billing only
- Target: 1% market penetration (1,000 customers)
- Average revenue per user: £400
- Year 1 target: £400,000 ARR

## Development Guidelines (CLAUDE.md)

1. **Always read entire files** - Don't make assumptions
2. **Don't edit Tailwind config** without permission
3. **Commit early and often** - After each milestone
4. **Look up library syntax** - Don't assume APIs
5. **Run linting** after major changes
6. **Optimize for readability** - Code is read more than written
7. **No dummy implementations** - Build real features
8. **Get clarity before starting** - Ask questions
9. **No large refactors** without explicit instruction
10. **Plan before coding** - Architecture first

## MCP Supabase Integration

We have MCP (Model Context Protocol) integration with Supabase, providing:
- Direct database access for queries
- Migration management
- Schema introspection
- Real-time subscriptions
- Storage management

Available MCP commands:
- `mcp__supabase__list_organizations`
- `mcp__supabase__get_organization`
- `mcp__supabase__list_projects`
- `mcp__supabase__execute_sql`
- `mcp__supabase__apply_migration`
- And many more...

## Key Success Factors

1. **Immediate Value**: Show compliance gaps within 5 minutes
2. **Low Friction**: Passwordless auth, smart defaults
3. **Mobile-First**: Critical tasks work on phones
4. **AI Delight**: Magic moments that save hours
5. **Anxiety Reduction**: Clear deadlines and guidance

## Next Steps & Priorities

1. Complete AI features (document extraction, compliance chat)
2. Implement report generation (Annual Return, Board Pack)
3. Add notification system for reminders
4. Optimize mobile experience
5. Performance testing and optimization
6. Launch preparation and marketing site

## Technical Debt & Known Issues

1. Some RLS policies still use recursive function (needs fixing)
2. Certificate generation files removed (PDF generation issues)
3. Board pack generation needs refactoring
4. Email ingestion not implemented
5. Some placeholder functionality in settings pages

## Important Notes

- Always check for edge cases with undefined/null data
- Use optional chaining (`?.`) for nested property access
- Validate all user inputs against database constraints
- Follow the established file structure and naming conventions
- Test with both authenticated and unauthenticated states
- Consider multi-organization scenarios in all features