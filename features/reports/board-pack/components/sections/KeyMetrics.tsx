"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, BarChart3, Target, Activity } from "lucide-react"

interface KeyMetricsProps {
  data: any
}

export default function KeyMetrics({ data }: KeyMetricsProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'financial':
        return <BarChart3 className="h-5 w-5" />
      case 'compliance':
        return <Target className="h-5 w-5" />
      case 'operational':
        return <Activity className="h-5 w-5" />
      default:
        return <BarChart3 className="h-5 w-5" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle>Key Performance Metrics</CardTitle>
        </div>
        <CardDescription>
          Critical indicators and performance trends
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data?.metrics && data.metrics.length > 0 ? (
          <div className="grid gap-4">
            {data.metrics.map((metric: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMetricIcon(metric.type)}
                    <h4 className="font-medium">{metric.name || 'Unnamed Metric'}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    {metric.trend && getTrendIcon(metric.trend)}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {metric.change || '0%'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Current</span>
                    <span className="font-medium">
                      {metric.current_value || 'N/A'}
                    </span>
                  </div>
                  
                  {metric.target && (
                    <>
                      <Progress 
                        value={metric.progress || 0} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-medium">{metric.target}</span>
                      </div>
                    </>
                  )}
                  
                  {metric.description && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {metric.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No metrics data available</p>
          </div>
        )}
        
        {/* Summary Stats */}
        {data?.summary && (
          <div className="border-t pt-4 grid grid-cols-3 gap-4">
            {data.summary.on_track && (
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {data.summary.on_track}
                </div>
                <div className="text-sm text-muted-foreground">On Track</div>
              </div>
            )}
            {data.summary.at_risk && (
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600">
                  {data.summary.at_risk}
                </div>
                <div className="text-sm text-muted-foreground">At Risk</div>
              </div>
            )}
            {data.summary.off_track && (
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {data.summary.off_track}
                </div>
                <div className="text-sm text-muted-foreground">Off Track</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}