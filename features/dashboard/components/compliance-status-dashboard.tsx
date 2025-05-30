'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  Globe, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Target
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import type { ComplianceStatistics } from '@/lib/services/compliance-statistics.service'
import { logActivity } from '@/lib/services/activity-logging.service'
import { ActivityTypes } from '@/lib/constants/activity-types'

interface ComplianceStatusDashboardProps {
  organizationId: string
}

interface ComplianceData {
  statistics: ComplianceStatistics | null
  loading: boolean
  error: string | null
}

export function ComplianceStatusDashboard({ organizationId }: ComplianceStatusDashboardProps) {
  const [data, setData] = useState<ComplianceData>({
    statistics: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setData(prev => ({ ...prev, loading: true, error: null }))
        
        const response = await fetch('/api/compliance/statistics')
        if (!response.ok) {
          throw new Error('Failed to fetch compliance data')
        }
        
        const statistics = await response.json()
        setData({ statistics, loading: false, error: null })
        
        // Log compliance dashboard view
        await logActivity({
          activity_type: ActivityTypes.COMPLIANCE_SCORE_VIEW,
          metadata: {
            source: 'dashboard',
            score: Math.round(statistics.overall.percentage),
            urgentActions: statistics.actionItems.filter((item: any) => item.priority === 'high').length
          }
        })
      } catch (error) {
        console.error('Error fetching compliance data:', error)
        setData({ 
          statistics: null, 
          loading: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      }
    }

    if (organizationId) {
      fetchComplianceData()
    }
  }, [organizationId])

  if (data.loading) {
    return <ComplianceStatusSkeleton />
  }

  if (data.error || !data.statistics) {
    return (
      <Card className="bg-white border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {data.error || 'Unable to load compliance data'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { statistics } = data
  const score = Math.round(statistics.overall.percentage)
  const urgentActions = statistics.actionItems.filter(item => item.priority === 'high')
  const allActions = statistics.actionItems.length

  // Get compliance status
  const getComplianceStatus = (score: number) => {
    if (score >= 90) return { status: 'COMPLIANT', color: 'green', icon: CheckCircle2 }
    if (score >= 70) return { status: 'ATTENTION NEEDED', color: 'amber', icon: AlertTriangle }
    return { status: 'URGENT ACTION', color: 'red', icon: AlertTriangle }
  }

  const status = getComplianceStatus(score)

  // Get trend icon
  const getTrendIcon = () => {
    if (!statistics.trends.direction) return <Minus className="h-4 w-4 text-gray-400" />
    
    switch (statistics.trends.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  const categoryIcons = {
    safeguarding: Shield,
    overseas: Globe,
    fundraising: DollarSign
  }

  return (
    <div className="space-y-6">
      {/* Status & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status Card */}
        <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm hover:border-[#B1FA63]/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 leading-normal">Current Status</h3>
                {statistics.trends.change && (
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon()}
                    <span className={cn(
                      "font-medium",
                      statistics.trends.direction === 'up' ? 'text-green-600' : 
                      statistics.trends.direction === 'down' ? 'text-red-600' : 
                      'text-gray-600'
                    )}>
                      {statistics.trends.change > 0 ? '+' : ''}{statistics.trends.change}%
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-center py-4">
                <div className={cn(
                  "text-5xl font-light mb-2 leading-none tracking-tight",
                  status.color === 'green' ? 'text-[#B1FA63]' :
                  status.color === 'amber' ? 'text-amber-600' :
                  'text-red-600'
                )}>
                  {score}%
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-2">
                  <status.icon className={cn(
                    "h-5 w-5",
                    status.color === 'green' ? 'text-green-600' :
                    status.color === 'amber' ? 'text-amber-600' :
                    'text-red-600'
                  )} />
                  <Badge variant="outline" className={cn(
                    "font-medium",
                    status.color === 'green' ? 'bg-green-50 text-green-700 border-green-200' :
                    status.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  )}>
                    {status.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-700 leading-relaxed">
                  {statistics.overall.level} compliance level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Urgent Actions Card */}
        <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm hover:border-[#B1FA63]/20 transition-all duration-300">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 leading-normal">Action Items</h3>
                <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                  {allActions} total
                </Badge>
              </div>
              
              {urgentActions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">
                      {urgentActions.length} urgent action{urgentActions.length !== 1 ? 's' : ''} required
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {urgentActions.slice(0, 3).map((action, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{action.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                          </div>
                          {action.count && (
                            <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 ml-2">
                              {action.count}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {urgentActions.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{urgentActions.length - 3} more urgent action{urgentActions.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">No urgent actions required</p>
                  {allActions > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {allActions} medium/low priority item{allActions !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
              
              {allActions > 0 && (
                <Link href="/compliance/score">
                  <Button variant="outline" size="sm" className="w-full hover:bg-[#B1FA63] hover:border-[#B1FA63] hover:text-[#243837] transition-all font-medium">
                    View All Actions
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm hover:border-[#B1FA63]/20 transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium text-gray-900 leading-normal">Category Health</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {Object.entries(statistics.breakdown).map(([key, data]) => {
              const IconComponent = categoryIcons[key as keyof typeof categoryIcons] || Shield
              const percentage = Math.round(data.percentage)
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-[#243837] rounded-lg flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-[#B1FA63]" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 capitalize leading-normal">
                          {key === 'fundraising' ? 'Income & Fundraising' : key}
                        </h4>
                        <p className="text-xs text-gray-600 leading-normal">{data.level}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className={cn(
                      "h-2",
                      percentage >= 90 ? '[&>div]:bg-[#B1FA63]' :
                      percentage >= 70 ? '[&>div]:bg-amber-500' :
                      '[&>div]:bg-red-500'
                    )}
                  />
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Need to improve?</span>
              <Link href="/compliance/score">
                <Button variant="ghost" size="sm" className="text-[#243837] hover:bg-[#B1FA63] hover:text-[#243837] transition-all font-medium">
                  <Target className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Trend (Simple) */}
      <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Trend</h3>
              <p className="text-sm text-gray-600">
                {statistics.trends.lastMonth ? 
                  `Last month: ${statistics.trends.lastMonth}%` : 
                  'No historical data yet'
                }
              </p>
            </div>
            
            <div className="text-right">
              {statistics.trends.direction && (
                <div className="flex items-center gap-2">
                  {getTrendIcon()}
                  <span className="text-sm text-gray-600">
                    {statistics.trends.direction === 'up' ? 'Improving' :
                     statistics.trends.direction === 'down' ? 'Declining' :
                     'Stable'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 Tip: Regular compliance monitoring helps maintain high scores and avoid last-minute issues
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ComplianceStatusSkeleton() {
  return (
    <div className="space-y-6">
      {/* Status & Actions Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="text-center py-4">
                <div className="h-12 w-20 bg-gray-200 rounded animate-pulse mx-auto mb-4" />
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2" />
                <div className="h-4 w-28 bg-gray-200 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-gray-200 rounded-2xl">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Category Breakdown Skeleton */}
      <Card className="bg-white border border-gray-200 rounded-2xl">
        <CardHeader className="pb-4">
          <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                    <div className="space-y-1">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-2 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Trend Skeleton */}
      <Card className="bg-white border border-gray-200 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="mt-4 h-12 bg-gray-100 rounded-lg animate-pulse" />
        </CardContent>
      </Card>
    </div>
  )
}