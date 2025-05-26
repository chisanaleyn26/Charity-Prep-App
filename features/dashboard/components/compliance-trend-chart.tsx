'use client'

import React from 'react'
import { TrendingUp, Calendar } from 'lucide-react'

const monthlyData = [
  { month: 'Jul', score: 78 },
  { month: 'Aug', score: 82 },
  { month: 'Sep', score: 85 },
  { month: 'Oct', score: 88 },
  { month: 'Nov', score: 87 },
  { month: 'Dec', score: 92 },
]

export function ComplianceTrendChart() {
  const maxScore = 100
  const chartHeight = 200

  return (
    <div className="bg-white rounded-xl border border-mist-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gunmetal">
            Compliance Trend
          </h3>
          <p className="text-sm text-mist-700 mt-1">
            Last 6 months performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-mist-700">
          <Calendar className="h-4 w-4" />
          <span>Jul - Dec 2024</span>
        </div>
      </div>

      {/* Simple Chart Visualization */}
      <div className="relative h-[200px] mb-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-mist-600">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-px bg-mist-200" />
            ))}
          </div>

          {/* Bars */}
          <div className="relative h-full flex items-end justify-between gap-2 px-4">
            {monthlyData.map((data, index) => {
              const height = (data.score / maxScore) * chartHeight
              const isLast = index === monthlyData.length - 1
              
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full flex items-end justify-center h-[200px]">
                    <div
                      className={cn(
                        'w-full max-w-[40px] rounded-t-lg transition-all duration-500',
                        isLast ? 'bg-primary' : 'bg-mist-300'
                      )}
                      style={{ height: `${height}px` }}
                    >
                      {isLast && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-gunmetal text-xs font-bold px-2 py-1 rounded">
                          {data.score}%
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-mist-700 mt-2">{data.month}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between pt-4 border-t border-mist-200">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <span className="text-sm font-medium text-gunmetal">
            +14% improvement
          </span>
        </div>
        <span className="text-sm text-mist-700">
          On track to reach 95% target
        </span>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-mist-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="w-32 h-6 bg-mist-100 rounded animate-pulse" />
          <div className="w-48 h-4 bg-mist-100 rounded animate-pulse" />
        </div>
        <div className="w-24 h-6 bg-mist-100 rounded animate-pulse" />
      </div>
      <div className="h-[200px] bg-mist-50 rounded animate-pulse" />
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-mist-200">
        <div className="w-32 h-5 bg-mist-100 rounded animate-pulse" />
        <div className="w-40 h-5 bg-mist-100 rounded animate-pulse" />
      </div>
    </div>
  )
}