import { z } from 'zod'

// Types based on overseas_activities table from schema
export interface OverseasActivity {
  id: string
  organization_id: string
  activity_name: string
  activity_type: 'humanitarian_aid' | 'development' | 'education' | 'healthcare' | 'emergency_relief' | 'capacity_building' | 'advocacy' | 'other'
  country_code: string
  partner_id?: string | null
  amount: number
  currency: string | null
  amount_gbp: number
  exchange_rate?: number | null
  transfer_method: 'bank_transfer' | 'wire_transfer' | 'cryptocurrency' | 'cash_courier' | 'money_service_business' | 'mobile_money' | 'informal_value_transfer' | 'other'
  transfer_date: string
  transfer_reference?: string | null
  financial_year: number
  quarter?: number | null
  beneficiaries_count?: number | null
  project_code?: string | null
  description?: string | null
  sanctions_check_completed: boolean | null
  requires_reporting: boolean | null
  reported_to_commission: boolean | null
  receipt_document_id?: string | null
  created_by?: string | null
  created_at: string | null
  updated_at: string | null
  deleted_at?: string | null
}

export const overseasActivitySchema = z.object({
  activity_name: z.string().min(3, 'Activity name is required'),
  activity_type: z.enum(['humanitarian_aid', 'development', 'education', 'healthcare', 'emergency_relief', 'capacity_building', 'advocacy', 'other']),
  country_code: z.string().length(2, 'Country code must be 2 characters'),
  partner_id: z.string().optional().nullable(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters'),
  amount_gbp: z.number().positive('GBP amount must be positive'),
  exchange_rate: z.number().positive().optional().nullable(),
  transfer_method: z.enum(['bank_transfer', 'wire_transfer', 'cryptocurrency', 'cash_courier', 'money_service_business', 'mobile_money', 'informal_value_transfer', 'other']),
  transfer_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  transfer_reference: z.string().optional().nullable(),
  financial_year: z.number().int().min(2020).max(2100),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  beneficiaries_count: z.number().int().positive().optional().nullable(),
  project_code: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  sanctions_check_completed: z.boolean().nullable().default(false),
  requires_reporting: z.boolean().nullable().default(false),
  reported_to_commission: z.boolean().nullable().default(false)
})

export type OverseasActivityFormData = z.infer<typeof overseasActivitySchema>

export const getActivityTypeLabel = (type: OverseasActivity['activity_type']) => {
  const labels: Record<OverseasActivity['activity_type'], string> = {
    humanitarian_aid: 'Humanitarian Aid',
    development: 'Development',
    education: 'Education',
    healthcare: 'Healthcare',
    emergency_relief: 'Emergency Relief',
    capacity_building: 'Capacity Building',
    advocacy: 'Advocacy',
    other: 'Other'
  }
  return labels[type]
}

export const getTransferMethodLabel = (method: OverseasActivity['transfer_method']) => {
  const labels: Record<OverseasActivity['transfer_method'], string> = {
    bank_transfer: 'Bank Transfer',
    wire_transfer: 'Wire Transfer',
    cryptocurrency: 'Cryptocurrency',
    cash_courier: 'Cash Courier',
    money_service_business: 'Money Service Business',
    mobile_money: 'Mobile Money',
    informal_value_transfer: 'Informal Value Transfer',
    other: 'Other'
  }
  return labels[method]
}

export const getTransferMethodColor = (method: OverseasActivity['transfer_method']) => {
  const colors: Record<OverseasActivity['transfer_method'], string> = {
    bank_transfer: 'bg-success/10 text-success border-success/20',
    wire_transfer: 'bg-primary/10 text-primary border-primary/20',
    cryptocurrency: 'bg-warning/10 text-warning border-warning/20',
    cash_courier: 'bg-destructive/10 text-destructive border-destructive/20',
    money_service_business: 'bg-sage-100 text-sage-700 border-sage-200',
    mobile_money: 'bg-mist-100 text-mist-700 border-mist-200',
    informal_value_transfer: 'bg-destructive/10 text-destructive border-destructive/20',
    other: 'bg-muted text-muted-foreground border-muted'
  }
  return colors[method]
}

// Backward compatibility - map status from reporting state
export const getStatusColor = (activity: OverseasActivity) => {
  if (activity.reported_to_commission) {
    return 'bg-success/10 text-success border-success/20'
  }
  if (activity.requires_reporting && !activity.reported_to_commission) {
    return 'bg-warning/10 text-warning border-warning/20'
  }
  return 'bg-primary/10 text-primary border-primary/20'
}

export const getComplianceStatus = (activity: OverseasActivity): string => {
  if (!activity.sanctions_check_completed) return 'Sanctions Check Needed'
  if (activity.requires_reporting && !activity.reported_to_commission) return 'Reporting Required'
  return 'Compliant'
}

export const getRiskLevel = (activity: OverseasActivity): 'low' | 'medium' | 'high' => {
  // Determine risk based on transfer method and amount
  if (activity.transfer_method === 'cash_courier' || activity.transfer_method === 'informal_value_transfer') {
    return 'high'
  }
  if (activity.transfer_method === 'cryptocurrency' || activity.amount_gbp > 100000) {
    return 'medium'
  }
  return 'low'
}

export const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
  const colors = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-destructive/10 text-destructive border-destructive/20'
  }
  return colors[risk]
}

// Backward compatibility function
export const needsRiskAssessment = (activity: OverseasActivity): boolean => {
  return !activity.sanctions_check_completed || 
    (activity.requires_reporting && !activity.reported_to_commission)
}