import { createServerClient } from '@/lib/supabase/server'
import { generateComplianceNarrative, generateRiskAssessment } from '@/lib/ai/narrative-generator'

export interface BoardPackData {
  organization: {
    id: string
    name: string
    charityNumber: string
    yearEnd: string
  }
  date: string
  sections: BoardPackSection[]
  metadata: {
    generatedAt: string
    generatedBy: string
  }
}

export interface BoardPackSection {
  id: string
  title: string
  type: 'narrative' | 'data' | 'chart' | 'table'
  content: any
  order: number
  included: boolean
}

export interface TemplateDefinition {
  id: string
  name: string
  description: string
  sections: SectionDefinition[]
}

export interface SectionDefinition {
  id: string
  title: string
  type: 'narrative' | 'data' | 'chart' | 'table'
  dataSource: string
  required: boolean
  order: number
}

// Available templates
export const boardPackTemplates: TemplateDefinition[] = [
  {
    id: 'standard',
    name: 'Standard Board Pack',
    description: 'Comprehensive report with all key sections',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 1
      },
      {
        id: 'compliance-status',
        title: 'Compliance Status',
        type: 'data',
        dataSource: 'compliance-score',
        required: true,
        order: 2
      },
      {
        id: 'risk-assessment',
        title: 'Risk Assessment',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 3
      },
      {
        id: 'safeguarding-summary',
        title: 'Safeguarding Summary',
        type: 'table',
        dataSource: 'safeguarding-records',
        required: false,
        order: 4
      },
      {
        id: 'financial-overview',
        title: 'Financial Overview',
        type: 'chart',
        dataSource: 'income-records',
        required: false,
        order: 5
      },
      {
        id: 'overseas-activities',
        title: 'International Operations',
        type: 'table',
        dataSource: 'overseas-activities',
        required: false,
        order: 6
      },
      {
        id: 'action-items',
        title: 'Recommended Actions',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 7
      }
    ]
  },
  {
    id: 'concise',
    name: 'Concise Summary',
    description: 'Quick overview for busy trustees',
    sections: [
      {
        id: 'executive-summary',
        title: 'Executive Summary',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 1
      },
      {
        id: 'compliance-status',
        title: 'Compliance Status',
        type: 'data',
        dataSource: 'compliance-score',
        required: true,
        order: 2
      },
      {
        id: 'action-items',
        title: 'Key Actions Required',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 3
      }
    ]
  },
  {
    id: 'quarterly',
    name: 'Quarterly Review',
    description: 'Detailed quarterly compliance review',
    sections: [
      {
        id: 'quarterly-overview',
        title: 'Quarter at a Glance',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 1
      },
      {
        id: 'compliance-trends',
        title: 'Compliance Trends',
        type: 'chart',
        dataSource: 'compliance-history',
        required: true,
        order: 2
      },
      {
        id: 'safeguarding-update',
        title: 'Safeguarding Update',
        type: 'table',
        dataSource: 'safeguarding-records',
        required: true,
        order: 3
      },
      {
        id: 'financial-summary',
        title: 'Financial Summary',
        type: 'chart',
        dataSource: 'income-records',
        required: true,
        order: 4
      },
      {
        id: 'next-quarter-priorities',
        title: 'Next Quarter Priorities',
        type: 'narrative',
        dataSource: 'ai-generated',
        required: true,
        order: 5
      }
    ]
  }
]

export async function generateBoardPackData(
  organizationId: string,
  templateId: string,
  meetingDate: string,
  selectedSections?: string[]
): Promise<BoardPackData> {
  const supabase = createServerClient()
  
  // Get organization details
  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single()
    
  if (!org) throw new Error('Organization not found')
  
  // Get template
  const template = boardPackTemplates.find(t => t.id === templateId)
  if (!template) throw new Error('Template not found')
  
  // Generate sections
  const sections: BoardPackSection[] = []
  
  for (const sectionDef of template.sections) {
    // Skip if not selected (and not required)
    if (selectedSections && !selectedSections.includes(sectionDef.id) && !sectionDef.required) {
      continue
    }
    
    const sectionData = await generateSectionContent(organizationId, sectionDef)
    
    sections.push({
      id: sectionDef.id,
      title: sectionDef.title,
      type: sectionDef.type,
      content: sectionData,
      order: sectionDef.order,
      included: true
    })
  }
  
  return {
    organization: {
      id: org.id,
      name: org.name,
      charityNumber: org.charity_number,
      yearEnd: org.financial_year_end
    },
    date: meetingDate,
    sections: sections.sort((a, b) => a.order - b.order),
    metadata: {
      generatedAt: new Date().toISOString(),
      generatedBy: 'system' // Would get from auth context
    }
  }
}

async function generateSectionContent(
  organizationId: string,
  section: SectionDefinition
): Promise<any> {
  const supabase = createServerClient()
  
  switch (section.dataSource) {
    case 'ai-generated':
      return await generateAIContent(organizationId, section.id)
      
    case 'compliance-score':
      const { data: scoreData } = await supabase
        .from('compliance_scores')
        .select('*')
        .eq('organization_id', organizationId)
        .single()
      return scoreData || { overall_score: 0 }
      
    case 'safeguarding-records':
      const { data: safeguardingData } = await supabase
        .from('safeguarding_records')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('expiry_date', { ascending: true })
      return safeguardingData || []
      
    case 'income-records':
      const { data: incomeData } = await supabase
        .from('income_records')
        .select('*')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
      return processIncomeData(incomeData || [])
      
    case 'overseas-activities':
      const { data: overseasData } = await supabase
        .from('overseas_activities')
        .select('*, countries!inner(name)')
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
      return overseasData || []
      
    case 'compliance-history':
      // Would fetch historical compliance scores
      return generateMockComplianceTrends()
      
    default:
      return null
  }
}

async function generateAIContent(organizationId: string, sectionId: string): Promise<string> {
  // Fetch relevant data for AI generation
  const supabase = createServerClient()
  
  const [complianceData, safeguardingData, incomeData] = await Promise.all([
    supabase.from('compliance_scores').select('*').eq('organization_id', organizationId).single(),
    supabase.from('safeguarding_records').select('*').eq('organization_id', organizationId),
    supabase.from('income_records').select('*').eq('organization_id', organizationId)
  ])
  
  const context = {
    compliance: complianceData.data,
    safeguarding: safeguardingData.data || [],
    income: incomeData.data || []
  }
  
  switch (sectionId) {
    case 'executive-summary':
      return await generateComplianceNarrative(context, 'executive-summary')
      
    case 'risk-assessment':
      return await generateRiskAssessment(context)
      
    case 'action-items':
    case 'next-quarter-priorities':
      return await generateComplianceNarrative(context, 'recommendations')
      
    case 'quarterly-overview':
      return await generateComplianceNarrative(context, 'quarterly-summary')
      
    default:
      return 'Content generation pending...'
  }
}

function processIncomeData(incomeRecords: any[]): any {
  // Group by source for chart data
  const bySource = incomeRecords.reduce((acc, record) => {
    if (!acc[record.source]) {
      acc[record.source] = 0
    }
    acc[record.source] += record.amount
    return acc
  }, {} as Record<string, number>)
  
  return {
    total: incomeRecords.reduce((sum, r) => sum + r.amount, 0),
    bySource: Object.entries(bySource).map(([source, amount]) => ({
      name: source.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: amount
    })),
    recordCount: incomeRecords.length
  }
}

function generateMockComplianceTrends(): any {
  // Mock data for demonstration
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    score: 65 + (index * 5) + Math.random() * 10
  }))
}