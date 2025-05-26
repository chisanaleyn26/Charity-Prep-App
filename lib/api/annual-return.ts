'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentFinancialYear } from './utils'
import { ANNUAL_RETURN_FIELDS } from '@/lib/constants'
import { calculateComplianceScore } from '@/lib/compliance/calculator'

export interface AnnualReturnData {
  organization: {
    name: string
    charityNumber: string
    address: string
    financialYearEnd: string
  }
  financialSummary: {
    totalIncome: number
    totalExpenditure: number
    restrictedFunds: number
    unrestrictedFunds: number
    reserves: number
    majorDonors: number
  }
  activities: {
    beneficiariesReached: number
    volunteerHours: number
    servicesProvided: string[]
    keyAchievements: string[]
  }
  governance: {
    trusteesCount: number
    trusteeMeetings: number
    policiesReviewed: string[]
    riskAssessmentDate?: string
  }
  safeguarding: {
    dbsChecksValid: number
    dbsChecksTotal: number
    trainingCompleted: number
    incidentsReported: number
    policyLastReviewed?: string
  }
  overseas: {
    countriesActive: number
    totalSpent: number
    partnersCount: number
    highRiskActivities: number
    dueDiligenceCompleted: boolean
  }
  compliance: {
    overallScore: number
    filingDeadline: string
    readyToFile: boolean
    missingData: string[]
  }
}

/**
 * Generate Annual Return data
 */
export async function generateAnnualReturn(
  organizationId: string,
  financialYear?: number
): Promise<{ data?: AnnualReturnData; error?: string }> {
  const supabase = await createClient()
  
  // Get organization details
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()
  
  if (orgError || !org) {
    return { error: 'Organization not found' }
  }
  
  const year = financialYear || getCurrentFinancialYear(org.financial_year_end)
  
  // Get all compliance data in parallel
  const [
    safeguardingData,
    overseasData,
    incomeData,
    countriesData
  ] = await Promise.all([
    getSafeguardingData(organizationId),
    getOverseasData(organizationId, year),
    getFinancialData(organizationId, year),
    supabase.from('countries').select('*')
  ])
  
  // Calculate compliance score
  const complianceScore = calculateComplianceScore(
    safeguardingData.records || [],
    overseasData.activities || [],
    incomeData.records || [],
    countriesData.data || []
  )
  
  // Build Annual Return data
  const annualReturn: AnnualReturnData = {
    organization: {
      name: org.name,
      charityNumber: org.charity_number || '',
      address: formatAddress(org),
      financialYearEnd: org.financial_year_end
    },
    financialSummary: {
      totalIncome: incomeData.total,
      totalExpenditure: overseasData.totalSpent,
      restrictedFunds: incomeData.restricted,
      unrestrictedFunds: incomeData.total - incomeData.restricted,
      reserves: calculateReserves(incomeData.total, overseasData.totalSpent),
      majorDonors: incomeData.majorDonors
    },
    activities: {
      beneficiariesReached: overseasData.beneficiaries,
      volunteerHours: safeguardingData.volunteerHours,
      servicesProvided: getServicesProvided(overseasData.activities || []),
      keyAchievements: [] // Would be manually entered
    },
    governance: {
      trusteesCount: safeguardingData.trustees,
      trusteeMeetings: 0, // Would need separate tracking
      policiesReviewed: safeguardingData.policiesReviewed,
      riskAssessmentDate: overseasData.lastRiskAssessment
    },
    safeguarding: {
      dbsChecksValid: safeguardingData.valid,
      dbsChecksTotal: safeguardingData.total,
      trainingCompleted: safeguardingData.trained,
      incidentsReported: 0, // Would need incident tracking
      policyLastReviewed: safeguardingData.policyDate
    },
    overseas: {
      countriesActive: overseasData.countries.length,
      totalSpent: overseasData.totalSpent,
      partnersCount: overseasData.partners,
      highRiskActivities: overseasData.highRisk,
      dueDiligenceCompleted: overseasData.dueDiligence
    },
    compliance: {
      overallScore: complianceScore.overall,
      filingDeadline: calculateFilingDeadline(org.financial_year_end),
      readyToFile: checkReadyToFile(complianceScore.overall),
      missingData: identifyMissingData(annualReturn)
    }
  }
  
  return { data: annualReturn }
}

/**
 * Get Annual Return field mappings
 */
