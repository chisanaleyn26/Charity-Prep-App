import { Suspense } from 'react'
import { DollarSign, TrendingUp, Target, AlertCircle } from 'lucide-react'
import { FundraisingTable } from '@/features/compliance/components/fundraising/fundraising-table'
import { FundraisingForm } from '@/features/compliance/components/fundraising/fundraising-form'
import { getFundraisingActivities, getFundraisingStats } from '@/features/compliance/services/fundraising'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        <div className="h-3 w-32 bg-muted animate-pulse rounded mt-1" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

async function FundraisingStats() {
  const stats = await getFundraisingStats()

  const statCards = [
    {
      title: 'Active Campaigns',
      value: stats.activeActivities,
      description: 'Currently running',
      icon: Target,
      color: 'text-primary'
    },
    {
      title: 'Total Target',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalTarget),
      description: 'Combined goal',
      icon: DollarSign,
      color: 'text-sage-600'
    },
    {
      title: 'Total Raised',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalRaised),
      description: `${stats.averageProgress}% of target`,
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      title: 'Compliance Pending',
      value: stats.needingCompliance,
      description: 'Need checks',
      icon: AlertCircle,
      color: stats.needingCompliance > 0 ? 'text-warning' : 'text-muted-foreground'
    }
  ]

  return (
    <>
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
    </>
  )
}

async function ActivitiesTable() {
  const activities = await getFundraisingActivities()
  return <FundraisingTable initialActivities={activities} />
}

export default function FundraisingPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-primary" />
            Fundraising
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage fundraising activities and ensure compliance
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <DollarSign className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Fundraising Activity</DialogTitle>
              <DialogDescription>
                Create a new fundraising campaign or event
              </DialogDescription>
            </DialogHeader>
            <FundraisingForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards - Bento Style Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Suspense fallback={
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        }>
          <FundraisingStats />
        </Suspense>
      </div>

      {/* Activities Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ActivitiesTable />
      </Suspense>
    </div>
  )
}