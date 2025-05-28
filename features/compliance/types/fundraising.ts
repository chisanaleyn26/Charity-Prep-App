import { z } from 'zod'

// Types based on income_records table from schema
export interface IncomeRecord {
  id: string
  organization_id: string
  source: 'donations_legacies' | 'charitable_activities' | 'other_trading' | 'investments' | 'other'
  amount: number
  date_received: string
  financial_year: number
  donor_type?: 'individual' | 'corporate' | 'trust' | 'government' | 'other' | null
  donor_name?: string | null
  is_anonymous: boolean | null
  fundraising_method?: 'individual_giving' | 'major_donors' | 'corporate' | 'trusts_foundations' | 'events' | 'online' | 'direct_mail' | 'telephone' | 'street' | 'legacies' | 'trading' | 'other' | null
  campaign_name?: string | null
  restricted_funds: boolean | null
  restriction_details?: string | null
  is_related_party: boolean | null
  related_party_relationship?: string | null
  gift_aid_eligible: boolean | null
  gift_aid_claimed: boolean | null
  reference_number?: string | null
  notes?: string | null
  receipt_document_id?: string | null
  created_by?: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at?: string | null
}

// Use IncomeRecord as FundraisingActivity for backward compatibility
export type FundraisingActivity = IncomeRecord

export const incomeRecordSchema = z.object({
  source: z.enum(['donations_legacies', 'charitable_activities', 'other_trading', 'investments', 'other']),
  amount: z.number().min(0, 'Amount must be 0 or greater'),
  date_received: z.string().min(1, 'Date received is required'),
  financial_year: z.number().int().min(2020).max(2100),
  donor_type: z.enum(['individual', 'corporate', 'trust', 'government', 'other']).optional().nullable(),
  donor_name: z.string().optional().nullable(),
  is_anonymous: z.boolean().default(false),
  fundraising_method: z.enum(['individual_giving', 'major_donors', 'corporate', 'trusts_foundations', 'events', 'online', 'direct_mail', 'telephone', 'street', 'legacies', 'trading', 'other']).optional().nullable(),
  campaign_name: z.string().optional().nullable(),
  restricted_funds: z.boolean().default(false),
  restriction_details: z.string().optional().nullable(),
  is_related_party: z.boolean().default(false),
  related_party_relationship: z.string().optional().nullable(),
  gift_aid_eligible: z.boolean().default(false),
  gift_aid_claimed: z.boolean().default(false),
  reference_number: z.string().optional().nullable(),
  notes: z.string().optional().nullable()
})

// Use incomeRecordSchema as fundraisingActivitySchema for backward compatibility
export const fundraisingActivitySchema = incomeRecordSchema
export type FundraisingActivityFormData = z.infer<typeof incomeRecordSchema>

export const getSourceLabel = (source: IncomeRecord['source']) => {
  const labels: Record<IncomeRecord['source'], string> = {
    donations_legacies: 'Donations & Legacies',
    charitable_activities: 'Charitable Activities',
    other_trading: 'Other Trading',
    investments: 'Investments',
    other: 'Other'
  }
  return labels[source]
}

export const getMethodLabel = (method: IncomeRecord['fundraising_method']) => {
  if (!method) return '-'
  
  const labels: Record<NonNullable<IncomeRecord['fundraising_method']>, string> = {
    individual_giving: 'Individual Giving',
    major_donors: 'Major Donors',
    corporate: 'Corporate',
    trusts_foundations: 'Trusts & Foundations',
    events: 'Events',
    online: 'Online',
    direct_mail: 'Direct Mail',
    telephone: 'Telephone',
    street: 'Street',
    legacies: 'Legacies',
    trading: 'Trading',
    other: 'Other'
  }
  return labels[method]
}

export const getDonorTypeColor = (type: IncomeRecord['donor_type']) => {
  if (!type) return 'bg-muted text-muted-foreground border-muted'
  
  const colors: Record<NonNullable<IncomeRecord['donor_type']>, string> = {
    individual: 'bg-primary/10 text-primary border-primary/20',
    corporate: 'bg-sage-100 text-sage-700 border-sage-200',
    trust: 'bg-mist-100 text-mist-700 border-mist-200',
    government: 'bg-warning/10 text-warning border-warning/20',
    other: 'bg-muted text-muted-foreground border-muted'
  }
  return colors[type]
}

// For backward compatibility - simulate progress tracking
export const calculateProgress = (activity: FundraisingActivity): number => {
  // Since income_records doesn't have target_amount, return 100% for received income
  return 100
}

export const getProgressColor = (progress: number): string => {
  return 'bg-success'
}

// For backward compatibility - simulate compliance requirements
export const requiresComplianceCheck = (activity: FundraisingActivity): boolean => {
  return activity.amount > 100000 || 
    activity.donor_type === 'corporate' ||
    (activity.is_related_party || false)
}

export const getDaysRemaining = (endDate: string | null | undefined): number | null => {
  // Income records don't have end dates
  return null
}

// Backward compatibility functions for fundraising components
export const getActivityTypeLabel = (type: string) => {
  return getSourceLabel(type as IncomeRecord['source'])
}

export const getStatusColor = (status: string) => {
  // Income records don't have status, return neutral color
  return 'bg-success/10 text-success border-success/20'
}

// Input types for creating and updating
export interface CreateFundraisingActivityInput {
  source: IncomeRecord['source']
  amount: number
  date_received: string
  financial_year: number
  donor_type?: IncomeRecord['donor_type']
  donor_name?: string | null
  is_anonymous?: boolean | null
  fundraising_method?: IncomeRecord['fundraising_method']
  campaign_name?: string | null
  restricted_funds?: boolean | null
  restriction_details?: string | null
  is_related_party?: boolean | null
  related_party_relationship?: string | null
  gift_aid_eligible?: boolean | null
  gift_aid_claimed?: boolean | null
  reference_number?: string | null
  notes?: string | null
}

export interface UpdateFundraisingActivityInput extends Partial<CreateFundraisingActivityInput> {
  id: string
}