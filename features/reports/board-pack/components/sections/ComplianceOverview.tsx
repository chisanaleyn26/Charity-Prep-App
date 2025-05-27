import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { ComplianceOverviewData } from '../../types/board-pack'

interface ComplianceOverviewProps {
  data: ComplianceOverviewData
}

export default function ComplianceOverview({ data }: ComplianceOverviewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { variant: 'default' as const, text: 'Excellent' }
    if (score >= 70) return { variant: 'secondary' as const, text: 'Good' }
    return { variant: 'destructive' as const, text: 'Needs Attention' }
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const scoreBadge = getScoreBadge(data.overallScore)

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center p-6 rounded-lg border">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            Overall Compliance Score
          </h3>
          <div className={`text-5xl font-bold ${getScoreColor(data.overallScore)}`}>
            {data.overallScore}%
          </div>
          <Badge variant={scoreBadge.variant}>
            {scoreBadge.text}
          </Badge>
        </div>
        <Progress 
          value={data.overallScore} 
          className="mt-4 h-3"
        />
      </div>

      {/* Category Scores */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        <div className="space-y-3">
          {data.categoryScores.map((category) => (
            <div key={category.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">
                    {category.category.replace('-', ' ')}
                  </span>
                  {getTrendIcon(category.trend)}
                </div>
                <span className={`font-semibold ${getScoreColor(category.score)}`}>
                  {category.score}%
                </span>
              </div>
              <Progress value={category.score} className="h-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Urgent Actions */}
      {data.urgentActions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            Urgent Actions Required
          </h3>
          <div className="space-y-2">
            {data.urgentActions.map((action, index) => (
              <Alert key={index} className="border-l-4 border-l-amber-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertDescription className="font-medium">
                      {action.title}
                    </AlertDescription>
                    {action.dueDate && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Due: {new Date(action.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Badge 
                    variant={action.priority === 'high' ? 'destructive' : 'secondary'}
                    className="ml-2"
                  >
                    {action.priority}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-start gap-3">
          {data.overallScore >= 90 ? (
            <>
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Excellent Compliance Status</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your charity maintains high compliance standards across all categories. 
                  Continue regular monitoring to maintain this excellent status.
                </p>
              </div>
            </>
          ) : data.overallScore >= 70 ? (
            <>
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium">Good Compliance with Room for Improvement</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Overall compliance is satisfactory, but addressing the urgent actions 
                  will help achieve excellent status.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium">Immediate Attention Required</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Compliance score indicates significant issues that need immediate attention. 
                  Focus on addressing urgent actions to avoid regulatory concerns.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}