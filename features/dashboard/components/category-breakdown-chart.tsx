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
  return (
    <div className="bg-white rounded-xl border border-mist-200 p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gunmetal">
            Compliance by Category
          </h3>
          <p className="text-sm text-mist-700 mt-1">
            Performance across all areas
          </p>
        </div>
        <BarChart3 className="h-5 w-5 text-mist-500" />
      </div>

      <div className="space-y-4">
        {categories.map((category) => (
          <div key={category.name}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={cn('p-2 rounded-lg', `${category.color}/10`)}>
                  <category.icon className={cn('h-4 w-4', category.color.replace('bg-', 'text-'))} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gunmetal">
                    {category.name}
                  </h4>
                  <p className="text-xs text-mist-600">
                    {category.items} items tracked
                  </p>
                </div>
              </div>
              <span className="text-sm font-bold text-gunmetal">
                {category.score}%
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-mist-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', category.color)}
                style={{ width: `${category.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-mist-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist-700">Overall Average</span>
          <span className="font-bold text-gunmetal text-lg">90%</span>
        </div>
      </div>
    </div>
  )
}