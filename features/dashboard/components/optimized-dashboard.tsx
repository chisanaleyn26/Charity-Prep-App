'use client'

import { lazy, Suspense } from 'react'
import { 
  KPICardsSkeleton, 
  ChartSkeleton, 
  ActivityFeedSkeleton 
} from '@/components/ui/loading-skeletons'

// Lazy load heavy chart components
const ComplianceTrendChart = lazy(() => import('./compliance-trend-chart'))
const CategoryBreakdownChart = lazy(() => import('./category-breakdown-chart'))

// Export optimized versions with built-in suspense
export function OptimizedComplianceTrendChart({ organizationId }: { organizationId: string }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ComplianceTrendChart organizationId={organizationId} />
    </Suspense>
  )
}

export function OptimizedCategoryBreakdownChart({ breakdown }: { breakdown: any }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <CategoryBreakdownChart breakdown={breakdown} />
    </Suspense>
  )
}

// Virtualized activity feed for large lists
import { useCallback, useRef } from 'react'
import { ActivityFeed } from './activity-feed'

interface VirtualizedActivityFeedProps {
  activities: any[]
  itemHeight?: number
  visibleItems?: number
}

export function VirtualizedActivityFeed({ 
  activities, 
  itemHeight = 80,
  visibleItems = 5 
}: VirtualizedActivityFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollTopRef = useRef(0)
  
  // Only render visible items for performance
  const getVisibleRange = useCallback(() => {
    if (!containerRef.current) return { start: 0, end: visibleItems }
    
    const scrollTop = scrollTopRef.current
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(start + visibleItems + 1, activities.length)
    
    return { start, end }
  }, [activities.length, itemHeight, visibleItems])
  
  const { start, end } = getVisibleRange()
  const visibleActivities = activities.slice(start, end)
  const totalHeight = activities.length * itemHeight
  const offsetY = start * itemHeight
  
  return (
    <div 
      ref={containerRef}
      className="relative overflow-auto"
      style={{ height: visibleItems * itemHeight }}
      onScroll={(e) => {
        scrollTopRef.current = e.currentTarget.scrollTop
      }}
    >
      <div style={{ height: totalHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <ActivityFeed activities={visibleActivities} />
        </div>
      </div>
    </div>
  )
}

// Intersection Observer for lazy loading dashboard sections
import { useEffect, useState } from 'react'

export function LazyDashboardSection({ 
  children, 
  placeholder = <div className="h-64" />,
  rootMargin = '100px'
}: {
  children: React.ReactNode
  placeholder?: React.ReactNode
  rootMargin?: string
}) {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    
    if (elementRef.current) {
      observer.observe(elementRef.current)
    }
    
    return () => observer.disconnect()
  }, [rootMargin])
  
  return (
    <div ref={elementRef}>
      {isVisible ? children : placeholder}
    </div>
  )
}