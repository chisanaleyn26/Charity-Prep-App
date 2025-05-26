'use server'

import { AIService } from './service'
import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  type: 'safeguarding' | 'overseas' | 'income' | 'document'
  id: string
  title: string
  description: string
  score: number
  data: any
}

/**
 * Natural language search across all compliance data
 */
export async function searchCompliance(
  query: string,
  organizationId: string,
  options?: {
    types?: Array<'safeguarding' | 'overseas' | 'income' | 'document'>
    limit?: number
  }
): Promise<{ results?: SearchResult[]; error?: string }> {
  const ai = AIService.getInstance()
  const supabase = await createClient()
  
  // First, understand the query intent
  const intentPrompt = `Analyze this search query and extract the intent:
Query: "${query}"

Extract:
1. What type of records they're looking for
2. Any specific filters (dates, amounts, names, etc.)
3. The main search terms

Return JSON:
{
  "recordTypes": ["safeguarding", "overseas", "income"],
  "filters": {
    "dateRange": { "start": "ISO date", "end": "ISO date" },
    "amountRange": { "min": 0, "max": 0 },
    "names": ["names mentioned"],
    "countries": ["country codes"],
    "status": ["active", "expired", etc]
  },
  "searchTerms": ["main", "search", "terms"],
  "intent": "brief description"
}`

  const intentResponse = await ai.complete<any>(intentPrompt, {
    jsonMode: true,
    temperature: 0.1
  })
  
  if (!intentResponse.success || !intentResponse.data) {
    // Fallback to basic text search
    return basicTextSearch(query, organizationId, options)
  }
  
  const intent = intentResponse.data
  const results: SearchResult[] = []
  
  // Search each record type based on intent
  const typesToSearch = options?.types || intent.recordTypes || ['safeguarding', 'overseas', 'income']
  
  // Safeguarding search
  if (typesToSearch.includes('safeguarding')) {
    const safeguardingResults = await searchSafeguarding(
      query,
      organizationId,
      intent.filters,
      intent.searchTerms
    )
    results.push(...safeguardingResults)
  }
  
  // Overseas search
  if (typesToSearch.includes('overseas')) {
    const overseasResults = await searchOverseas(
      query,
      organizationId,
      intent.filters,
      intent.searchTerms
    )
    results.push(...overseasResults)
  }
  
  // Income search
  if (typesToSearch.includes('income')) {
    const incomeResults = await searchIncome(
      query,
      organizationId,
      intent.filters,
      intent.searchTerms
    )
    results.push(...incomeResults)
  }
  
  // Sort by relevance score
  results.sort((a, b) => b.score - a.score)
  
  // Limit results
  const limit = options?.limit || 20
  
  return { results: results.slice(0, limit) }
}

/**
 * Search safeguarding records
 */
async function searchSafeguarding(
  query: string,
  organizationId: string,
  filters: any,
  searchTerms: string[]
): Promise<SearchResult[]> {
  const supabase = await createClient()
  
  let dbQuery = supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  // Apply filters
  if (filters?.names?.length > 0) {
    dbQuery = dbQuery.or(filters.names.map((name: string) => `person_name.ilike.%${name}%`).join(','))
  }
  
  if (filters?.status?.includes('expired')) {
    dbQuery = dbQuery.lt('expiry_date', new Date().toISOString())
  } else if (filters?.status?.includes('active')) {
    dbQuery = dbQuery.gt('expiry_date', new Date().toISOString())
  }
  
  // Text search
  if (searchTerms.length > 0) {
    const searchConditions = searchTerms.map(term => 
      `person_name.ilike.%${term}%,role_title.ilike.%${term}%,notes.ilike.%${term}%`
    ).join(',')
    dbQuery = dbQuery.or(searchConditions)
  }
  
  const { data: records, error } = await dbQuery
  
  if (error || !records) return []
  
  return records.map(record => ({
    type: 'safeguarding' as const,
    id: record.id,
    title: `${record.person_name} - ${record.role_title}`,
    description: `DBS ${record.dbs_check_type} expires ${new Date(record.expiry_date).toLocaleDateString()}`,
    score: calculateRelevanceScore(query, [record.person_name, record.role_title, record.notes].join(' ')),
    data: record
  }))
}

/**
 * Search overseas activities
 */
