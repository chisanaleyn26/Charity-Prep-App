/**
 * Advanced AI Assistant Service
 * Handles OpenRouter integration with sophisticated rate limiting, caching, and error handling
 */

import { createClient } from '@/lib/supabase/server'
import { getOpenRouter, callOpenRouter, AI_MODELS } from '@/lib/ai/openrouter'
import type { 
  ChatContext, 
  ChatMessage, 
  ChatMessageMetadata, 
  ComplianceSource,
  ChatError,
  ChatErrorType 
} from '../types/chat'
import { createHash } from 'crypto'

// Enhanced configuration for the AI assistant
export const AI_CONFIG = {
  // Model settings
  DEFAULT_MODEL: AI_MODELS.CHAT,
  MAX_TOKENS: 1200,
  TEMPERATURE: 0.3,
  
  // Rate limiting and retries
  MAX_REQUESTS_PER_MINUTE: 20,
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY: 1000, // ms
  EXPONENTIAL_BACKOFF_MULTIPLIER: 2,
  
  // Caching
  CACHE_TTL_HOURS: 24,
  MAX_HISTORY_CONTEXT: 6, // messages
  
  // Quality thresholds
  MIN_RESPONSE_LENGTH: 50,
  MAX_RESPONSE_LENGTH: 2000,
} as const

// Rate limiting store (in-memory for now, could be Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Compliance knowledge base with enhanced detail
const COMPLIANCE_KNOWLEDGE = {
  dbs_checks: {
    requirements: `DBS checks are required for:
• Anyone working with children under 18 in regulated activity
• Anyone working with vulnerable adults in regulated activity
• Trustees if they have regular, direct contact with beneficiaries
• Staff and volunteers in regulated activities (teaching, supervising, training)
• Anyone with access to sensitive personal data of vulnerable groups`,
    
    types: {
      basic: 'Shows unspent convictions only - suitable for basic roles',
      standard: 'Shows spent and unspent convictions, cautions, reprimands, warnings - for roles involving vulnerable groups',
      enhanced: 'Standard check plus local police intelligence - for senior positions',
      enhanced_barred: 'Enhanced check plus barred list check - mandatory for regulated activity with vulnerable groups'
    },
    
    renewal: 'DBS checks don\'t legally expire, but best practice is renewal every 3 years. Some funding bodies require annual renewal.',
    
    process: `DBS application process:
1. Complete application online or on paper
2. Verify identity documents (3 required)
3. Pay fee (£23-£44 depending on type)
4. Wait 2-8 weeks for certificate
5. Keep secure records of certificates`,
    
    storage: 'Store DBS certificates securely, with restricted access. Delete copies after 6 months unless specific retention required.'
  },
  
  overseas_activities: {
    reporting_thresholds: `Report overseas expenditure if:
• Total annual income exceeds £1 million, OR
• Overseas expenditure exceeds £100,000`,
    
    due_diligence: `Due diligence requirements:
• Check partners aren't on sanctions lists (OFSI)
• Verify partner organization legitimacy
• Assess local legal and regulatory environment
• Review partner's governance and financial controls
• Monitor ongoing compliance with UK anti-terrorism laws`,
    
    documentation: `Required documentation:
• Written agreements with overseas partners
• Records of all money transfers and purposes
• Evidence of due diligence checks
• Monitoring reports from partners
• Risk assessments for countries of operation`,
    
    sanctions: 'Always check OFSI (Office of Financial Sanctions Implementation) consolidated list before any overseas transfer. Update checks regularly.'
  },
  
  fundraising: {
    registration: 'Register with Fundraising Regulator if annual fundraising income exceeds £100,000',
    
    code_requirements: `Fundraising Code of Practice requires:
• Honest, open and respectful approach
• Respect for donor wishes and privacy
• Protection of vulnerable donors
• Clear information about how donations are used
• Proper handling and security of donations
• Transparent complaints procedure`,
    
    gift_aid: `Gift Aid rules:
• Can claim 25p for every £1 donated by UK taxpayers
• Donor must pay income/capital gains tax equal to Gift Aid claimed
• Must have written declaration from donor
• Keep records for at least 4 years
• Report annually to HMRC`,
    
    digital_fundraising: 'Online fundraising must comply with data protection laws, payment card security standards, and platform-specific rules.'
  },
  
  reporting: {
    annual_return: `Annual Return requirements:
• Due within 10 months of financial year end
• Late filing penalties: £10-£1,000+ depending on delay
• Must include updated charity information
• Declare any serious incidents
• Confirm trustee eligibility`,
    
    accounts: {
      receipts_payments: 'Receipts & payments accounts for income under £250,000 - simpler format showing money in/out',
      accruals: 'Accruals accounts required if income over £250,000 - shows financial position at year end',
      audit: 'Independent examination required for income £25,000-£1m. Full audit required if income over £1m or assets over £3.26m'
    },
    
    trustees_report: 'Annual trustees\' report required for all charities. More detailed version required if income over £500,000, including public benefit statement.',
    
    serious_incidents: 'Must report serious incidents to Charity Commission within reasonable time - includes fraud, data breaches, safeguarding issues, significant financial losses.'
  },
  
  safeguarding: {
    policy_requirement: 'Written safeguarding policy mandatory if working with children or vulnerable adults. Must be reviewed annually.',
    
    training: `Safeguarding training requirements:
• All trustees need basic safeguarding awareness
• Staff/volunteers need role-appropriate training
• Designated safeguarding lead needs advanced training
• Refresh training every 2-3 years`,
    
    reporting: 'Report safeguarding incidents to Charity Commission as serious incidents. Also report to local authority and police as appropriate.',
    
    recruitment: 'Safer recruitment practices include application forms, interviews, references, DBS checks, probationary periods, and supervision.'
  }
}

