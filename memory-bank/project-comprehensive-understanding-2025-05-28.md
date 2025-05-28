# Charity Prep - Comprehensive Project Understanding
*Updated: 2025-05-28*

## Executive Summary

After thoroughly reviewing all documentation in `/docs` and memory bank files, I have gained a comprehensive understanding of **Charity Prep** - a SaaS platform designed to help UK charities comply with the new Charities (Annual Return) Regulations 2024. The project is well-architected using Next.js 15.2, Supabase, and AI integrations to solve a critical compliance problem for 100,000+ UK charities.

## Project Context

### The Problem
- **New Regulations**: Charities (Annual Return) Regulations 2024 expand reporting from 16 to 26+ questions
- **Compliance Burden**: Detailed tracking required for safeguarding, overseas expenditure, and fundraising
- **Urgency**: First affected returns due late 2025/early 2026
- **Market Gap**: No purpose-built solution exists for these specific regulations

### The Solution
- **Purpose-Built Platform**: Designed specifically for new Annual Return requirements
- **AI-Powered Automation**: OCR extraction, email processing, natural language search
- **Real-Time Compliance**: Visual "Risk Radar" shows compliance status instantly
- **Year-Round Value**: Continuous tracking prevents last-minute panic

### Target Market
- **Primary**: Solo charity administrators (non-technical, time-poor, compliance-anxious)
- **Secondary**: Finance managers responsible for compliance
- **Tertiary**: Accountants managing multiple charity clients
- **Market Size**: 100,000+ registered charities in England & Wales

## Technical Architecture

### Core Technology Stack
```
Frontend:    Next.js 15.2 (App Router), TypeScript, Zustand, Shadcn UI
Backend:     Supabase (PostgreSQL + Auth + Realtime + Storage)
AI/ML:       Gemini 2.5 Flash (via OpenRouter), GPT-4 Vision (OCR)
Infra:       Vercel (London), Edge Functions
Payments:    Stripe
Email:       Resend
Design:      Ethereal UI (custom design system)
```

### Architectural Principles
1. **Server-First Architecture**: Default to Server Components, minimal client state
2. **Feature-Based Organization**: `/features/[domain]/` structure
3. **Type Safety**: End-to-end TypeScript with Zod validation
4. **Progressive Enhancement**: Works without JavaScript
5. **Multi-Tenancy**: Row-level security from day one
6. **Real-Time Updates**: Supabase Realtime for collaboration

### Key Technical Decisions
- **Passwordless Auth**: Magic links for simplicity
- **Zustand for UI State Only**: Server is source of truth
- **Server Actions**: All mutations via server actions
- **Mobile-First**: Critical paths optimized for mobile
- **AI-Native**: LLM integration as core feature

## Feature Architecture

### 🚨 Compliance Modules
1. **Safeguarding Tracker**
   - DBS check management with expiry alerts
   - Training record tracking
   - Policy review schedules
   - Automated reminders at 90/60/30/14 days

2. **Overseas Operations**
   - Country-by-country expenditure tracking
   - Transfer method compliance (flags risky methods)
   - Partner organization management
   - Risk assessment by country

3. **Fundraising & Income**
   - Income source categorization
   - Major donor identification
   - Related party transaction flagging
   - Fundraising method compliance

### 🤖 AI-Powered Features
1. **Magic Import**
   - Email forwarding to `data-{orgId}@charityprep.uk`
   - Automatic data extraction and categorization
   - Confidence scoring on extracted data

2. **Document OCR**
   - DBS certificate extraction
   - Receipt processing
   - Donation letter parsing
   - Multi-file batch processing

3. **Natural Language Search**
   - Query examples: "Show all Kenya expenses", "DBS expiring in March"
   - Semantic search with embeddings
   - Context-aware results

4. **Compliance Q&A**
   - RAG-based regulatory guidance
   - Organization-specific context
   - Citation of relevant regulations

5. **Report Generation**
   - AI-written board narratives
   - Data-to-prose conversion
   - Professional formatting

### 📊 Reporting & Export
1. **Annual Return Generator**
   - Maps data to official form fields
   - Preview in Commission format
   - Field-by-field copy functionality
   - Progress tracking (87% complete, etc.)

2. **Board Pack Generator**
   - Template selection
   - AI narrative generation
   - Branded PDF output
   - Section customization

3. **Compliance Certificates**
   - Shareable achievement badges
   - "97% Compliant" certificates
   - Social sharing integration

## Database Architecture

### Schema Design Philosophy
- **Multi-tenancy**: `organization_id` on all tables
- **Audit Trail**: Complete change history in `audit_log`
- **Soft Deletes**: `deleted_at` timestamps (never lose data)
- **UUID Keys**: Global uniqueness
- **Type Safety**: ENUMs for fixed values

### Core Tables
```sql
organizations          -- Tenant/charity information
users                  -- Extended from Supabase auth
organization_members   -- Many-to-many with roles (admin/member/viewer)
safeguarding_records   -- DBS checks and training
overseas_activities    -- International operations
income_records         -- Fundraising and donations
documents             -- File storage with extraction status
ai_tasks              -- Processing queue for AI operations
compliance_scores     -- Materialized view for performance
audit_log             -- Complete change tracking
notifications         -- Reminder and alert queue
```