async function searchOverseas(
  query: string,
  organizationId: string,
  filters: any,
  searchTerms: string[]
): Promise<SearchResult[]> {
  const supabase = await createClient()
  
  let dbQuery = supabase
    .from('overseas_activities')
    .select('*, country:countries(*)')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  // Apply filters
  if (filters?.countries?.length > 0) {
    dbQuery = dbQuery.in('country_code', filters.countries)
  }
  
  if (filters?.amountRange) {
    if (filters.amountRange.min) {
      dbQuery = dbQuery.gte('amount_gbp', filters.amountRange.min)
    }
    if (filters.amountRange.max) {
      dbQuery = dbQuery.lte('amount_gbp', filters.amountRange.max)
    }
  }
  
  if (filters?.dateRange) {
    if (filters.dateRange.start) {
      dbQuery = dbQuery.gte('transfer_date', filters.dateRange.start)
    }
    if (filters.dateRange.end) {
      dbQuery = dbQuery.lte('transfer_date', filters.dateRange.end)
    }
  }
  
  // Text search
  if (searchTerms.length > 0) {
    const searchConditions = searchTerms.map(term => 
      `activity_name.ilike.%${term}%,description.ilike.%${term}%`
    ).join(',')
    dbQuery = dbQuery.or(searchConditions)
  }
  
  const { data: activities, error } = await dbQuery
  
  if (error || !activities) return []
  
  return activities.map(activity => ({
    type: 'overseas' as const,
    id: activity.id,
    title: activity.activity_name,
    description: `${activity.country?.name} - £${activity.amount_gbp.toLocaleString()} on ${new Date(activity.transfer_date).toLocaleDateString()}`,
    score: calculateRelevanceScore(query, [activity.activity_name, activity.description, activity.country?.name].join(' ')),
    data: activity
  }))
}

/**
 * Search income records
 */
async function searchIncome(
  query: string,
  organizationId: string,
  filters: any,
  searchTerms: string[]
): Promise<SearchResult[]> {
  const supabase = await createClient()
  
  let dbQuery = supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)
  
  // Apply filters
  if (filters?.amountRange) {
    if (filters.amountRange.min) {
      dbQuery = dbQuery.gte('amount', filters.amountRange.min)
    }
    if (filters.amountRange.max) {
      dbQuery = dbQuery.lte('amount', filters.amountRange.max)
    }
  }
  
  if (filters?.dateRange) {
    if (filters.dateRange.start) {
      dbQuery = dbQuery.gte('date_received', filters.dateRange.start)
    }
    if (filters.dateRange.end) {
      dbQuery = dbQuery.lte('date_received', filters.dateRange.end)
    }
  }
  
  // Text search
  if (searchTerms.length > 0) {
    const searchConditions = searchTerms.map(term => 
      `donor_name.ilike.%${term}%,campaign_name.ilike.%${term}%,notes.ilike.%${term}%`
    ).join(',')
    dbQuery = dbQuery.or(searchConditions)
  }
  
  const { data: records, error } = await dbQuery
  
  if (error || !records) return []
  
  return records.map(record => ({
    type: 'income' as const,
    id: record.id,
    title: record.donor_name || 'Anonymous donation',
    description: `£${record.amount.toLocaleString()} - ${record.source} on ${new Date(record.date_received).toLocaleDateString()}`,
    score: calculateRelevanceScore(query, [record.donor_name, record.campaign_name, record.notes].join(' ')),
    data: record
  }))
}

/**
 * Basic text search fallback
 */
async function basicTextSearch(
  query: string,
  organizationId: string,
  options?: any
): Promise<{ results?: SearchResult[]; error?: string }> {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2)
  const results: SearchResult[] = []
  
  // Search all types with basic text matching
  const [safeguarding, overseas, income] = await Promise.all([
    searchSafeguarding(query, organizationId, {}, searchTerms),
    searchOverseas(query, organizationId, {}, searchTerms),
    searchIncome(query, organizationId, {}, searchTerms)
  ])
  
  results.push(...safeguarding, ...overseas, ...income)
  results.sort((a, b) => b.score - a.score)
  
  return { results: results.slice(0, options?.limit || 20) }
}

/**
 * Calculate relevance score
 */
function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  // Exact match
  if (textLower.includes(queryLower)) {
    return 1.0
  }
  
  // Word matches
  const queryWords = queryLower.split(' ')
  const matchedWords = queryWords.filter(word => textLower.includes(word))
  
  return matchedWords.length / queryWords.length
}