import { createServerClient } from '@/lib/supabase/server'

export interface AnnualReturnData {
  // Organization details
  organizationId: string
  charityName: string
  charityNumber: string
  financialYearEnd: string
  
  // Staff & Volunteers
  totalStaff: number
  totalVolunteers: number
  totalTrustees: number
  
  // Safeguarding
  workingWithChildren: boolean
  workingWithVulnerableAdults: boolean
  dbsChecksComplete: boolean
  safeguardingPoliciesReviewed: boolean
  totalPeopleRequiringDBS: number
  dbsChecksExpired: number
  
  // International Operations
  operatesOverseas: boolean
  countriesList: string[]
  overseasExpenditure: number
  nonBankTransferAmount: number
  nonBankTransferPercentage: number
  
  // Income
  totalIncome: number
  incomeFromDonationsAndLegacies: number
  incomeFromCharitableActivities: number
  incomeFromOtherTrading: number
  incomeFromInvestments: number
  incomeFromOther: number
  
  // Major donations
  highestCorporateDonation: number | null
  highestIndividualDonation: number | null
  hasRelatedPartyTransactions: boolean
  relatedPartyAmount: number
  
  // Fundraising
  fundraisingMethods: string[]
  usesProfessionalFundraiser: boolean
  
  // Completion tracking
  completionPercentage: number
  missingFields: string[]
}

