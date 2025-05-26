'use server'

import { openrouter } from '@/lib/ai/openrouter'
import { createClient } from '@/lib/supabase/server'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: {
    type: 'regulation' | 'guidance' | 'internal_data'
    title: string
    reference?: string
  }[]
}

export interface ChatContext {
  organizationType?: string
  income?: number
  hasOverseasActivities?: boolean
  workWithChildren?: boolean
  workWithVulnerableAdults?: boolean
}

// Compliance knowledge base
const COMPLIANCE_KNOWLEDGE = {
  dbs_checks: {
    requirements: `DBS checks are required for:
- Anyone working with children under 18
- Anyone working with vulnerable adults
- Trustees if they have regular contact with beneficiaries
- Staff and volunteers in regulated activities`,
    types: {
      basic: 'Shows unspent convictions only',
      standard: 'Shows spent and unspent convictions, cautions, reprimands, warnings',
      enhanced: 'Standard check plus local police information',
      enhanced_barred: 'Enhanced check plus barred list check'
    },
    renewal: 'DBS checks don\'t expire but most charities renew every 3 years'
  },
  
  overseas_activities: {
    reporting: `Charities must report overseas expenditure if:
- Total income exceeds £1 million, OR
- Overseas expenditure exceeds £100,000`,
    requirements: `For overseas activities you must:
- Conduct due diligence on partners
- Keep records of all transfers
- Monitor how funds are used
- Report in your annual return`,
    sanctions: 'Always check OFSI sanctions list before transfers'
  },
  
  fundraising: {
    registration: 'Register with Fundraising Regulator if raising over £100,000 annually',
    rules: `Key fundraising rules:
- Be honest and open
- Respect donor wishes
- Handle donations safely
- Protect vulnerable donors
- Keep proper records`,
    gift_aid: 'Can claim 25p for every £1 donated by UK taxpayers'
  },
  
  reporting: {
    annual_return: 'Due within 10 months of financial year end',
    accounts: {
      receipts_payments: 'For income under £250,000',
      accruals: 'Required if income over £250,000',
      audit: 'Independent examination if income £25,000-£1m, audit if over £1m'
    },
    trustees_report: 'Required for all charities, more detail if income over £500,000'
  },
  
  safeguarding: {
    policy: 'Written safeguarding policy required if working with children/vulnerable adults',
    training: 'All staff and volunteers need appropriate safeguarding training',
    reporting: 'Must report safeguarding incidents to Charity Commission'
  }
}

/**
 * Process a user question and generate a response
 */
export async function processComplianceQuestion(
  question: string,
  context?: ChatContext,
  history?: ChatMessage[]
): Promise<ChatMessage> {
  const supabase = await createClient()
  
  // Get organization-specific context if available
  let orgContext = ''
  if (context) {
    orgContext = `
Organization context:
- Type: ${context.organizationType || 'Unknown'}
- Annual income: ${context.income ? `£${context.income.toLocaleString()}` : 'Unknown'}
- Works with children: ${context.workWithChildren ? 'Yes' : 'No'}
- Works with vulnerable adults: ${context.workWithVulnerableAdults ? 'Yes' : 'No'}
- Has overseas activities: ${context.hasOverseasActivities ? 'Yes' : 'No'}
`
  }

  // Build conversation history
  const messages: any[] = [
    {
      role: 'system',
      content: `You are a helpful UK charity compliance assistant. You provide accurate, practical guidance on charity regulations and best practices.

Your knowledge includes:
${JSON.stringify(COMPLIANCE_KNOWLEDGE, null, 2)}

${orgContext}

Guidelines:
1. Always cite specific regulations or guidance where relevant
2. Provide practical, actionable advice
3. Highlight important deadlines or requirements
4. Suggest next steps when appropriate
5. Be clear about what is legally required vs best practice
6. If unsure, recommend consulting the Charity Commission or professional advice

Keep responses concise but comprehensive. Use bullet points for clarity.`
    }
  ]

  // Add conversation history
  if (history && history.length > 0) {
    history.slice(-5).forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      })
    })
  }

  // Add current question
  messages.push({
    role: 'user',
    content: question
  })

  try {
    const response = await openrouter.chat.completions.create({
      model: 'google/gemini-2.0-flash-exp:free',
      messages,
      temperature: 0.3,
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'
    
    // Extract any regulatory references
    const sources = extractSources(content)

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      sources
    }
  } catch (error) {
    console.error('Chat error:', error)
    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'I apologize, but I encountered an error. Please try again or contact support if the issue persists.',
      timestamp: new Date()
    }
  }
}

/**
 * Extract regulatory sources from response
 */
