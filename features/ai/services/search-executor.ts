'use server'

import { createClient } from '@/lib/supabase/server'
import { parseSearchQuery, buildSearchConditions, type ParsedSearchQuery } from './search-parser'

export interface SearchResult {
  id: string
  type: 'safeguarding' | 'income' | 'overseas'
  title: string
  description: string
  date?: string
  amount?: number
  status?: string
  metadata: Record<string, any>
  relevance: number
}

export interface SearchResponse {
  results: SearchResult[]
  totalCount: number
  query: ParsedSearchQuery
  executionTime: number
}

/**
 * Execute a natural language search query
 */
export async function executeSearch(query: string): Promise<SearchResponse> {
  const startTime = Date.now()
  const supabase = await createClient()
  
  // Get current user and organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
    
  if (!membership) {
    throw new Error('No organization found')
  }

  // Parse the natural language query
  const parsed = await parseSearchQuery(query)
  const searchConditions = buildSearchConditions(parsed)
  
  const results: SearchResult[] = []
  
  // Search each relevant table
  for (const table of searchConditions.tables) {
    switch (table) {
      case 'safeguarding_records':
        const safeguardingResults = await searchSafeguardingRecords(
          supabase,
          membership.organization_id,
          searchConditions.conditions
        )
        results.push(...safeguardingResults)
        break
        
      case 'income_records':
        const incomeResults = await searchIncomeRecords(
          supabase,
          membership.organization_id,
          searchConditions.conditions
        )
        results.push(...incomeResults)
        break
        
      case 'overseas_activities':
        const overseasResults = await searchOverseasActivities(
          supabase,
          membership.organization_id,
          searchConditions.conditions
        )
        results.push(...overseasResults)
        break
    }
  }
  
  // Sort results by relevance
  results.sort((a, b) => b.relevance - a.relevance)
  
  // Apply ordering if specified
  if (searchConditions.orderBy) {
    results.sort((a, b) => {
      const aVal = a.metadata[searchConditions.orderBy!.column]
      const bVal = b.metadata[searchConditions.orderBy!.column]
      const multiplier = searchConditions.orderBy!.direction === 'asc' ? 1 : -1
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * multiplier
      }
      
      return String(aVal).localeCompare(String(bVal)) * multiplier
    })
  }
  
  return {
    results: results.slice(0, 50), // Limit to 50 results
    totalCount: results.length,
    query: parsed,
    executionTime: Date.now() - startTime
  }
}

/**
 * Search safeguarding records
 */
async function searchSafeguardingRecords(
  supabase: any,
  organizationId: string,
  conditions: Record<string, any>
): Promise<SearchResult[]> {
  let query = supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    
  // Apply person name filter
  if (conditions.personNames?.length) {
    const nameConditions = conditions.personNames
      .map((name: string) => `person_name.ilike.%${name}%`)
      .join(',')
    query = query.or(nameConditions)
  }
  
  // Apply date range filter
  if (conditions.dateRange) {
    if (conditions.dateRange.start) {
      query = query.gte('created_at', conditions.dateRange.start)
    }
    if (conditions.dateRange.end) {
      query = query.lte('created_at', conditions.dateRange.end)
    }
  }
  
  // Apply keyword search
  if (conditions.keywords?.length) {
    const keywordConditions = conditions.keywords
      .map((keyword: string) => 
        `person_name.ilike.%${keyword}%,role.ilike.%${keyword}%,notes.ilike.%${keyword}%`
      )
      .join(',')
    query = query.or(keywordConditions)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    console.error('Safeguarding search error:', error)
    return []
  }
  
  return data.map((record: any) => ({
    id: record.id,
    type: 'safeguarding' as const,
    title: record.person_name,
    description: `${record.role || 'Staff'} - DBS: ${record.dbs_certificate_number || 'Pending'}`,
    date: record.issue_date,
    status: record.check_status,
    metadata: record,
    relevance: calculateRelevance(record, conditions)
  }))
}

/**
 * Search income records
 */
