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
        return 'bg-red-50 text-red-600 border border-red-200'
      case 'medium':
        return 'bg-gray-100 text-gray-600 border border-gray-200'
      case 'low':
        return 'bg-gray-100 text-gray-600 border border-gray-200'
    }
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight flex items-center gap-3">
              <Lightbulb className="h-6 w-6 text-gray-600" />
              Recommendations
            </h3>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">
              Ways to improve your score
            </p>
          </div>
          
          <div className="text-center py-12">
            <Lightbulb className="h-16 w-16 mx-auto mb-6 text-gray-300" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2 tracking-wide">Excellent work!</h4>
            <p className="text-gray-600 font-medium tracking-wide">No immediate recommendations.</p>
            <p className="text-sm text-gray-500 mt-2 font-medium">Keep maintaining your high standards.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
      <div className="space-y-8">
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-gray-600" />
            Recommendations
          </h3>
          <p className="text-gray-600 font-medium tracking-wide leading-relaxed">
            Top actions to improve your compliance score
          </p>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div
              key={recommendation.id}
              className="p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300 space-y-4"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${getPriorityColor(recommendation.priority)}`}>
                    {getPriorityIcon(recommendation.priority)}
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">
                      {recommendation.title}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium tracking-wide leading-relaxed">
                      {recommendation.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold uppercase tracking-wider"
                >
                  {recommendation.priority}
                </Badge>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between pl-16">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-900 tracking-wide">
                    {recommendation.actionRequired}
                  </p>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border border-gray-200 text-xs font-medium">
                    {recommendation.category}
                  </Badge>
                </div>
                {onActionClick && (
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => onActionClick(recommendation)}
                    className="gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-800 transition-all duration-300 px-4 py-2 rounded-xl border border-gray-200"
                  >
                    <span className="text-sm font-semibold tracking-wide">Take Action</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}