export async function getAnnualReturnFields(
  organizationId: string
): Promise<{ fields?: Record<string, any>; error?: string }> {
  const result = await generateAnnualReturn(organizationId)
  
  if (result.error || !result.data) {
    return { error: result.error || 'Failed to generate data' }
  }
  
  const data = result.data
  const fields: Record<string, any> = {}
  
  // Map to official Annual Return fields
  // Section A: Charity Information
  fields['A1'] = data.organization.name
  fields['A2'] = data.organization.charityNumber
  fields['A3'] = data.organization.address
  fields['A4'] = data.organization.financialYearEnd
  
  // Section B: Financial Information
  fields['B1'] = data.financialSummary.totalIncome
  fields['B2'] = data.financialSummary.totalExpenditure
  fields['B3'] = data.financialSummary.restrictedFunds
  fields['B4'] = data.financialSummary.unrestrictedFunds
  fields['B5'] = data.financialSummary.reserves
  
  // Section C: Activities
  fields['C1'] = data.activities.beneficiariesReached
  fields['C2'] = data.activities.servicesProvided.join(', ')
  
  // Section D: Safeguarding
  fields['D1'] = data.safeguarding.dbsChecksValid
  fields['D2'] = data.safeguarding.dbsChecksTotal
  fields['D3'] = data.safeguarding.policyLastReviewed
  
  // Section E: Overseas (if applicable)
  if (data.overseas.countriesActive > 0) {
    fields['E1'] = data.overseas.countriesActive
    fields['E2'] = data.overseas.totalSpent
    fields['E3'] = data.overseas.highRiskActivities > 0 ? 'Yes' : 'No'
    fields['E4'] = data.overseas.dueDiligenceCompleted ? 'Yes' : 'No'
  }
  
  return { fields }
}

/**
 * Helper functions
 */
async function getSafeguardingData(organizationId: string) {
  const supabase = await createClient()
  
  const { data: records } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  const now = new Date()
  const valid = records?.filter(r => new Date(r.expiry_date) > now).length || 0
  const trustees = records?.filter(r => r.role_type === 'trustee').length || 0
  const trained = records?.filter(r => r.training_completed).length || 0
  const volunteers = records?.filter(r => r.role_type === 'volunteer').length || 0
  
  return {
    records,
    total: records?.length || 0,
    valid,
    trustees,
    trained,
    volunteerHours: volunteers * 100, // Rough estimate
    policiesReviewed: ['Safeguarding Policy', 'Code of Conduct'],
    policyDate: '2024-01-01' // Would need actual tracking
  }
}

async function getOverseasData(organizationId: string, year: number) {
  const supabase = await createClient()
  
  const { data: activities } = await supabase
    .from('overseas_activities')
    .select('*, country:countries(*)')
    .eq('organization_id', organizationId)
    .eq('financial_year', year)
    .is('deleted_at', null)
  
  const { data: partners } = await supabase
    .from('overseas_partners')
    .select('id')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  const countries = [...new Set(activities?.map(a => a.country_code) || [])]
  const highRisk = activities?.filter(a => a.country?.is_high_risk).length || 0
  const totalSpent = activities?.reduce((sum, a) => sum + a.amount_gbp, 0) || 0
  const beneficiaries = activities?.reduce((sum, a) => sum + (a.beneficiaries_count || 0), 0) || 0
  
  return {
    activities,
    countries,
    totalSpent,
    partners: partners?.length || 0,
    highRisk,
    beneficiaries,
    dueDiligence: highRisk === 0 || activities?.every(a => a.sanctions_check_completed) || false,
    lastRiskAssessment: '2024-01-01' // Would need actual tracking
  }
}

async function getFinancialData(organizationId: string, year: number) {
  const supabase = await createClient()
  
  const { data: records } = await supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('financial_year', year)
    .is('deleted_at', null)
  
  const total = records?.reduce((sum, r) => sum + r.amount, 0) || 0
  const restricted = records?.filter(r => r.restricted_funds).reduce((sum, r) => sum + r.amount, 0) || 0
  const majorDonors = records?.filter(r => r.amount >= 5000).length || 0
  
  return {
    records,
    total,
    restricted,
    majorDonors
  }
}

function formatAddress(org: any): string {
  const parts = [
    org.address_line1,
    org.address_line2,
    org.city,
    org.postcode,
    org.country
  ].filter(Boolean)
  
  return parts.join(', ')
}

function calculateReserves(income: number, expenditure: number): number {
  // Simple calculation - would need proper accounting data
  return Math.max(0, income - expenditure)
}

function getServicesProvided(activities: any[]): string[] {
  const services = new Set<string>()
  
  activities.forEach(a => {
    if (a.activity_type) {
      services.add(a.activity_type.replace(/_/g, ' '))
    }
  })
  
  return Array.from(services)
}

function calculateFilingDeadline(yearEnd: string): string {
  const [month, day] = yearEnd.split('-').map(Number)
  const deadline = new Date()
  deadline.setMonth(month - 1 + 10) // 10 months after year end
  deadline.setDate(day)
  
  if (deadline < new Date()) {
    deadline.setFullYear(deadline.getFullYear() + 1)
  }
  
  return deadline.toISOString().split('T')[0]
}

function checkReadyToFile(score: number): boolean {
  return score >= 90 // 90% compliance required
}

function identifyMissingData(data: AnnualReturnData): string[] {
  const missing: string[] = []
  
  if (!data.organization.charityNumber) {
    missing.push('Charity registration number')
  }
  
  if (data.safeguarding.dbsChecksValid < data.safeguarding.dbsChecksTotal) {
    missing.push('Some DBS checks have expired')
  }
  
  if (data.overseas.highRiskActivities > 0 && !data.overseas.dueDiligenceCompleted) {
    missing.push('Due diligence for high-risk countries')
  }
  
  if (data.activities.keyAchievements.length === 0) {
    missing.push('Key achievements narrative')
  }
  
  return missing
}