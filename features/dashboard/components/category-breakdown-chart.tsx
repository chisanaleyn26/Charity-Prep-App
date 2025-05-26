'use client'

import React from 'react'
import { Shield, Globe, Coins, FileText, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Category {
  name: string
  score: number
  icon: React.ElementType
  color: string
  items: number
}

const categories: Category[] = [
  {
    name: 'Safeguarding',
    score: 95,
    icon: Shield,
    color: 'bg-primary',
    items: 47
  },
  {
    name: 'International',
    score: 88,
    icon: Globe,
    color: 'bg-sage',
    items: 12
  },
  {
    name: 'Fundraising',
    score: 92,
    icon: Coins,
    color: 'bg-mist',
    items: 23
  },
  {
    name: 'Documents',
    score: 85,
    icon: FileText,
    color: 'bg-warning',
    items: 18
  }
]

export function CategoryBreakdownChart() {
  const averageScore = Math.round(categories.reduce((sum, cat) => sum + cat.score, 0) / categories.length)
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-amber-600'
    return 'text-red-600'
  }

  const getIconBgColor = (color: string) => {
    // Minimalistic gray palette only
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Side - Category Cards */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">Category Performance</h3>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">Detailed breakdown</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-extralight text-gray-900 mb-1 tracking-tight leading-none">{averageScore}%</div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Average</div>
          </div>
        </div>

        <div className="space-y-4">
          {categories.slice(0, 2).map((category, index) => (
            <div 
              key={category.name} 
              className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border',
                    getIconBgColor(category.color)
                  )}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium tracking-wide">
                      {category.items} items
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
                    {category.score}%
                  </div>
                  <div className="text-xs text-gray-500 font-bold tracking-wider">
                    {category.score >= averageScore ? '+' : ''}{(category.score - averageScore).toFixed(0)}
                  </div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-xl overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-xl transition-all duration-1000 ease-out',
                    category.score >= 90 ? 'bg-green-500' : 
                    category.score >= 80 ? 'bg-gray-600' : 'bg-red-500'
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Remaining Categories */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:border-gray-300 transition-all duration-300">
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">Additional Areas</h3>
            <p className="text-gray-600 font-medium tracking-wide leading-relaxed">More categories</p>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 border border-gray-200">
            <div className="text-3xl font-extralight text-gray-900 mb-1 tracking-tight leading-none">{categories.length}</div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Total</div>
          </div>
        </div>

        <div className="space-y-4">
          {categories.slice(2).map((category, index) => (
            <div 
              key={category.name} 
              className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border',
                    getIconBgColor(category.color)
                  )}>
                    <category.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-600 font-medium tracking-wide">
                      {category.items} items
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
                    {category.score}%
                  </div>
                  <div className="text-xs text-gray-500 font-bold tracking-wider">
                    {category.score >= averageScore ? '+' : ''}{(category.score - averageScore).toFixed(0)}
                  </div>
                </div>
              </div>
              
              <div className="h-2 bg-gray-100 rounded-xl overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-xl transition-all duration-1000 ease-out',
                    category.score >= 90 ? 'bg-green-500' : 
                    category.score >= 80 ? 'bg-gray-600' : 'bg-red-500'
                  )}
                  style={{ width: `${category.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => c.score >= 90).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Excellent</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => c.score >= 80 && c.score < 90).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Good</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => c.score < 80).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Focus</div>
          </div>
        </div>
      </div>
    </div>
  )
}