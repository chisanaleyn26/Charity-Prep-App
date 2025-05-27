'use client'

import { ChevronRight, CheckCircle, AlertCircle, Shield, Globe, Coins } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ComplianceCategory } from '../../types/compliance-score'
import { cn } from '@/lib/utils'

interface CategoryBreakdownProps {
  categories: ComplianceCategory[]
}

export function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'safeguarding': return Shield
      case 'overseas activities': return Globe
      case 'fundraising': return Coins
      default: return CheckCircle
    }
  }

  const averageScore = Math.round(categories.reduce((sum, cat) => sum + (cat.score || 0), 0) / categories.length)

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-gray-600'
    return 'text-red-600'
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
          {categories.slice(0, 2).map((category, index) => {
            const IconComponent = getCategoryIcon(category.name)
            const score = category.score || 0
            
            return (
              <div 
                key={category.name} 
                className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border bg-gray-100 text-gray-600">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium tracking-wide">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
                      {score}%
                    </div>
                    <div className="text-xs text-gray-500 font-bold tracking-wider">
                      {score >= averageScore ? '+' : ''}{(score - averageScore).toFixed(0)}
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-xl overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-xl transition-all duration-1000 ease-out',
                      score >= 90 ? 'bg-green-500' : 
                      score >= 80 ? 'bg-gray-600' : 'bg-red-500'
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Issues */}
                {category.issues && category.issues.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {category.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-red-600 font-medium">{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
          {categories.slice(2).map((category, index) => {
            const IconComponent = getCategoryIcon(category.name)
            const score = category.score || 0
            
            return (
              <div 
                key={category.name} 
                className="group p-4 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm border bg-gray-100 text-gray-600">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-gray-900 tracking-wide leading-tight">
                        {category.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium tracking-wide">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-3xl font-extralight text-gray-900 tracking-tight leading-none">
                      {score}%
                    </div>
                    <div className="text-xs text-gray-500 font-bold tracking-wider">
                      {score >= averageScore ? '+' : ''}{(score - averageScore).toFixed(0)}
                    </div>
                  </div>
                </div>
                
                <div className="h-2 bg-gray-100 rounded-xl overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-xl transition-all duration-1000 ease-out',
                      score >= 90 ? 'bg-green-500' : 
                      score >= 80 ? 'bg-gray-600' : 'bg-red-500'
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>

                {/* Issues */}
                {category.issues && category.issues.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {category.issues.map((issue, issueIndex) => (
                      <div key={issueIndex} className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-xs text-red-600 font-medium">{issue}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        {/* Summary stats in minimalistic gray */}
        <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => (c.score || 0) >= 90).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Excellent</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => (c.score || 0) >= 80 && (c.score || 0) < 90).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Good</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="text-2xl font-extralight text-gray-900 mb-2 tracking-tight leading-none">
              {categories.filter(c => (c.score || 0) < 80).length}
            </div>
            <div className="text-xs text-gray-600 font-bold uppercase tracking-wider">Focus</div>
          </div>
        </div>
      </div>
    </div>
  )
}