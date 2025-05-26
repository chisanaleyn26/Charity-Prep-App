'use server'

import { openrouter } from '@/lib/ai/openrouter'
import { z } from 'zod'

// Search intent types
export type SearchIntent = 
  | 'safeguarding_check'
  | 'income_analysis' 
  | 'overseas_activity'
  | 'compliance_status'
  | 'financial_summary'
  | 'person_lookup'
  | 'date_range_query'
  | 'general'

// Parsed search query structure
export interface ParsedSearchQuery {
  intent: SearchIntent
  entities: {
    personNames?: string[]
    dateRange?: {
      start?: string
      end?: string
    }
    amounts?: {
      min?: number
      max?: number
    }
    countries?: string[]
    documentTypes?: string[]
    statuses?: string[]
    keywords?: string[]
  }
  filters: {
    table?: string
    timeframe?: 'today' | 'week' | 'month' | 'quarter' | 'year' | 'all'
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }
  originalQuery: string
  confidence: number
}

// Schema for AI response
const searchParseSchema = z.object({
  intent: z.enum([
    'safeguarding_check',
    'income_analysis',
    'overseas_activity', 
    'compliance_status',
    'financial_summary',
    'person_lookup',
    'date_range_query',
    'general'
  ]),
  entities: z.object({
    personNames: z.array(z.string()).optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    amounts: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    countries: z.array(z.string()).optional(),
    documentTypes: z.array(z.string()).optional(),
    statuses: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional()
  }),
  filters: z.object({
    table: z.string().optional(),
    timeframe: z.enum(['today', 'week', 'month', 'quarter', 'year', 'all']).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional()
  }),
  confidence: z.number().min(0).max(1)
})

/**
 * Parse natural language search query into structured format
 */
export async function parseSearchQuery(query: string): Promise<ParsedSearchQuery> {
  const prompt = `You are a search query parser for a charity compliance system. Parse the following natural language query into a structured format.

The system tracks:
- Safeguarding records (DBS checks, training, roles)
- Income records (donations, grants, fundraising)
- Overseas activities (international transfers and projects)
- Compliance documents and reports

Query: "${query}"

Analyze the query and extract:
1. Intent - what type of search is this?
2. Entities - names, dates, amounts, countries, etc.
3. Filters - which table to search, time range, sorting

Respond with a JSON object matching this schema:
${JSON.stringify(searchParseSchema.shape, null, 2)}

Examples:
- "Show me all DBS checks expiring this month" -> intent: safeguarding_check, timeframe: month
- "Find donations over £1000 from John Smith" -> intent: income_analysis, personNames: ["John Smith"], amounts: {min: 1000}
- "List overseas activities in Kenya last year" -> intent: overseas_activity, countries: ["Kenya"], timeframe: year`

  try {
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: 'You are a search query parser. Always respond with valid JSON only, no markdown or explanations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)
    const validated = searchParseSchema.parse(parsed)

    return {
      ...validated,
      originalQuery: query
    }
  } catch (error) {
    console.error('Failed to parse search query:', error)
    
    // Fallback to basic keyword search
    return {
      intent: 'general',
      entities: {
        keywords: query.toLowerCase().split(/\s+/).filter(word => word.length > 2)
      },
      filters: {
        timeframe: 'all'
      },
      originalQuery: query,
      confidence: 0.3
    }
  }
}

/**
 * Convert parsed query to SQL conditions
 */
