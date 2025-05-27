import { ComplianceScore } from '@/features/compliance/components/score/compliance-score-card'
import { CategoryBreakdown } from '@/features/compliance/components/score/category-breakdown'
import { Recommendations } from '@/features/compliance/components/score/recommendations'
import { BarChart3 } from 'lucide-react'
import { calculateComplianceScore } from '@/features/compliance/services/compliance-score'
import { getComplianceLevel } from '@/lib/compliance/calculator'

async function ComplianceScoreData() {
  const scoreData = await calculateComplianceScore()
  const level = getComplianceLevel(scoreData.overallScore)
  
  return {
    scoreData,
    level
  }
}

export default async function ComplianceScorePage() {
  const { scoreData, level } = await ComplianceScoreData()
  
  // Transform categories for the CategoryBreakdown component
  const categoryBreakdownData = scoreData.categories.map(cat => ({
    name: cat.name,
    score: cat.currentPoints,
    weight: cat.weight / 100, // Convert percentage to decimal
    description: cat.description,
    issues: cat.items.filter(item => !item.completed).map(item => item.name)
  }))
  
  // Transform recommendations for the Recommendations component
  const recommendationsData = scoreData.recommendations?.map((rec, index) => ({
    id: String(index + 1),
    category: rec.category.toLowerCase(),
    priority: rec.priority,
    title: rec.title,
    description: rec.description,
    actionRequired: rec.action
  })) || []
  
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
              <div className="text-6xl font-extralight text-gray-900 tracking-tighter leading-none">{scoreData.overallScore}</div>
              <div className="text-2xl font-light text-gray-500 leading-none">%</div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <div className={`h-2 w-2 rounded-full ${
                level === 'Excellent' ? 'bg-green-500' :
                level === 'Good' ? 'bg-blue-500' :
                level === 'Fair' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <p className={`text-sm font-medium tracking-wide uppercase ${
                level === 'Excellent' ? 'text-green-600' :
                level === 'Good' ? 'text-blue-600' :
                level === 'Fair' ? 'text-yellow-600' :
                'text-red-600'
              }`}>{level}</p>
            </div>
          </div>
        </div>

        {/* 6-Column Responsive Grid System */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* Compliance Score Card - 4 columns */}
          <div className="lg:col-span-4">
            <ComplianceScore 
              score={{
                overallScore: scoreData.overallScore,
                overallGrade: scoreData.overallGrade,
                lastUpdated: scoreData.lastUpdated,
                nextReviewDate: scoreData.nextReviewDate
              }}
              previousScore={scoreData.overallScore - 3} // Mock previous score
            />
          </div>
          
          {/* Recommendations - 2 columns */}
          <div className="lg:col-span-2">
            <Recommendations recommendations={recommendationsData} />
          </div>

          {/* Category Breakdown - Full width */}
          <div className="lg:col-span-6">
            <CategoryBreakdown categories={categoryBreakdownData} />
          </div>
        </div>
      </div>
  )
}
