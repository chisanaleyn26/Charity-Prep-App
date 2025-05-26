import { Suspense } from 'react'
import { 
  KPICards,
  ComplianceTrendChart,
  CategoryBreakdownChart,
  ActivityFeed,
  KPICardsSkeleton,
  ChartSkeleton,
  ActivityFeedSkeleton
} from '@/features/dashboard/components'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gunmetal">Dashboard</h1>
        <p className="text-mist-700 mt-1">
          Welcome back! Here&apos;s your compliance overview for St. Mary&apos;s Community Trust.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards - Top Row (1x1 each) */}
        <Suspense fallback={<KPICardsSkeleton />}>
          <KPICards />
        </Suspense>

        {/* Compliance Trend Chart - Middle (2x2) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <ComplianceTrendChart />
          </Suspense>
        </div>

        {/* Category Breakdown - Bottom Left (2x1) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <Suspense fallback={<ChartSkeleton />}>
            <CategoryBreakdownChart />
          </Suspense>
        </div>

        {/* Activity Feed - Bottom Right (2x1) */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </div>
    </div>
  )
}