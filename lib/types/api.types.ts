import { z } from 'zod'
import { Constants } from './database.types'

// Enum schemas
export const userRoleSchema = z.enum(Constants.public.Enums.user_role)
export const organizationSizeSchema = z.enum(Constants.public.Enums.organization_size)
export const subscriptionTierSchema = z.enum(Constants.public.Enums.subscription_tier)
export const subscriptionStatusSchema = z.enum(Constants.public.Enums.subscription_status)
export const dbsCheckTypeSchema = z.enum(Constants.public.Enums.dbs_check_type)
export const safeguardingRoleTypeSchema = z.enum(Constants.public.Enums.safeguarding_role_type)
export const activityTypeSchema = z.enum(Constants.public.Enums.activity_type)
export const transferMethodSchema = z.enum(Constants.public.Enums.transfer_method)
export const incomeSourceSchema = z.enum(Constants.public.Enums.income_source)
export const donorTypeSchema = z.enum(Constants.public.Enums.donor_type)
export const fundraisingMethodSchema = z.enum(Constants.public.Enums.fundraising_method)

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  primary_email: z.string().email(),
  charity_number: z.string().optional(),
  charity_type: z.string().optional(),
  income_band: organizationSizeSchema,
  financial_year_end: z.string().regex(/^\d{2}-\d{2}$/),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
})

export const updateOrganizationSchema = createOrganizationSchema.partial()

// User schemas
export const updateUserSchema = z.object({
  full_name: z.string().min(1).max(255).optional(),
  phone: z.string().optional(),
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
})

// Safeguarding schemas
export const createSafeguardingRecordSchema = z.object({
  person_name: z.string().min(1).max(255),
  role_title: z.string().min(1).max(255),
  role_type: safeguardingRoleTypeSchema,
  dbs_check_type: dbsCheckTypeSchema,
  dbs_certificate_number: z.string().optional(),
  issue_date: z.string().datetime(),
  expiry_date: z.string().datetime(),
  department: z.string().optional(),
  works_with_children: z.boolean().optional(),
  works_with_vulnerable_adults: z.boolean().optional(),
  unsupervised_access: z.boolean().optional(),
  training_completed: z.boolean().optional(),
  training_date: z.string().datetime().optional(),
  reference_checks_completed: z.boolean().optional(),
  notes: z.string().optional(),
})

export const updateSafeguardingRecordSchema = createSafeguardingRecordSchema.partial()

// Overseas activity schemas
export const createOverseasActivitySchema = z.object({
  activity_name: z.string().min(1).max(255),
  activity_type: activityTypeSchema,
  country_code: z.string().length(2),
  transfer_date: z.string().datetime(),
  transfer_method: transferMethodSchema,
  amount: z.number().positive(),
  currency: z.string().default('GBP'),
  amount_gbp: z.number().positive(),
  exchange_rate: z.number().positive().optional(),
  financial_year: z.number().int().min(2020).max(2100),
  quarter: z.number().int().min(1).max(4).optional(),
  partner_id: z.string().uuid().optional(),
  project_code: z.string().optional(),
  description: z.string().optional(),
  beneficiaries_count: z.number().int().positive().optional(),
  transfer_reference: z.string().optional(),
  sanctions_check_completed: z.boolean().optional(),
  requires_reporting: z.boolean().optional(),
  reported_to_commission: z.boolean().optional(),
})

export const updateOverseasActivitySchema = createOverseasActivitySchema.partial()

// Overseas partner schemas
export const createOverseasPartnerSchema = z.object({
  partner_name: z.string().min(1).max(255),
  partner_type: z.string().optional(),
  country_code: z.string().length(2).optional(),
  registration_number: z.string().optional(),
  registration_verified: z.boolean().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  has_formal_agreement: z.boolean().optional(),
  agreement_start_date: z.string().datetime().optional(),
  agreement_end_date: z.string().datetime().optional(),
  risk_assessment_completed: z.boolean().optional(),
  risk_assessment_date: z.string().datetime().optional(),
  risk_level: z.enum(['low', 'medium', 'high']).optional(),
  is_active: z.boolean().default(true),
  notes: z.string().optional(),
})

