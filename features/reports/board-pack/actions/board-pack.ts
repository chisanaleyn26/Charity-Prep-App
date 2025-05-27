'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  BoardPackTemplate, 
  BoardPackData,
  ComplianceOverviewData,
  FinancialSummaryData,
  RiskAnalysisData,
  DEFAULT_BOARD_PACK_TEMPLATES
} from '../types/board-pack'
import { generateNarrative } from '@/lib/ai/narrative-generator'
import { calculateComplianceScore } from '@/features/compliance/services/compliance-score'

// Get available templates
export async function getBoardPackTemplates(): Promise<BoardPackTemplate[]> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // For now, return default templates
  // TODO: Fetch custom templates from database
  return DEFAULT_BOARD_PACK_TEMPLATES
}

// Generate board pack data based on template
export async function generateBoardPackData(
  templateId: string,
  period: { start: Date; end: Date }
): Promise<BoardPackData> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Get organization
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!org) throw new Error('Organization not found')

  // Get template
  const template = DEFAULT_BOARD_PACK_TEMPLATES.find(t => t.id === templateId)
  if (!template) throw new Error('Template not found')

  // Generate data for each enabled section
  const sections: Record<string, any> = {}

  for (const section of template.sections.filter(s => s.enabled)) {
    switch (section.type) {
      case 'compliance-overview':
        sections[section.id] = await generateComplianceOverview(org.id, period)
        break
      case 'financial-summary':
        sections[section.id] = await generateFinancialSummary(org.id, period)
        break
      case 'risk-analysis':
        sections[section.id] = await generateRiskAnalysis(org.id)
        break
      case 'fundraising-report':
        sections[section.id] = await generateFundraisingReport(org.id, period)
        break
      case 'safeguarding-report':
        sections[section.id] = await generateSafeguardingReport(org.id, period)
        break
      case 'overseas-activities':
        sections[section.id] = await generateOverseasReport(org.id, period)
        break
      case 'key-metrics':
        sections[section.id] = await generateKeyMetrics(org.id, period)
        break
      case 'recommendations':
        sections[section.id] = await generateRecommendations(org.id, sections)
        break
      case 'narrative-summary':
        sections[section.id] = await generateNarrativeSummary(org.id, sections)
        break
    }
  }

  return {
    organizationId: org.id,
    templateId,
    generatedAt: new Date(),
    period,
    sections,
    metadata: {
      preparedBy: user.email || 'System Generated'
    }
  }
}

// Section data generators
async function generateComplianceOverview(
  orgId: string, 
  period: { start: Date; end: Date }
): Promise<ComplianceOverviewData> {
  const supabase = await createClient()
  
  // Calculate current compliance score
  const score = await calculateComplianceScore(orgId)
  
  // Get urgent actions
  const { data: urgentActions } = await supabase
    .from('compliance_actions')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'pending')
    .in('priority', ['high', 'critical'])
    .limit(5)

  return {
    overallScore: score.overall,
    categoryScores: Object.entries(score.categories).map(([category, data]) => ({
      category,
      score: data.score,
      trend: 'stable' // TODO: Calculate actual trend
    })),
    urgentActions: urgentActions?.map(action => ({
      title: action.title,
      priority: action.priority as 'high' | 'medium' | 'low',
      dueDate: action.due_date
    })) || []
  }
}

async function generateFinancialSummary(
  orgId: string,
  period: { start: Date; end: Date }
): Promise<FinancialSummaryData> {
  const supabase = await createClient()
  
  // Get income data
  const { data: income } = await supabase
    .from('income_sources')
    .select('source, amount')
    .eq('organization_id', orgId)
    .gte('date', period.start.toISOString())
    .lte('date', period.end.toISOString())

  const totalIncome = income?.reduce((sum, i) => sum + i.amount, 0) || 0
  
  // Group income by source
  const incomeBySource = income?.reduce((acc, curr) => {
    const existing = acc.find(i => i.source === curr.source)
    if (existing) {
      existing.amount += curr.amount
    } else {
      acc.push({ source: curr.source, amount: curr.amount, percentage: 0 })
    }
    return acc
  }, [] as any[]) || []

  // Calculate percentages
  incomeBySource.forEach(i => {
    i.percentage = totalIncome > 0 ? (i.amount / totalIncome) * 100 : 0
  })

  // Mock expense data (would come from expense tracking)
  const totalExpenses = totalIncome * 0.85
  const netSurplus = totalIncome - totalExpenses

  return {
    totalIncome,
    totalExpenses,
    netSurplus,
    incomeBySource,
    expensesByCategory: [
      { category: 'Programs', amount: totalExpenses * 0.6, percentage: 60 },
      { category: 'Administration', amount: totalExpenses * 0.25, percentage: 25 },
      { category: 'Fundraising', amount: totalExpenses * 0.15, percentage: 15 }
    ],
    cashFlow: [] // TODO: Implement monthly cash flow
  }
}

