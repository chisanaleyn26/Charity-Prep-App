import { z } from 'zod'
import { STRIPE_PRODUCTS, type SubscriptionTier } from '@/lib/payments/stripe'

// Base subscription interface
export interface Subscription {
  id: string
  organizationId: string
  stripeCustomerId: string
  stripeSubscriptionId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  billingCycle: BillingCycle
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  trialEnd?: Date
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, string>
}

// Subscription status
export type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid'
  | 'expired'

// Billing cycle
export type BillingCycle = 'monthly' | 'yearly'

// Feature access levels
export type FeatureLevel = 'basic' | 'standard' | 'premium'

// Plan features mapping
export const FEATURE_ACCESS: Record<SubscriptionTier, string[]> = {
  ESSENTIALS: [
    'basic_compliance',
    'annual_return',
    'manual_entry',
    'basic_export',
    'email_support'
  ],
  STANDARD: [
    'basic_compliance',
    'annual_return',
    'manual_entry',
    'basic_export',
    'ai_processing',
    'document_ocr',
    'csv_import',
    'board_packs',
    'advanced_export',
    'priority_support'
  ],
  PREMIUM: [
    'basic_compliance',
    'annual_return',
    'manual_entry',
    'basic_export',
    'ai_processing',
    'document_ocr',
    'csv_import',
    'board_packs',
    'advanced_export',
    'multi_charity',
    'custom_reporting',
    'api_access',
    'dedicated_support',
    'white_label'
  ]
} as const

// Usage metrics
export interface UsageMetrics {
  users: {
    current: number
    limit: number
    percentage: number
  }
  storage: {
    current: number // in bytes
    limit: number // in bytes
    percentage: number
  }
  aiRequests: {
    current: number
    limit: number
    percentage: number
  }
  exports: {
    current: number
    limit: number
    percentage: number
  }
}

// Billing information
export interface BillingInfo {
  customerId: string
  subscriptionId: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  nextBillingDate: Date
  amount: number
  currency: string
  paymentMethod?: PaymentMethod
  invoices: Invoice[]
  upcomingInvoice?: Invoice
}

// Payment method
export interface PaymentMethod {
  id: string
  type: 'card'
  card: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  isDefault: boolean
}

// Invoice
export interface Invoice {
  id: string
  number: string
  status: string
  amount: number
  currency: string
  paidAt?: Date
  dueDate?: Date
  hostedUrl?: string
  pdfUrl?: string
}

// Plan comparison data
export interface PlanComparison {
  tier: SubscriptionTier
  name: string
  description: string
  price: {
    monthly: number
    yearly: number
    monthlyFormatted: string
    yearlyFormatted: string
  }
  features: string[]
  limits: {
    users: number
    storage: number
    aiRequests: number
    exports: number
  }
  popular?: boolean
  current?: boolean
}

// Upgrade/downgrade preview
export interface SubscriptionChangePreview {
  currentTier: SubscriptionTier
  newTier: SubscriptionTier
  currentCycle: BillingCycle
  newCycle: BillingCycle
  prorationAmount: number
  nextBillingAmount: number
  nextBillingDate: Date
  featureChanges: {
    added: string[]
    removed: string[]
    limitChanges: {
      users: { from: number; to: number }
      storage: { from: number; to: number }
      aiRequests: { from: number; to: number }
      exports: { from: number; to: number }
    }
  }
}

// Feature gate result
export interface FeatureGateResult {
  allowed: boolean
  reason?: string
  upgradeRequired?: boolean
  currentTier?: SubscriptionTier
  requiredTier?: SubscriptionTier
  usageInfo?: {
    current: number
    limit: number
    type: string
  }
  gracePeriodEnd?: Date
}

// Subscription events
export type SubscriptionEventType = 
  | 'subscription.created'
  | 'subscription.updated'
  | 'subscription.canceled'
  | 'subscription.reactivated'
  | 'invoice.paid'
  | 'invoice.payment_failed'
  | 'customer.subscription.trial_will_end'

export interface SubscriptionEvent {
  type: SubscriptionEventType
  organizationId: string
  subscriptionId: string
  data: Record<string, any>
  timestamp: Date
}

// Notifications
export interface SubscriptionNotification {
  id: string
  organizationId: string
  type: 'usage_warning' | 'payment_failed' | 'trial_ending' | 'subscription_canceled'
  title: string
  message: string
  actionRequired: boolean
  actionUrl?: string
  actionText?: string
  createdAt: Date
  readAt?: Date
}

// Subscription form data
export const SubscriptionFormSchema = z.object({
  tier: z.enum(['ESSENTIALS', 'STANDARD', 'PREMIUM']),
  cycle: z.enum(['monthly', 'yearly']),
  organizationId: z.string().min(1),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

export type SubscriptionFormData = z.infer<typeof SubscriptionFormSchema>

// Billing settings form
export const BillingSettingsSchema = z.object({
  billingEmail: z.string().email(),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
  address: z.object({
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    country: z.string().min(2).max(2),
    postalCode: z.string().min(1),
  }),
})

export type BillingSettingsData = z.infer<typeof BillingSettingsSchema>

// Usage report
export interface UsageReport {
  organizationId: string
  period: {
    start: Date
    end: Date
  }
  metrics: UsageMetrics
  events: {
    date: Date
    type: 'user_added' | 'ai_request' | 'export' | 'storage_update'
    value: number
    metadata?: Record<string, any>
  }[]
  projections: {
    endOfMonth: {
      users: number
      storage: number
      aiRequests: number
      exports: number
    }
    limitBreaches: string[]
  }
}

// Subscription analytics
export interface SubscriptionAnalytics {
  organizationId: string
  subscriptionAge: number // days
  totalSpent: number
  averageMonthlySpend: number
  featureUsage: {
    feature: string
    usageCount: number
    lastUsed?: Date
  }[]
  upgradeRecommendations: {
    reason: string
    suggestedTier: SubscriptionTier
    savings?: number
    benefits: string[]
  }[]
}

// Export types
export * from '@/lib/payments/stripe'
export type { 
  SubscriptionTier,
  SubscriptionData
}