export interface ComplianceCategory {
  id?: string
  name: string
  description: string
  weight: number // Percentage weight in overall score
  maxPoints?: number
  currentPoints?: number
  items?: ComplianceItem[]
  score?: number
  issues?: string[]
}

export interface ComplianceItem {
  id: string
  name: string
  description: string
  points: number
  completed: boolean
  dueDate?: string | null
  evidence?: string | null
  notes?: string | null
}

export interface ComplianceScore {
  overallScore: number // 0-100
  overallGrade: ComplianceGrade
  categories: ComplianceCategory[]
  lastUpdated: string
  nextReviewDate: string
  recommendations: ComplianceRecommendation[]
}

export interface ComplianceRecommendation {
  id: string
  priority: 'high' | 'medium' | 'low'
  category: string
  title: string
  description: string
  actionRequired: string
}

export type ComplianceGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export const getGradeFromScore = (score: number): ComplianceGrade => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export const getGradeColor = (grade: ComplianceGrade): string => {
  const colors: Record<ComplianceGrade, string> = {
    'A': 'text-success',
    'B': 'text-primary',
    'C': 'text-sage-600',
    'D': 'text-warning',
    'F': 'text-destructive'
  }
  return colors[grade]
}

export const getGradeBgColor = (grade: ComplianceGrade): string => {
  const colors: Record<ComplianceGrade, string> = {
    'A': 'bg-success/10 border-success/20',
    'B': 'bg-primary/10 border-primary/20',
    'C': 'bg-sage-100 border-sage-200',
    'D': 'bg-warning/10 border-warning/20',
    'F': 'bg-destructive/10 border-destructive/20'
  }
  return colors[grade]
}

// Default compliance categories for UK charities
export const defaultComplianceCategories: Omit<ComplianceCategory, 'currentPoints' | 'items'>[] = [
  {
    id: 'governance',
    name: 'Governance',
    description: 'Board structure, meetings, policies, and decision-making',
    weight: 25,
    maxPoints: 100
  },
  {
    id: 'financial',
    name: 'Financial Management',
    description: 'Accounting, reporting, reserves, and financial controls',
    weight: 25,
    maxPoints: 100
  },
  {
    id: 'regulatory',
    name: 'Regulatory Compliance',
    description: 'Charity Commission requirements, annual returns, and legal obligations',
    weight: 20,
    maxPoints: 100
  },
  {
    id: 'safeguarding',
    name: 'Safeguarding',
    description: 'DBS checks, policies, training, and incident management',
    weight: 15,
    maxPoints: 100
  },
  {
    id: 'fundraising',
    name: 'Fundraising Standards',
    description: 'Ethical fundraising, donor care, and regulatory compliance',
    weight: 10,
    maxPoints: 100
  },
  {
    id: 'data',
    name: 'Data Protection',
    description: 'GDPR compliance, privacy policies, and data security',
    weight: 5,
    maxPoints: 100
  }
]

export function calculateCategoryScore(category: ComplianceCategory): number {
  if (category.maxPoints === 0) return 0
  return Math.round((category.currentPoints / category.maxPoints) * 100)
}

export function calculateOverallScore(categories: ComplianceCategory[]): number {
  const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0)
  if (totalWeight === 0) return 0

  const weightedScore = categories.reduce((sum, cat) => {
    const categoryScore = calculateCategoryScore(cat)
    return sum + (categoryScore * cat.weight)
  }, 0)

  return Math.round(weightedScore / totalWeight)
}