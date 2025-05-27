import { Suspense } from 'react'
import { Globe, DollarSign, AlertTriangle, MapPin } from 'lucide-react'
import { OverseasActivitiesTable } from '@/features/compliance/components/overseas/activities-table-aligned'
import { OverseasActivitiesForm } from '@/features/compliance/components/overseas/activities-form-aligned'
import { getOverseasActivities, getOverseasStats } from '@/features/compliance/services/overseas-activities-aligned'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { mockOverseasActivities } from '@/lib/mock-data'

// MOCK MODE
const MOCK_MODE = true

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
  const stats = MOCK_MODE ? {
    totalCountries: new Set(mockOverseasActivities.map(a => a.country_code).filter(Boolean)).size,
    activeActivities: mockOverseasActivities.length,
    totalAnnualSpend: mockOverseasActivities.reduce((sum, activity) => sum + (activity.amount_gbp || 0), 0),
    highRiskActivities: 0
  } : await getOverseasStats()

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
  const activities = MOCK_MODE ? mockOverseasActivities : await getOverseasActivities()
  return <OverseasActivitiesTable initialActivities={activities} />
}

export default function OverseasActivitiesPage() {
  return (
    <div className="space-y-8">
      {/* Enhanced Typography Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none flex items-center gap-4">
            <Globe className="h-12 w-12 text-gray-600" />
            Overseas Activities
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Track and manage your charity&apos;s international operations and compliance.
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