import { Database } from './database.types'

export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row']
export type Subscription = Database['public']['Tables']['subscriptions']['Row']
export type SafeguardingRecord = Database['public']['Tables']['safeguarding_records']['Row']
export type OverseasActivity = Database['public']['Tables']['overseas_activities']['Row']
export type OverseasPartner = Database['public']['Tables']['overseas_partners']['Row']
export type IncomeRecord = Database['public']['Tables']['income_records']['Row']
export type Country = Database['public']['Tables']['countries']['Row']

export type UserRole = Database['public']['Enums']['user_role']
export type OrganizationSize = Database['public']['Enums']['organization_size']
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type SubscriptionStatus = Database['public']['Enums']['subscription_status']
export type DBSCheckType = Database['public']['Enums']['dbs_check_type']
export type SafeguardingRoleType = Database['public']['Enums']['safeguarding_role_type']
export type ActivityType = Database['public']['Enums']['activity_type']
export type TransferMethod = Database['public']['Enums']['transfer_method']
export type IncomeSource = Database['public']['Enums']['income_source']
export type DonorType = Database['public']['Enums']['donor_type']
export type FundraisingMethod = Database['public']['Enums']['fundraising_method']

export interface OrganizationWithMembers extends Organization {
  members?: OrganizationMember[]
  subscription?: Subscription
}

export interface UserWithOrganizations extends User {
  organizations?: OrganizationMember[]
}

export interface SafeguardingDashboard {
  totalRecords: number
  activeRecords: number
  expiringRecords: number
  overdueRecords: number
  recordsByType: Record<SafeguardingRoleType, number>
  recordsByDBSType: Record<DBSCheckType, number>
}

export interface OverseasDashboard {
  totalActivities: number
  totalAmount: number
  countriesCount: number
  partnersCount: number
  activitiesByType: Record<ActivityType, number>
  highRiskActivities: number
}

export interface IncomeDashboard {
  totalIncome: number
  donorCount: number
  giftAidEligible: number
  restrictedFunds: number
  incomeBySource: Record<IncomeSource, number>
  incomeByMethod: Record<FundraisingMethod, number>
}

export interface ComplianceStatus {
  safeguarding: {
    compliant: boolean
    expiringCount: number
    overdueCount: number
    lastUpdated: string | null
  }
  overseas: {
    compliant: boolean
    unreportedCount: number
    highRiskCount: number
    lastUpdated: string | null
  }
  income: {
    compliant: boolean
    unverifiedCount: number
    relatedPartyCount: number
    lastUpdated: string | null
  }
}

export interface APIResponse<T = unknown> {
  data?: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface FilterOptions {
  search?: string
  status?: string
  startDate?: Date
  endDate?: Date
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}