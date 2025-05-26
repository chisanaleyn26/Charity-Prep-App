'use server'

import { openrouter } from '@/lib/ai/openrouter'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export type ReportType = 
  | 'annual_report'
  | 'safeguarding_summary'
  | 'financial_overview'
  | 'overseas_impact'
  | 'quarterly_update'
  | 'trustee_report'

export interface ReportSection {
  title: string
  content: string
  highlights?: string[]
  concerns?: string[]
  recommendations?: string[]
}

export interface GeneratedReport {
  type: ReportType
  title: string
  executiveSummary: string
  sections: ReportSection[]
  keyMetrics: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'stable'
    commentary?: string
  }[]
  conclusion: string
  generatedAt: string
  dataRange: {
    start: string
    end: string
  }
}

// Schema for AI response
const reportSectionSchema = z.object({
  title: z.string(),
  content: z.string(),
  highlights: z.array(z.string()).optional(),
  concerns: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional()
})

const reportSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  sections: z.array(reportSectionSchema),
  keyMetrics: z.array(z.object({
    label: z.string(),
    value: z.union([z.string(), z.number()]),
    trend: z.enum(['up', 'down', 'stable']).optional(),
    commentary: z.string().optional()
  })),
  conclusion: z.string()
})

/**
 * Generate a narrative report based on compliance data
 */
export async function generateReport(
  type: ReportType,
  startDate: Date,
  endDate: Date,
  options?: {
    includeRecommendations?: boolean
    tone?: 'formal' | 'conversational'
    length?: 'brief' | 'detailed'
  }
): Promise<GeneratedReport> {
  const supabase = await createClient()
  
  // Get current user and organization
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  
  const { data: membership } = await supabase
    .from('organization_members')
    .select(`
      organization_id,
      organizations (
        name,
        charity_number,
        financial_year_end
      )
    `)
    .eq('user_id', user.id)
    .single()
    
  if (!membership) {
    throw new Error('No organization found')
  }

  // Fetch relevant data based on report type
  const data = await fetchReportData(
    supabase,
    membership.organization_id,
    type,
    startDate,
    endDate
  )

  // Generate narrative using AI
  const narrative = await generateNarrative(
    type,
    data,
    {
      organizationName: membership.organizations.name,
      charityNumber: membership.organizations.charity_number,
      ...options
    }
  )

  return {
    type,
    ...narrative,
    generatedAt: new Date().toISOString(),
    dataRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  }
}

/**
 * Fetch data for report generation
 */
async function fetchReportData(
  supabase: any,
  organizationId: string,
  type: ReportType,
  startDate: Date,
  endDate: Date
): Promise<any> {
  const data: any = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    }
  }

  switch (type) {
    case 'safeguarding_summary':
      // Fetch safeguarding records
      const { data: safeguarding } = await supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
      
      data.safeguarding = {
        total: safeguarding?.length || 0,
        byCheckType: groupBy(safeguarding || [], 'check_type'),
        withChildren: safeguarding?.filter((r: any) => r.works_with_children).length || 0,
        withVulnerableAdults: safeguarding?.filter((r: any) => r.works_with_vulnerable_adults).length || 0,
        trainingCompleted: safeguarding?.filter((r: any) => r.training_completed).length || 0,
        expiringSoon: safeguarding?.filter((r: any) => {
          if (!r.expiry_date) return false
          const expiry = new Date(r.expiry_date)
          const threeMonths = new Date()
          threeMonths.setMonth(threeMonths.getMonth() + 3)
          return expiry <= threeMonths
        }).length || 0
      }
      break

    case 'financial_overview':
      // Fetch income records
      const { data: income } = await supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', organizationId)
        .gte('date_received', startDate.toISOString())
        .lte('date_received', endDate.toISOString())
      
      data.income = {
        total: income?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0,
        count: income?.length || 0,
        bySource: groupBy(income || [], 'source_type'),
        largestDonation: income?.reduce((max: any, r: any) => 
          r.amount > (max?.amount || 0) ? r : max, null
        ),
        giftAidEligible: income?.filter((r: any) => r.gift_aid_eligible).reduce(
          (sum: number, r: any) => sum + r.amount, 0
        ) || 0,
        restricted: income?.filter((r: any) => r.restricted_funds).reduce(
          (sum: number, r: any) => sum + r.amount, 0
        ) || 0
      }
      break

    case 'overseas_impact':
      // Fetch overseas activities
      const { data: overseas } = await supabase
        .from('overseas_activities')
        .select(`
          *,
          countries (
            name,
            region
          )
        `)
        .eq('organization_id', organizationId)
        .gte('transfer_date', startDate.toISOString())
        .lte('transfer_date', endDate.toISOString())
      
      data.overseas = {
        total: overseas?.reduce((sum: number, r: any) => sum + r.amount_gbp, 0) || 0,
        count: overseas?.length || 0,
        byCountry: groupBy(overseas || [], 'country_code'),
        byActivity: groupBy(overseas || [], 'activity_type'),
        totalBeneficiaries: overseas?.reduce(
          (sum: number, r: any) => sum + (r.beneficiaries_count || 0), 0
        ) || 0,
        countries: [...new Set(overseas?.map((r: any) => r.countries?.name) || [])]
      }
      break

    default:
      // For annual report and others, fetch all data
      const [safeguardingAll, incomeAll, overseasAll] = await Promise.all([
        supabase
          .from('safeguarding_records')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString()),
        supabase
          .from('income_records')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('date_received', startDate.toISOString())
          .lte('date_received', endDate.toISOString()),
        supabase
          .from('overseas_activities')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('transfer_date', startDate.toISOString())
          .lte('transfer_date', endDate.toISOString())
      ])

      data.safeguarding = {
        total: safeguardingAll.data?.length || 0
      }
      data.income = {
        total: incomeAll.data?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0,
        count: incomeAll.data?.length || 0
      }
      data.overseas = {
        total: overseasAll.data?.reduce((sum: number, r: any) => sum + r.amount_gbp, 0) || 0,
        count: overseasAll.data?.length || 0
      }
  }

  return data
}

