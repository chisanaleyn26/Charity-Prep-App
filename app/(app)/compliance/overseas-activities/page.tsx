import { Suspense } from 'react'
import { Globe, DollarSign, AlertTriangle, MapPin } from 'lucide-react'
import { OverseasActivitiesTable } from '@/features/compliance/components/overseas/activities-table-aligned'
import { OverseasActivitiesForm } from '@/features/compliance/components/overseas/activities-form-aligned'
import { getOverseasActivities, getOverseasStats } from '@/features/compliance/services/overseas-activities-aligned'
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

async function OverseasStats() {
  const stats = await getOverseasStats()

  const statCards = [
    {
      title: 'Countries',
      value: stats.totalCountries,
      description: 'Active locations',
      icon: MapPin,
      color: 'text-primary'
    },
    {
      title: 'Active Activities',
      value: stats.activeActivities,
      description: 'Ongoing operations',
      icon: Globe,
      color: 'text-sage-600'
    },
    {
      title: 'Annual Spend',
      value: new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(stats.totalAnnualSpend),
      description: 'Total overseas budget',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      title: 'High Risk',
      value: stats.highRiskActivities,
      description: 'Activities needing review',
      icon: AlertTriangle,
      color: 'text-warning'
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
  const activities = await getOverseasActivities()
  return <OverseasActivitiesTable initialActivities={activities} />
}

export default function OverseasActivitiesPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Globe className="h-8 w-8 text-primary" />
            Overseas Activities
          </h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your charity&apos;s international operations
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Globe className="h-4 w-4 mr-2" />
              Add Activity
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Overseas Activity</DialogTitle>
              <DialogDescription>
                Record a new overseas activity or operation
              </DialogDescription>
            </DialogHeader>
            <OverseasActivitiesForm />
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
          <OverseasStats />
        </Suspense>
      </div>

      {/* Activities Table */}
      <Suspense fallback={<TableSkeleton />}>
        <ActivitiesTable />
      </Suspense>
    </div>
  )
}