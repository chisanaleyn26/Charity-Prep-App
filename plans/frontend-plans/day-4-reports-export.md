# Day 4 - Reports & Export Implementation Plan

## 🎯 Goal: Build Value Delivery Features - Reports, Exports, and Revenue

Day 4 focuses on the features that deliver tangible value: Annual Return generation, board reports, data exports, and the billing system that captures that value.

## Prerequisites from Day 3 ✅
- [x] AI narrative generation working
- [x] All compliance data accessible
- [x] Document management system complete
- [x] Natural language capabilities ready

## Phase 1: Annual Return Generator (Hours 1-2) 📋 ✅ COMPLETED

### 1.1 AR Data Aggregation Service
- [x] Create `features/reports/services/annual-return-service.ts`
  - [x] Aggregate all compliance data for financial year
  - [x] Map to Charity Commission fields
  - [x] Calculate missing fields
  - [x] Generate completion percentage

### 1.2 Field Mapping Engine
- [x] Create `features/reports/services/ar-field-mapper.ts`
  ```typescript
  const fieldMappings = {
    'total_volunteers': 'SELECT COUNT(*) FROM safeguarding_records WHERE role_type = volunteer',
    'overseas_expenditure': 'SELECT SUM(amount_gbp) FROM overseas_activities WHERE financial_year = ?',
    'highest_paid_employee': 'SELECT MAX(salary) FROM staff_records',
    // ... all 26+ fields
  }
  ```
- [x] Handle complex calculations
- [x] Format data per Commission requirements
- [x] Validate field completeness

### 1.3 AR Preview UI
- [x] Create `app/(app)/reports/annual-return/page.tsx`
- [x] Build `features/reports/components/ar-preview.tsx`
  - [x] Split-screen preview (Your Data | Official Form)
  - [x] Visual field mapping lines
  - [x] Completion indicators
  - [x] Missing data warnings

- [x] Build `features/reports/components/ar-field-mapper.tsx`
  - [x] Draggable field connections
  - [x] Auto-mapping suggestions
  - [x] Manual override options
  - [x] Validation messages

### 1.4 Export Functionality
- [x] Build `features/reports/components/ar-export-options.tsx`
  - [x] Copy individual fields
  - [x] Export as CSV
  - [x] Generate PDF preview
  - [x] Email to trustees option

## Phase 2: Board Pack Generator (Hours 2-3) 📊 ✅ COMPLETED

### 2.1 Report Template System
- [x] Create `features/reports/services/template-service.ts`
  - [x] Define template structure
  - [x] Section management
  - [x] Variable replacement
  - [x] Conditional content

### 2.2 Report Sections
- [x] Create template definitions in service
  - [x] `executive-summary` - Key metrics & highlights
  - [x] `compliance-status` - Score breakdown & issues
  - [x] `risk-assessment` - Areas of concern
  - [x] `financial-summary` - Income breakdown
  - [x] `action-items` - Recommendations

### 2.3 Report Builder UI
- [x] Create `app/(app)/reports/board-pack/page.tsx`
- [x] Build `features/reports/components/report-builder.tsx`
  - [x] Template selection
  - [x] Section toggle/reorder
  - [x] Content preview
  - [x] Branding options

- [x] Build `features/reports/components/report-section.tsx`
  - [x] Editable content blocks
  - [x] AI regeneration per section
  - [x] Charts/visualizations
  - [x] Comments/notes

### 2.4 PDF Generation
- [x] Create `features/reports/services/pdf-generator.ts`
  - [x] Use React PDF or similar
  - [x] Apply charity branding
  - [x] Include charts/graphs
  - [x] Page numbers & TOC

## Phase 3: Compliance Certificates (Hours 3-4) 🏆 ✅ COMPLETED

### 3.1 Certificate Templates
- [x] Create certificate templates in generator service
  - [x] `compliance-achievement` - X% Compliant
  - [x] `annual-return-ready` - Ready to submit
  - [x] `milestone-reached` - First 100% score
  - [x] `improvement-award` - Most improved

### 3.2 Certificate Generator
- [x] Create `features/reports/services/certificate-generator.ts`
  - [x] Dynamic text generation
  - [x] QR code for verification
  - [x] Unique certificate ID
  - [x] Shareable links

### 3.3 Certificate UI
- [x] Build `features/reports/components/certificate-display.tsx`
  - [x] Beautiful certificate design
  - [x] Animated reveal
  - [x] Download options
  - [x] Social sharing buttons

## Phase 4: Data Export Suite (Hours 4-5) 💾 ✅ COMPLETED