/**
 * Generate narrative using AI
 */
async function generateNarrative(
  type: ReportType,
  data: any,
  options: any
): Promise<Omit<GeneratedReport, 'type' | 'generatedAt' | 'dataRange'>> {
  const tone = options.tone === 'conversational' ? 
    'conversational and accessible' : 
    'professional and formal'
    
  const length = options.length === 'brief' ? 
    'concise (2-3 paragraphs per section)' : 
    'comprehensive (4-5 paragraphs per section)'

  let prompt = `Generate a ${type.replace(/_/g, ' ')} for ${options.organizationName} (Charity No: ${options.charityNumber}).

Report period: ${new Date(data.period.start).toLocaleDateString()} to ${new Date(data.period.end).toLocaleDateString()}

Write in a ${tone} tone and keep the content ${length}.
${options.includeRecommendations ? 'Include actionable recommendations in each section.' : ''}

Data available:
${JSON.stringify(data, null, 2)}

Generate a compelling narrative that:
1. Highlights key achievements and positive trends
2. Identifies areas of concern or risk
3. Provides context and analysis, not just numbers
4. ${type === 'trustee_report' ? 'Focuses on governance and strategic matters' : 'Tells the story behind the data'}
5. Uses clear, accessible language

Format the response as JSON matching this structure:
${JSON.stringify(reportSchema.shape, null, 2)}`

  try {
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages: [
        {
          role: 'system',
          content: 'You are an expert charity report writer with deep knowledge of UK charity regulations and best practices. Generate insightful, well-structured reports that tell a compelling story while maintaining accuracy and compliance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    const parsed = JSON.parse(content)
    return reportSchema.parse(parsed)
  } catch (error) {
    console.error('Failed to generate narrative:', error)
    
    // Fallback to a basic report
    return {
      title: `${type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} - ${options.organizationName}`,
      executiveSummary: 'Report generation encountered an error. Please try again.',
      sections: [{
        title: 'Data Summary',
        content: 'Unable to generate narrative content at this time.'
      }],
      keyMetrics: [],
      conclusion: 'Please regenerate this report.'
    }
  }
}

/**
 * Helper function to group array by key
 */
function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const group = String(item[key])
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {} as Record<string, T[]>)
}

/**
 * Get available report types for an organization
 */
export async function getAvailableReports(): Promise<{
  type: ReportType
  name: string
  description: string
  icon: string
}[]> {
  return [
    {
      type: 'annual_report',
      name: 'Annual Report',
      description: 'Comprehensive yearly overview for trustees and regulators',
      icon: 'FileText'
    },
    {
      type: 'safeguarding_summary',
      name: 'Safeguarding Summary',
      description: 'Overview of safeguarding compliance and training status',
      icon: 'Shield'
    },
    {
      type: 'financial_overview',
      name: 'Financial Overview',
      description: 'Income analysis with donor insights and trends',
      icon: 'TrendingUp'
    },
    {
      type: 'overseas_impact',
      name: 'Overseas Impact Report',
      description: 'Summary of international activities and beneficiary reach',
      icon: 'Globe'
    },
    {
      type: 'quarterly_update',
      name: 'Quarterly Update',
      description: 'Three-month progress report for stakeholders',
      icon: 'Calendar'
    },
    {
      type: 'trustee_report',
      name: 'Trustee Report',
      description: 'Governance-focused report for board meetings',
      icon: 'Users'
    }
  ]
}