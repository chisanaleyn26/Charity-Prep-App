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
        <Card key={index} className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <stat.icon className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
              {stat.title}
            </h3>
            <p className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
              {stat.value}
            </p>
            <p className="text-xs text-gray-600 font-medium tracking-wide">
              {stat.description}
            </p>
          </div>
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
      {/* Enhanced Typography Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <DollarSign className="h-12 w-12 text-gray-600" />
            Fundraising
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Manage fundraising activities and ensure compliance with regulations.
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

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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