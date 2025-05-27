# Charity Prep - 5-Day Implementation Plan

## Overview

This is your hour-by-hour, module-by-module blueprint for building Charity Prep in 5 days with AI acceleration. Each task includes success criteria and integration points.

**Team Structure:**

- **Dev 1 (Foundation)**: Infrastructure, auth, core UI
- **Dev 2 (Features)**: Compliance modules, business logic
- **Dev 3 (AI/Magic)**: AI features, import/export, reports

## Day 1: Foundation Sprint (The Critical Base)

### 🎯 Day 1 Goal

Working app with auth, database, and basic UI that all three developers can build upon.

### Morning (0-4 hours)

### ALL DEVS: Project Setup (Hour 1)

```bash
# Everyone runs simultaneously
npx create-next-app@latest charity-prep --typescript --tailwind --app
cd charity-prep
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zustand @tanstack/react-query
npm install zod react-hook-form @hookform/resolvers
npm install date-fns
npx shadcn-ui@latest init

```

**Success: Everyone has identical running Next.js app**

### Dev 1: Supabase Setup (Hours 1-2)

```sql
-- Create Supabase project
-- Enable auth providers: Email (Magic Link)
-- Run migrations from /supabase/migrations/001_initial_schema.sql
-- Set up RLS policies
-- Configure auth emails

```

**Deliverable:**

- Supabase project live
- Schema deployed
- Share anon/service keys with team

### Dev 2: Shadcn UI + Ethereal Design System (Hours 1-2)

```bash
# Install all components at once
npx shadcn-ui@latest add alert badge button card checkbox dialog dropdown-menu form input label popover select separator sheet skeleton table tabs textarea toast

# Create ethereal-ui.css with color system
# Update tailwind.config.ts with Ethereal colors
# Create components/ui/index.ts for exports

```

**Deliverable:**

- All UI components installed
- Ethereal colors configured
- Example component gallery at /style-guide

### Dev 3: Type System + API Structure (Hours 1-2)

```tsx
// Generate types from Supabase
npx supabase gen types typescript --project-id [id] > types/database.ts

// Create core types
// types/index.ts - Domain types
// lib/api/client.ts - API wrapper
// lib/api/errors.ts - Error handling

```

**Deliverable:**

- Complete type system
- API client ready
- Error handling patterns

### Afternoon (4-8 hours)

### Dev 1: Authentication Flow (Hours 3-6)

```
Build:
- app/(auth)/login/page.tsx - Magic link form
- app/(auth)/verify/page.tsx - "Check email" page
- app/api/auth/login/route.ts - Send magic link
- app/api/auth/callback/route.ts - Handle callback
- middleware.ts - Protect routes
- lib/supabase/server.ts - Server client
- lib/supabase/client.ts - Browser client

```

**Test:** Can login with magic link and see protected route

### Dev 2: Layout System (Hours 3-6)

```
Build:
- app/(app)/layout.tsx - Sidebar + main layout
- components/layout/Sidebar.tsx - Navigation
- components/layout/Header.tsx - User menu
- components/layout/MobileNav.tsx - Mobile bottom nav
- store/ui.ts - UI state (sidebar open/closed)

```

**Test:** Responsive layout with working navigation

### Dev 3: Dashboard Foundation (Hours 3-6)

```
Build:
- app/(app)/dashboard/page.tsx - Dashboard shell
- features/compliance/components/ComplianceScore.tsx - Big score circle
- features/compliance/components/RiskRadar.tsx - 4 quadrant grid
- features/compliance/hooks/useCompliance.ts - Mock data for now

```

**Test:** Dashboard shows with mock 73% score

### Evening Integration (Hours 7-8)

### ALL DEVS: Integration & Deploy

```
Tasks:
1. Merge all branches
2. Test auth → dashboard flow
3. Fix any integration issues
4. Deploy to Vercel
5. Test production auth flow

```

