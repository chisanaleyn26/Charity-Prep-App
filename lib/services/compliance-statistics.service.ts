'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateComplianceScore, getComplianceLevel } from '@/lib/compliance/calculator'
import type { ComplianceScore } from '@/lib/types/database.types'

export interface ComplianceStatistics {
  overall: { percentage: number; level: string }
  breakdown: {
    safeguarding: { percentage: number; level: string }
    overseas: { percentage: number; level: string }
    fundraising: { percentage: number; level: string }
  }
  trends: {
    lastMonth: number | null
    change: number | null
    direction: 'up' | 'down' | 'stable' | null
  }
  actionItems: Array<{
    category: 'safeguarding' | 'overseas' | 'fundraising'
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    count?: number
  }>
  lastUpdated: string
}

/**
 * Get comprehensive compliance statistics for an organization
 */
export async function getComplianceStatistics(organizationId: string): Promise<ComplianceStatistics> {
  const supabase = await createClient()
  
  try {
    // Fetch all compliance data in parallel
    const [
      { data: safeguardingRecords },
      { data: overseasActivities }, 
      { data: incomeRecords },
      { data: countries },
      { data: historicalScores }
    ] = await Promise.all([
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
        .is('deleted_at', null),
      
      // Income records
      supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null),
      
      // Countries reference data
      supabase
        .from('countries')
        .select('*'),
      
      // Historical compliance scores (for trending)
      supabase
        .from('compliance_history')
        .select('score, created_at')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(2)
    ])

    // Calculate current compliance scores
    const scores = calculateComplianceScore(
      safeguardingRecords || [],
      overseasActivities || [],
      incomeRecords || [],
      countries || []
    )

    // Calculate trends
    const trends = calculateTrends(historicalScores || [], scores.overall)
    
    // Generate action items
    const actionItems = generateActionItems(scores, safeguardingRecords || [], overseasActivities || [], incomeRecords || [])

    return {
      overall: { 
        percentage: scores.overall, 
        level: getComplianceLevel(scores.overall)
      },
      breakdown: {
        safeguarding: { 
          percentage: scores.safeguarding, 
          level: getComplianceLevel(scores.safeguarding)
        },
        overseas: { 
          percentage: scores.overseas, 
          level: getComplianceLevel(scores.overseas)
        },
        fundraising: { 
          percentage: scores.income, 
          level: getComplianceLevel(scores.income)
        }
      },
      trends,
      actionItems,
      lastUpdated: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error fetching compliance statistics:', error)
    throw new Error('Failed to fetch compliance statistics')
  }
}

/**
 * Calculate trend information
 */
function calculateTrends(historicalScores: any[], currentScore: number) {
  if (historicalScores.length < 2) {
    return {
      lastMonth: null,
      change: null,
      direction: null as const
    }
  }

  const lastMonth = historicalScores[1].score
  const change = currentScore - lastMonth
  
  let direction: 'up' | 'down' | 'stable'
  if (Math.abs(change) < 1) {
    direction = 'stable'
  } else if (change > 0) {
    direction = 'up'
  } else {
    direction = 'down'
  }

  return {
    lastMonth,
    change: Math.round(change * 10) / 10, // Round to 1 decimal
    direction
  }
}

/**
 * Generate actionable items based on compliance gaps
 */
function generateActionItems(
  scores: ReturnType<typeof calculateComplianceScore>,
  safeguardingRecords: any[],
  overseasActivities: any[],
  incomeRecords: any[]
) {
  const actionItems: ComplianceStatistics['actionItems'] = []

  // Safeguarding action items
  if (scores.safeguarding < 80) {
    const expiredDBS = safeguardingRecords.filter(record => {
      const expiryDate = new Date(record.expiry_date)
      return expiryDate < new Date()
    })

    const expiringSoon = safeguardingRecords.filter(record => {
      const expiryDate = new Date(record.expiry_date)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      return expiryDate > new Date() && expiryDate <= thirtyDaysFromNow
    })

    if (expiredDBS.length > 0) {
      actionItems.push({
        category: 'safeguarding',
        priority: 'high',
        title: 'Expired DBS Checks',
        description: `${expiredDBS.length} DBS check(s) have expired and need immediate renewal`,
        count: expiredDBS.length
      })
    }

    if (expiringSoon.length > 0) {
      actionItems.push({
        category: 'safeguarding',
        priority: 'medium',
        title: 'DBS Checks Expiring Soon',
        description: `${expiringSoon.length} DBS check(s) expire within 30 days`,
        count: expiringSoon.length
      })
    }
  }

  // Overseas activities action items
  if (scores.overseas < 80) {
    const riskyTransfers = overseasActivities.filter(activity => 
      activity.transfer_method && !['bank_transfer', 'wire_transfer'].includes(activity.transfer_method)
    )

    if (riskyTransfers.length > 0) {
      actionItems.push({
        category: 'overseas',
        priority: 'high',
        title: 'High-Risk Transfer Methods',
        description: `${riskyTransfers.length} transfer(s) use non-standard methods requiring documentation`,
        count: riskyTransfers.length
      })
    }
  }

  // Fundraising action items
  if (scores.income < 80) {
    const uncategorizedIncome = incomeRecords.filter(record => !record.source)
    
    if (uncategorizedIncome.length > 0) {
      actionItems.push({
        category: 'fundraising',
        priority: 'medium',
        title: 'Uncategorized Income',
        description: `${uncategorizedIncome.length} income record(s) need proper categorization`,
        count: uncategorizedIncome.length
      })
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return actionItems.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

/**
 * Store current compliance score for historical tracking
 */
export async function storeComplianceScore(organizationId: string, score: number): Promise<void> {
  const supabase = await createClient()
  
  try {
    await supabase
      .from('compliance_history')
      .insert({
        organization_id: organizationId,
        score,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error storing compliance score:', error)
    // Don't throw - this is a background operation
  }
}

/**
 * Get compliance score for a specific date range
 */
export async function getComplianceScoreHistory(
  organizationId: string, 
  startDate: Date, 
  endDate: Date
): Promise<Array<{ date: string; score: number }>> {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('compliance_history')
      .select('score, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    return (data || []).map(record => ({
      date: record.created_at,
      score: record.score
    }))
  } catch (error) {
    console.error('Error fetching compliance score history:', error)
    return []
  }
}