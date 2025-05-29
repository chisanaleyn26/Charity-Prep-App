'use client'

import React from 'react'
import { TrendingUp, Calendar } from 'lucide-react'
import { mockComplianceTrend } from '@/lib/mock-data'
import { appConfig } from '@/lib/config'

const monthlyData = appConfig.features.mockMode ? mockComplianceTrend.map(item => ({
  month: new Date(item.date).toLocaleString('default', { month: 'short' }),
  score: item.score
})) : [
  { month: 'Jul', score: 78 },
  { month: 'Aug', score: 82 },
  { month: 'Sep', score: 85 },
  { month: 'Oct', score: 88 },
  { month: 'Nov', score: 87 },
  { month: 'Dec', score: 92 },
]

export function ComplianceTrendChart({ organizationId }: { organizationId?: string }) {
  const maxScore = 100
  const chartHeight = 200

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 hover:shadow-md transition-all duration-300 group relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-1 leading-normal">Compliance Progress</h3>
              <p className="text-gray-600 text-base leading-relaxed">6 month journey to excellence</p>
            </div>
            <div className="text-right">
              <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                <div className="text-2xl font-semibold text-gray-900 mb-1 leading-tight">92%</div>
                <div className="flex items-center gap-2 justify-end">
                  <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600 font-medium">Current</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Enhanced Chart Visualization */}
      <div className="relative h-[200px] mb-6">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-30">
          {[100, 75, 50, 25, 0].map((value) => (
            <div key={value} className="flex items-center">
              <span className="text-xs text-gray-400 w-8 font-medium">{value}%</span>
              <div className="flex-1 h-px bg-gray-200 ml-2" />
            </div>
          ))}
        </div>

        {/* Modern Bars with animations */}
        <div className="relative h-full flex items-end justify-between gap-4 px-12">
          {monthlyData.map((data, index) => {
            const height = (data.score / maxScore) * chartHeight
            const isLast = index === monthlyData.length - 1
            const prevScore = index > 0 ? monthlyData[index - 1].score : data.score
            const isImprovement = data.score > prevScore
            
            return (
              <div key={data.month} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full flex items-end justify-center h-[200px]">
                  <div
                    className={cn(
                      'w-full max-w-[36px] rounded-2xl transition-all duration-700 hover:scale-110 cursor-pointer relative overflow-hidden shadow-lg',
                      isLast 
                        ? 'bg-gradient-to-t from-primary via-primary/80 to-primary/60' 
                        : 'bg-gradient-to-t from-gray-400 via-gray-350 to-gray-300 group-hover:from-primary/70 group-hover:via-primary/50 group-hover:to-primary/30'
                    )}
                    style={{ 
                      height: `${height}px`,
                      animationDelay: `${index * 150}ms`
                    }}
                  >
                    {/* Modern shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Enhanced hover score display */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="bg-gray-900/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap shadow-lg border border-white/10">
                        <span className="font-medium">{data.score}%</span>
                        {isImprovement && index > 0 && (
                          <span className="text-emerald-400 ml-1">↗ +{data.score - prevScore}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <span className={cn(
                  'text-sm mt-4 transition-colors font-medium',
                  isLast ? 'text-primary' : 'text-gray-500'
                )}>
                  {data.month}
                </span>
              </div>
            )
          })}
        </div>
      </div>

        {/* Modern Summary Cards */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100/80">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-25 rounded-lg p-4 border border-emerald-100/50 text-center">
            <div className="text-xl font-semibold text-emerald-600 mb-1 leading-tight">+14%</div>
            <div className="text-xs text-emerald-700 font-medium uppercase">Improvement</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-25 rounded-lg p-4 border border-blue-100/50 text-center">
            <div className="text-xl font-semibold text-blue-600 mb-1 leading-tight">6</div>
            <div className="text-xs text-blue-700 font-medium uppercase">Months</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-25 rounded-lg p-4 border border-purple-100/50 text-center">
            <div className="text-xl font-semibold text-purple-600 mb-1 leading-tight">Top 15%</div>
            <div className="text-xs text-purple-700 font-medium uppercase">Industry</div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <div className="w-32 h-5 bg-gray-100 rounded animate-pulse" />
          <div className="w-40 h-4 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="w-20 h-16 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-[200px] bg-gray-50 rounded animate-pulse mb-6" />
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-100">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="w-12 h-6 bg-gray-100 rounded animate-pulse mx-auto mb-1" />
            <div className="w-16 h-3 bg-gray-100 rounded animate-pulse mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}