**Day 1 Complete When:**

- [ ]  Can sign up with magic link
- [ ]  See protected dashboard
- [ ]  Responsive on mobile
- [ ]  Deployed to production
- [ ]  All devs can pull and run locally

---

## Day 2: Compliance Modules (The Core Value)

### 🎯 Day 2 Goal

All compliance tracking modules working with real data, CRUD operations complete.

### Morning (0-4 hours)

### Dev 1: Safeguarding Module (Hours 1-4)

```
Build:
- app/(app)/compliance/safeguarding/page.tsx - DBS list
- features/compliance/safeguarding/components/DBSTable.tsx
- features/compliance/safeguarding/components/DBSForm.tsx
- features/compliance/safeguarding/components/ExpiryBadge.tsx
- app/api/compliance/safeguarding/route.ts - CRUD endpoints
- features/compliance/safeguarding/hooks/useSafeguarding.ts

Database operations:
- List DBS records with expiry highlighting
- Add/Edit/Delete DBS records
- Calculate days until expiry
- Filter by status

```

**Test:** Can add DBS record and see it in table with expiry warning

### Dev 2: Overseas Module (Hours 1-4)

```
Build:
- app/(app)/compliance/overseas/page.tsx - Activities list
- features/compliance/overseas/components/ActivityList.tsx
- features/compliance/overseas/components/ActivityForm.tsx
- features/compliance/overseas/components/CountryMap.tsx
- features/compliance/overseas/components/TransferMethodSelect.tsx
- app/api/compliance/overseas/route.ts - CRUD endpoints

Features:
- Add overseas activity with country dropdown
- Transfer method selection with warnings
- Amount in local currency → GBP conversion
- Partner organization tracking

```

**Test:** Can add overseas spend and see on map

### Dev 3: Fundraising Module (Hours 1-4)

```
Build:
- app/(app)/compliance/fundraising/page.tsx - Income tracking
- features/compliance/fundraising/components/IncomeForm.tsx
- features/compliance/fundraising/components/IncomeBreakdown.tsx
- features/compliance/fundraising/components/MajorDonorsList.tsx
- app/api/compliance/fundraising/route.ts - CRUD endpoints

Features:
- Track income by source
- Flag related party transactions
- Auto-identify highest donations
- Methods used checklist

```

**Test:** Can add donation and see in breakdown chart

### Afternoon (4-8 hours)

### Dev 1: Compliance Score Calculator (Hours 5-7)

```
Build:
- lib/compliance/score-calculator.ts - Real calculation logic
- app/api/compliance/score/route.ts - Score endpoint
- Update dashboard to show real score
- features/compliance/components/ScoreBreakdown.tsx

Logic:
- 40% weight: Safeguarding (% with valid DBS)
- 30% weight: Overseas (has data if needed)
- 30% weight: Fundraising (income sources tracked)

```

**Test:** Score updates when adding/removing records

### Dev 2: Document Management (Hours 5-7)

```
Build:
- app/(app)/documents/page.tsx - Document vault
- features/documents/components/DocumentUpload.tsx
- features/documents/components/DocumentList.tsx
- app/api/documents/upload/route.ts
- lib/storage/upload.ts - Supabase storage

Features:
- Drag & drop upload
- Link documents to records
- Preview documents
- Secure storage with RLS

```

**Test:** Can upload PDF and link to DBS record

### Dev 3: Notifications System (Hours 5-7)

```
Build:
- services/notifications/reminder-service.ts
- app/api/cron/reminders/route.ts
- database: notifications table
- Email templates for reminders

Features:
- Queue DBS expiry reminders
- Store notification preferences
- Mark as read/dismissed

```

**Test:** Creates notification for DBS expiring in 30 days

### Evening Integration (Hour 8)

### ALL DEVS: Module Integration

```
Tasks:
1. Link all modules from dashboard
2. Ensure compliance score calculates correctly
3. Test document uploads work
4. Verify all CRUD operations
5. Fix any data inconsistencies

```

