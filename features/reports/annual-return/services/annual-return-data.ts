import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/types/database.types'

type Organization = Database['public']['Tables']['organizations']['Row']
type SafeguardingRecord = Database['public']['Tables']['safeguarding_records']['Row']
type OverseasActivity = Database['public']['Tables']['overseas_activities']['Row']
type IncomeRecord = Database['public']['Tables']['income_records']['Row']
type FundraisingMethod = Database['public']['Tables']['fundraising_methods_used']['Row']

export interface AnnualReturnData {
  organization: Organization | null
  safeguarding: {
    totalStaffVolunteers: number
    workingWithChildren: number
    workingWithVulnerableAdults: number
    dbsChecksValid: number
    dbsChecksExpired: number
    policies: Array<{
      policy_type: string
      last_reviewed_date: string
      next_review_date: string
    }>
  }
  overseas: {
    hasOverseasActivities: boolean
    totalSpend: number
    countries: string[]
    activities: Array<{
      country: string
      amount: number
      activity_type: string
      transfer_method: string
    }>
    usesNonBankTransfers: boolean
  }
  income: {
    totalIncome: number
    breakdown: {
      donations_legacies: number
      charitable_activities: number
      other_trading: number
      investments: number
      other: number
    }
    highestCorporateDonation: number | null
    highestIndividualDonation: number | null
    hasRelatedPartyTransactions: boolean
    relatedPartyTotal: number
  }
  fundraising: {
    methodsUsed: string[]
    usesProfessionalFundraiser: boolean
    professionalFundraiserDetails: Array<{
      fundraiser_name: string
      fundraiser_registration: string | null
    }>
  }
  compliance: {
    overallScore: number
    lastUpdated: string
  }
}

