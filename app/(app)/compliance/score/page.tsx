'use client'

import { Suspense } from 'react'
import { Award, RefreshCw } from 'lucide-react'
import { ComplianceScoreCard } from '@/features/compliance/components/score/compliance-score-card'
import { CategoryBreakdown } from '@/features/compliance/components/score/category-breakdown'
import { Recommendations } from '@/features/compliance/components/score/recommendations'
import { calculateComplianceScore } from '@/features/compliance/services/compliance-score'
import { Button } from '@/components/ui/button'
import { use } from 'react'

function ScoreSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="space-y-6">
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  )
}

// Create a wrapper component to handle the promise
function ComplianceScoreContent() {
  const scorePromise = calculateComplianceScore()
  const score = use(scorePromise)

  const handleRecommendationAction = (recommendation: any) => {
    // Navigate to the relevant section based on the category
    const categoryRoutes: Record<string, string> = {
      'Safeguarding': '/compliance/safeguarding',
      'Fundraising Standards': '/compliance/fundraising',
      'Regulatory Compliance': '/compliance/overseas-activities',
      'Governance': '/settings/organization',
      'Financial Management': '/reports',
      'Data Protection': '/settings/security'
    }
    
    const route = categoryRoutes[recommendation.category]
    if (route) {
      window.location.href = route
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Score Card */}
      <div className="space-y-6">
        <ComplianceScoreCard score={score} previousScore={82} />
        <Recommendations 
          recommendations={score.recommendations}
          onActionClick={handleRecommendationAction}
        />
      </div>

      {/* Right Column - Categories */}
      <div className="lg:col-span-2">
        <CategoryBreakdown categories={score.categories} />
      </div>
    </div>
  )
}

export default function ComplianceScorePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-primary" />
            Compliance Score
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and improve your charity&apos;s compliance health
          </p>
        </div>
        
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Recalculate
        </Button>
      </div>

      {/* Score Dashboard */}
      <Suspense fallback={<ScoreSkeleton />}>
        <ComplianceScoreContent />
      </Suspense>
    </div>
  )
}