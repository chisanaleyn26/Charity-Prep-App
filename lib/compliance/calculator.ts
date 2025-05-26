import { COMPLIANCE_WEIGHTS, COMPLIANCE_THRESHOLDS } from '@/lib/constants'
import type { 
  SafeguardingRecord, 
  OverseasActivity, 
  IncomeRecord,
  Country 
} from '@/lib/types'

export interface ComplianceScores {
  overall: number
  safeguarding: number
  overseas: number
  income: number
  breakdown: {
    safeguarding: SafeguardingScore
    overseas: OverseasScore
    income: IncomeScore
  }
}

export interface SafeguardingScore {
  score: number
  totalRecords: number
  validRecords: number
  expiringRecords: number
  expiredRecords: number
}

export interface OverseasScore {
  score: number
  totalActivities: number
  highRiskActivities: number
  unreportedActivities: number
  sanctionsCheckRequired: number
}

export interface IncomeScore {
  score: number
  totalRecords: number
  documentedRecords: number
  relatedPartyRecords: number
  giftAidEligible: number
}

/**
 * Calculate overall compliance score
 */
export function calculateComplianceScore(
  safeguardingRecords: SafeguardingRecord[],
  overseasActivities: OverseasActivity[],
  incomeRecords: IncomeRecord[],
  countries: Country[]
): ComplianceScores {
  const safeguarding = calculateSafeguardingScore(safeguardingRecords)
  const overseas = calculateOverseasScore(overseasActivities, countries)
  const income = calculateIncomeScore(incomeRecords)

  const overall = Math.round(
    safeguarding.score * COMPLIANCE_WEIGHTS.safeguarding +
    overseas.score * COMPLIANCE_WEIGHTS.overseas +
    income.score * COMPLIANCE_WEIGHTS.income
  )

  return {
    overall,
    safeguarding: safeguarding.score,
    overseas: overseas.score,
    income: income.score,
    breakdown: {
      safeguarding,
      overseas,
      income
    }
  }
}

/**
 * Calculate safeguarding compliance score
 */
export function calculateSafeguardingScore(records: SafeguardingRecord[]): SafeguardingScore {
  if (records.length === 0) {
    return {
      score: 0,
      totalRecords: 0,
      validRecords: 0,
      expiringRecords: 0,
      expiredRecords: 0
    }
  }

  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + COMPLIANCE_THRESHOLDS.dbs.expiryWarningDays)

  let validRecords = 0
  let expiringRecords = 0
  let expiredRecords = 0

  records.forEach(record => {
    if (!record.is_active) return

    const expiryDate = new Date(record.expiry_date)

    if (expiryDate < today) {
      expiredRecords++
    } else if (expiryDate < warningDate) {
      expiringRecords++
      validRecords++ // Still valid but expiring soon
    } else {
      validRecords++
    }
  })

  // Score calculation:
  // - 100% if all records valid
  // - -10 points per expiring record
  // - -20 points per expired record
  let score = 100
  score -= expiringRecords * 10
  score -= expiredRecords * 20
  score = Math.max(0, score)

  return {
    score,
    totalRecords: records.length,
    validRecords,
    expiringRecords,
    expiredRecords
  }
}

/**
 * Calculate overseas compliance score
 */
export function calculateOverseasScore(
  activities: OverseasActivity[],
  countries: Country[]
): OverseasScore {
  if (activities.length === 0) {
    // If no overseas activities, perfect score
    return {
      score: 100,
      totalActivities: 0,
      highRiskActivities: 0,
      unreportedActivities: 0,
      sanctionsCheckRequired: 0
    }
  }

  const countryMap = new Map(countries.map(c => [c.code, c]))
  
  let highRiskActivities = 0
  let unreportedActivities = 0
  let sanctionsCheckRequired = 0

  activities.forEach(activity => {
    const country = countryMap.get(activity.country_code)
    
    if (country?.is_high_risk) {
      highRiskActivities++
      
      if (!activity.reported_to_commission) {
        unreportedActivities++
      }
    }
    
    if (country?.sanctions_list && !activity.sanctions_check_completed) {
      sanctionsCheckRequired++
    }
  })

  // Score calculation:
  // - Start at 100
  // - -15 points per unreported high-risk activity
  // - -10 points per missing sanctions check
  let score = 100
  score -= unreportedActivities * 15
  score -= sanctionsCheckRequired * 10
  score = Math.max(0, score)

  return {
    score,
    totalActivities: activities.length,
    highRiskActivities,
    unreportedActivities,
    sanctionsCheckRequired
  }
}

/**
 * Calculate income compliance score
 */
export function calculateIncomeScore(records: IncomeRecord[]): IncomeScore {
  if (records.length === 0) {
    return {
      score: 0,
      totalRecords: 0,
      documentedRecords: 0,
      relatedPartyRecords: 0,
      giftAidEligible: 0
    }
  }

  let documentedRecords = 0
  let relatedPartyRecords = 0
  let giftAidEligible = 0

  records.forEach(record => {
    if (record.receipt_document_id) {
      documentedRecords++
    }
    
    if (record.is_related_party) {
      relatedPartyRecords++
    }
    
    if (record.gift_aid_eligible && !record.gift_aid_claimed) {
      giftAidEligible++
    }
  })

  // Score calculation:
  // - Base score from documentation rate (0-80 points)
  // - +20 points if all related party transactions documented
  // - -5 points per unclaimed gift aid
  const documentationRate = documentedRecords / records.length
  let score = Math.round(documentationRate * 80)
  
  if (relatedPartyRecords > 0) {
    const relatedPartyDocumented = records
      .filter(r => r.is_related_party && r.receipt_document_id)
      .length
    
    if (relatedPartyDocumented === relatedPartyRecords) {
      score += 20
    }
  } else {
    score += 20 // No related party transactions
  }
  
  score -= giftAidEligible * 5
  score = Math.max(0, Math.min(100, score))

  return {
    score,
    totalRecords: records.length,
    documentedRecords,
    relatedPartyRecords,
    giftAidEligible
  }
}

/**
 * Get compliance status level
 */
export function getComplianceLevel(score: number): 'excellent' | 'good' | 'needs-attention' | 'at-risk' {
  if (score >= 90) return 'excellent'
  if (score >= 75) return 'good'
  if (score >= 50) return 'needs-attention'
  return 'at-risk'
}

/**
 * Get compliance status message
 */
export function getComplianceMessage(level: ReturnType<typeof getComplianceLevel>): string {
  switch (level) {
    case 'excellent':
      return 'Your charity is fully compliant with all regulations'
    case 'good':
      return 'Good compliance standing with minor areas for improvement'
    case 'needs-attention':
      return 'Several compliance issues need your attention'
    case 'at-risk':
      return 'Urgent action required to meet compliance requirements'
  }
}