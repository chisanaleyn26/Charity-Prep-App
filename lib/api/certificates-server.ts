'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateComplianceScore } from '@/lib/compliance/calculator'

export async function getCertificateData(orgId: string) {
  const supabase = await createClient()
  
  // Get organization data
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', orgId)
    .single()
    
  if (orgError) throw orgError
  
  // Calculate compliance score
  const score = await calculateComplianceScore(orgId)
  
  return {
    organization: org,
    score,
    generatedAt: new Date().toISOString()
  }
}