async function searchIncomeRecords(
  supabase: any,
  organizationId: string,
  conditions: Record<string, any>
): Promise<SearchResult[]> {
  let query = supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    
  // Apply person name filter
  if (conditions.personNames?.length) {
    const nameConditions = conditions.personNames
      .map((name: string) => `donor_name.ilike.%${name}%`)
      .join(',')
    query = query.or(nameConditions)
  }
  
  // Apply amount filter
  if (conditions.amounts) {
    if (conditions.amounts.min) {
      query = query.gte('amount', conditions.amounts.min)
    }
    if (conditions.amounts.max) {
      query = query.lte('amount', conditions.amounts.max)
    }
  }
  
  // Apply date range filter
  if (conditions.dateRange) {
    if (conditions.dateRange.start) {
      query = query.gte('date_received', conditions.dateRange.start)
    }
    if (conditions.dateRange.end) {
      query = query.lte('date_received', conditions.dateRange.end)
    }
  }
  
  // Apply keyword search
  if (conditions.keywords?.length) {
    const keywordConditions = conditions.keywords
      .map((keyword: string) => 
        `donor_name.ilike.%${keyword}%,source_type.ilike.%${keyword}%,reference.ilike.%${keyword}%,notes.ilike.%${keyword}%`
      )
      .join(',')
    query = query.or(keywordConditions)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    console.error('Income search error:', error)
    return []
  }
  
  return data.map((record: any) => ({
    id: record.id,
    type: 'income' as const,
    title: record.donor_name || 'Anonymous Donor',
    description: `${record.source_type} - ${record.reference || 'No reference'}`,
    date: record.date_received,
    amount: record.amount,
    metadata: record,
    relevance: calculateRelevance(record, conditions)
  }))
}

/**
 * Search overseas activities
 */
async function searchOverseasActivities(
  supabase: any,
  organizationId: string,
  conditions: Record<string, any>
): Promise<SearchResult[]> {
  let query = supabase
    .from('overseas_activities')
    .select(`
      *,
      countries (
        code,
        name
      )
    `)
    .eq('organization_id', organizationId)
    
  // Apply country filter
  if (conditions.countries?.length) {
    // First get country codes for the country names
    const { data: countryCodes } = await supabase
      .from('countries')
      .select('code, name')
      .in('name', conditions.countries)
      
    if (countryCodes?.length) {
      query = query.in('country_code', countryCodes.map(c => c.code))
    }
  }
  
  // Apply amount filter
  if (conditions.amounts) {
    if (conditions.amounts.min) {
      query = query.gte('amount_gbp', conditions.amounts.min)
    }
    if (conditions.amounts.max) {
      query = query.lte('amount_gbp', conditions.amounts.max)
    }
  }
  
  // Apply date range filter
  if (conditions.dateRange) {
    if (conditions.dateRange.start) {
      query = query.gte('transfer_date', conditions.dateRange.start)
    }
    if (conditions.dateRange.end) {
      query = query.lte('transfer_date', conditions.dateRange.end)
    }
  }
  
  // Apply keyword search
  if (conditions.keywords?.length) {
    const keywordConditions = conditions.keywords
      .map((keyword: string) => 
        `recipient_name.ilike.%${keyword}%,activity_type.ilike.%${keyword}%,purpose.ilike.%${keyword}%,transfer_reference.ilike.%${keyword}%`
      )
      .join(',')
    query = query.or(keywordConditions)
  }
  
  const { data, error } = await query
  
  if (error || !data) {
    console.error('Overseas search error:', error)
    return []
  }
  
  return data.map((record: any) => ({
    id: record.id,
    type: 'overseas' as const,
    title: record.recipient_name,
    description: `${record.activity_type} in ${record.countries?.name || record.country_code}`,
    date: record.transfer_date,
    amount: record.amount_gbp,
    metadata: {
      ...record,
      country_name: record.countries?.name
    },
    relevance: calculateRelevance(record, conditions)
  }))
}

/**
 * Calculate relevance score for a search result
 */
function calculateRelevance(record: any, conditions: Record<string, any>): number {
  let score = 0.5 // Base relevance
  
  // Boost for exact matches
  if (conditions.personNames?.length) {
    const recordName = (record.person_name || record.donor_name || '').toLowerCase()
    for (const searchName of conditions.personNames) {
      if (recordName === searchName.toLowerCase()) {
        score += 0.3
      } else if (recordName.includes(searchName.toLowerCase())) {
        score += 0.1
      }
    }
  }
  
  // Boost for recent records
  const recordDate = new Date(record.created_at || record.date_received || record.transfer_date)
  const daysSinceCreated = (Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSinceCreated < 7) {
    score += 0.2
  } else if (daysSinceCreated < 30) {
    score += 0.1
  }
  
  // Boost for keyword matches
  if (conditions.keywords?.length) {
    const recordText = JSON.stringify(record).toLowerCase()
    let keywordMatches = 0
    for (const keyword of conditions.keywords) {
      if (recordText.includes(keyword.toLowerCase())) {
        keywordMatches++
      }
    }
    score += Math.min(0.3, keywordMatches * 0.1)
  }
  
  return Math.min(1, score)
}