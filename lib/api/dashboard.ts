'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateComplianceScore, getComplianceLevel, getComplianceMessage } from '@/lib/compliance/calculator'
import { getCurrentFinancialYear } from './helpers'
import { COMPLIANCE_THRESHOLDS } from '@/lib/constants'

export interface DashboardData {
  organization: {
    id: string
    name: string
    subscription: {
      tier: string
      status: string
      trialEndsAt: string | null
    }
  }
  compliance: {
    score: number
    level: string
    message: string
    breakdown: {
      safeguarding: number
      overseas: number
      income: number
    }
  }
  alerts: Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    title: string
    message: string
    link?: string
  }>
  quickStats: {
    safeguarding: {
      total: number
      expiring: number
      expired: number
    }
    overseas: {
      countries: number
      totalSpend: number
      highRisk: number
    }
    income: {
      totalIncome: number
      giftAidPending: number
      majorDonors: number
    }
  }
  recentActivity: Array<{
    id: string
    type: string
    description: string
    timestamp: string
  }>
}

export async function getDashboardData(organizationId: string): Promise<DashboardData | { error: string }> {
  const supabase = await createClient()

  try {
    // Get organization with subscription
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select(`
        *,
        subscription:subscriptions(*)
      `)
      .eq('id', organizationId)
      .single()

    if (orgError || !org) {
      return { error: 'Organization not found' }
    }

    // Get all compliance data in parallel
    const [
      { data: safeguardingRecords },
      { data: overseasActivities },
      { data: incomeRecords },
      { data: countries }
    ] = await Promise.all([
      supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null),
      supabase
        .from('overseas_activities')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null),
      supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('financial_year', getCurrentFinancialYear(org.financial_year_end))
        .is('deleted_at', null),
      supabase
        .from('countries')
        .select('*')
    ])

    // Calculate compliance scores
    const complianceScores = calculateComplianceScore(
      safeguardingRecords || [],
      overseasActivities || [],
      incomeRecords || [],
      countries || []
    )

    const complianceLevel = getComplianceLevel(complianceScores.overall)

    // Generate alerts
    const alerts = generateAlerts(
      safeguardingRecords || [],
      overseasActivities || [],
      incomeRecords || [],
      countries || []
    )

    // Calculate quick stats
    const quickStats = calculateQuickStats(
      safeguardingRecords || [],
      overseasActivities || [],
      incomeRecords || []
    )

    // Get recent activity
    const recentActivity = await getRecentActivity(organizationId)

    return {
      organization: {
        id: org.id,
        name: org.name,
        subscription: {
          tier: org.subscription.tier,
          status: org.subscription.status,
          trialEndsAt: org.subscription.trial_ends_at
        }
      },
      compliance: {
        score: complianceScores.overall,
        level: complianceLevel,
        message: getComplianceMessage(complianceLevel),
        breakdown: {
          safeguarding: complianceScores.safeguarding,
          overseas: complianceScores.overseas,
          income: complianceScores.income
        }
      },
      alerts,
      quickStats,
      recentActivity
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    return { error: 'Failed to load dashboard data' }
  }
}

