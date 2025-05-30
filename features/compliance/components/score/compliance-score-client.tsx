'use client'

import { useState, useEffect } from 'react'
import { Award, TrendingUp, TrendingDown, Minus, Shield, Globe, DollarSign, Target, AlertTriangle, CheckCircle, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { ComplianceStatistics } from '@/lib/services/compliance-statistics.service'
import Link from 'next/link'
import { logActivity } from '@/lib/services/activity-logging.service'
import { ActivityTypes } from '@/lib/constants/activity-types'

interface ComplianceScoreClientProps {
  statistics: ComplianceStatistics
}

export default function ComplianceScoreClient({ statistics }: ComplianceScoreClientProps) {
  const [activeTab, setActiveTab] = useState('overview')
  
  const score = Math.round(statistics.overall.percentage)
  const level = statistics.overall.level
  
  // Log compliance score view on mount
  useEffect(() => {
    logActivity({
      activity_type: ActivityTypes.COMPLIANCE_SCORE_VIEW,
      metadata: {
        score: score,
        level: level,
        highPriorityActions: statistics.actionItems.filter(item => item.priority === 'high').length
      }
    })
  }, [])
  
  // Calculate key metrics
  const metrics = {
    overallScore: score,
    safeguardingScore: Math.round(statistics.breakdown.safeguarding.percentage),
    overseasScore: Math.round(statistics.breakdown.overseas.percentage),
    fundraisingScore: Math.round(statistics.breakdown.fundraising.percentage),
    highPriorityActions: statistics.actionItems.filter(item => item.priority === 'high').length,
    totalActions: statistics.actionItems.length,
    trend: statistics.trends.change || 0
  }

  const statCards = [
    {
      title: 'Overall Score',
      value: `${metrics.overallScore}%`,
      description: level,
      icon: Award,
      color: 'text-primary'
    },
    {
      title: 'Safeguarding',
      value: `${metrics.safeguardingScore}%`,
      description: 'DBS & training',
      icon: Shield,
      color: 'text-sage-600'
    },
    {
      title: 'Overseas',
      value: `${metrics.overseasScore}%`,
      description: 'International ops',
      icon: Globe,
      color: 'text-success'
    },
    {
      title: 'Fundraising',
      value: `${metrics.fundraisingScore}%`,
      description: 'Income compliance',
      icon: DollarSign,
      color: 'text-muted-foreground'
    }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }

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

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" asChild>
          <Link href="/reports/export">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Link>
        </Button>
        <Button className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium border-[#B1FA63] hover:border-[#9FE851]" asChild>
          <Link href="/compliance/fundraising">
            <Target className="h-4 w-4 mr-2" />
            Improve Score
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
                <stat.icon className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
              </div>
              {index === 0 && statistics.trends.change && (
                <div className="flex items-center gap-1 text-xs">
                  {getTrendIcon()}
                  <span className={cn(
                    "font-medium",
                    statistics.trends.direction === 'up' ? 'text-green-600' : 
                    statistics.trends.direction === 'down' ? 'text-red-600' : 
                    'text-gray-600'
                  )}>
                    {Math.abs(statistics.trends.change)}%
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
                {stat.title}
              </h3>
              <p className={cn(
                "text-3xl font-light tracking-tight leading-none",
                index === 0 ? getScoreColor(metrics.overallScore) : 'text-gray-900'
              )}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {stat.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value)
        // Log tab change
        logActivity({
          activity_type: ActivityTypes.PAGE_VIEW,
          metadata: {
            page: `compliance_score_${value}`,
            section: 'compliance'
          }
        })
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="details">Score Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Compliance Status Card */}
          <Card className="bg-white border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Compliance Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(statistics.breakdown).map(([key, data]) => (
                  <div key={key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700 capitalize">{key}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {data.level}
                      </Badge>
                    </div>
                    <Progress value={data.percentage} className="h-2" />
                    <p className="text-xs text-gray-600">
                      {data.percentage}% compliant
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          {statistics.actionItems.filter(item => item.priority === 'high').length > 0 && (
            <Card className="bg-white border border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  High Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statistics.actionItems
                    .filter(item => item.priority === 'high')
                    .slice(0, 3)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                          {item.count || 0}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="actions" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium">All Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.actionItems.map((item, index) => (
                  <div key={index} className={cn(
                    "flex items-center justify-between p-4 rounded-lg border",
                    item.priority === 'high' ? 'bg-red-50 border-red-200' :
                    item.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                    'bg-blue-50 border-blue-200'
                  )}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium text-gray-900">{item.title}</h5>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{item.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.count && (
                        <Badge variant="outline">{item.count}</Badge>
                      )}
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        item.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                        item.priority === 'medium' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                        'bg-blue-100 text-blue-700 border-blue-200'
                      )}>
                        {item.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <Card className="bg-white border border-gray-200 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Score Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Your compliance score is calculated using weighted averages across three key areas:
              </p>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Safeguarding (40% weight)</h4>
                  <p className="text-xs text-gray-600 mb-2">Base score minus penalties for expired or expiring DBS checks</p>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.safeguardingScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{metrics.safeguardingScore}%</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Overseas Activities (30% weight)</h4>
                  <p className="text-xs text-gray-600 mb-2">Base score minus penalties for unreported activities and missing checks</p>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.overseasScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{metrics.overseasScore}%</span>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fundraising (30% weight)</h4>
                  <p className="text-xs text-gray-600 mb-2">Documentation rate with bonuses for compliance</p>
                  <div className="flex items-center gap-2">
                    <Progress value={metrics.fundraisingScore} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{metrics.fundraisingScore}%</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">Overall Score</span>
                  <span className={cn("text-2xl font-bold", getScoreColor(score))}>
                    {score}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}