export async function getAnnualReturnData(
  organizationId: string,
  financialYear: number
): Promise<AnnualReturnData> {
  const supabase = createServerClient()
  
  // Fetch all data in parallel
  const [
    orgData,
    safeguardingData,
    overseasData,
    incomeData,
    countriesData
  ] = await Promise.all([
    // Organization details
    supabase
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single(),
      
    // Safeguarding records
    supabase
      .from('safeguarding_records')
      .select('*')
      .eq('organization_id', organizationId)
      .is('deleted_at', null),
      
    // Overseas activities
    supabase
      .from('overseas_activities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('financial_year', financialYear)
      .is('deleted_at', null),
      
    // Income records
    supabase
      .from('income_records')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('financial_year', financialYear)
      .is('deleted_at', null),
      
    // Countries reference
    supabase
      .from('countries')
      .select('code, name')
  ])
  
  if (orgData.error) throw orgData.error
  
  const organization = orgData.data
  const safeguarding = safeguardingData.data || []
  const overseas = overseasData.data || []
  const income = incomeData.data || []
  const countries = countriesData.data || []
  
  // Process safeguarding data
  const totalStaff = safeguarding.filter(r => r.role_type === 'employee').length
  const totalVolunteers = safeguarding.filter(r => r.role_type === 'volunteer').length
  const totalTrustees = safeguarding.filter(r => r.role_type === 'trustee').length
  
  const workingWithChildren = safeguarding.some(r => r.works_with_children)
  const workingWithVulnerableAdults = safeguarding.some(r => r.works_with_vulnerable_adults)
  
  const today = new Date()
  const dbsChecksExpired = safeguarding.filter(r => 
    new Date(r.expiry_date) < today
  ).length
  
  const dbsChecksComplete = safeguarding.every(r => 
    r.dbs_certificate_number && new Date(r.expiry_date) >= today
  )
  
  // Process overseas data
  const operatesOverseas = overseas.length > 0
  const uniqueCountries = [...new Set(overseas.map(a => a.country_code))]
  const countriesList = uniqueCountries.map(code => {
    const country = countries.find(c => c.code === code)
    return country ? country.name : code
  })
  
  const overseasExpenditure = overseas.reduce((sum, a) => sum + (a.amount_gbp || 0), 0)
  const nonBankTransferAmount = overseas
    .filter(a => a.transfer_method !== 'bank_transfer' && a.transfer_method !== 'wire_transfer')
    .reduce((sum, a) => sum + (a.amount_gbp || 0), 0)
  
  const nonBankTransferPercentage = overseasExpenditure > 0 
    ? (nonBankTransferAmount / overseasExpenditure) * 100 
    : 0
  
  // Process income data
  const totalIncome = income.reduce((sum, i) => sum + (i.amount || 0), 0)
  
  const incomeBySource = {
    donations_legacies: 0,
    charitable_activities: 0,
    other_trading: 0,
    investments: 0,
    other: 0
  }
  
  income.forEach(i => {
    if (incomeBySource.hasOwnProperty(i.source)) {
      incomeBySource[i.source] += i.amount || 0
    }
  })
  
  // Find major donations
  const corporateDonations = income.filter(i => i.donor_type === 'corporate')
  const individualDonations = income.filter(i => i.donor_type === 'individual')
  
  const highestCorporateDonation = corporateDonations.length > 0
    ? Math.max(...corporateDonations.map(d => d.amount))
    : null
    
  const highestIndividualDonation = individualDonations.length > 0
    ? Math.max(...individualDonations.map(d => d.amount))
    : null
  
  // Related party transactions
  const relatedPartyTransactions = income.filter(i => i.is_related_party)
  const hasRelatedPartyTransactions = relatedPartyTransactions.length > 0
  const relatedPartyAmount = relatedPartyTransactions.reduce((sum, i) => sum + (i.amount || 0), 0)
  
  // Fundraising methods
  const fundraisingMethods = [...new Set(income.map(i => i.fundraising_method).filter(Boolean))]
  
  // Calculate completion
  const missingFields: string[] = []
  
  // Check required fields
  if (totalStaff + totalVolunteers + totalTrustees === 0) {
    missingFields.push('No staff/volunteer records')
  }
  
  if (dbsChecksExpired > 0) {
    missingFields.push(`${dbsChecksExpired} DBS checks expired`)
  }
  
  if (operatesOverseas && !overseasExpenditure) {
    missingFields.push('Overseas expenditure amounts missing')
  }
  
  if (totalIncome === 0) {
    missingFields.push('No income records')
  }
  
  if (fundraisingMethods.length === 0) {
    missingFields.push('No fundraising methods specified')
  }
  
  const totalFields = 20 // Approximate number of AR fields
  const completedFields = totalFields - missingFields.length
  const completionPercentage = Math.round((completedFields / totalFields) * 100)
  
  return {
    // Organization
    organizationId,
    charityName: organization.name,
    charityNumber: organization.charity_number,
    financialYearEnd: organization.financial_year_end,
    
    // Staff & Volunteers
    totalStaff,
    totalVolunteers,
    totalTrustees,
    
    // Safeguarding
    workingWithChildren,
    workingWithVulnerableAdults,
    dbsChecksComplete,
    safeguardingPoliciesReviewed: true, // Would check policy table if it existed
    totalPeopleRequiringDBS: safeguarding.length,
    dbsChecksExpired,
    
    // International
    operatesOverseas,
    countriesList,
    overseasExpenditure,
    nonBankTransferAmount,
    nonBankTransferPercentage,
    
    // Income
    totalIncome,
    incomeFromDonationsAndLegacies: incomeBySource.donations_legacies,
    incomeFromCharitableActivities: incomeBySource.charitable_activities,
    incomeFromOtherTrading: incomeBySource.other_trading,
    incomeFromInvestments: incomeBySource.investments,
    incomeFromOther: incomeBySource.other,
    
    // Major donations
    highestCorporateDonation,
    highestIndividualDonation,
    hasRelatedPartyTransactions,
    relatedPartyAmount,
    
    // Fundraising
    fundraisingMethods,
    usesProfessionalFundraiser: false, // Would check fundraising_methods_used table
    
    // Completion
    completionPercentage,
    missingFields
  }
}

// Helper to get the current financial year based on year end
export function getCurrentFinancialYear(yearEndDate: string): number {
  const yearEnd = new Date(yearEndDate)
  const today = new Date()
  
  // Extract month and day from year end
  const yearEndMonth = yearEnd.getMonth()
  const yearEndDay = yearEnd.getDate()
  
  // Create this year's year end date
  const thisYearEnd = new Date(today.getFullYear(), yearEndMonth, yearEndDay)
  
  // If we're past this year's year end, we're in the next financial year
  if (today > thisYearEnd) {
    return today.getFullYear() + 1
  } else {
    return today.getFullYear()
  }
}