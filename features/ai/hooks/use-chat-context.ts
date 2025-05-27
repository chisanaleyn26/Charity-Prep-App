'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatContext } from '../types/chat'

// Cache organization context to avoid repeated fetches
let cachedContext: ChatContext | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useChatContext() {
  const [context, setContext] = useState<ChatContext | null>(cachedContext)
  const [isLoading, setIsLoading] = useState(!cachedContext)

  useEffect(() => {
    // Use cached context if it's still fresh
    if (cachedContext && Date.now() - cacheTimestamp < CACHE_DURATION) {
      setContext(cachedContext)
      setIsLoading(false)
      return
    }

    loadContext()
  }, [])

  const loadContext = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      // Get organization membership
      const { data: membership } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          organizations (
            name,
            charity_number,
            income_band,
            financial_year_end
          )
        `)
        .eq('user_id', user.id)
        .single()
      
      if (!membership?.organizations) {
        setIsLoading(false)
        return
      }

      const org = membership.organizations as any

      // Get additional context in parallel
      const [safeguardingResult, overseasResult] = await Promise.all([
        // Check safeguarding context
        supabase
          .from('safeguarding_records')
          .select('works_with_children, works_with_vulnerable_adults')
          .eq('organization_id', membership.organization_id)
          .limit(1),
        
        // Check overseas activities
        supabase
          .from('overseas_activities')
          .select('id')
          .eq('organization_id', membership.organization_id)
          .limit(1)
      ])

      const contextData: ChatContext = {
        organizationType: 'Registered Charity',
        organizationName: org.name,
        charityNumber: org.charity_number,
        income: getIncomeFromBand(org.income_band),
        financialYearEnd: org.financial_year_end,
        workWithChildren: safeguardingResult.data?.[0]?.works_with_children ?? false,
        workWithVulnerableAdults: safeguardingResult.data?.[0]?.works_with_vulnerable_adults ?? false,
        hasOverseasActivities: (overseasResult.data?.length ?? 0) > 0
      }

      // Update cache
      cachedContext = contextData
      cacheTimestamp = Date.now()
      
      setContext(contextData)
    } catch (error) {
      console.error('Failed to load chat context:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshContext = () => {
    cachedContext = null
    cacheTimestamp = 0
    loadContext()
  }

  return { context, isLoading, refreshContext }
}

function getIncomeFromBand(band?: string): number | undefined {
  switch (band) {
    case 'small': return 50000
    case 'medium': return 500000
    case 'large': return 5000000
    default: return undefined
  }
}