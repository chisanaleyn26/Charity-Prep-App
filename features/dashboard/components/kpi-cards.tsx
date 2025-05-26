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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-gray-300 hover:shadow-sm transition-all duration-300 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <kpi.icon className="h-4 w-4 text-gray-600" />
            </div>
            <div className={cn(
              'flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg tracking-wide',
              kpi.changeType === 'increase' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            )}>
              <span className="text-sm font-bold">
                {kpi.changeType === 'increase' ? '↗' : '↘'}
              </span>
              <span className="font-bold">{Math.abs(kpi.change)}%</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">
              {kpi.title}
            </h3>
            <p className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
              {kpi.value}
            </p>
            
            {/* Compact progress bar */}
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  kpi.changeType === 'increase' ? 'bg-green-500' : 'bg-red-500'
                )}
                style={{ 
                  width: `${Math.min(Math.abs(kpi.change) * 8, 100)}%`
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
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