async function generateRiskAnalysis(orgId: string): Promise<RiskAnalysisData> {
  // Mock risk data - would come from risk assessment module
  return {
    riskMatrix: [
      {
        category: 'Compliance',
        likelihood: 2,
        impact: 4,
        rating: 'medium',
        mitigations: ['Regular compliance audits', 'Staff training programs']
      },
      {
        category: 'Financial',
        likelihood: 3,
        impact: 3,
        rating: 'medium',
        mitigations: ['Diversify income sources', 'Build reserves']
      },
      {
        category: 'Reputational',
        likelihood: 2,
        impact: 5,
        rating: 'high',
        mitigations: ['Crisis communication plan', 'Regular stakeholder engagement']
      }
    ],
    topRisks: [
      {
        title: 'Funding Concentration',
        description: 'Over-reliance on single major donor',
        owner: 'Finance Director',
        status: 'monitoring'
      },
      {
        title: 'Regulatory Changes',
        description: 'New charity regulations coming into effect',
        owner: 'Compliance Officer',
        status: 'new'
      }
    ]
  }
}

async function generateFundraisingReport(
  orgId: string,
  period: { start: Date; end: Date }
) {
  const supabase = await createClient()
  
  const { data: events } = await supabase
    .from('fundraising_events')
    .select('*')
    .eq('organization_id', orgId)
    .gte('event_date', period.start.toISOString())
    .lte('event_date', period.end.toISOString())

  return {
    totalEvents: events?.length || 0,
    totalRaised: events?.reduce((sum, e) => sum + (e.amount_raised || 0), 0) || 0,
    topEvents: events?.sort((a, b) => b.amount_raised - a.amount_raised).slice(0, 5) || [],
    complianceStatus: 'compliant' // TODO: Calculate actual status
  }
}

async function generateSafeguardingReport(
  orgId: string,
  period: { start: Date; end: Date }
) {
  const supabase = await createClient()
  
  const { data: incidents } = await supabase
    .from('safeguarding_incidents')
    .select('*')
    .eq('organization_id', orgId)
    .gte('incident_date', period.start.toISOString())
    .lte('incident_date', period.end.toISOString())

  return {
    totalIncidents: incidents?.length || 0,
    resolvedIncidents: incidents?.filter(i => i.status === 'resolved').length || 0,
    pendingIncidents: incidents?.filter(i => i.status === 'pending').length || 0,
    trainingCompleted: true, // TODO: Get from training records
    policiesUpToDate: true // TODO: Check policy review dates
  }
}

async function generateOverseasReport(
  orgId: string,
  period: { start: Date; end: Date }
) {
  const supabase = await createClient()
  
  const { data: activities } = await supabase
    .from('overseas_activities')
    .select('*')
    .eq('organization_id', orgId)

  return {
    totalCountries: new Set(activities?.map(a => a.country) || []).size,
    activeProjects: activities?.filter(a => a.is_active).length || 0,
    totalExpenditure: activities?.reduce((sum, a) => sum + (a.expenditure || 0), 0) || 0,
    complianceChecks: activities?.filter(a => a.compliance_checked).length || 0
  }
}

async function generateKeyMetrics(
  orgId: string,
  period: { start: Date; end: Date }
) {
  // Aggregate key metrics from various sources
  const compliance = await generateComplianceOverview(orgId, period)
  const financial = await generateFinancialSummary(orgId, period)
  
  return {
    complianceScore: compliance.overallScore,
    totalIncome: financial.totalIncome,
    netSurplus: financial.netSurplus,
    urgentActions: compliance.urgentActions.length,
    trend: {
      compliance: 'up',
      financial: 'stable'
    }
  }
}

async function generateRecommendations(
  orgId: string,
  existingSections: Record<string, any>
) {
  // Analyze data and generate recommendations
  const recommendations = []
  
  // Check compliance score
  const complianceData = Object.values(existingSections).find(
    s => s.overallScore !== undefined
  ) as ComplianceOverviewData | undefined
  
  if (complianceData && complianceData.overallScore < 80) {
    recommendations.push({
      priority: 'high',
      title: 'Improve Compliance Score',
      description: 'Focus on addressing urgent compliance actions to improve overall score',
      actions: complianceData.urgentActions.map(a => a.title)
    })
  }
  
  // Check financial health
  const financialData = Object.values(existingSections).find(
    s => s.netSurplus !== undefined
  ) as FinancialSummaryData | undefined
  
  if (financialData && financialData.netSurplus < 0) {
    recommendations.push({
      priority: 'critical',
      title: 'Address Financial Deficit',
      description: 'Implement cost reduction measures and increase fundraising efforts',
      actions: ['Review expense categories', 'Launch emergency fundraising campaign']
    })
  }
  
  return { recommendations }
}

async function generateNarrativeSummary(
  orgId: string,
  sections: Record<string, any>
) {
  // Use AI to generate executive summary
  const prompt = `Generate an executive summary for a charity board pack based on the following data:
    ${JSON.stringify(sections, null, 2)}
    
    Focus on key achievements, challenges, and strategic priorities.`
  
  const narrative = await generateNarrative(prompt, 'board-pack-summary')
  
  return {
    summary: narrative,
    generatedAt: new Date()
  }
}

// Save board pack configuration
export async function saveBoardPackTemplate(template: Omit<BoardPackTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // TODO: Save to database
  return {
    ...template,
    id: `custom-${Date.now()}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Export board pack
export async function exportBoardPack(
  data: BoardPackData,
  format: 'pdf' | 'docx' | 'pptx' | 'html'
) {
  // TODO: Implement export functionality
  // For now, return a mock URL
  return {
    url: `/api/export/board-pack?format=${format}`,
    filename: `board-pack-${new Date().toISOString().split('T')[0]}.${format}`
  }
}