export async function getAnnualReturnData(organizationId: string, financialYear: number): Promise<AnnualReturnData> {
  const supabase = await createClient()

  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()

  // Get safeguarding data
  const { data: safeguardingRecords } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const { data: safeguardingPolicies } = await supabase
    .from('safeguarding_policies')
    .select('policy_type, last_reviewed_date, next_review_date')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  // Get overseas activities
  const { data: overseasActivities } = await supabase
    .from('overseas_activities')
    .select('*, countries!inner(name)')
    .eq('organization_id', organizationId)
    .eq('financial_year', financialYear)
    .is('deleted_at', null)

  // Get income records
  const { data: incomeRecords } = await supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('financial_year', financialYear)
    .is('deleted_at', null)

  // Get major donations
  const { data: majorDonations } = await supabase
    .from('major_donations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('financial_year', financialYear)

  // Get fundraising methods
  const { data: fundraisingMethods } = await supabase
    .from('fundraising_methods_used')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('financial_year', financialYear)

  // Process safeguarding data
  const safeguardingStats = {
    totalStaffVolunteers: safeguardingRecords?.length || 0,
    workingWithChildren: safeguardingRecords?.filter(r => r.works_with_children).length || 0,
    workingWithVulnerableAdults: safeguardingRecords?.filter(r => r.works_with_vulnerable_adults).length || 0,
    dbsChecksValid: safeguardingRecords?.filter(r => new Date(r.expiry_date) > new Date()).length || 0,
    dbsChecksExpired: safeguardingRecords?.filter(r => new Date(r.expiry_date) <= new Date()).length || 0,
    policies: safeguardingPolicies || []
  }

  // Process overseas data
  const overseasStats = {
    hasOverseasActivities: (overseasActivities?.length || 0) > 0,
    totalSpend: overseasActivities?.reduce((sum, a) => sum + Number(a.amount_gbp), 0) || 0,
    countries: [...new Set(overseasActivities?.map(a => a.country_code) || [])],
    activities: overseasActivities?.map(a => ({
      country: a.country_code,
      amount: Number(a.amount_gbp),
      activity_type: a.activity_type,
      transfer_method: a.transfer_method
    })) || [],
    usesNonBankTransfers: overseasActivities?.some(a => a.transfer_method !== 'bank_transfer') || false
  }

  // Process income data
  const incomeBreakdown = incomeRecords?.reduce((acc, record) => {
    const source = record.source as keyof typeof acc
    acc[source] = (acc[source] || 0) + Number(record.amount)
    return acc
  }, {
    donations_legacies: 0,
    charitable_activities: 0,
    other_trading: 0,
    investments: 0,
    other: 0
  }) || {
    donations_legacies: 0,
    charitable_activities: 0,
    other_trading: 0,
    investments: 0,
    other: 0
  }

  const incomeStats = {
    totalIncome: Object.values(incomeBreakdown).reduce((sum, val) => sum + val, 0),
    breakdown: incomeBreakdown,
    highestCorporateDonation: majorDonations?.find(d => d.is_highest_corporate)?.amount || null,
    highestIndividualDonation: majorDonations?.find(d => d.is_highest_individual)?.amount || null,
    hasRelatedPartyTransactions: incomeRecords?.some(r => r.is_related_party) || false,
    relatedPartyTotal: incomeRecords?.filter(r => r.is_related_party).reduce((sum, r) => sum + Number(r.amount), 0) || 0
  }

  // Process fundraising data
  const fundraisingStats = {
    methodsUsed: fundraisingMethods?.filter(m => m.is_used).map(m => m.method) || [],
    usesProfessionalFundraiser: fundraisingMethods?.some(m => m.uses_professional_fundraiser) || false,
    professionalFundraiserDetails: fundraisingMethods
      ?.filter(m => m.uses_professional_fundraiser && m.fundraiser_name)
      .map(m => ({
        fundraiser_name: m.fundraiser_name!,
        fundraiser_registration: m.fundraiser_registration
      })) || []
  }

  // Get compliance score (assuming we have a compliance scores table or calculation)
  const overallScore = calculateComplianceScore(safeguardingStats, overseasStats, incomeStats)

  return {
    organization: org,
    safeguarding: safeguardingStats,
    overseas: overseasStats,
    income: incomeStats,
    fundraising: fundraisingStats,
    compliance: {
      overallScore,
      lastUpdated: new Date().toISOString()
    }
  }
}

function calculateComplianceScore(
  safeguarding: AnnualReturnData['safeguarding'],
  overseas: AnnualReturnData['overseas'],
  income: AnnualReturnData['income']
): number {
  let score = 0
  let weights = 0

  // Safeguarding score (40% weight)
  if (safeguarding.totalStaffVolunteers > 0) {
    const safeguardingScore = (safeguarding.dbsChecksValid / safeguarding.totalStaffVolunteers) * 100
    score += safeguardingScore * 0.4
    weights += 0.4
  }

  // Overseas score (30% weight) - has data if required
  if (overseas.hasOverseasActivities) {
    const overseasScore = overseas.activities.length > 0 ? 100 : 0
    score += overseasScore * 0.3
    weights += 0.3
  } else {
    // If no overseas activities, this contributes positively
    score += 100 * 0.3
    weights += 0.3
  }

  // Income diversity score (30% weight)
  const incomeSources = Object.values(income.breakdown).filter(v => v > 0).length
  const incomeScore = Math.min(incomeSources / 3 * 100, 100) // At least 3 sources = 100%
  score += incomeScore * 0.3
  weights += 0.3

  return weights > 0 ? Math.round(score / weights) : 0
}

// Field mapping for Annual Return form
export const ANNUAL_RETURN_FIELD_MAPPING = {
  // Part A - Charity Information
  'A1_CharityName': 'organization.name',
  'A2_CharityNumber': 'organization.charity_number',
  'A3_CharityType': 'organization.charity_type',
  'A4_FinancialYearEnd': 'organization.financial_year_end',
  
  // Part B - Income
  'B1_TotalIncome': 'income.totalIncome',
  'B2_DonationsLegacies': 'income.breakdown.donations_legacies',
  'B3_CharitableActivities': 'income.breakdown.charitable_activities',
  'B4_OtherTrading': 'income.breakdown.other_trading',
  'B5_Investments': 'income.breakdown.investments',
  'B6_Other': 'income.breakdown.other',
  
  // Part C - Expenditure (placeholder - would need expenditure tracking)
  'C1_TotalExpenditure': 'placeholder',
  'C2_CharitableSpend': 'placeholder',
  'C3_RaisingFunds': 'placeholder',
  
  // Part D - Overseas
  'D1_OverseasSpend': 'overseas.totalSpend',
  'D2_CountriesCount': 'overseas.countries.length',
  'D3_CountriesList': 'overseas.countries',
  
  // Part E - Fundraising
  'E1_FundraisingMethods': 'fundraising.methodsUsed',
  'E2_ProfessionalFundraiser': 'fundraising.usesProfessionalFundraiser',
  
  // Part F - Trading Subsidiaries
  'F1_HasSubsidiaries': 'placeholder',
  
  // Part G - Trustee Benefits
  'G1_TrusteePayments': 'placeholder',
  'G2_RelatedPartyTransactions': 'income.hasRelatedPartyTransactions',
  
  // Part H - Safeguarding
  'H1_WorkingWithChildren': 'safeguarding.workingWithChildren',
  'H2_SafeguardingPolicy': 'safeguarding.policies.length > 0',
  
  // Part I - Serious Incidents
  'I1_SeriousIncidents': 'placeholder',
  
  // Additional Information
  'HighestCorporateDonation': 'income.highestCorporateDonation',
  'HighestIndividualDonation': 'income.highestIndividualDonation',
  'StaffVolunteersCount': 'safeguarding.totalStaffVolunteers',
}