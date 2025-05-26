'use server'

import { AIService } from './service'
import { AI_CONFIG } from './config'
import { createClient } from '@/lib/supabase/server'

export interface QAContext {
  organizationId: string
  userId: string
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

export interface QAResponse {
  answer: string
  sources: string[]
  relatedQuestions: string[]
  confidence: number
}

// UK Charity Commission regulations knowledge base
const REGULATIONS_KB = {
  safeguarding: `
UK Safeguarding Requirements:
- All charities must have safeguarding policies
- DBS checks required for regulated activities
- Enhanced DBS for work with children/vulnerable adults
- Safeguarding training must be documented
- Serious incidents must be reported to Commission
- Annual review of safeguarding policies required
`,
  overseas: `
UK Overseas Activities Requirements:
- Must report work in high-risk countries
- Due diligence required for partners
- Sanctions list checking mandatory
- Transfer methods must be documented
- Quarterly reporting for certain activities
- Annual Return must include overseas work
`,
  income: `
UK Income Reporting Requirements:
- All income over £25k must be reported
- Gift Aid claims need proper documentation
- Related party transactions must be disclosed
- Major donors (>£5k) require enhanced recording
- Restricted funds must be tracked separately
- Anonymous donations over £25k need reporting
`
}

/**
 * Answer compliance questions with context
 */
export async function answerComplianceQuestion(
  question: string,
  context: QAContext
): Promise<{ response?: QAResponse; error?: string }> {
  const ai = AIService.getInstance()
  const supabase = await createClient()
  
  // Get organization context
  const { data: orgData } = await supabase
    .from('organizations')
    .select('name, income_band, charity_type')
    .eq('id', context.organizationId)
    .single()
  
  // Get relevant compliance data for context
  const [safeguarding, overseas, income] = await Promise.all([
    supabase
      .from('safeguarding_records')
      .select('count')
      .eq('organization_id', context.organizationId)
      .single(),
    supabase
      .from('overseas_activities')
      .select('count')
      .eq('organization_id', context.organizationId)
      .single(),
    supabase
      .from('income_records')
      .select('count')
      .eq('organization_id', context.organizationId)
      .single()
  ])
  
  // Build context prompt
  const contextInfo = `
Organization: ${orgData?.name || 'Unknown'}
Size: ${orgData?.income_band || 'Unknown'}
Type: ${orgData?.charity_type || 'General'}

Current Data:
- Safeguarding records: ${safeguarding?.data?.count || 0}
- Overseas activities: ${overseas?.data?.count || 0}
- Income records: ${income?.data?.count || 0}

Conversation History:
${context.conversationHistory?.map(h => `${h.role}: ${h.content}`).join('\n') || 'None'}
`

  const prompt = `Answer this UK charity compliance question:
"${question}"

Context:
${contextInfo}

UK Regulations Knowledge:
${REGULATIONS_KB.safeguarding}
${REGULATIONS_KB.overseas}
${REGULATIONS_KB.income}

Provide:
1. A clear, specific answer
2. Cite relevant regulations
3. Consider the organization's specific context
4. Suggest related questions they might ask
5. Indicate confidence level (0-1)

Return as JSON:
{
  "answer": "detailed answer",
  "sources": ["regulation citations"],
  "relatedQuestions": ["question 1", "question 2"],
  "confidence": 0.95
}`

  const response = await ai.complete<QAResponse>(prompt, {
    systemPrompt: AI_CONFIG.prompts.complianceQA,
    jsonMode: true,
    temperature: 0.3
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate answer' }
  }
  
  // Store Q&A for improvement
  await storeQAInteraction(question, response.data, context)
  
  return { response: response.data }
}

/**
 * Get suggested questions based on organization data
 */
export async function getSuggestedQuestions(
  organizationId: string
): Promise<string[]> {
  const supabase = await createClient()
  
  // Analyze organization's compliance gaps
  const { data: gaps } = await supabase.rpc('get_compliance_gaps', {
    org_id: organizationId
  })
  
  const suggestions = [
    'What are my safeguarding obligations?',
    'Do I need to report overseas activities?',
    'How do I claim Gift Aid on donations?',
    'What counts as a related party transaction?',
    'When should I file my Annual Return?'
  ]
  
  // Add specific suggestions based on gaps
  if (gaps?.expired_dbs > 0) {
    suggestions.unshift('What should I do about expired DBS checks?')
  }
  
  if (gaps?.high_risk_countries > 0) {
    suggestions.unshift('What are the requirements for high-risk country work?')
  }
  
  return suggestions.slice(0, 5)
}

/**
 * Search regulations for specific topics
 */
export async function searchRegulations(
  topic: string
): Promise<{ results?: Array<{ title: string; content: string; url: string }>; error?: string }> {
  const ai = AIService.getInstance()
  
  const prompt = `Search UK charity regulations for: "${topic}"

Find the most relevant regulations, guidelines, or Commission guidance.

Return as JSON array:
[
  {
    "title": "Regulation title",
    "content": "Brief summary of relevant section",
    "url": "Link to official source (use gov.uk where possible)"
  }
]

Maximum 5 results.`

  const response = await ai.complete<any[]>(prompt, {
    jsonMode: true,
    temperature: 0.2
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to search regulations' }
  }
  
  return { results: response.data }
}

/**
 * Generate compliance checklist based on question
 */
export async function generateComplianceChecklist(
  topic: string,
  organizationContext: any
): Promise<{ checklist?: Array<{ item: string; required: boolean; priority: 'high' | 'medium' | 'low' }>; error?: string }> {
  const ai = AIService.getInstance()
  
  const prompt = `Generate a compliance checklist for: "${topic}"

Organization context:
${JSON.stringify(organizationContext, null, 2)}

Create a practical checklist with:
- Specific action items
- Whether each is legally required or best practice
- Priority level

Return as JSON array:
[
  {
    "item": "Action item description",
    "required": true/false,
    "priority": "high/medium/low"
  }
]

Maximum 10 items, ordered by priority.`

  const response = await ai.complete<any[]>(prompt, {
    jsonMode: true,
    temperature: 0.3
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate checklist' }
  }
  
  return { checklist: response.data }
}

/**
 * Store Q&A interaction for future improvement
 */
async function storeQAInteraction(
  question: string,
  response: QAResponse,
  context: QAContext
) {
  // In production, this would store to a table for:
  // 1. Improving AI responses
  // 2. Identifying common questions
  // 3. Building a FAQ
  
  console.log('Q&A Interaction stored:', {
    question,
    confidence: response.confidence,
    timestamp: new Date().toISOString()
  })
}