**Day 2 Complete When:**

- [ ]  All 3 compliance modules have working CRUD
- [ ]  Real compliance score calculating
- [ ]  Documents can be uploaded and linked
- [ ]  Data persists in production

---

## Day 3: AI Magic Features (The Differentiator)

### 🎯 Day 3 Goal

AI-powered import, document extraction, and intelligent features that create "wow" moments.

### Morning (0-4 hours)

### Dev 1: Email Ingestion System (Hours 1-4)

```
Build:
- services/email/inbound.ts - Parse incoming emails
- app/api/webhooks/email/route.ts - Receive emails
- features/ai/components/EmailImportQueue.tsx
- Set up forwarding address: data@charityprep.uk

Email flow:
1. User forwards receipt to data-{orgId}@charityprep.uk
2. Webhook receives email
3. Queue for AI processing
4. Show in import queue

```

**Test:** Forward email and see it appear in queue

### Dev 2: CSV Import with AI Mapping (Hours 1-4)

```
Build:
- features/ai/components/CSVImportWizard.tsx
- features/ai/components/ColumnMapper.tsx
- services/ai/csv-mapper.ts - AI column matching
- app/api/import/csv/route.ts

AI Prompt:
"Map these CSV headers to our schema:
CSV: ['Name', 'DBS No.', 'Expires']
Schema: ['person_name', 'dbs_number', 'expiry_date']"

```

**Test:** Upload messy CSV and see AI map columns correctly

### Dev 3: Document OCR Extraction (Hours 1-4)

```
Build:
- services/ai/ocr-service.ts - GPT-4 Vision integration
- features/ai/components/DocumentExtractor.tsx
- app/api/ai/extract/route.ts

Features:
- Extract from DBS certificates
- Extract from receipts
- Extract from donation letters
- Show confidence scores

```

**Test:** Upload DBS certificate photo, extract all fields

### Afternoon (4-8 hours)

### Dev 1: Natural Language Search (Hours 5-7)

```
Build:
- services/ai/search-service.ts - Embeddings + search
- features/ai/components/SmartSearch.tsx
- app/api/ai/search/route.ts
- lib/embeddings/index.ts

Example queries:
- "Show all DBS expiring in March"
- "Total spent in Kenya"
- "Donations over £5000"

```

**Test:** Natural language query returns correct results

### Dev 2: Report Generation AI (Hours 5-7)

```
Build:
- services/ai/narrative-generator.ts
- features/reports/board-pack/BoardPackGenerator.tsx
- app/api/ai/generate/narrative/route.ts

Prompts:
- Compliance summary narrative
- Risk assessment prose
- Trustee-friendly explanations

```

**Test:** Generate board report with professional narrative

### Dev 3: Compliance Q&A Bot (Hours 5-7)

```
Build:
- services/ai/compliance-qa.ts - RAG with regulations
- features/ai/components/ComplianceChat.tsx
- app/api/ai/chat/route.ts
- Index all charity regulations

Features:
- Context-aware answers
- Cites regulations
- Knows user's data

```

**Test:** Ask "Do I need to report crypto?" get contextual answer

### Evening Integration (Hour 8)

### ALL DEVS: AI Feature Showcase

```
Tasks:
1. Create "Magic Import" demo flow
2. Test email → data flow
3. Verify OCR accuracy
4. Polish AI response timing
5. Add loading states

```

**Day 3 Complete When:**

- [x]  Email forwarding creates records
- [x]  CSV import with AI mapping works
- [x]  Document OCR extracts accurately
- [x]  Natural language search returns results
- [x]  Q&A bot answers compliance questions

---

## Day 4: Reports & Export (The Closer)

### 🎯 Day 4 Goal

Complete Annual Return generator, board reports, and data exports that prove value.

### Morning (0-4 hours)

