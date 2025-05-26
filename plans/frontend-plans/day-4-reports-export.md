# Day 4 - Reports & Export Implementation Plan

## 🎯 Goal: Build Value Delivery Features - Reports, Exports, and Revenue

Day 4 focuses on the features that deliver tangible value: Annual Return generation, board reports, data exports, and the billing system that captures that value.

## Prerequisites from Day 3 ✅
- [x] AI narrative generation working
- [x] All compliance data accessible
- [x] Document management system complete
- [x] Natural language capabilities ready

## Phase 1: Annual Return Generator (Hours 1-2) 📋

### 1.1 AR Data Aggregation Service
- [ ] Create `features/reports/services/annual-return-service.ts`
  - [ ] Aggregate all compliance data for financial year
  - [ ] Map to Charity Commission fields
  - [ ] Calculate missing fields
  - [ ] Generate completion percentage

### 1.2 Field Mapping Engine
- [ ] Create `features/reports/services/ar-field-mapper.ts`
  ```typescript
  const fieldMappings = {
    'total_volunteers': 'SELECT COUNT(*) FROM safeguarding_records WHERE role_type = volunteer',
    'overseas_expenditure': 'SELECT SUM(amount_gbp) FROM overseas_activities WHERE financial_year = ?',
    'highest_paid_employee': 'SELECT MAX(salary) FROM staff_records',
    // ... all 26+ fields
  }
  ```
- [ ] Handle complex calculations
- [ ] Format data per Commission requirements
- [ ] Validate field completeness

### 1.3 AR Preview UI
- [ ] Create `app/(app)/reports/annual-return/page.tsx`
- [ ] Build `features/reports/components/ar-preview.tsx`
  - [ ] Split-screen preview (Your Data | Official Form)
  - [ ] Visual field mapping lines
  - [ ] Completion indicators
  - [ ] Missing data warnings

- [ ] Build `features/reports/components/ar-field-mapper.tsx`
  - [ ] Draggable field connections
  - [ ] Auto-mapping suggestions
  - [ ] Manual override options
  - [ ] Validation messages

### 1.4 Export Functionality
- [ ] Build `features/reports/components/ar-export-options.tsx`
  - [ ] Copy individual fields
  - [ ] Export as CSV
  - [ ] Generate PDF preview
  - [ ] Email to trustees option

## Phase 2: Board Pack Generator (Hours 2-3) 📊

### 2.1 Report Template System
- [ ] Create `features/reports/services/template-service.ts`
  - [ ] Define template structure
  - [ ] Section management
  - [ ] Variable replacement
  - [ ] Conditional content

### 2.2 Report Sections
- [ ] Create `features/reports/templates/` directory
  - [ ] `executive-summary.ts` - Key metrics & highlights
  - [ ] `compliance-status.ts` - Score breakdown & issues
  - [ ] `risk-assessment.ts` - Areas of concern
  - [ ] `financial-summary.ts` - Income breakdown
  - [ ] `action-items.ts` - Recommendations

### 2.3 Report Builder UI
- [ ] Create `app/(app)/reports/board-pack/page.tsx`
- [ ] Build `features/reports/components/report-builder.tsx`
  - [ ] Template selection
  - [ ] Section toggle/reorder
  - [ ] Content preview
  - [ ] Branding options

- [ ] Build `features/reports/components/report-section.tsx`
  - [ ] Editable content blocks
  - [ ] AI regeneration per section
  - [ ] Charts/visualizations
  - [ ] Comments/notes

### 2.4 PDF Generation
- [ ] Create `features/reports/services/pdf-generator.ts`
  - [ ] Use React PDF or similar
  - [ ] Apply charity branding
  - [ ] Include charts/graphs
  - [ ] Page numbers & TOC

## Phase 3: Compliance Certificates (Hours 3-4) 🏆

### 3.1 Certificate Templates
- [ ] Create `features/reports/templates/certificates/`
  - [ ] `compliance-achievement.tsx` - X% Compliant
  - [ ] `annual-return-ready.tsx` - Ready to submit
  - [ ] `milestone-reached.tsx` - First 100% score
  - [ ] `improvement-award.tsx` - Most improved

### 3.2 Certificate Generator
- [ ] Create `features/reports/services/certificate-generator.ts`
  - [ ] Dynamic text generation
  - [ ] QR code for verification
  - [ ] Unique certificate ID
  - [ ] Shareable links