export const updateOverseasPartnerSchema = createOverseasPartnerSchema.partial()

// Income record schemas
export const createIncomeRecordSchema = z.object({
  source: incomeSourceSchema,
  amount: z.number().positive(),
  date_received: z.string().datetime(),
  financial_year: z.number().int().min(2020).max(2100),
  donor_type: donorTypeSchema.optional(),
  donor_name: z.string().optional(),
  is_anonymous: z.boolean().optional(),
  fundraising_method: fundraisingMethodSchema.optional(),
  campaign_name: z.string().optional(),
  gift_aid_eligible: z.boolean().optional(),
  gift_aid_claimed: z.boolean().optional(),
  restricted_funds: z.boolean().optional(),
  restriction_details: z.string().optional(),
  is_related_party: z.boolean().optional(),
  related_party_relationship: z.string().optional(),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

export const updateIncomeRecordSchema = createIncomeRecordSchema.partial()

// Import schemas
export const importFileSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(['safeguarding', 'overseas', 'income']),
  mapping: z.record(z.string()).optional(),
})

// Filter schemas
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export const sortingSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export const safeguardingFiltersSchema = z.object({
  search: z.string().optional(),
  role_type: safeguardingRoleTypeSchema.optional(),
  dbs_check_type: dbsCheckTypeSchema.optional(),
  is_active: z.boolean().optional(),
  expiring_soon: z.boolean().optional(),
}).merge(paginationSchema).merge(dateRangeSchema).merge(sortingSchema)

export const overseasFiltersSchema = z.object({
  search: z.string().optional(),
  activity_type: activityTypeSchema.optional(),
  country_code: z.string().optional(),
  transfer_method: transferMethodSchema.optional(),
  high_risk_only: z.boolean().optional(),
}).merge(paginationSchema).merge(dateRangeSchema).merge(sortingSchema)

export const incomeFiltersSchema = z.object({
  search: z.string().optional(),
  source: incomeSourceSchema.optional(),
  donor_type: donorTypeSchema.optional(),
  fundraising_method: fundraisingMethodSchema.optional(),
  gift_aid_eligible: z.boolean().optional(),
  restricted_funds: z.boolean().optional(),
}).merge(paginationSchema).merge(dateRangeSchema).merge(sortingSchema)

// Auth schemas
export const signInSchema = z.object({
  email: z.string().email(),
})

export const inviteUserSchema = z.object({
  email: z.string().email(),
  role: userRoleSchema,
})

// Export types
export type CreateOrganization = z.infer<typeof createOrganizationSchema>
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>
export type UpdateUser = z.infer<typeof updateUserSchema>
export type CreateSafeguardingRecord = z.infer<typeof createSafeguardingRecordSchema>
export type UpdateSafeguardingRecord = z.infer<typeof updateSafeguardingRecordSchema>
export type CreateOverseasActivity = z.infer<typeof createOverseasActivitySchema>
export type UpdateOverseasActivity = z.infer<typeof updateOverseasActivitySchema>
export type CreateOverseasPartner = z.infer<typeof createOverseasPartnerSchema>
export type UpdateOverseasPartner = z.infer<typeof updateOverseasPartnerSchema>
export type CreateIncomeRecord = z.infer<typeof createIncomeRecordSchema>
export type UpdateIncomeRecord = z.infer<typeof updateIncomeRecordSchema>
export type ImportFile = z.infer<typeof importFileSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
export type Sorting = z.infer<typeof sortingSchema>
export type SafeguardingFilters = z.infer<typeof safeguardingFiltersSchema>
export type OverseasFilters = z.infer<typeof overseasFiltersSchema>
export type IncomeFilters = z.infer<typeof incomeFiltersSchema>
export type SignIn = z.infer<typeof signInSchema>
export type InviteUser = z.infer<typeof inviteUserSchema>