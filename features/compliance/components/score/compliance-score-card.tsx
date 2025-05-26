import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ComplianceScore, getGradeColor, getGradeBgColor } from '../../types/compliance-score'

interface ComplianceScoreCardProps {
  score: ComplianceScore
  previousScore?: number
}

export function ComplianceScoreCard({ score, previousScore }: ComplianceScoreCardProps) {
  const scoreDiff = previousScore ? score.overallScore - previousScore : 0
  const showTrend = previousScore !== undefined

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Compliance Score</CardTitle>
          <Award className={`h-6 w-6 ${getGradeColor(score.overallGrade)}`} />
        </div>
        <CardDescription>
          Your charity's overall compliance health
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <div className="text-5xl font-bold">{score.overallScore}</div>
            <Badge 
              variant="outline" 
              className={`text-2xl px-4 py-2 ${getGradeBgColor(score.overallGrade)} ${getGradeColor(score.overallGrade)}`}
            >
              Grade {score.overallGrade}
            </Badge>
          </div>
          
          {showTrend && (
            <div className="flex items-center justify-center gap-1 text-sm">
              {scoreDiff > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-success" />
                  <span className="text-success">+{scoreDiff} points</span>
                </>
              ) : scoreDiff < 0 ? (
                <>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  <span className="text-destructive">{scoreDiff} points</span>
                </>
              ) : (
                <>
                  <Minus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">No change</span>
                </>
              )}
              <span className="text-muted-foreground">from last review</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={score.overallScore} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
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
              className={`text-center py-2 rounded-md text-sm font-medium transition-all ${
                grade === score.overallGrade
                  ? `${getGradeBgColor(grade)} ${getGradeColor(grade)} ring-2 ring-offset-2 ring-primary`
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {grade}
            </div>
          ))}
        </div>

        {/* Review Date */}
        <div className="pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {new Date(score.lastUpdated).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-muted-foreground">Next Review</span>
            <span className="font-medium text-primary">
              {new Date(score.nextReviewDate).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}