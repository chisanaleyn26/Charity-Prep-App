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

interface KPICard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ElementType
  iconColor: string
  bgColor: string
}

const kpiData: KPICard[] = [
  {
    title: 'Compliance Score',
    value: '92%',
    change: 4.5,
    changeType: 'increase',
    icon: Shield,
    iconColor: 'text-primary',
    bgColor: 'bg-primary/10'
  },
  {
    title: 'Active DBS Checks',
    value: 47,
    change: 3,
    changeType: 'increase', 
    icon: Users,
    iconColor: 'text-sage',
    bgColor: 'bg-sage/10'
  },
  {
    title: 'Overseas Activities',
    value: 12,
    change: -2,
    changeType: 'decrease',
    icon: Globe,
    iconColor: 'text-mist',
    bgColor: 'bg-mist/10'
  },
  {
    title: 'Expiring Soon',
    value: 5,
    change: 2,
    changeType: 'increase',
    icon: AlertCircle,
    iconColor: 'text-warning',
    bgColor: 'bg-warning/10'
  }
]

export function KPICards() {
  return (
    <>
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-mist-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={cn('p-3 rounded-lg', kpi.bgColor)}>
              <kpi.icon className={cn('h-6 w-6', kpi.iconColor)} />
            </div>
            <div className={cn(
              'flex items-center gap-1 text-sm font-medium',
              kpi.changeType === 'increase' ? 'text-success' : 'text-error'
            )}>
              {kpi.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(kpi.change)}%</span>
            </div>
          </div>
          
          <h3 className="text-sm font-medium text-mist-700 mb-1">
            {kpi.title}
          </h3>
          <p className="text-2xl font-bold text-gunmetal">
            {kpi.value}
          </p>
        </div>
      ))}
    </>
  )
}

export function KPICardsSkeleton() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-mist-200 p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-mist-100 rounded-lg animate-pulse" />
            <div className="w-16 h-6 bg-mist-100 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 bg-mist-100 rounded animate-pulse" />
            <div className="w-16 h-8 bg-mist-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </>
  )
}