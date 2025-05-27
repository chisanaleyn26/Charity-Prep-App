"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, AlertCircle, CheckCircle, Clock, ArrowRight } from "lucide-react"

interface RecommendationsProps {
  data: any
}

export default function Recommendations({ data }: RecommendationsProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <CardTitle>Recommendations & Actions</CardTitle>
        </div>
        <CardDescription>
          Strategic recommendations and required actions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.recommendations && data.recommendations.length > 0 ? (
          <div className="space-y-3">
            {data.recommendations.map((rec: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium flex-1">{rec.title || 'Recommendation'}</h4>
                  <div className="flex items-center gap-2">
                    {rec.status && getStatusIcon(rec.status)}
                    <Badge variant={getPriorityColor(rec.priority)}>
                      {rec.priority || 'Medium'} Priority
                    </Badge>
                  </div>
                </div>
                
                {rec.description && (
                  <p className="text-sm text-muted-foreground">{rec.description}</p>
                )}
                
                {rec.action_items && rec.action_items.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium">Action Items:</p>
                    <ul className="space-y-1">
                      {rec.action_items.map((item: any, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <ArrowRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                  {rec.deadline && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Due: {rec.deadline}</span>
                    </div>
                  )}
                  {rec.owner && (
                    <div>
                      <span>Owner: {rec.owner}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No recommendations available</p>
          </div>
        )}
        
        {/* Summary */}
        {data?.summary && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {data.summary.high_priority || 0}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {data.summary.medium_priority || 0}
                </div>
                <div className="text-sm text-muted-foreground">Medium Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">
                  {data.summary.low_priority || 0}
                </div>
                <div className="text-sm text-muted-foreground">Low Priority</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}