function generateAlerts(
  safeguardingRecords: any[],
  overseasActivities: any[],
  incomeRecords: any[],
  countries: any[]
): DashboardData['alerts'] {
  const alerts: DashboardData['alerts'] = []
  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + COMPLIANCE_THRESHOLDS.dbs.expiryWarningDays)

  // Safeguarding alerts
  const expiringDBS = safeguardingRecords.filter(record => {
    const expiryDate = new Date(record.expiry_date)
    return record.is_active && expiryDate > today && expiryDate <= warningDate
  })

  const expiredDBS = safeguardingRecords.filter(record => {
    const expiryDate = new Date(record.expiry_date)
    return record.is_active && expiryDate <= today
  })

  if (expiredDBS.length > 0) {
    alerts.push({
      id: 'dbs-expired',
      type: 'error',
      title: 'DBS Checks Expired',
      message: `${expiredDBS.length} DBS check(s) have expired and need renewal`,
      link: '/compliance/safeguarding'
    })
  }

  if (expiringDBS.length > 0) {
    alerts.push({
      id: 'dbs-expiring',
      type: 'warning',
      title: 'DBS Checks Expiring Soon',
      message: `${expiringDBS.length} DBS check(s) will expire within 30 days`,
      link: '/compliance/safeguarding'
    })
  }

  // Overseas alerts
  const countryMap = new Map(countries.map(c => [c.code, c]))
  const highRiskUnreported = overseasActivities.filter(activity => {
    const country = countryMap.get(activity.country_code)
    return country?.is_high_risk && !activity.reported_to_commission
  })

  if (highRiskUnreported.length > 0) {
    alerts.push({
      id: 'overseas-unreported',
      type: 'error',
      title: 'High-Risk Activities Unreported',
      message: `${highRiskUnreported.length} high-risk overseas activities need reporting`,
      link: '/compliance/overseas'
    })
  }

  // Income alerts
  const undocumentedLarge = incomeRecords.filter(record => 
    record.amount >= 5000 && !record.receipt_document_id
  )

  if (undocumentedLarge.length > 0) {
    alerts.push({
      id: 'income-undocumented',
      type: 'warning',
      title: 'Large Donations Need Documentation',
      message: `${undocumentedLarge.length} donation(s) over £5,000 lack documentation`,
      link: '/compliance/income'
    })
  }

  return alerts
}

function calculateQuickStats(
  safeguardingRecords: any[],
  overseasActivities: any[],
  incomeRecords: any[]
): DashboardData['quickStats'] {
  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + COMPLIANCE_THRESHOLDS.dbs.expiryWarningDays)

  // Safeguarding stats
  const activeRecords = safeguardingRecords.filter(r => r.is_active)
  const expiring = activeRecords.filter(record => {
    const expiryDate = new Date(record.expiry_date)
    return expiryDate > today && expiryDate <= warningDate
  })
  const expired = activeRecords.filter(record => {
    const expiryDate = new Date(record.expiry_date)
    return expiryDate <= today
  })

  // Overseas stats
  const countries = new Set(overseasActivities.map(a => a.country_code))
  const totalSpend = overseasActivities.reduce((sum, a) => sum + a.amount_gbp, 0)
  const highRisk = overseasActivities.filter(a => a.requires_reporting).length

  // Income stats
  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0)
  const giftAidPending = incomeRecords.filter(r => 
    r.gift_aid_eligible && !r.gift_aid_claimed
  ).length
  const majorDonors = incomeRecords.filter(r => r.amount >= 5000).length

  return {
    safeguarding: {
      total: activeRecords.length,
      expiring: expiring.length,
      expired: expired.length
    },
    overseas: {
      countries: countries.size,
      totalSpend,
      highRisk
    },
    income: {
      totalIncome,
      giftAidPending,
      majorDonors
    }
  }
}

async function getRecentActivity(organizationId: string): Promise<DashboardData['recentActivity']> {
  const supabase = await createClient()
  const activities: DashboardData['recentActivity'] = []

  // Get recent safeguarding records
  const { data: recentDBS } = await supabase
    .from('safeguarding_records')
    .select('id, person_name, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(3)

  recentDBS?.forEach(record => {
    activities.push({
      id: `dbs-${record.id}`,
      type: 'safeguarding',
      description: `DBS check added for ${record.person_name}`,
      timestamp: record.created_at
    })
  })

  // Get recent overseas activities
  const { data: recentOverseas } = await supabase
    .from('overseas_activities')
    .select('id, activity_name, amount_gbp, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(3)

  recentOverseas?.forEach(activity => {
    activities.push({
      id: `overseas-${activity.id}`,
      type: 'overseas',
      description: `${activity.activity_name} - £${activity.amount_gbp.toLocaleString()}`,
      timestamp: activity.created_at
    })
  })

  // Get recent income
  const { data: recentIncome } = await supabase
    .from('income_records')
    .select('id, donor_name, amount, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(3)

  recentIncome?.forEach(record => {
    const donor = record.donor_name || 'Anonymous'
    activities.push({
      id: `income-${record.id}`,
      type: 'income',
      description: `Donation received from ${donor} - £${record.amount.toLocaleString()}`,
      timestamp: record.created_at
    })
  })

  // Sort by timestamp and return top 10
  return activities
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
}