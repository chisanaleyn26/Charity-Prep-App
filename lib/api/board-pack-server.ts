'use server'

import { createClient } from '@/lib/supabase/server'
import { generateAnnualReturn } from './annual-return'
import { getDashboardData } from './dashboard'
import { generateBoardNarrative } from '@/lib/ai/narrative-generator'
import { calculateComplianceScore } from '@/lib/compliance/calculator'

export async function getBoardPackData(orgId: string) {
  const supabase = await createClient()
  
  // Get organization data
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
    
  if (orgError) throw orgError
  
  // Get compliance score
  const complianceScore = await calculateComplianceScore(orgId)
  
  // Get dashboard data
  const dashboardData = await getDashboardData(orgId)
  
  // Generate narrative
  const narrative = await generateBoardNarrative({
    organization: org,
    complianceScore,
    dashboardData
  })
  
  return {
    organization: org,
    complianceScore,
    dashboardData,
    narrative,
    generatedAt: new Date().toISOString()
  }
}