function extractSources(content: string): ChatMessage['sources'] {
  const sources: ChatMessage['sources'] = []
  
  // Check for Charity Commission references
  if (content.includes('Charity Commission')) {
    sources.push({
      type: 'regulation',
      title: 'Charity Commission Guidance',
      reference: 'gov.uk/government/organisations/charity-commission'
    })
  }
  
  // Check for specific regulations
  if (content.toLowerCase().includes('annual return')) {
    sources.push({
      type: 'regulation',
      title: 'Annual Return Requirements',
      reference: 'CC15a'
    })
  }
  
  if (content.toLowerCase().includes('dbs')) {
    sources.push({
      type: 'guidance',
      title: 'DBS Checking Guidance',
      reference: 'Safeguarding and protecting people'
    })
  }
  
  if (content.toLowerCase().includes('fundraising')) {
    sources.push({
      type: 'regulation',
      title: 'Fundraising Regulator Code',
      reference: 'fundraisingregulator.org.uk'
    })
  }
  
  return sources.length > 0 ? sources : undefined
}

/**
 * Get suggested questions based on context
 */
export async function getSuggestedQuestions(context?: ChatContext): Promise<string[]> {
  const suggestions = [
    'What are the DBS check requirements for our charity?',
    'When is our annual return due?',
    'Do we need to register with the Fundraising Regulator?',
    'What records do we need to keep for Gift Aid claims?',
    'What are the reporting requirements for overseas activities?'
  ]
  
  // Add context-specific suggestions
  if (context?.workWithChildren || context?.workWithVulnerableAdults) {
    suggestions.unshift('What safeguarding policies do we need?')
  }
  
  if (context?.hasOverseasActivities) {
    suggestions.unshift('How do we conduct due diligence on overseas partners?')
  }
  
  if (context?.income && context.income > 250000) {
    suggestions.push('Do we need an audit or independent examination?')
  }
  
  return suggestions.slice(0, 5)
}

/**
 * Search compliance guidance
 */
export async function searchComplianceGuidance(query: string): Promise<{
  title: string
  summary: string
  link?: string
}[]> {
  // This would integrate with Charity Commission API or guidance database
  // For now, return relevant sections from our knowledge base
  const results = []
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('dbs') || lowerQuery.includes('safeguarding')) {
    results.push({
      title: 'DBS Checks and Safeguarding',
      summary: COMPLIANCE_KNOWLEDGE.dbs_checks.requirements,
      link: 'https://www.gov.uk/guidance/safeguarding-duties-for-charity-trustees'
    })
  }
  
  if (lowerQuery.includes('overseas') || lowerQuery.includes('international')) {
    results.push({
      title: 'Overseas Activities Reporting',
      summary: COMPLIANCE_KNOWLEDGE.overseas_activities.reporting,
      link: 'https://www.gov.uk/guidance/reporting-overseas-expenditure'
    })
  }
  
  if (lowerQuery.includes('fundrais')) {
    results.push({
      title: 'Fundraising Requirements',
      summary: COMPLIANCE_KNOWLEDGE.fundraising.rules,
      link: 'https://www.fundraisingregulator.org.uk/code'
    })
  }
  
  if (lowerQuery.includes('annual') || lowerQuery.includes('report')) {
    results.push({
      title: 'Annual Reporting Requirements',
      summary: COMPLIANCE_KNOWLEDGE.reporting.annual_return,
      link: 'https://www.gov.uk/guidance/prepare-a-charity-annual-return'
    })
  }
  
  return results
}

/**
 * Get relevant compliance alerts for organization
 */
export async function getComplianceAlerts(organizationId: string): Promise<{
  type: 'warning' | 'info' | 'deadline'
  title: string
  message: string
  dueDate?: Date
}[]> {
  const supabase = await createClient()
  const alerts = []
  
  // Check for expiring DBS certificates
  const { data: expiringDBS } = await supabase
    .from('safeguarding_records')
    .select('person_name, expiry_date')
    .eq('organization_id', organizationId)
    .gte('expiry_date', new Date().toISOString())
    .lte('expiry_date', new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString())
  
  if (expiringDBS?.length) {
    alerts.push({
      type: 'warning' as const,
      title: 'DBS Certificates Expiring Soon',
      message: `${expiringDBS.length} DBS certificates will expire in the next 90 days`,
      dueDate: new Date(expiringDBS[0].expiry_date)
    })
  }
  
  // Check annual return deadline (mock - would need org financial year end)
  const mockFinancialYearEnd = new Date()
  mockFinancialYearEnd.setMonth(mockFinancialYearEnd.getMonth() - 2)
  const annualReturnDeadline = new Date(mockFinancialYearEnd)
  annualReturnDeadline.setMonth(annualReturnDeadline.getMonth() + 10)
  
  if (annualReturnDeadline > new Date()) {
    alerts.push({
      type: 'deadline' as const,
      title: 'Annual Return Due',
      message: 'Submit your charity annual return to the Charity Commission',
      dueDate: annualReturnDeadline
    })
  }
  
  // General compliance reminders
  alerts.push({
    type: 'info' as const,
    title: 'Regular Review Reminder',
    message: 'Review your safeguarding policy and procedures annually'
  })
  
  return alerts
}