### Dev 1: Annual Return Generator (Hours 1-4)

```
Build:
- app/(app)/reports/annual-return/page.tsx
- features/reports/annual-return/ARGenerator.tsx
- features/reports/annual-return/ARPreview.tsx
- features/reports/annual-return/FieldMapper.tsx
- app/api/export/annual-return/route.ts

Features:
- Show AR form preview
- Map data to official fields
- Highlight missing data
- Copy individual fields
- Export all as CSV

```

**Test:** Generate AR with real data, copy to clipboard

### Dev 2: Board Pack Generator (Hours 1-4)

```
Build:
- app/(app)/reports/board-pack/page.tsx
- features/reports/board-pack/TemplateSelector.tsx
- features/reports/board-pack/ReportBuilder.tsx
- services/export/pdf-generator.ts
- app/api/export/board-pack/route.ts

Features:
- Choose sections to include
- AI-generated narratives
- Branded PDF output
- Email to trustees option

```

**Test:** Generate PDF report with charity branding

### Dev 3: Compliance Certificates (Hours 1-4)

```
Build:
- features/reports/certificates/CertificateGenerator.tsx
- services/export/certificate-generator.ts
- Beautiful certificate design
- Shareable links

Features:
- "97% Compliant" certificate
- Annual Return Ready badge
- Social sharing options

```

**Test:** Generate certificate, looks professional

### Afternoon (4-8 hours)

### Dev 1: Data Export Suite (Hours 5-7)

```
Build:
- app/api/export/csv/route.ts - All data as CSV
- app/api/export/backup/route.ts - Full backup
- features/settings/DataExport.tsx
- Scheduled backups option

Formats:
- CSV per module
- Combined Excel file
- JSON backup
- GDPR export

```

**Test:** Export all data, reimport successfully

### Dev 2: Multi-Charity Portal (Hours 5-7)

```
Build:
- app/(app)/advisor/page.tsx
- features/advisor/OrgSwitcher.tsx
- features/advisor/MultiOrgDashboard.tsx
- Update auth for multi-org

Features:
- Switch between charities
- Bulk operations
- Comparison view
- Unified billing

```

**Test:** Manage 3 charities from one login

### Dev 3: Subscription & Billing (Hours 5-7)

```
Build:
- app/(app)/settings/billing/page.tsx
- services/payments/stripe-integration.ts
- app/api/webhooks/stripe/route.ts
- features/subscription/UpgradeFlow.tsx

Features:
- Tier selection
- Stripe checkout
- Usage tracking
- Feature limits

```

**Test:** Complete upgrade flow, webhook updates status

### Evening Polish (Hour 8)

### ALL DEVS: Report Testing

```
Tasks:
1. Generate all report types
2. Verify data accuracy
3. Test export formats
4. Polish PDF layouts
5. Add error handling

```

**Day 4 Complete When:**

- [x]  Annual Return generates correctly (BACKEND COMPLETE)
- [x]  Board pack creates professional PDF (BACKEND COMPLETE)
- [x]  All data exportable (BACKEND COMPLETE - via import/export APIs)
- [x]  Multi-charity switching works (BACKEND COMPLETE)
- [x]  Payment flow complete (BACKEND COMPLETE - Stripe integration)
- [ ]  Annual Return UI (PENDING - Frontend)
- [ ]  Board pack UI (PENDING - Frontend)
- [ ]  Export UI (PENDING - Frontend)
- [ ]  Multi-org UI (PENDING - Frontend)
- [ ]  Billing UI (PENDING - Frontend)

---

## Day 5: Polish, Deploy & Launch (The Finale)

### 🎯 Day 5 Goal

Production-ready app with all features polished, tested, and deployed.

### Morning (0-4 hours)

### Dev 1: Mobile Experience (Hours 1-3)

```
Polish:
- Test all flows on mobile
- Fix responsive issues
- Optimize touch targets
- Add PWA manifest
- Test offline mode

Critical mobile flows:
- Quick DBS entry
- Photo upload
- View compliance score

```

