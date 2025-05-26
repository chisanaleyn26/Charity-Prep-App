'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react'

export default function FundraisingTestPage() {
  const mockStats = {
    activeActivities: 5,
    totalTarget: 100000,
    totalRaised: 75000,
    averageProgress: 75,
    needingCompliance: 2
  }

  const statCards = [
    {
      title: 'Active Campaigns',
      value: mockStats.activeActivities,
      description: 'Currently running',
      icon: Target,
      color: 'text-primary'
    },
    {
      title: 'Total Target',
      value: `£${mockStats.totalTarget.toLocaleString()}`,
      description: 'Combined goal',
      icon: DollarSign,
      color: 'text-sage-600'
    },
    {
      title: 'Total Raised',
      value: `£${mockStats.totalRaised.toLocaleString()}`,
      description: `${mockStats.averageProgress}% of target`,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Compliance Needed',
      value: mockStats.needingCompliance,
      description: 'Activities requiring review',
      icon: AlertCircle,
      color: 'text-warning'
    }
  ]

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Fundraising (Test)
          </h1>
          <p className="text-muted-foreground mt-1">
            This is a test page to verify CSS is loading correctly
          </p>
        </div>
        
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <DollarSign className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Test Content */}
      <Card>
        <CardHeader>
          <CardTitle>CSS Test Results</CardTitle>
          <CardDescription>
            If you can see this styled content, CSS is loading correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 text-primary rounded-lg">
              Primary color test
            </div>
            <div className="p-4 bg-success/10 text-success rounded-lg">
              Success color test
            </div>
            <div className="p-4 bg-warning/10 text-warning rounded-lg">
              Warning color test
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">Muted background test</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}