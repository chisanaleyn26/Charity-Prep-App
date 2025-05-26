import { ComplianceScore } from '@/features/compliance/components/score/compliance-score-card'
import { CategoryBreakdown } from '@/features/compliance/components/score/category-breakdown'
import { Recommendations } from '@/features/compliance/components/score/recommendations'
import { BarChart3, TrendingUp, Shield, Target } from 'lucide-react'

export default function ComplianceScorePage() {
  return (
    <div className="space-y-10">
      {/* Enhanced Typography Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <BarChart3 className="h-12 w-12 text-gray-600" />
            Compliance Score
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Track your charity&apos;s compliance health and performance metrics.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-baseline gap-1">
            <div className="text-6xl font-extralight text-gray-900 tracking-tighter leading-none">92</div>
            <div className="text-2xl font-light text-gray-500 leading-none">%</div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-600 tracking-wide uppercase">Excellent</p>
          </div>
        </div>
      </div>

      {/* 6-Column Responsive Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* Compliance Score Card - 4 columns */}
        <div className="lg:col-span-4">
          <ComplianceScore 
            score={{
              overallScore: 92,
              overallGrade: 'A',
              lastUpdated: new Date().toISOString(),
              nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
            }}
            previousScore={89}
          />
        </div>
        
        {/* Recommendations - 2 columns */}
        <div className="lg:col-span-2">
          <Recommendations 
            recommendations={[
              {
                id: '1',
                category: 'safeguarding',
                priority: 'high',
                title: 'Update DBS Checks',
                description: 'Three DBS certificates will expire in the next 60 days',
                actionRequired: 'Review and renew expiring certificates'
              },
              {
                id: '2',
                category: 'fundraising',
                priority: 'medium',
                title: 'Document Major Donors',
                description: 'Add documentation for donations over £5,000',
                actionRequired: 'Upload supporting documents'
              }
            ]}
          />
        </div>

        {/* Category Breakdown - Full width */}
        <div className="lg:col-span-6">
          <CategoryBreakdown 
            categories={[
              {
                name: 'Safeguarding',
                score: 95,
                weight: 0.4,
                description: 'DBS checks and policies',
                issues: []
              },
              {
                name: 'Fundraising',
                score: 88,
                weight: 0.3,
                description: 'Income tracking and documentation',
                issues: ['Missing gift aid declarations']
              },
              {
                name: 'Overseas Activities',
                score: 94,
                weight: 0.3,
                description: 'International operations compliance',
                issues: []
              }
            ]}
          />
        </div>
      </div>
    </div>
  )
}