### 3.3 Certificate UI
- [ ] Build `features/reports/components/certificate-display.tsx`
  - [ ] Beautiful certificate design
  - [ ] Animated reveal
  - [ ] Download options
  - [ ] Social sharing buttons

## Phase 4: Data Export Suite (Hours 4-5) 💾

### 4.1 Export Service
- [ ] Create `features/export/services/export-service.ts`
  - [ ] Export all data by module
  - [ ] Custom date ranges
  - [ ] Multiple formats (CSV, Excel, JSON)
  - [ ] GDPR-compliant exports

### 4.2 Export UI
- [ ] Create `app/(app)/settings/export/page.tsx`
- [ ] Build `features/export/components/export-wizard.tsx`
  - [ ] Module selection
  - [ ] Date range picker
  - [ ] Format selection
  - [ ] Preview before export

### 4.3 Scheduled Exports
- [ ] Create backup scheduling
- [ ] Email delivery option
- [ ] Cloud storage integration
- [ ] Export history tracking

## Phase 5: Multi-Charity Portal (Hours 5-6) 🏢

### 5.1 Organization Switching
- [ ] Update `stores/auth-store.ts` for multi-org
- [ ] Create `features/organizations/services/org-service.ts`
- [ ] Implement organization context
- [ ] Update all queries for current org

### 5.2 Advisor Dashboard
- [ ] Create `app/(app)/advisor/page.tsx`
- [ ] Build `features/advisor/components/org-switcher.tsx`
  - [ ] Dropdown with org list
  - [ ] Quick search
  - [ ] Recent organizations
  - [ ] Add new org option

- [ ] Build `features/advisor/components/multi-org-dashboard.tsx`
  - [ ] Compliance scores grid
  - [ ] Urgent actions across orgs
  - [ ] Bulk operations
  - [ ] Comparison view

### 5.3 Bulk Operations
- [ ] Bulk report generation
- [ ] Cross-org analytics
- [ ] Unified billing view
- [ ] Permission management

## Phase 6: Subscription & Billing (Hours 6-7) 💳

### 6.1 Paddle Integration
- [ ] Create `lib/payments/paddle.ts`
  - [ ] Initialize Paddle SDK
  - [ ] Configure products/prices
  - [ ] Set up webhooks
  - [ ] Handle different regions

### 6.2 Subscription Service
- [ ] Create `features/subscription/services/subscription-service.ts`
  - [ ] Check subscription status
  - [ ] Enforce limits (users, storage)
  - [ ] Handle upgrades/downgrades
  - [ ] Process webhooks

### 6.3 Pricing Page Updates
- [ ] Update `components/marketing/pricing.tsx`
  - [ ] Connect to Paddle checkout
  - [ ] Show current plan
  - [ ] Upgrade prompts
  - [ ] Feature comparison

### 6.4 Billing UI
- [ ] Create `app/(app)/settings/billing/page.tsx`
- [ ] Build `features/subscription/components/billing-dashboard.tsx`
  - [ ] Current plan display
  - [ ] Usage metrics
  - [ ] Invoice history
  - [ ] Update payment method

- [ ] Build `features/subscription/components/upgrade-modal.tsx`
  - [ ] Feature comparison
  - [ ] Proration preview
  - [ ] Smooth checkout flow
  - [ ] Success confirmation

### 6.5 Feature Gating
- [ ] Implement feature flags
- [ ] Create upgrade prompts
- [ ] Soft limits with warnings
- [ ] Grace period handling

## Phase 7: API & Integrations (Hours 7-8) 🔌

### 7.1 Public API
- [ ] Create `app/api/v1/` structure
- [ ] Implement rate limiting
- [ ] API key management
- [ ] Documentation

### 7.2 Webhook System
- [ ] Create `app/api/webhooks/paddle/route.ts`
  - [ ] Subscription created
  - [ ] Payment succeeded
  - [ ] Subscription cancelled
  - [ ] Payment failed

### 7.3 Third-party Integrations
- [ ] Charity Commission API (if available)
- [ ] Accounting software webhooks
- [ ] Calendar integration
- [ ] Slack notifications

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
5. ✅ Billing system processing payments
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
        └── usage-display.tsx
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

### Subscription Enforcement
```typescript
export async function checkFeatureAccess(
  orgId: string, 
  feature: string
): Promise<boolean> {
  const subscription = await getSubscription(orgId)
  
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