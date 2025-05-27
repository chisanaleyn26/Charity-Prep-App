import { createClient } from '@/lib/supabase/server'
import { 
  ComplianceCategory, 
  ComplianceScore, 
  ComplianceRecommendation,
  calculateOverallScore,
  getGradeFromScore,
  defaultComplianceCategories
} from '../types/compliance-score'
// import { getSafeguardingStats } from './safeguarding'
import { getFundraisingStats } from './fundraising'
// import { getOverseasStats } from './overseas-activities'

export async function calculateComplianceScore(): Promise<ComplianceScore> {
  const supabase = await createClient()
  
  // Get current user's organization
  const { data: userData } = await supabase.auth.getUser()
  const organizationId = userData.user?.user_metadata?.organization_id

  // Gather data from various modules
  const fundraisingStats = await getFundraisingStats()
  
  // Temporarily provide default stats
  const safeguardingStats = {
    totalRecords: 0,
    expiringRecords: 0,
    needingRenewal: 0,
    complianceRate: 100
  }
  
  const overseasStats = {
    totalCountries: 0,
    activeActivities: 0,
    totalAnnualSpend: 0,
    highRiskActivities: 0
  }

  // Build categories with actual data
  const categories: ComplianceCategory[] = [
    {
      id: 'governance',
      name: 'Governance',
      description: 'Board structure, meetings, policies, and decision-making',
      weight: 25,
      maxPoints: 100,
      currentPoints: 75, // This would be calculated from actual governance data
      items: [
        {
          id: 'board-meetings',
          name: 'Regular Board Meetings',
          description: 'Hold at least 4 board meetings per year',
          points: 25,
          completed: true
        },
        {
          id: 'board-diversity',
          name: 'Board Diversity',
          description: 'Diverse board with varied skills and backgrounds',
          points: 20,
          completed: true
        },
        {
          id: 'conflict-policy',
          name: 'Conflict of Interest Policy',
          description: 'Up-to-date conflict of interest policy',
          points: 15,
          completed: true
        },
        {
          id: 'risk-register',
          name: 'Risk Register',
          description: 'Maintain and review risk register quarterly',
          points: 20,
          completed: false
        },
        {
          id: 'strategic-plan',
          name: 'Strategic Plan',
          description: 'Current 3-5 year strategic plan',
          points: 20,
          completed: true
        }
      ]
    },
    {
      id: 'financial',
      name: 'Financial Management',
      description: 'Accounting, reporting, reserves, and financial controls',
      weight: 25,
      maxPoints: 100,
      currentPoints: 85,
      items: [
        {
          id: 'annual-accounts',
          name: 'Annual Accounts',
          description: 'File annual accounts on time',
          points: 30,
          completed: true
        },
        {
          id: 'reserves-policy',
          name: 'Reserves Policy',
          description: 'Maintain appropriate reserves (3-6 months)',
          points: 25,
          completed: true
        },
        {
          id: 'financial-controls',
          name: 'Financial Controls',
          description: 'Dual authorization for payments',
          points: 20,
          completed: true
        },
        {
          id: 'budget-monitoring',
          name: 'Budget Monitoring',
          description: 'Monthly budget vs actual reviews',
          points: 15,
          completed: true
        },
        {
          id: 'audit',
          name: 'Independent Audit',
          description: 'Annual independent audit or examination',
          points: 10,
          completed: false
        }
      ]
    },
    {
      id: 'regulatory',
      name: 'Regulatory Compliance',
      description: 'Charity Commission requirements, annual returns, and legal obligations',
      weight: 20,
      maxPoints: 100,
      currentPoints: 90,
      items: [
        {
          id: 'annual-return',
          name: 'Annual Return',
          description: 'Submit annual return to Charity Commission',
          points: 40,
          completed: true
        },
        {
          id: 'trustees-update',
          name: 'Trustee Details',
          description: 'Keep trustee details up to date',
          points: 20,
          completed: true
        },
        {
          id: 'serious-incidents',
          name: 'Serious Incident Reporting',
          description: 'Report serious incidents promptly',
          points: 20,
          completed: true
        },
        {
          id: 'public-benefit',
          name: 'Public Benefit Reporting',
          description: 'Clear public benefit statement',
          points: 20,
          completed: true
        }
      ]
    },
    {
      id: 'safeguarding',
      name: 'Safeguarding',
      description: 'DBS checks, policies, training, and incident management',
      weight: 15,
      maxPoints: 100,
      currentPoints: Math.round(safeguardingStats.complianceRate),
      items: [
        {
          id: 'dbs-checks',
          name: 'DBS Checks',
          description: 'All eligible staff and volunteers have valid DBS checks',
          points: 40,
          completed: safeguardingStats.complianceRate >= 95
        },
        {
          id: 'safeguarding-policy',
          name: 'Safeguarding Policy',
          description: 'Comprehensive safeguarding policy in place',
          points: 30,
          completed: true
        },
        {
          id: 'safeguarding-training',
          name: 'Safeguarding Training',
          description: 'Annual safeguarding training for all staff',
          points: 20,
          completed: false
        },
        {
          id: 'designated-lead',
          name: 'Designated Safeguarding Lead',
          description: 'Appointed DSL with appropriate training',
          points: 10,
          completed: true
        }
      ]
    },
    {
      id: 'fundraising',
      name: 'Fundraising Standards',
      description: 'Ethical fundraising, donor care, and regulatory compliance',
      weight: 10,
      maxPoints: 100,
      currentPoints: fundraisingStats.needingCompliance > 0 ? 70 : 95,
      items: [
        {
          id: 'fundraising-regulation',
          name: 'Fundraising Regulation',
          description: 'Registered with Fundraising Regulator',
          points: 25,
          completed: true
        },
        {
          id: 'donor-charter',
          name: 'Donor Charter',
          description: 'Published donor charter and promises',
          points: 20,
          completed: true
        },
        {
          id: 'complaints-procedure',
          name: 'Complaints Procedure',
          description: 'Clear fundraising complaints procedure',
          points: 20,
          completed: true
        },
        {
          id: 'compliance-checks',
          name: 'Activity Compliance',
          description: 'All fundraising activities have compliance checks',
          points: 35,
          completed: fundraisingStats.needingCompliance === 0
        }
      ]
    },
    {
      id: 'data',
      name: 'Data Protection',
      description: 'GDPR compliance, privacy policies, and data security',
      weight: 5,
      maxPoints: 100,
      currentPoints: 80,
      items: [
        {
          id: 'privacy-policy',
          name: 'Privacy Policy',
          description: 'GDPR-compliant privacy policy',
          points: 30,
          completed: true
        },
        {
          id: 'data-register',
          name: 'Data Processing Register',
          description: 'Maintain register of processing activities',
          points: 25,
          completed: true
        },
        {
          id: 'consent-management',
          name: 'Consent Management',
          description: 'Proper consent records for communications',
          points: 25,
          completed: true
        },
        {
          id: 'data-breach-procedure',
          name: 'Data Breach Procedure',
          description: 'Documented data breach response procedure',
          points: 20,
          completed: false
        }
      ]
    }
  ]

  // Calculate overall score
  const overallScore = calculateOverallScore(categories)
  const overallGrade = getGradeFromScore(overallScore)

  // Generate recommendations based on gaps
  const recommendations = generateRecommendations(categories, { 
    safeguardingStats, 
    fundraisingStats, 
    overseasStats 
  })

  return {
    overallScore,
    overallGrade,
    categories,
    lastUpdated: new Date().toISOString(),
    nextReviewDate: getNextReviewDate(),
    recommendations
  }
}

