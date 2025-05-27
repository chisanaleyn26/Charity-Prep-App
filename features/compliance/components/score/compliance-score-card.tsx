import { Award, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ComplianceScore, getGradeColor, getGradeBgColor } from '../../types/compliance-score'
import { cn } from '@/lib/utils'

interface ComplianceScoreCardProps {
  score: ComplianceScore
  previousScore?: number
}

export function ComplianceScoreCard({ score, previousScore }: ComplianceScoreCardProps) {
  const scoreDiff = previousScore ? score.overallScore - previousScore : 0
  const showTrend = previousScore !== undefined

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-gray-600' 
    return 'bg-red-500'
  }

  const getTrendColor = (diff: number) => {
    if (diff > 0) return 'text-green-600 bg-green-50 border-green-200'
    if (diff < 0) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-gray-600 bg-gray-100 border-gray-200'
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-30" />
      
      <div className="relative z-10 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-gray-600" />
              Compliance Score
            </h3>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">
              Your charity&apos;s overall compliance health
            </p>
          </div>
          <Award className="h-8 w-8 text-gray-400" />
        </div>

        {/* Score Display */}
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <div className="flex items-baseline justify-center gap-2">
              <div className="text-7xl font-extralight text-gray-900 tracking-tighter leading-none">
                {score.overallScore}
              </div>
              <div className="text-3xl font-light text-gray-500 leading-none">%</div>
            </div>
            
            <Badge 
              variant="outline" 
              className="text-lg px-4 py-2 bg-gray-100 text-gray-700 border border-gray-200 font-bold tracking-wider"
            >
              Grade {score.overallGrade}
            </Badge>
          </div>
          
          {showTrend && (
            <div className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold tracking-wide',
              getTrendColor(scoreDiff)
            )}>
              {scoreDiff > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4" />
                  <span>+{scoreDiff} points</span>
                </>
              ) : scoreDiff < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4" />
                  <span>{scoreDiff} points</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4" />
                  <span>No change</span>
                </>
              )}
              <span className="text-gray-500">from last review</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="h-4 bg-gray-100 rounded-2xl overflow-hidden">
            <div
              className={cn(
                'h-full rounded-2xl transition-all duration-1000 ease-out',
                getProgressColor(score.overallScore)
              )}
              style={{ width: `${score.overallScore}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 font-medium">
            <span>0</span>
            <span>50</span>
            <span>100</span>
          </div>
        </div>

        {/* Grade Scale */}
        <div className="grid grid-cols-5 gap-2">
          {(['F', 'D', 'C', 'B', 'A'] as const).map((grade) => (
            <div
              key={grade}
              className={cn(
                'text-center py-3 rounded-xl text-sm font-bold transition-all tracking-wider',
                grade === score.overallGrade
                  ? 'bg-gray-200 text-gray-900 border-2 border-gray-400'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              )}
            >
              {grade}
            </div>
          ))}
        </div>

        {/* Review Dates */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium tracking-wide">Last Updated</span>
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              {new Date(score.lastUpdated).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500 font-medium tracking-wide">Next Review</span>
            <span className="text-sm font-semibold text-gray-900 tracking-wide">
              {new Date(score.nextReviewDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export alias for backward compatibility
export { ComplianceScoreCard as ComplianceScore }