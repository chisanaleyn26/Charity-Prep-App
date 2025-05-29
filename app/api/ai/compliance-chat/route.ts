import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenRouter } from '@/lib/ai/openrouter'
import { tryModelsWithFallback, AI_MODELS } from '@/lib/ai/retry-utils'
import { randomUUID } from 'crypto'

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


export async function POST(req: NextRequest) {
  try {
    const { question, context, history } = await req.json()

    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Build conversation for AI
    const messages: any[] = [
      {
        role: 'system',
        content: `You are a knowledgeable UK charity compliance assistant. You help charity trustees, managers, and staff understand and comply with UK charity regulations.

COMPLIANCE KNOWLEDGE BASE:
${JSON.stringify(COMPLIANCE_KNOWLEDGE, null, 2)}

${context ? `ORGANIZATION CONTEXT:
- Type: ${context.organizationType || 'Unknown'}
- Annual income: ${context.income ? `£${context.income.toLocaleString()}` : 'Unknown'}
- Works with children: ${context.workWithChildren ? 'Yes' : 'No'}
- Works with vulnerable adults: ${context.workWithVulnerableAdults ? 'Yes' : 'No'}
- Has overseas activities: ${context.hasOverseasActivities ? 'Yes' : 'No'}` : ''}

RESPONSE GUIDELINES:
1. Be accurate and cite specific UK charity regulations
2. Use clear language that non-legal professionals can understand
3. Include specific next steps or actions
4. Highlight important deadlines
5. Point out potential compliance risks
6. Recommend official sources when appropriate

Use bullet points for lists and keep responses focused and practical.`
      }
    ]

    // Add conversation history
    if (history && history.length > 0) {
      history.slice(-5).forEach((msg: any) => {
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

    // Get AI response with retry logic and model fallback
    const openrouter = getOpenRouter()
    
    const response = await tryModelsWithFallback(
      AI_MODELS.CHAT,
      async (model) => {
        return await openrouter.chat.completions.create({
          model,
          messages,
          temperature: 0.3,
          max_tokens: 1000,
        })
      }
    )

    const content = response.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response.'
    
    // Extract sources
    const sources = extractSources(content)

    return NextResponse.json({
      id: randomUUID(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      sources
    })
  } catch (error) {
    console.error('Chat API error:', error)
    
    let errorMessage = 'Failed to process your question. Please try again.'
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Authentication error. Please check API configuration.'
      } else if (error.message.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage 
    }, { 
      status: 500 
    })
  }
}

function extractSources(content: string) {
  const sources = []
  
  if (content.includes('Charity Commission')) {
    sources.push({
      type: 'regulation',
      title: 'Charity Commission Guidance',
      reference: 'gov.uk/government/organisations/charity-commission'
    })
  }
  
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