export function buildSearchConditions(parsed: ParsedSearchQuery): {
  tables: string[]
  conditions: Record<string, any>
  orderBy?: { column: string; direction: 'asc' | 'desc' }
} {
  const result: {
    tables: string[]
    conditions: Record<string, any>
    orderBy?: { column: string; direction: 'asc' | 'desc' }
  } = {
    tables: [],
    conditions: {}
  }

  // Determine which tables to search based on intent
  switch (parsed.intent) {
    case 'safeguarding_check':
      result.tables = ['safeguarding_records']
      break
    case 'income_analysis':
    case 'financial_summary':
      result.tables = ['income_records']
      break
    case 'overseas_activity':
      result.tables = ['overseas_activities']
      break
    case 'person_lookup':
      result.tables = ['safeguarding_records', 'income_records']
      break
    default:
      result.tables = ['safeguarding_records', 'income_records', 'overseas_activities']
  }

  // Override with specific table if provided
  if (parsed.filters.table) {
    result.tables = [parsed.filters.table]
  }

  // Build conditions based on entities
  if (parsed.entities.personNames?.length) {
    result.conditions.personNames = parsed.entities.personNames
  }

  if (parsed.entities.dateRange) {
    result.conditions.dateRange = parsed.entities.dateRange
  }

  if (parsed.entities.amounts) {
    result.conditions.amounts = parsed.entities.amounts
  }

  if (parsed.entities.countries?.length) {
    result.conditions.countries = parsed.entities.countries
  }

  if (parsed.entities.statuses?.length) {
    result.conditions.statuses = parsed.entities.statuses
  }

  if (parsed.entities.keywords?.length) {
    result.conditions.keywords = parsed.entities.keywords
  }

  // Apply timeframe filter
  if (parsed.filters.timeframe && parsed.filters.timeframe !== 'all') {
    const now = new Date()
    let startDate: Date

    switch (parsed.filters.timeframe) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
    }

    result.conditions.dateRange = {
      start: startDate!.toISOString(),
      ...result.conditions.dateRange
    }
  }

  // Set ordering
  if (parsed.filters.sortBy) {
    result.orderBy = {
      column: parsed.filters.sortBy,
      direction: parsed.filters.sortOrder || 'desc'
    }
  }

  return result
}

/**
 * Generate a human-readable description of the search
 */
export function describeSearch(parsed: ParsedSearchQuery): string {
  const parts: string[] = []

  // Intent description
  switch (parsed.intent) {
    case 'safeguarding_check':
      parts.push('Searching safeguarding records')
      break
    case 'income_analysis':
      parts.push('Analyzing income records')
      break
    case 'overseas_activity':
      parts.push('Finding overseas activities')
      break
    case 'compliance_status':
      parts.push('Checking compliance status')
      break
    case 'financial_summary':
      parts.push('Generating financial summary')
      break
    case 'person_lookup':
      parts.push('Looking up person records')
      break
    case 'date_range_query':
      parts.push('Searching by date range')
      break
    default:
      parts.push('Searching all records')
  }

  // Add entity descriptions
  if (parsed.entities.personNames?.length) {
    parts.push(`for ${parsed.entities.personNames.join(', ')}`)
  }

  if (parsed.entities.dateRange) {
    if (parsed.entities.dateRange.start && parsed.entities.dateRange.end) {
      parts.push(`between ${new Date(parsed.entities.dateRange.start).toLocaleDateString()} and ${new Date(parsed.entities.dateRange.end).toLocaleDateString()}`)
    } else if (parsed.entities.dateRange.start) {
      parts.push(`after ${new Date(parsed.entities.dateRange.start).toLocaleDateString()}`)
    } else if (parsed.entities.dateRange.end) {
      parts.push(`before ${new Date(parsed.entities.dateRange.end).toLocaleDateString()}`)
    }
  }

  if (parsed.entities.amounts) {
    if (parsed.entities.amounts.min && parsed.entities.amounts.max) {
      parts.push(`between £${parsed.entities.amounts.min} and £${parsed.entities.amounts.max}`)
    } else if (parsed.entities.amounts.min) {
      parts.push(`over £${parsed.entities.amounts.min}`)
    } else if (parsed.entities.amounts.max) {
      parts.push(`under £${parsed.entities.amounts.max}`)
    }
  }

  if (parsed.entities.countries?.length) {
    parts.push(`in ${parsed.entities.countries.join(', ')}`)
  }

  // Add timeframe
  if (parsed.filters.timeframe && parsed.filters.timeframe !== 'all') {
    parts.push(`from the last ${parsed.filters.timeframe}`)
  }

  return parts.join(' ')
}