**Test:** Complete full journey on iPhone

### Dev 2: Error Handling & Edge Cases (Hours 1-3)

```
Build:
- Global error boundary
- API error handling
- Form validation messages
- Empty states
- Loading skeletons
- Rate limiting

```

**Test:** App handles errors gracefully

### Dev 3: Performance Optimization (Hours 1-3)

```
Optimize:
- Lighthouse audit fixes
- Image optimization
- Code splitting
- Caching strategy
- Database indexes
- API response times

```

**Target:** 90+ Lighthouse score

### Midday (Hour 4)

### ALL DEVS: Integration Testing

```
Complete E2E flows:
1. New user signup → first value
2. Import data → see score improve
3. Generate reports → export
4. Upgrade subscription
5. Multi-charity management

```

### Afternoon (4-8 hours)

### Dev 1: Production Deployment (Hours 5-6)

```
Deploy:
- Environment variables set
- Vercel production deploy
- Custom domain setup
- SSL certificates
- Monitor setup (Sentry)
- Analytics (Vercel)

```

**Test:** Production app fully functional

### Dev 2: Documentation & Onboarding (Hours 5-6)

```
Create:
- In-app onboarding tour
- Help documentation
- FAQ section
- Video walkthrough
- Support email setup

```

**Test:** New user understands product

### Dev 3: Launch Preparation (Hours 5-6)

```
Prepare:
- Seed demo account
- Launch announcement email
- Social media assets
- Product Hunt draft
- Customer support ready

```

**Test:** Demo account impressive

### Final Hours (7-8)

### ALL DEVS: Launch Checklist

```
□ All features working in production
□ Payment processing tested
□ Emails sending correctly
□ Mobile experience smooth
□ Demo account ready
□ Support email monitored
□ Error tracking live
□ Backup systems verified
□ Team celebration planned

```

**Day 5 Complete When:**

- [x]  Error handling and monitoring system (BACKEND COMPLETE)
- [x]  Performance tracking and optimization (BACKEND COMPLETE)
- [x]  Onboarding and help system backend (BACKEND COMPLETE)
- [x]  Demo data seeder for testing (BACKEND COMPLETE)
- [x]  Backup and restore functionality (BACKEND COMPLETE)
- [ ]  Production app live at charityprep.uk (PENDING - Deployment)
- [ ]  Can complete full user journey (PENDING - Frontend)
- [ ]  Payment processing working (BACKEND COMPLETE - Frontend pending)
- [ ]  Mobile experience polished (PENDING - Frontend)
- [ ]  Ready for first customers (PENDING - Frontend)

---

## Module Dependencies

```
Foundation
    ↓
Compliance Modules
    ↓
AI Features ← → Reports/Export
    ↓
Billing/Portal
    ↓
Polish/Deploy

```

## Critical Success Factors

1. **Day 1 foundation must be solid** - Everything builds on this
2. **Keep AI prompts simple** - Complex prompts = slow/expensive
3. **Test as you build** - Don't leave testing until end
4. **Deploy daily** - Catch production issues early
5. **Communicate blockers immediately** - 5 days = no time for stuck

## Risk Mitigation

**If running behind:**

- Cut advisor portal (not critical for MVP)
- Simplify AI features (basic extraction only)
- Skip compliance certificates
- Manual billing setup instead of automated

**Must have no matter what:**

- Auth + core compliance modules
- Basic import (CSV minimum)
- Annual Return export
- Payment processing

## Daily Standups

**Format (15 min max):**

1. What I built yesterday
2. What I'm building today
3. Any blockers
4. Integration points needed

**End of day check-in:**

- Merge all code
- Test integrated features
- Deploy to staging
- Plan next day

This plan delivers a working, revenue-generating product in 5 days. The key is parallel development with clear interfaces and daily integration.