### 4.1 Export Service
- [x] Create `features/reports/services/export-service.ts`
  - [x] Export all data by module
  - [x] Custom date ranges
  - [x] Multiple formats (CSV, Excel, JSON, PDF)
  - [x] GDPR-compliant exports

### 4.2 Export UI
- [x] Create `app/(app)/reports/export/page.tsx`
- [x] Build `features/reports/components/export-wizard.tsx`
  - [x] Module selection
  - [x] Date range picker
  - [x] Format selection
  - [x] Preview before export

### 4.3 Scheduled Exports
- [x] Create backup scheduling
- [x] Email delivery option
- [x] Cloud storage integration
- [x] Export history tracking

## Phase 5: Multi-Charity Portal (Hours 5-6) 🏢 ✅ COMPLETED

### 5.1 Organization Switching
- [x] Update `stores/auth-store.ts` for multi-org
- [x] Create `features/organizations/services/org-service.ts`
- [x] Implement organization context
- [x] Update all queries for current org

### 5.2 Advisor Dashboard
- [x] Create `app/(app)/advisor/page.tsx`
- [x] Build `features/organizations/components/org-switcher.tsx` (integrated with sidebar)
  - [x] Dropdown with org list
  - [x] Role-based organization grouping
  - [x] Current organization display
  - [x] Smooth organization switching

- [x] Build `features/advisor/components/multi-org-dashboard.tsx`
  - [x] Compliance scores grid
  - [x] Urgent actions across orgs
  - [x] Bulk operations interface
  - [x] Organization comparison view

### 5.3 Bulk Operations
- [x] Bulk operations UI framework
- [x] Cross-org analytics interface
- [x] Unified organization view
- [x] Permission-based access control

## Phase 6: Subscription & Billing (Hours 6-7) 💳

### 6.1 Stripe Integration
- [x] Create `lib/payments/stripe.ts`
  - [x] Initialize Stripe SDK
  - [x] Configure products/prices
  - [x] Set up webhooks
  - [x] Handle different regions

### 6.2 Subscription Service
- [x] Create `features/subscription/services/subscription-service.ts`
  - [x] Check subscription status
  - [x] Enforce limits (users, storage)
  - [x] Handle upgrades/downgrades
  - [x] Process webhooks

### 6.3 Pricing Page Updates
- [x] Update `components/marketing/pricing.tsx`
  - [x] Connect to Stripe checkout
  - [x] Show current plan
  - [x] Upgrade prompts
  - [x] Feature comparison

### 6.4 Billing UI
- [x] Create `app/(app)/settings/billing/page.tsx`
- [x] Build `features/subscription/components/billing-dashboard.tsx`
  - [x] Current plan display
  - [x] Usage metrics
  - [x] Invoice history
  - [x] Update payment method

- [x] Build `features/subscription/components/upgrade-modal.tsx`
  - [x] Feature comparison
  - [x] Proration preview
  - [x] Smooth checkout flow
  - [x] Success confirmation

### 6.5 Feature Gating
- [x] Implement feature flags
- [x] Create upgrade prompts
- [x] Soft limits with warnings
- [x] Grace period handling

## Phase 7: API & Integrations (Hours 7-8) 🔌

### 7.1 Public API
- [x] Create `app/api/v1/` structure
- [x] Implement rate limiting
- [x] API key management
- [x] Documentation

### 7.2 Webhook System
- [x] Create `app/api/webhooks/stripe/route.ts`
  - [x] Subscription created
  - [x] Payment succeeded
  - [x] Subscription cancelled
  - [x] Payment failed

### 7.3 Third-party Integrations
- [x] Charity Commission API (if available)
- [x] Accounting software webhooks
- [x] Calendar integration
- [x] Slack notifications

## Testing & Integration (Hour 8) 🧪

### 8.1 End-to-End Testing
- [ ] Complete Annual Return flow
- [ ] Board pack generation
- [ ] Multi-charity switching
- [ ] Full billing cycle

### 8.2 Performance Testing
- [ ] Large data exports
- [ ] PDF generation speed
- [ ] Multi-org queries
- [ ] Concurrent users

### 8.3 Revenue Testing
- [ ] Subscription flow
- [ ] Feature limits
- [ ] Payment processing
- [ ] Webhook handling

## Success Criteria ✅

By end of Day 4:
1. ✅ Annual Return generates with field mapping
2. ✅ Board packs create professional PDFs
3. ✅ Data exports in multiple formats
4. ✅ Multi-charity portal functional
5. ✅ Stripe billing system processing payments
6. ✅ Feature gating based on plans

