'use client'

import React from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  Globe, 
  FileText,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardData } from '@/lib/api/dashboard'

interface KPICard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
  iconColor: string
  bgColor: string
}

interface DashboardStats {
  totalRecords: number
  safeguardingRecords: number
  overseasActivities: number
  fundraisingRecords: number
  documents: number
  lastUpdated: string
}

interface KPICardsProps {
  stats?: DashboardStats
  dashboardData?: DashboardData | { error: string }
}

export function KPICards({ stats, dashboardData }: KPICardsProps) {
  // Support both new stats prop and legacy dashboardData prop
  console.log('KPICards received:', { 
    hasStats: !!stats, 
    hasDashboardData: !!dashboardData,
    stats: stats,
    dashboardData: dashboardData 
  })
  
  // Early return if no data or if dashboardData is an error object
  if (!stats && (!dashboardData || 'error' in dashboardData)) {
    return <KPICardsSkeleton />
  }

  const kpiData: KPICard[] = stats ? [
    {
      title: 'Total Records',
      value: stats.totalRecords,
      change: 5.2,
      changeType: 'increase',
      icon: FileText,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Safeguarding Records',
      value: stats.safeguardingRecords,
      change: 3,
      changeType: 'increase', 
      icon: Shield,
      iconColor: 'text-sage',
      bgColor: 'bg-sage/10'
    },
    {
      title: 'Overseas Activities',
      value: stats.overseasActivities,
      change: 2.1,
      changeType: 'increase',
      icon: Globe,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Documents',
      value: stats.documents,
      change: 8.3,
      changeType: 'increase',
      icon: FileText,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ] : dashboardData && !('error' in dashboardData) && dashboardData.compliance && dashboardData.quickStats ? [
    {
      title: 'Compliance Score',
      value: `${dashboardData.compliance?.score || 0}%`,
      change: 4.5,
      changeType: 'increase',
      icon: Shield,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Active DBS Checks',
      value: dashboardData.quickStats?.safeguarding?.total || 0,
      change: 3,
      changeType: 'increase', 
      icon: Users,
      iconColor: 'text-sage',
      bgColor: 'bg-sage/10'
    },
    {
      title: 'Overseas Countries',
      value: dashboardData.quickStats?.overseas?.countries || 0,
      change: (dashboardData.quickStats?.overseas?.highRisk || 0) > 0 ? -2 : 2,
      changeType: (dashboardData.quickStats?.overseas?.highRisk || 0) > 0 ? 'decrease' : 'increase',
      icon: Globe,
      iconColor: 'text-mist',
      bgColor: 'bg-mist/10'
    },
    {
      title: 'Expiring Soon',
      value: dashboardData.quickStats?.safeguarding?.expiring || 0,
      change: (dashboardData.quickStats?.safeguarding?.expiring || 0) > 0 ? 2 : 0,
      changeType: (dashboardData.quickStats?.safeguarding?.expiring || 0) > 0 ? 'increase' : 'decrease',
      icon: AlertCircle,
      iconColor: 'text-warning',
      bgColor: 'bg-warning/10'
    }
  ] : [
    // Default fallback cards for new organizations
    {
      title: 'Total Records',
      value: 0,
      change: 0,
      changeType: 'increase',
      icon: FileText,
      iconColor: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Safeguarding Records',
      value: 0,
      change: 0,
      changeType: 'increase', 
      icon: Shield,
      iconColor: 'text-sage',
      bgColor: 'bg-sage/10'
    },
    {
      title: 'Overseas Activities',
      value: 0,
      change: 0,
      changeType: 'increase',
      icon: Globe,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Documents',
      value: 0,
      change: 0,
      changeType: 'increase',
      icon: FileText,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-6 hover:border-[#B1FA63]/30 hover:shadow-md transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 bg-[#243837] rounded-lg flex items-center justify-center group-hover:scale-105 group-hover:bg-[#B1FA63] transition-all duration-200 flex-shrink-0">
              <kpi.icon className="h-5 w-5 text-[#B1FA63] group-hover:text-[#243837]" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide leading-normal">
              {kpi.title}
            </h3>
            <p className="text-3xl font-light text-gray-900 leading-none tracking-tight">
              {kpi.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function KPICardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="w-20 h-4 bg-gray-100 rounded animate-pulse" />
            <div className="w-16 h-8 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}