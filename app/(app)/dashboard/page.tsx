'use client'

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
import { Award, TrendingUp, Bell, Calendar, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Enhanced Typography Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-5xl font-extralight text-gray-900 tracking-tight leading-none">
            Dashboard
          </h1>
          <p className="text-lg text-gray-600 font-normal leading-relaxed tracking-wide">
            Welcome back, John. Here&apos;s your compliance overview.
          </p>
        </div>
        <div className="text-right space-y-2">
          <div className="flex items-baseline gap-1">
            <div className="text-6xl font-extralight text-gray-900 tracking-tighter leading-none">92</div>
            <div className="text-2xl font-light text-gray-500 leading-none">%</div>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            <p className="text-sm font-medium text-green-600 tracking-wide uppercase">Excellent</p>
          </div>
        </div>
      </div>

      {/* 6-Column Responsive Grid System */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
        {/* KPI Cards - 4 columns across top */}
        <div className="lg:col-span-6">
          <Suspense fallback={<KPICardsSkeleton />}>
            <KPICards />
          </Suspense>
        </div>
        
        {/* Compliance Trend Chart - 4 columns */}
        <div className="lg:col-span-4">
          <Suspense fallback={<ChartSkeleton />}>
            <ComplianceTrendChart />
          </Suspense>
        </div>
        
        {/* Activity Feed - 2 columns (compressed) */}
        <div className="lg:col-span-2">
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>

        {/* Category Breakdown - Split into two 3-column sections */}
        <div className="lg:col-span-6">
          <Suspense fallback={<ChartSkeleton />}>
            <CategoryBreakdownChart />
          </Suspense>
        </div>
      </div>
    </div>
  )
}