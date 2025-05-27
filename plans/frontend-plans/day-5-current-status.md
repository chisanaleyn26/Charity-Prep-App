# Charity Prep - Day 5 Frontend Status & Implementation Guide

## Current Situation (Day 5 Morning)

We're entering Day 5 with a strong backend foundation but missing critical frontend UI components. The backend APIs, database, and business logic are largely complete, but the user-facing interfaces need to be built.

## What's Complete ✅

### Backend Infrastructure
- **Database**: All tables, RLS policies, migrations applied
- **Auth**: Magic link system working (backend)
- **APIs**: Complete CRUD for all compliance modules
- **Type System**: Full TypeScript + Zod validation
- **Server Actions**: All data mutations implemented
- **AI Features**: Backend logic ready (email ingestion, OCR, search)
- **Payments**: Stripe integration backend ready
- **Multi-org**: Backend support implemented

### Frontend (Partial)
- **Foundation**: Next.js 15.2 app structure
- **Components**: Some UI components (sidebar, headers)
- **Compliance Modules**: Basic CRUD interfaces
- **Dashboard**: Compliance score display

## What's Missing ❌ (Priority for Day 5)

### Critical UI Components

#### 1. Annual Return UI (`/app/(app)/reports/annual-return/`)
- **ARGenerator.tsx**: Main interface for generating Annual Return
- **ARPreview.tsx**: Side-by-side preview of data mapped to official form
- **FieldMapper.tsx**: Copy individual fields for pasting into Charity Commission form

#### 2. Board Pack UI (`/app/(app)/reports/board-pack/`)
- **TemplateSelector.tsx**: Choose which sections to include
- **ReportBuilder.tsx**: Generate PDF with AI narratives
- **Preview/Download**: Professional PDF output

#### 3. Export UI (`/app/(app)/reports/export/`)
- **ExportWizard.tsx**: Select data to export
- **Format selection**: CSV, Excel, PDF options
- **Date range and filtering**

#### 4. Multi-Org UI (`/app/(app)/advisor/`)
- **OrgSwitcher.tsx**: Dropdown to switch between organizations
- **MultiOrgDashboard.tsx**: Overview of all managed charities
- **Bulk operations interface**

#### 5. Billing UI (`/app/(app)/settings/billing/`)
- **BillingDashboard.tsx**: Current plan and usage
- **UpgradeFlow.tsx**: Plan selection and Stripe checkout
- **Invoice history**

## Day 5 Implementation Plan

### Morning Sprint (4 hours)

#### Developer 1: Reports UI
```tsx
// Priority: Annual Return Generator
- Build ARGenerator with progress indicators
- Create field mapping interface
- Implement copy-to-clipboard for each field
- Add missing data warnings
```

#### Developer 2: Board Pack & Export
```tsx
// Priority: Professional report generation
- Template selection UI
- PDF preview component
- Export wizard with format options
- Download functionality
```

#### Developer 3: Multi-Org & Billing
```tsx
// Priority: Revenue features
- Organization switcher dropdown
- Billing dashboard
- Stripe checkout integration UI
- Plan comparison table
```

### Afternoon Sprint (4 hours)

#### All Developers: Integration & Polish
1. **Mobile Optimization**
   - Test all flows on mobile devices
   - Fix responsive issues
   - Optimize touch targets

2. **Error Handling**
   - Add error boundaries
   - User-friendly error messages
   - Loading states

3. **Performance**
   - Lighthouse audit
   - Fix performance issues
   - Optimize images

4. **Production Deployment**
   - Set environment variables
   - Deploy to Vercel
   - Test all features in production

## Quick Implementation Patterns

### Report UI Pattern
```tsx
// app/(app)/reports/annual-return/page.tsx
import { getAnnualReturnData } from '@/lib/api/annual-return'
import { ARGenerator } from '@/features/reports/annual-return/components/ARGenerator'

export default async function AnnualReturnPage() {
  const data = await getAnnualReturnData()
  
  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Annual Return Generator</h1>
      <ARGenerator initialData={data} />
    </div>
  )
}
```

### Multi-Org Switcher Pattern
```tsx
// components/layout/org-switcher.tsx
'use client'
import { useOrganizationStore } from '@/stores/organization-store'

export function OrgSwitcher() {
  const { organizations, current, switchOrg } = useOrganizationStore()
  
  return (
    <Select value={current?.id} onValueChange={switchOrg}>
      {organizations.map(org => (
        <SelectItem key={org.id} value={org.id}>
          {org.name}
        </SelectItem>
      ))}
    </Select>
  )
}
```

### Stripe Checkout Pattern
```tsx
// features/subscription/components/upgrade-flow.tsx
'use client'
import { loadStripe } from '@stripe/stripe-js'
import { createCheckoutSession } from '@/lib/api/billing'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function UpgradeFlow() {
  const handleUpgrade = async (priceId: string) => {
    const { sessionId } = await createCheckoutSession(priceId)
    const stripe = await stripePromise
    await stripe?.redirectToCheckout({ sessionId })
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Pricing tiers with Stripe price IDs */}
    </div>
  )
}
```

## Success Criteria for Day 5

### Must Have (MVP)
- [ ] User can generate Annual Return data
- [ ] User can create board report PDF
- [ ] User can export their data
- [ ] Advisor can switch between organizations
- [ ] User can view/manage subscription
- [ ] Mobile responsive
- [ ] Deployed to production

### Nice to Have (If Time)
- [ ] Compliance certificates
- [ ] Email delivery of reports
- [ ] Advanced PDF formatting
- [ ] API documentation
- [ ] Video walkthrough

## Testing Checklist

1. **New User Flow**
   - Sign up → Onboarding → Add first DBS → See score change

2. **Report Generation**
   - Add compliance data → Generate Annual Return → Copy fields

3. **Multi-Org**
   - Switch organizations → See different data → Maintain context

4. **Billing**
   - View current plan → Upgrade → Stripe checkout → Confirm upgrade

## Deployment Checklist

```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
OPENROUTER_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
RESEND_API_KEY=
```

## Stripe Integration Notes

### Products to Create in Stripe Dashboard
1. **Essentials Plan**: £199/year
   - Create product and price
   - Note the price ID

2. **Standard Plan**: £549/year
   - Create product and price
   - Note the price ID

3. **Premium Plan**: £1,199/year
   - Create product and price
   - Note the price ID

### Webhook Events to Handle
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## If Behind Schedule

### Minimum Viable Launch
1. Basic Annual Return export (even without pretty UI)
2. Simple data export to CSV
3. Manual organization switching (URL-based)
4. Payment links instead of embedded checkout
5. Skip PDF generation (just HTML preview)

### Can Defer to Post-Launch
- Compliance certificates
- Advanced report templates  
- Scheduled exports
- API access
- Mobile app

## Final Push Motivation

Remember: UK charities NEED this by early 2026. Even a basic working version is better than nothing. Focus on core value:

1. **Track compliance data** ✅ (Done)
2. **Calculate compliance score** ✅ (Done)
3. **Export for Annual Return** ⏳ (Today's focus)
4. **Accept payments** ⏳ (Today's focus)

Everything else is enhancement. Ship it! 🚀