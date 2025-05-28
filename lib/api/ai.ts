'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
// import { 
//   mapCSVColumns, 
//   getModuleSchema 
// } from '@/lib/ai/csv-mapper'
// import { 
//   extractDocumentData,
//   extractDBSCertificate,
//   extractReceipt 
// } from '@/lib/ai/ocr-extraction'
// import { 
//   processComplianceEmail,
//   parseEmailWebhook,
//   type EmailData
// } from '@/lib/ai/email-processor'
// import { searchCompliance } from '@/lib/ai/search'
// import { 
//   generateBoardNarrative,
//   generateAnnualReturnNarratives,
//   generateActionSummary,
//   generateRiskAssessment,
//   type NarrativeOptions
// } from '@/lib/ai/narrative-generator'
// import { 
//   answerComplianceQuestion,
//   getSuggestedQuestions,
//   searchRegulations,
//   generateComplianceChecklist
// } from '@/lib/ai/compliance-qa'

// Input schemas
const csvMappingSchema = z.object({
  headers: z.array(z.string()),
  moduleType: z.enum(['safeguarding', 'overseas', 'income'])
})

const documentExtractionSchema = z.object({
  imageBase64: z.string(),
  documentHint: z.string().optional()
})

const searchSchema = z.object({
  query: z.string().min(1),
  types: z.array(z.enum(['safeguarding', 'overseas', 'income', 'document'])).optional(),
  limit: z.number().optional()
})

const narrativeSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  options: z.object({
    tone: z.enum(['formal', 'friendly', 'concise']).optional(),
    includeRecommendations: z.boolean().optional(),
    highlightRisks: z.boolean().optional(),
    audienceLevel: z.enum(['board', 'operational', 'public']).optional()
  }).optional()
})

const qaSchema = z.object({
  question: z.string().min(1),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
})

/**
 * Map CSV columns using AI
 */
export async function aiMapCSVColumns(
  organizationId: string,
  input: unknown
) {
  const validated = csvMappingSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // const schema = getModuleSchema(validated.data.moduleType)
  // const result = await mapCSVColumns(
  //   validated.data.headers,
  //   schema,
  //   validated.data.moduleType
  // )

  return { mappings: {}, confidence: 0, suggestions: [] }
}

/**
 * Extract data from document image
 */
export async function aiExtractDocument(
  organizationId: string,
  input: unknown
) {
  const validated = documentExtractionSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check organization access
  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { error: 'Access denied' }
  }

  // const result = await extractDocumentData(
  //   validated.data.imageBase64,
  //   validated.data.documentHint
  // )

  return { data: {}, confidence: 0, suggestions: [] }
}

/**
 * Process email webhook
 */
export async function aiProcessEmailWebhook(
  provider: string,
  payload: any
) {
  return { error: 'Email processing temporarily unavailable' }
  
  // // Parse webhook based on provider
  // const emailData = parseEmailWebhook(provider, payload)
  // if (!emailData) {
  //   return { error: 'Unsupported email provider' }
  // }

  // // Extract organization ID from email address
  // // Expected format: data-{orgId}@charityprep.uk
  // const match = emailData.to.match(/data-([a-f0-9-]+)@/)
  // if (!match) {
  //   return { error: 'Invalid recipient address' }
  // }

  // const organizationId = match[1]
  
  // // Verify organization exists
  // const supabase = await createClient()
  // const { data: org } = await supabase
  //   .from('organizations')
  //   .select('id')
  //   .eq('id', organizationId)
  //   .single()

  // if (!org) {
  //   return { error: 'Organization not found' }
  // }

  // // Process the email
  // const result = await processComplianceEmail(emailData, organizationId)
  
  // return result
}

/**
 * Search compliance data with natural language
 */
export async function aiSearchCompliance(
  organizationId: string,
  input: unknown
) {
  const validated = searchSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid search query' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify access
  const { data: member } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (!member) {
    return { error: 'Access denied' }
  }

  // const result = await searchCompliance(
  //   validated.data.query,
  //   organizationId,
  //   {
  //     types: validated.data.types,
  //     limit: validated.data.limit
  //   }
  // )

  return { results: [], totalCount: 0 }
}

/**
 * Generate board report narrative
 */
export async function aiGenerateBoardNarrative(
  organizationId: string,
  input: unknown
) {
  const validated = narrativeSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get organization data
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single()

  if (!org) {
    return { error: 'Organization not found' }
  }

  // Get compliance scores
  const { getDashboardData } = await import('./dashboard')
  const dashboardResult = await getDashboardData(organizationId)
  
  if ('error' in dashboardResult) {
    return { error: dashboardResult.error }
  }

  // Get detailed compliance breakdown
  const { calculateComplianceScore } = await import('@/lib/compliance/calculator')
  const { data: safeguarding } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const { data: overseas } = await supabase
    .from('overseas_activities')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const { data: income } = await supabase
    .from('income_records')
    .select('*')
    .eq('organization_id', organizationId)
    .is('deleted_at', null)

  const { data: countries } = await supabase
    .from('countries')
    .select('*')

  const scores = calculateComplianceScore(
    safeguarding || [],
    overseas || [],
    income || [],
    countries || []
  )

  // const result = await generateBoardNarrative(
  //   org.name,
  //   scores,
  //   {
  //     start: new Date(validated.data.period.start),
  //     end: new Date(validated.data.period.end)
  //   },
  //   validated.data.options
  // )

  return { narrative: "Board narrative generation temporarily unavailable", recommendations: [] }
}

/**
 * Answer compliance questions
 */
export async function aiAnswerCompliance(
  organizationId: string,
  input: unknown
) {
  const validated = qaSchema.safeParse(input)
  if (!validated.success) {
    return { error: 'Invalid question' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // const result = await answerComplianceQuestion(
  //   validated.data.question,
  //   {
  //     organizationId,
  //     userId: user.id,
  //     conversationHistory: validated.data.conversationHistory
  //   }
  // )

  return { answer: "AI compliance Q&A temporarily unavailable", sources: [] }
}

/**
 * Get AI suggested questions
 */
export async function aiGetSuggestedQuestions(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // const questions = await getSuggestedQuestions(organizationId)
  
  return { questions: [] }
}

/**
 * Generate compliance checklist
 */
export async function aiGenerateChecklist(
  organizationId: string,
  topic: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Get organization context
  const { data: org } = await supabase
    .from('organizations')
    .select('income_band, charity_type')
    .eq('id', organizationId)
    .single()

  // const result = await generateComplianceChecklist(topic, {
  //   income_band: org?.income_band,
  //   charity_type: org?.charity_type
  // })

  return { checklist: [], description: "Checklist generation temporarily unavailable" }
}