### Performance Optimizations
- Indexed foreign keys and common queries
- Materialized views for compliance scores
- Partial indexes for soft deletes
- JSONB for flexible metadata

## User Experience Design

### Design System: Ethereal UI
- **Primary**: Inchworm (#B1FA63) - CTAs, positive actions
- **Text**: Gunmetal (#243837) - Primary text color
- **Warning**: Orange (#FE7733) - Deadlines, alerts
- **Success**: Pale Violet (#B2A1FF) - Achievements
- **Typography**: Inter with -8% letter spacing
- **Spacing**: 8px base grid system
- **Radius**: 4px (sm), 8px (md), 12px (lg)

### Critical User Flows
1. **Onboarding (5 minutes)**
   - Email capture → Magic link → Charity details → Import data → See compliance score

2. **Daily Usage**
   - Quick mobile entry → Photo capture → AI extraction → Auto-save

3. **Weekly Compliance Check**
   - Email digest → Dashboard review → Fix urgent items → Track progress

4. **Annual Return Generation**
   - Preview form → Map fields → Copy data → Export CSV

### Mobile-First Features
- Bottom navigation for thumb reach
- Camera-first document capture
- Offline mode with sync
- Voice input for field notes

## Business Model

### Pricing Strategy
| Tier | Target | Price | Features |
|------|--------|-------|----------|
| Essentials | Income < £100k | £199/year | 2 users, core features |
| Standard | Income £100k-1M | £549/year | 5 users, documents |
| Premium | Income > £1M | £1,199+/year | 10+ users, API, priority support |

### Revenue Projections
- Target: 1% market penetration = 1,000 customers
- ARPU: £400
- Year 1 goal: £400,000 ARR
- Growth: Viral referrals + advisor channel

## Development Status

### ✅ Completed
- Project architecture and setup
- Database schema with migrations
- Authentication system (passwordless)
- All backend API routes
- AI service integrations
- Payment processing (Stripe)
- Email ingestion system
- UI component library
- State management setup

### 🚧 In Progress
- Frontend page implementations
- Real-time collaboration features
- Mobile responsive layouts
- Error boundary implementations
- Performance optimizations

### ❌ Pending
- Annual Return UI
- Board Pack generator UI
- Multi-org advisor portal
- Comprehensive E2E tests
- Production deployment
- Monitoring setup

## Performance & Optimization Strategy

### Next.js 15 Optimizations
1. **Caching Layers**
   - Request Memoization with `cache()`
   - Data Cache with `unstable_cache()`
   - Full Route Cache for static pages
   - Automatic fetch() caching

2. **Streaming & Suspense**
   - Critical data renders immediately
   - Non-critical data streams progressively
   - Skeleton loaders for perceived performance

3. **Code Splitting**
   - Dynamic imports for heavy components (PDF, charts)
   - Route-based code splitting
   - Lazy loading for below-fold content

### Performance Targets
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Bundle size < 500KB initial JS

## Testing Strategy

### Test Coverage Goals
- Business Logic: 90%
- API Routes: 80%
- Overall: 60% (for 5-day build)

### Testing Approach
- **Unit**: Business logic, calculations (Jest)
- **Integration**: API routes, database operations
- **E2E**: Critical user journeys (Playwright)
- **Skip**: UI components, third-party integrations

## Security Considerations

### Data Protection
- Row-level security on all tables
- Encryption at rest (AES-256)
- TLS 1.3 in transit
- UK data residency
- GDPR compliant

### Access Control
- Role-based permissions
- API key rotation
- Session management
- 2FA available (Premium)

## Key Success Factors

1. **Regulatory Timing**: First-mover advantage before mandatory deadline
2. **AI Differentiation**: "Magic" moments that delight users
3. **Anxiety Reduction**: Clear progress tracking and deadlines
4. **Mobile Accessibility**: Field workers can contribute
5. **Year-Round Value**: Prevents post-Annual Return churn

## Risk Mitigation

1. **Regulation Changes**: Flexible schema, rapid update capability
2. **Competition**: Purpose-built vs generic charity software
3. **Technical Debt**: Clean architecture from day one
4. **Scaling**: Multi-tenant design supports growth
5. **User Adoption**: Progressive onboarding, immediate value

## Next Steps & Priorities

### Immediate (This Week)
1. Complete frontend page implementations
2. Fix any remaining hydration/build errors
3. Implement real-time updates
4. Mobile responsive testing
5. Error boundary coverage

### Short Term (Next 2 Weeks)
1. E2E test suite completion
2. Performance optimization pass
3. Security audit
4. Beta user onboarding
5. Production deployment

### Medium Term (Next Month)
1. Charity Commission API integration
2. Advanced analytics dashboard
3. Mobile app consideration
4. Partner integrations
5. Scale to 100 beta users

## Conclusion

Charity Prep represents a well-architected solution to a real, urgent market need. The technical foundation is solid with modern best practices, the UX is designed for the target users' needs, and the business model aligns with the market opportunity. The combination of compliance urgency, AI differentiation, and thoughtful user experience positions this product for strong market adoption.

The project demonstrates excellent architectural decisions including server-first rendering, feature-based organization, comprehensive type safety, and multi-tenancy from inception. With the backend largely complete and a clear path for frontend implementation, the project is well-positioned for successful launch before the regulatory deadline creates peak demand.