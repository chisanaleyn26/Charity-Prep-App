import { Lightbulb, AlertTriangle, Info, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ComplianceRecommendation } from '../../types/compliance-score'

interface RecommendationsProps {
  recommendations: ComplianceRecommendation[]
  onActionClick?: (recommendation: ComplianceRecommendation) => void
}

export function Recommendations({ recommendations, onActionClick }: RecommendationsProps) {
  const getPriorityIcon = (priority: ComplianceRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="h-4 w-4" />
      case 'medium':
        return <Lightbulb className="h-4 w-4" />
      case 'low':
        return <Info className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: ComplianceRecommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20'
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20'
      case 'low':
        return 'bg-primary/10 text-primary border-primary/20'
    }
  }

  const getImpactColor = (impact: string) => {
    const points = parseInt(impact.match(/\d+/)?.[0] || '0')
    if (points >= 20) return 'bg-success/10 text-success border-success/20'
    if (points >= 10) return 'bg-primary/10 text-primary border-primary/20'
    return 'bg-sage-100 text-sage-700 border-sage-200'
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>
            Ways to improve your compliance score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Excellent work! No immediate recommendations.</p>
            <p className="text-sm mt-2">Keep maintaining your high standards.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          Recommendations
        </CardTitle>
        <CardDescription>
          Top actions to improve your compliance score
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((recommendation, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border space-y-3 hover:shadow-sm transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${getPriorityColor(recommendation.priority)}`}>
                  {getPriorityIcon(recommendation.priority)}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium">{recommendation.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {recommendation.description}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className={getImpactColor(recommendation.impact)}
              >
                {recommendation.impact}
              </Badge>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between pl-11">
              <div className="space-y-1">
                <p className="text-sm font-medium">{recommendation.action}</p>
                <Badge variant="outline" className="text-xs">
                  {recommendation.category}
                </Badge>
              </div>
              {onActionClick && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => onActionClick(recommendation)}
                  className="gap-1"
                >
                  Take Action
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}