/**
 * Generate a cache key for a question and context
 */
function generateCacheKey(question: string, context: Partial<ChatContext>): string {
  const normalizedQuestion = question.toLowerCase().trim()
  const contextString = JSON.stringify({
    works_with_children: context.works_with_children,
    works_with_vulnerable_adults: context.works_with_vulnerable_adults,
    has_overseas_activities: context.has_overseas_activities,
    income_band: context.income_band,
    annual_income: context.annual_income ? Math.floor(context.annual_income / 10000) * 10000 : undefined // Round to 10k for caching
  })
  
  return createHash('sha256')
    .update(normalizedQuestion + contextString)
    .digest('hex')
}

/**
 * Check rate limiting for user
 */
function checkRateLimit(userId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const key = `rate_limit_${userId}`
  const windowStart = Math.floor(now / 60000) * 60000 // Start of current minute
  
  const current = rateLimitStore.get(key)
  
  if (!current || current.resetTime < windowStart) {
    // New window or expired
    rateLimitStore.set(key, { count: 1, resetTime: windowStart + 60000 })
    return { allowed: true }
  }
  
  if (current.count >= AI_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    const retryAfter = Math.ceil((current.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  current.count++
  return { allowed: true }
}

/**
 * Attempt to get cached response
 */
async function getCachedResponse(cacheKey: string): Promise<{
  content: string
  metadata: ChatMessageMetadata
} | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('response_content, response_metadata, hit_count')
      .eq('question_hash', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single()
    
    if (error || !data) return null
    
    // Update hit count and last accessed
    await supabase
      .from('ai_response_cache')
      .update({ 
        hit_count: data.hit_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('question_hash', cacheKey)
    
    return {
      content: data.response_content,
      metadata: {
        ...data.response_metadata,
        cache_hit: true
      }
    }
  } catch (error) {
    console.error('Cache read error:', error)
    return null
  }
}

/**
 * Cache AI response
 */
async function cacheResponse(
  cacheKey: string,
  question: string,
  context: Partial<ChatContext>,
  content: string,
  metadata: ChatMessageMetadata
): Promise<void> {
  try {
    const supabase = createClient()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + AI_CONFIG.CACHE_TTL_HOURS)
    
    await supabase
      .from('ai_response_cache')
      .upsert({
        question_hash: cacheKey,
        question_text: question,
        context_hash: createHash('sha256').update(JSON.stringify(context)).digest('hex'),
        context_data: context,
        response_content: content,
        response_metadata: metadata,
        expires_at: expiresAt.toISOString()
      })
  } catch (error) {
    console.error('Cache write error:', error)
    // Don't throw - caching failure shouldn't break the response
  }
}

/**
 * Extract sources from AI response content
 */
function extractSources(content: string, context: Partial<ChatContext>): ComplianceSource[] {
  const sources: ComplianceSource[] = []
  const lowerContent = content.toLowerCase()
  
  // Regulatory sources
  if (lowerContent.includes('charity commission') || lowerContent.includes('cc15')) {
    sources.push({
      type: 'regulation',
      title: 'Charity Commission Guidance',
      reference: 'gov.uk/charity-commission',
      url: 'https://www.gov.uk/government/organisations/charity-commission',
      confidence: 0.9
    })
  }
  
  if (lowerContent.includes('annual return') || lowerContent.includes('reporting')) {
    sources.push({
      type: 'regulation',
      title: 'Annual Return Requirements',
      reference: 'CC15a - How to complete your annual return',
      url: 'https://www.gov.uk/guidance/how-to-complete-your-annual-return-cc15a',
      confidence: 0.85
    })
  }
  
  if (lowerContent.includes('dbs') || lowerContent.includes('safeguarding')) {
    sources.push({
      type: 'guidance',
      title: 'DBS Checking Guidance',
      reference: 'Safeguarding and protecting people',
      url: 'https://www.gov.uk/guidance/safeguarding-duties-for-charity-trustees',
      confidence: 0.9
    })
  }
  
  if (lowerContent.includes('fundraising') || lowerContent.includes('donation')) {
    sources.push({
      type: 'regulation',
      title: 'Fundraising Regulator Code',
      reference: 'Code of Fundraising Practice',
      url: 'https://www.fundraisingregulator.org.uk/code',
      confidence: 0.85
    })
  }
  
  if (lowerContent.includes('overseas') || lowerContent.includes('international')) {
    sources.push({
      type: 'guidance',
      title: 'Overseas Activities Guidance',
      reference: 'CC33 - Charities and Commercial Partners',
      url: 'https://www.gov.uk/guidance/charity-reporting-and-accounting-the-essentials-cc15b',
      confidence: 0.8
    })
  }
  
  // Add context-specific sources
  if (context.has_overseas_activities && lowerContent.includes('sanction')) {
    sources.push({
      type: 'regulation',
      title: 'OFSI Sanctions List',
      reference: 'Office of Financial Sanctions Implementation',
      url: 'https://www.gov.uk/government/organisations/office-of-financial-sanctions-implementation',
      confidence: 0.95
    })
  }
  
  return sources
}

/**
 * Create system prompt based on context
 */
function createSystemPrompt(context: Partial<ChatContext>): string {
  const basePrompt = `You are an expert UK charity compliance assistant. You help charity trustees, managers, and staff understand and comply with UK charity regulations.

COMPLIANCE KNOWLEDGE BASE:
${JSON.stringify(COMPLIANCE_KNOWLEDGE, null, 2)}`

  const contextSection = context ? `

ORGANIZATION CONTEXT:
- Organization: ${context.organization_name || 'Unknown'}
- Charity Number: ${context.charity_number || 'Unknown'}
- Income Band: ${context.income_band || 'Unknown'}
- Annual Income: ${context.annual_income ? `£${context.annual_income.toLocaleString()}` : 'Unknown'}
- Works with children: ${context.works_with_children ? 'Yes' : 'No'}
- Works with vulnerable adults: ${context.works_with_vulnerable_adults ? 'Yes' : 'No'}
- Has overseas activities: ${context.has_overseas_activities ? 'Yes' : 'No'}
- Registration date: ${context.registration_date || 'Unknown'}
- Year end: ${context.year_end_date || 'Unknown'}` : ''

  const guidelines = `

RESPONSE GUIDELINES:
1. Be accurate and cite specific UK charity regulations and guidance
2. Use clear, jargon-free language that non-legal professionals can understand
3. Provide specific, actionable next steps
4. Highlight important deadlines and compliance risks
5. Reference official sources and guidance documents
6. Tailor advice to the organization's specific context
7. Use bullet points for lists and keep responses focused
8. Mention relevant penalties or consequences for non-compliance
9. Suggest ways to evidence compliance
10. Be encouraging while emphasizing the importance of compliance

Keep responses between 150-400 words unless more detail is specifically requested.`

  return basePrompt + contextSection + guidelines
}

/**
 * Main AI assistant function with comprehensive error handling
 */
export async function getAIResponse(
  question: string,
  context: Partial<ChatContext>,
  conversationHistory: ChatMessage[] = [],
  userId: string
): Promise<{
  content: string
  metadata: ChatMessageMetadata
  sources: ComplianceSource[]
  cached: boolean
}> {
  const startTime = Date.now()
  
  try {
    // Validate inputs
    if (!question?.trim()) {
      throw createChatError('VALIDATION_ERROR', 'Question cannot be empty')
    }
    
    if (question.length > 1000) {
      throw createChatError('VALIDATION_ERROR', 'Question is too long (max 1000 characters)')
    }
    
    // Check rate limiting
    const rateCheck = checkRateLimit(userId)
    if (!rateCheck.allowed) {
      throw createChatError('RATE_LIMITED', 'Too many requests. Please wait before trying again.', {
        retry_after: rateCheck.retryAfter
      })
    }
    
    // Generate cache key and check cache
    const cacheKey = generateCacheKey(question, context)
    const cached = await getCachedResponse(cacheKey)
    
    if (cached) {
      const sources = extractSources(cached.content, context)
      return {
        content: cached.content,
        metadata: {
          ...cached.metadata,
          response_time_ms: Date.now() - startTime,
          cache_hit: true
        },
        sources,
        cached: true
      }
    }
    
    // Prepare conversation messages
    const messages: any[] = [
      {
        role: 'system',
        content: createSystemPrompt(context)
      }
    ]
    
    // Add relevant conversation history (last few messages)
    const recentHistory = conversationHistory
      .filter(msg => msg.role !== 'system')
      .slice(-AI_CONFIG.MAX_HISTORY_CONTEXT)
    
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })
    
    // Add current question
    messages.push({
      role: 'user',
      content: question
    })
    
    // Call OpenRouter with retry logic
    const aiResponse = await callOpenRouter(async () => {
      const openrouter = getOpenRouter()
      return await openrouter.chat.completions.create({
        model: AI_CONFIG.DEFAULT_MODEL,
        messages,
        temperature: AI_CONFIG.TEMPERATURE,
        max_tokens: AI_CONFIG.MAX_TOKENS,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      })
    }, {
      retries: AI_CONFIG.MAX_RETRIES,
      retryDelay: AI_CONFIG.BASE_RETRY_DELAY
    })
    
    const content = aiResponse.choices[0]?.message?.content?.trim()
    
    if (!content || content.length < AI_CONFIG.MIN_RESPONSE_LENGTH) {
      throw createChatError('API_ERROR', 'Received empty or incomplete response from AI service')
    }
    
    // Extract sources and prepare metadata
    const sources = extractSources(content, context)
    const responseTime = Date.now() - startTime
    
    const metadata: ChatMessageMetadata = {
      model_used: AI_CONFIG.DEFAULT_MODEL,
      tokens_used: aiResponse.usage?.total_tokens || 0,
      response_time_ms: responseTime,
      sources,
      cache_hit: false
    }
    
    // Cache the response asynchronously
    cacheResponse(cacheKey, question, context, content, metadata).catch(error => {
      console.error('Failed to cache response:', error)
    })
    
    return {
      content,
      metadata,
      sources,
      cached: false
    }
    
  } catch (error) {
    console.error('AI assistant error:', error)
    
    // Convert various error types to ChatError
    if (error instanceof Error && 'type' in error) {
      throw error // Already a ChatError
    }
    
    if (error instanceof Error) {
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        throw createChatError('RATE_LIMITED', 'AI service is experiencing high demand. Please try again in a moment.')
      }
      
      if (error.message.includes('401') || error.message.includes('unauthorized')) {
        throw createChatError('UNAUTHORIZED', 'Authentication error with AI service.')
      }
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        throw createChatError('NETWORK_ERROR', 'Network connection issue. Please check your connection and try again.')
      }
    }
    
    throw createChatError('API_ERROR', 'Failed to get AI response. Please try again later.')
  }
}

