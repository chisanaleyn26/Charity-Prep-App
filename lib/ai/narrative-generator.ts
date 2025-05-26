'use server'

import { AIService } from './service'
import { AI_CONFIG } from './config'
import { 
  ComplianceScores, 
  getComplianceLevel, 
  getComplianceMessage 
} from '@/lib/compliance/calculator'

export interface NarrativeOptions {
  tone: 'formal' | 'friendly' | 'concise'
  includeRecommendations: boolean
  highlightRisks: boolean
  audienceLevel: 'board' | 'operational' | 'public'
}

/**
 * Generate board report narrative
 */
export async function generateBoardNarrative(
  organizationName: string,
  complianceScores: ComplianceScores,
  period: { start: Date; end: Date },
  options: NarrativeOptions = {
    tone: 'formal',
    includeRecommendations: true,
    highlightRisks: true,
    audienceLevel: 'board'
  }
): Promise<{ narrative?: string; error?: string }> {
  const ai = AIService.getInstance()
  
  const level = getComplianceLevel(complianceScores.overall)
  const message = getComplianceMessage(level)
  
  const prompt = `Generate a professional board report narrative for ${organizationName}.

Compliance Status:
- Overall Score: ${complianceScores.overall}%
- Level: ${level}
- Message: ${message}

Module Breakdown:
- Safeguarding: ${complianceScores.safeguarding}%
  - Total Records: ${complianceScores.breakdown.safeguarding.totalRecords}
  - Valid: ${complianceScores.breakdown.safeguarding.validRecords}
  - Expiring: ${complianceScores.breakdown.safeguarding.expiringRecords}
  - Expired: ${complianceScores.breakdown.safeguarding.expiredRecords}

- Overseas Activities: ${complianceScores.overseas}%
  - Total Activities: ${complianceScores.breakdown.overseas.totalActivities}
  - High Risk: ${complianceScores.breakdown.overseas.highRiskActivities}
  - Unreported: ${complianceScores.breakdown.overseas.unreportedActivities}

- Income Tracking: ${complianceScores.income}%
  - Total Records: ${complianceScores.breakdown.income.totalRecords}
  - Documented: ${complianceScores.breakdown.income.documentedRecords}
  - Related Party: ${complianceScores.breakdown.income.relatedPartyRecords}

Period: ${period.start.toLocaleDateString()} to ${period.end.toLocaleDateString()}

Generate a ${options.tone} narrative for ${options.audienceLevel} audience that:
1. Summarizes the compliance position
2. ${options.highlightRisks ? 'Highlights key risks' : 'Focuses on achievements'}
3. ${options.includeRecommendations ? 'Provides actionable recommendations' : 'States facts only'}
4. Uses appropriate language for trustees/board members
5. Follows UK charity reporting conventions

Structure:
- Executive Summary (2-3 sentences)
- Compliance Overview
- Key Achievements
${options.highlightRisks ? '- Risk Areas' : ''}
${options.includeRecommendations ? '- Recommendations' : ''}
- Conclusion`

  const response = await ai.complete<string>(prompt, {
    systemPrompt: AI_CONFIG.prompts.narrativeGenerator,
    temperature: 0.7, // Some creativity but mostly consistent
    maxTokens: 2000
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate narrative' }
  }
  
  return { narrative: response.data }
}

/**
 * Generate annual return narrative sections
 */
export async function generateAnnualReturnNarratives(
  organizationData: {
    name: string
    charityNumber: string
    financialYear: number
    income: number
    beneficiaries: number
  },
  complianceData: {
    safeguardingHighlights: string[]
    overseasCountries: string[]
    majorDonors: number
    restrictedFunds: number
  }
): Promise<{ 
  narratives?: {
    activities: string
    achievements: string
    financialReview: string
    risks: string
  }
  error?: string 
}> {
  const ai = AIService.getInstance()
  
  const prompt = `Generate Annual Return narrative sections for ${organizationData.name} (${organizationData.charityNumber}).

Financial Year: ${organizationData.financialYear}
Total Income: £${organizationData.income.toLocaleString()}
Beneficiaries Reached: ${organizationData.beneficiaries.toLocaleString()}

Key Data:
- Safeguarding: ${complianceData.safeguardingHighlights.join(', ')}
- Overseas Work: ${complianceData.overseasCountries.join(', ')}
- Major Donors (>£5k): ${complianceData.majorDonors}
- Restricted Funds: £${complianceData.restrictedFunds.toLocaleString()}

Generate concise narratives for these Annual Return sections:

1. Activities and Achievements (max 200 words)
- What the charity did
- Who benefited
- Key outcomes

2. Financial Review (max 150 words)
- Income sources
- Major expenditure
- Reserves position

3. Principal Risks (max 100 words)
- Key risks faced
- Mitigation measures

Return as JSON with keys: activities, achievements, financialReview, risks`

  const response = await ai.complete<any>(prompt, {
    jsonMode: true,
    temperature: 0.5
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate narratives' }
  }
  
  return { narratives: response.data }
}

/**
 * Generate compliance action summary
 */
export async function generateActionSummary(
  urgentActions: Array<{
    type: string
    description: string
    dueDate?: Date
  }>,
  completedActions: Array<{
    type: string
    description: string
    completedDate: Date
  }>
): Promise<{ summary?: string; error?: string }> {
  const ai = AIService.getInstance()
  
  const prompt = `Summarize compliance actions for a quick email update:

Urgent Actions (${urgentActions.length}):
${urgentActions.map(a => `- ${a.description}${a.dueDate ? ` (due ${a.dueDate.toLocaleDateString()})` : ''}`).join('\n')}

Recently Completed (${completedActions.length}):
${completedActions.map(a => `- ${a.description} (${a.completedDate.toLocaleDateString()})`).join('\n')}

Create a brief, friendly summary suitable for an email to charity staff.
Focus on what needs immediate attention and celebrate recent completions.
Maximum 150 words.`

  const response = await ai.complete<string>(prompt, {
    temperature: 0.6
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate summary' }
  }
  
  return { summary: response.data }
}

/**
 * Generate risk assessment narrative
 */
export async function generateRiskAssessment(
  riskFactors: {
    expiredDBS: number
    highRiskCountries: string[]
    undocumentedIncome: number
    relatedPartyTransactions: number
  }
): Promise<{ assessment?: string; error?: string }> {
  const ai = AIService.getInstance()
  
  const prompt = `Generate a risk assessment narrative based on:

Risk Factors:
- Expired DBS Checks: ${riskFactors.expiredDBS}
- High-Risk Country Operations: ${riskFactors.highRiskCountries.join(', ')}
- Undocumented Income: £${riskFactors.undocumentedIncome.toLocaleString()}
- Related Party Transactions: ${riskFactors.relatedPartyTransactions}

Create a formal risk assessment that:
1. Evaluates each risk factor
2. Assigns risk levels (Low/Medium/High)
3. Suggests mitigation strategies
4. Prioritizes actions

Use language appropriate for regulatory submissions.
Maximum 300 words.`

  const response = await ai.complete<string>(prompt, {
    temperature: 0.3, // Low temperature for consistent risk assessment
    systemPrompt: 'You are a charity compliance expert writing for UK regulators.'
  })
  
  if (!response.success || !response.data) {
    return { error: response.error || 'Failed to generate risk assessment' }
  }
  
  return { assessment: response.data }
}