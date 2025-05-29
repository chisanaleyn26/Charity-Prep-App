# Subscription Integration Example

This document shows how to integrate the subscription system into your Charity Prep application.

## Quick Start

### 1. Feature Gating in Components

```tsx
// Example: AI Chat feature gated by subscription
import { FeatureGate } from '@/features/subscription/components'

export function AIAssistantPage() {
  return (
    <FeatureGate 
      feature="ai_chat"
      upgradeTitle="AI Chat Assistant"
      upgradeDescription="Unlock our powerful AI assistant to help with compliance questions."
    >
      <ComplianceChat />
    </FeatureGate>
  )
}
```

### 2. Inline Feature Checks

```tsx
// Example: Show/hide features based on subscription
import { FeatureCheck } from '@/features/subscription/components'
import { Button } from '@/components/ui/button'

export function DocumentActions() {
  return (
    <div className="flex gap-2">
      <Button>Download PDF</Button>
      
      <FeatureCheck 
        feature="advanced_reporting"
        fallback={
          <Button disabled title="Upgrade to Standard for advanced exports">
            Export to Excel (Pro)
          </Button>
        }
      >
        <Button>Export to Excel</Button>
      </FeatureCheck>
    </div>
  )
}
```

### 3. Using the Subscription Hook

```tsx
// Example: Custom subscription logic
import { useSubscription } from '@/features/subscription/hooks'

export function SubscriptionStatus() {
  const { 
    subscription, 
    isLoading, 
    isActive, 
    isInTrial, 
    daysUntilTrialEnd,
    canAccessFeature 
  } = useSubscription()

  if (isLoading) return <Spinner />

  if (isInTrial && daysUntilTrialEnd) {
    return (
      <Alert>
        <AlertDescription>
          Trial ends in {daysUntilTrialEnd} days. 
          <Link href="/settings/billing">Upgrade now</Link>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <p>Current Plan: {subscription?.tier || 'None'}</p>
      <p>Status: {subscription?.status || 'No subscription'}</p>
    </div>
  )
}
```

### 4. Protecting Entire Pages

```tsx
// Example: Protect an entire route
import { withFeatureGate } from '@/features/subscription/components'

const AdvancedReportsPage = withFeatureGate(
  function Reports() {
    return (
      <div>
        <h1>Advanced Reports</h1>
        {/* Your report content */}
      </div>
    )
  },
  'advanced_reporting',
  {
    upgradeTitle: 'Advanced Reporting Required',
    upgradeDescription: 'Upgrade to Standard to access detailed compliance reports.'
  }
)

export default AdvancedReportsPage
```

### 5. Organization Switcher Integration

```tsx
// The org switcher automatically works with subscriptions
import { OrgSwitcher } from '@/features/organizations/components/org-switcher'

export function AppHeader() {
  return (
    <header>
      <OrgSwitcher />
      {/* Subscription state updates automatically when org changes */}
    </header>
  )
}
```

## Feature Mapping

### Essentials Plan Features
- `compliance_tracking` - Basic compliance tracking
- `basic_reporting` - Standard reports
- `document_upload` - Document management
- `email_support` - Email support

### Standard Plan Features (includes all Essentials features)
- `advanced_reporting` - Advanced reports & exports
- `ai_import` - AI-powered data import
- `advisor_portal` - Advisor access

### Premium Plan Features (includes all Standard features)
- `ai_chat` - AI compliance assistant
- `api_access` - API integration
- `phone_support` - Priority phone support
- `custom_branding` - White label options

## Billing Page Integration

```tsx
// app/(app)/settings/billing/page.tsx
import { BillingDashboard } from '@/features/subscription/components'

export default function BillingPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>
      <BillingDashboard />
    </div>
  )
}
```

## Handling Trial Users

Trial users have access to basic features only:
- Compliance tracking
- Basic reporting  
- Document upload

The system automatically detects trial status and shows appropriate upgrade prompts.

## Real-time Updates

The subscription system uses Supabase real-time to automatically update when:
- Payment is successful
- Subscription is upgraded/downgraded
- Trial expires
- Payment fails

No manual refresh needed!

## Testing

### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

### Test Scenarios
1. New user signup → 14-day trial automatically created
2. Trial expiration → Features locked, upgrade prompts shown
3. Successful payment → Instant feature access
4. Failed payment → Grace period (3 days), then features locked

## Migration from Paddle

The system supports both Paddle and Stripe during the transition:
- Existing Paddle subscriptions continue working
- New subscriptions use Stripe
- Both are handled transparently by the subscription hook