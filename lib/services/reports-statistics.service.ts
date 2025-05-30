'use server'

import { createClient } from '@/lib/supabase/server'
import { addDays, differenceInDays } from 'date-fns'

export interface ReportsStatistics {
  complianceScore: number
  reportsGenerated: number
  nextAnnualReturn: number // days until next annual return
  lastReportDate: string | null
}

/**
 * Get reports statistics for an organization
 */
export async function getReportsStatistics(organizationId: string): Promise<ReportsStatistics> {
  const supabase = await createClient()
  
  try {
    // Get compliance score - simplified calculation
    const { data: safeguardingRecords } = await supabase
      .from('safeguarding_records')
      .select('expiry_date, is_active')
      .eq('organization_id', organizationId)
      .is('deleted_at', null)
    
    const activeRecords = safeguardingRecords?.filter(r => r.is_active) || []
    const validRecords = activeRecords.filter(r => 
      !r.expiry_date || new Date(r.expiry_date) > new Date()
    )
    
    const complianceScore = activeRecords.length > 0 
      ? Math.round((validRecords.length / activeRecords.length) * 100)
      : 75 // Default score if no records
    
    // Get reports count from export history
    const { data: exports, error: exportsError } = await supabase
      .from('export_jobs')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('status', 'completed')
    
    const reportsGenerated = exports?.length || 0
    
    // Calculate next annual return (mocked for now - typically 10 months after year end)
    const currentDate = new Date()
    const yearEnd = new Date(currentDate.getFullYear(), 3, 5) // April 5th
    if (currentDate > yearEnd) {
      yearEnd.setFullYear(yearEnd.getFullYear() + 1)
    }
    const annualReturnDue = addDays(yearEnd, 305) // 10 months after year end
    const nextAnnualReturn = differenceInDays(annualReturnDue, currentDate)
    
    // Get last report date
    const { data: lastExport } = await supabase
      .from('export_jobs')
      .select('created_at')
      .eq('organization_id', organizationId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    return {
      complianceScore,
      reportsGenerated,
      nextAnnualReturn: Math.max(0, nextAnnualReturn),
      lastReportDate: lastExport?.created_at || null
    }
  } catch (error) {
    console.error('Error fetching reports statistics:', error)
    // Return default values on error
    return {
      complianceScore: 75,
      reportsGenerated: 0,
      nextAnnualReturn: 45,
      lastReportDate: null
    }
  }
}