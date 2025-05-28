import { Suspense } from 'react'
import { 
  KPICards,
  ComplianceTrendChart,
  CategoryBreakdownChart,
  ActivityFeed,
  KPICardsSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton
} from '@/features/dashboard/components'
import { Award, TrendingUp, Bell, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getDashboardData } from '@/lib/api/dashboard'
import { getCurrentOrganization, getUser } from '@/lib/api/auth'
import { redirect } from 'next/navigation'
import { mockKPIs, mockActivityFeed, mockComplianceScore } from '@/lib/mock-data'

// MOCK MODE
const MOCK_MODE = true

export default async function DashboardPage() {
  // Use mock data in mock mode
  if (MOCK_MODE) {
    const dashboardData = {
      compliance: {
        score: mockComplianceScore.overall_score,
        level: mockComplianceScore.overall_score >= 80 ? 'Excellent' : 
               mockComplianceScore.overall_score >= 60 ? 'Good' : 
               mockComplianceScore.overall_score >= 40 ? 'Fair' : 'Poor',
        breakdown: mockComplianceScore.category_scores
      },
      quickStats: {
        safeguarding: {
          total: 15,
          expiring: 3,
          expired: 1
        },
        overseas: {
          countries: 2,
          highRisk: 0
        },
        fundraising: {
          active: 2,
          total: 75000
        }
      },
      recentActivity: mockActivityFeed
    }
    
    const user = { full_name: 'John Doe' }
    
    return renderDashboard(dashboardData, user)
  }

  // Real data flow
  const [organization, user] = await Promise.all([
    getCurrentOrganization(),
    getUser()
  ])
  
  if (!organization) {
    redirect('/onboarding')
  }
  
  const dashboardData = await getDashboardData(organization.id)
  
  if ('error' in dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">Failed to load dashboard data</p>
      </div>
    )
  }
  
  return renderDashboard(dashboardData, user)
}

function renderDashboard(dashboardData: any, user: any) {
  return (
    <div className="space-y-8">
      {/* Enhanced Typography Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Welcome back{user?.full_name ? `, ${user.full_name}` : ''}. Here&apos;s your compliance overview.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-baseline gap-1">
            <div className="text-6xl font-extralight text-gray-900 tracking-tighter leading-none">{dashboardData.compliance.score}</div>
            <div className="text-2xl font-light text-gray-500 leading-none">%</div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className={`h-2 w-2 rounded-full ${
              dashboardData.compliance.level === 'Excellent' ? 'bg-green-500' :
              dashboardData.compliance.level === 'Good' ? 'bg-blue-500' :
              dashboardData.compliance.level === 'Fair' ? 'bg-yellow-500' :
              'bg-red-500'
            }`}></div>
            <p className={`text-sm font-medium tracking-wide uppercase ${
              dashboardData.compliance.level === 'Excellent' ? 'text-green-600' :
              dashboardData.compliance.level === 'Good' ? 'text-blue-600' :
              dashboardData.compliance.level === 'Fair' ? 'text-yellow-600' :
              'text-red-600'
            }`}>{dashboardData.compliance.level}</p>
          </div>
        </div>
      </div>

      {/* 6-Column Responsive Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* KPI Cards - 4 columns across top */}
        <div className="lg:col-span-6">
          <Suspense fallback={<KPICardsSkeleton />}>
            <KPICards dashboardData={dashboardData} />
          </Suspense>
        </div>
        
        {/* Compliance Trend Chart - 4 columns */}
        <div className="lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <ComplianceTrendChart organizationId="mock-org-123" />
          </Suspense>
        </div>
        
        {/* Activity Feed - 2 columns (compressed) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeed activities={dashboardData.recentActivity} />
          </Suspense>
        </div>

        {/* Category Breakdown - Split into two 3-column sections */}
        <div className="lg:col-span-6">
          <Suspense fallback={<ChartSkeleton />}>
            <CategoryBreakdownChart breakdown={dashboardData.compliance.breakdown} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}