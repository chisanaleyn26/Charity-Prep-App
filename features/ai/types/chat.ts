export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  sources?: {
    type: 'regulation' | 'guidance' | 'internal_data'
    title: string
    reference?: string
    link?: string
  }[]
  feedback?: 'positive' | 'negative'
  retryCount?: number
}

export interface ChatContext {
  organizationType?: string
  organizationName?: string
  charityNumber?: string
  income?: number
  hasOverseasActivities?: boolean
  workWithChildren?: boolean
  workWithVulnerableAdults?: boolean
  financialYearEnd?: string
}

export interface ComplianceAlert {
  id: string
  type: 'warning' | 'info' | 'deadline' | 'error'
  title: string
  message: string
  dueDate?: Date
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export interface RelatedGuidance {
  id: string
  title: string
  summary: string
  category: string
  link?: string
  relevanceScore?: number
}