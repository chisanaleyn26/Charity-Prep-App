import { z } from 'zod'

// Board Pack Section Types
export type BoardPackSectionType = 
  | 'compliance-overview'
  | 'financial-summary'
  | 'risk-analysis'
  | 'fundraising-report'
  | 'safeguarding-report'
  | 'overseas-activities'
  | 'key-metrics'
  | 'recommendations'
  | 'narrative-summary'

// Section Configuration
export interface BoardPackSection {
  id: string
  type: BoardPackSectionType
  title: string
  description: string
  enabled: boolean
  order: number
  config?: Record<string, any>
}

// Template Definition
export interface BoardPackTemplate {
  id: string
  name: string
  description: string
  sections: BoardPackSection[]
  isDefault?: boolean
  createdAt: Date
  updatedAt: Date
}

// Board Pack Data
export interface BoardPackData {
  organizationId: string
  templateId: string
  generatedAt: Date
  period: {
    start: Date
    end: Date
  }
  sections: {
    [key: string]: any
  }
  metadata: {
    preparedBy: string
    approvedBy?: string
    notes?: string
  }
}

// Section Data Types
export interface ComplianceOverviewData {
  overallScore: number
  categoryScores: {
    category: string
    score: number
    trend: 'up' | 'down' | 'stable'
  }[]
  urgentActions: {
    title: string
    priority: 'high' | 'medium' | 'low'
    dueDate?: string
  }[]
}

export interface FinancialSummaryData {
  totalIncome: number
  totalExpenses: number
  netSurplus: number
  incomeBySource: {
    source: string
    amount: number
    percentage: number
  }[]
  expensesByCategory: {
    category: string
    amount: number
    percentage: number
  }[]
  cashFlow: {
    month: string
    income: number
    expenses: number
    balance: number
  }[]
}

export interface RiskAnalysisData {
  riskMatrix: {
    category: string
    likelihood: 1 | 2 | 3 | 4 | 5
    impact: 1 | 2 | 3 | 4 | 5
    rating: 'critical' | 'high' | 'medium' | 'low'
    mitigations: string[]
  }[]
  topRisks: {
    title: string
    description: string
    owner: string
    status: 'new' | 'monitoring' | 'mitigated'
  }[]
}

// Zod Schemas
export const BoardPackSectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    'compliance-overview',
    'financial-summary',
    'risk-analysis',
    'fundraising-report',
    'safeguarding-report',
    'overseas-activities',
    'key-metrics',
    'recommendations',
    'narrative-summary'
  ]),
  title: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  order: z.number(),
  config: z.record(z.any()).optional()
})

export const BoardPackTemplateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string(),
  sections: z.array(BoardPackSectionSchema),
  isDefault: z.boolean().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
})

// Default Templates
export const DEFAULT_BOARD_PACK_TEMPLATES: BoardPackTemplate[] = [
  {
    id: 'standard-quarterly',
    name: 'Standard Quarterly Report',
    description: 'Comprehensive quarterly board pack with all key sections',
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'compliance-1',
        type: 'compliance-overview',
        title: 'Compliance Overview',
        description: 'Current compliance status and trends',
        enabled: true,
        order: 1
      },
      {
        id: 'financial-1',
        type: 'financial-summary',
        title: 'Financial Summary',
        description: 'Income, expenses, and cash flow analysis',
        enabled: true,
        order: 2
      },
      {
        id: 'risk-1',
        type: 'risk-analysis',
        title: 'Risk Analysis',
        description: 'Current risk assessment and mitigation strategies',
        enabled: true,
        order: 3
      },
      {
        id: 'fundraising-1',
        type: 'fundraising-report',
        title: 'Fundraising Report',
        description: 'Fundraising activities and performance',
        enabled: true,
        order: 4
      },
      {
        id: 'safeguarding-1',
        type: 'safeguarding-report',
        title: 'Safeguarding Report',
        description: 'Safeguarding incidents and compliance',
        enabled: true,
        order: 5
      },
      {
        id: 'recommendations-1',
        type: 'recommendations',
        title: 'Recommendations',
        description: 'Key recommendations for the board',
        enabled: true,
        order: 6
      }
    ]
  },
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'Concise board pack focusing on key metrics and actions',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'metrics-1',
        type: 'key-metrics',
        title: 'Key Metrics Dashboard',
        description: 'High-level organizational KPIs',
        enabled: true,
        order: 1
      },
      {
        id: 'narrative-1',
        type: 'narrative-summary',
        title: 'Executive Summary',
        description: 'AI-generated narrative summary',
        enabled: true,
        order: 2
      },
      {
        id: 'recommendations-2',
        type: 'recommendations',
        title: 'Strategic Recommendations',
        description: 'Priority actions for board consideration',
        enabled: true,
        order: 3
      }
    ]
  },
  {
    id: 'compliance-focused',
    name: 'Compliance Focus',
    description: 'Detailed compliance and regulatory reporting',
    createdAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 'compliance-2',
        type: 'compliance-overview',
        title: 'Compliance Dashboard',
        description: 'Comprehensive compliance status',
        enabled: true,
        order: 1
      },
      {
        id: 'safeguarding-2',
        type: 'safeguarding-report',
        title: 'Safeguarding Compliance',
        description: 'Detailed safeguarding analysis',
        enabled: true,
        order: 2
      },
      {
        id: 'fundraising-2',
        type: 'fundraising-report',
        title: 'Fundraising Compliance',
        description: 'Fundraising regulatory compliance',
        enabled: true,
        order: 3
      },
      {
        id: 'overseas-1',
        type: 'overseas-activities',
        title: 'Overseas Activities',
        description: 'International operations compliance',
        enabled: true,
        order: 4
      },
      {
        id: 'risk-2',
        type: 'risk-analysis',
        title: 'Compliance Risks',
        description: 'Risk assessment focused on compliance',
        enabled: true,
        order: 5
      }
    ]
  }
]

// Export Format Options
export type ExportFormat = 'pdf' | 'docx' | 'pptx' | 'html'

export interface ExportOptions {
  format: ExportFormat
  includeCharts: boolean
  includeAppendices: boolean
  brandingEnabled: boolean
  headerText?: string
  footerText?: string
}