## Component Structure Created

```
features/
├── reports/
│   ├── services/
│   │   ├── annual-return-service.ts
│   │   ├── ar-field-mapper.ts
│   │   ├── template-service.ts
│   │   ├── pdf-generator.ts
│   │   └── certificate-generator.ts
│   ├── components/
│   │   ├── ar-preview.tsx
│   │   ├── ar-field-mapper.tsx
│   │   ├── report-builder.tsx
│   │   ├── report-section.tsx
│   │   └── certificate-display.tsx
│   └── templates/
│       ├── executive-summary.ts
│       ├── compliance-status.ts
│       └── certificates/
├── export/
│   ├── services/
│   │   └── export-service.ts
│   └── components/
│       └── export-wizard.tsx
├── advisor/
│   └── components/
│       ├── org-switcher.tsx
│       └── multi-org-dashboard.tsx
└── subscription/
    ├── services/
    │   └── subscription-service.ts
    └── components/
        ├── billing-dashboard.tsx
        ├── upgrade-modal.tsx
        ├── usage-display.tsx
        └── feature-gate.tsx
```

## Key Implementation Patterns

### Annual Return Field Mapping
```typescript
export async function generateAnnualReturn(orgId: string, year: number) {
  const supabase = createServerClient()
  
  // Gather all data
  const [safeguarding, overseas, income] = await Promise.all([
    supabase.from('safeguarding_records').select('*').eq('organization_id', orgId),
    supabase.from('overseas_activities').select('*').eq('financial_year', year),
    supabase.from('income_records').select('*').eq('financial_year', year)
  ])
  
  // Map to AR fields
  const arData = {
    // Staff & Volunteers
    total_staff: safeguarding.data.filter(r => r.role_type === 'employee').length,
    total_volunteers: safeguarding.data.filter(r => r.role_type === 'volunteer').length,
    total_trustees: safeguarding.data.filter(r => r.role_type === 'trustee').length,
    
    // Safeguarding
    working_with_children: safeguarding.data.some(r => r.works_with_children),
    dbs_checks_complete: safeguarding.data.every(r => r.dbs_certificate_number),
    
    // International
    operates_overseas: overseas.data.length > 0,
    countries_list: [...new Set(overseas.data.map(a => a.country_code))],
    overseas_expenditure: overseas.data.reduce((sum, a) => sum + a.amount_gbp, 0),
    
    // Income
    total_income: income.data.reduce((sum, i) => sum + i.amount, 0),
    income_from_donations: income.data
      .filter(i => i.source === 'donations_legacies')
      .reduce((sum, i) => sum + i.amount, 0),
    
    // ... all other fields
  }
  
  return arData
}
```

### Stripe Subscription Enforcement
```typescript
export async function checkFeatureAccess(
  orgId: string, 
  feature: string
): Promise<boolean> {
  const subscription = await getStripeSubscription(orgId)
  
  const limits = {
    essentials: {
      users: 2,
      storage: 100 * 1024 * 1024, // 100MB
      features: ['basic_compliance', 'annual_return']
    },
    standard: {
      users: 5,
      storage: 1024 * 1024 * 1024, // 1GB
      features: ['basic_compliance', 'annual_return', 'ai_import', 'board_packs']
    },
    premium: {
      users: 20,
      storage: 10 * 1024 * 1024 * 1024, // 10GB
      features: ['all']
    }
  }
  
  const plan = limits[subscription.tier]
  return plan.features.includes('all') || plan.features.includes(feature)
}
```

### PDF Generation Pattern
```typescript
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'

export async function generateBoardPack(data: BoardPackData) {
  const MyDocument = (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{data.organization.name}</Text>
          <Text>Board Report - {data.date}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.title}>Executive Summary</Text>
          <Text>{data.narrative.summary}</Text>
        </View>
        
        {/* Additional sections */}
      </Page>
    </Document>
  )
  
  const blob = await pdf(MyDocument).toBlob()
  return blob
}
```

## Revenue Protection

1. **Soft Limits**: Warn at 80%, block at 100%
2. **Grace Period**: 7 days after limit exceeded
3. **Downgrade Protection**: Export data before downgrade
4. **Payment Failures**: 3 retry attempts over 7 days

## Risk Mitigation

If behind schedule:
1. Simplify AR to basic field list
2. Use template PDFs (no dynamic generation)
3. Single charity only (skip multi-org)
4. Manual billing (send Stripe links)

## Tomorrow (Day 5)

Final day focuses on:
- Mobile optimization
- Performance tuning
- Error handling
- Production deployment
- Launch preparation