function generateRecommendations(
  categories: ComplianceCategory[],
  stats: {
    safeguardingStats: any
    fundraisingStats: any
    overseasStats: any
  }
): ComplianceRecommendation[] {
  const recommendations: ComplianceRecommendation[] = []

  // Check each category for improvement opportunities
  categories.forEach(category => {
    const categoryScore = calculateCategoryScore(category)
    
    // Find incomplete items
    const incompleteItems = category.items.filter(item => !item.completed)
    
    if (incompleteItems.length > 0) {
      // Add high priority recommendations for low-scoring categories
      if (categoryScore < 70) {
        incompleteItems.slice(0, 2).forEach(item => {
          recommendations.push({
            priority: 'high',
            category: category.name,
            title: item.name,
            description: item.description,
            action: `Complete: ${item.name}`,
            impact: `+${item.points} points`
          })
        })
      } else {
        // Add medium priority for better-performing categories
        incompleteItems.slice(0, 1).forEach(item => {
          recommendations.push({
            priority: 'medium',
            category: category.name,
            title: item.name,
            description: item.description,
            action: `Complete: ${item.name}`,
            impact: `+${item.points} points`
          })
        })
      }
    }
  })

  // Add specific recommendations based on stats
  if (stats.safeguardingStats.expired > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Safeguarding',
      title: 'Expired DBS Checks',
      description: `${stats.safeguardingStats.expired} DBS checks have expired`,
      action: 'Renew expired DBS checks immediately',
      impact: `+${Math.min(stats.safeguardingStats.expired * 5, 20)} points`
    })
  }

  if (stats.fundraisingStats.needingCompliance > 0) {
    recommendations.push({
      priority: 'high',
      category: 'Fundraising Standards',
      title: 'Compliance Checks Needed',
      description: `${stats.fundraisingStats.needingCompliance} activities need compliance checks`,
      action: 'Complete compliance checks for active fundraising',
      impact: '+10 points'
    })
  }

  if (stats.overseasStats.highRiskActivities > 0) {
    recommendations.push({
      priority: 'medium',
      category: 'Regulatory Compliance',
      title: 'High Risk Overseas Activities',
      description: `${stats.overseasStats.highRiskActivities} high-risk overseas activities`,
      action: 'Review and mitigate risks for overseas operations',
      impact: '+5 points'
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations.slice(0, 5) // Return top 5 recommendations
}

function getNextReviewDate(): string {
  const nextReview = new Date()
  nextReview.setMonth(nextReview.getMonth() + 3) // Quarterly review
  return nextReview.toISOString()
}

function calculateCategoryScore(category: ComplianceCategory): number {
  const completedPoints = category.items
    .filter(item => item.completed)
    .reduce((sum, item) => sum + item.points, 0)
  
  const totalPoints = category.items.reduce((sum, item) => sum + item.points, 0)
  
  if (totalPoints === 0) return 0
  return Math.round((completedPoints / totalPoints) * 100)
}

// Export alias for compatibility
export { calculateComplianceScore as getComplianceScore }