/**
 * Helper function to create standardized chat errors
 */
function createChatError(type: ChatErrorType, message: string, details?: Record<string, any>): ChatError {
  return {
    type,
    message,
    details,
    ...(type === 'RATE_LIMITED' && details?.retry_after && { retry_after: details.retry_after })
  }
}

/**
 * Clean up expired cache entries (called periodically)
 */
export async function cleanupExpiredCache(): Promise<{ deleted: number }> {
  try {
    const supabase = createClient()
    
    const { count } = await supabase
      .from('ai_response_cache')
      .delete()
      .lt('expires_at', new Date().toISOString())
    
    return { deleted: count || 0 }
  } catch (error) {
    console.error('Cache cleanup error:', error)
    return { deleted: 0 }
  }
}

/**
 * Get cache statistics for monitoring
 */
export async function getCacheStats(): Promise<{
  total_entries: number
  total_hits: number
  cache_size_mb: number
  hit_rate: number
}> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('ai_response_cache')
      .select('hit_count, response_content')
      .gt('expires_at', new Date().toISOString())
    
    if (error || !data) {
      return { total_entries: 0, total_hits: 0, cache_size_mb: 0, hit_rate: 0 }
    }
    
    const totalEntries = data.length
    const totalHits = data.reduce((sum, entry) => sum + entry.hit_count, 0)
    const cacheSizeMb = data.reduce((sum, entry) => sum + entry.response_content.length, 0) / (1024 * 1024)
    const hitRate = totalEntries > 0 ? totalHits / totalEntries : 0
    
    return {
      total_entries: totalEntries,
      total_hits: totalHits,
      cache_size_mb: Math.round(cacheSizeMb * 100) / 100,
      hit_rate: Math.round(hitRate * 10000) / 100 // percentage with 2 decimal places
    }
  } catch (error) {
    console.error('Cache stats error:', error)
    return { total_entries: 0, total_hits: 0, cache_size_mb: 0, hit_rate: 0 }
  }
}