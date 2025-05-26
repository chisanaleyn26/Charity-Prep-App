'use client'

import React from 'react'
import { EtherealCard, EtherealCardContent } from '@/components/custom-ui/ethereal-card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface ComplianceScoreProps {
  score?: number
  previousScore?: number
  status?: 'excellent' | 'good' | 'needs-attention' | 'at-risk'
}

export function ComplianceScore({ 
  score = 92, 
  previousScore = 88,
  status = 'excellent' 
}: ComplianceScoreProps) {
  const change = score - previousScore
  const isImproving = change >= 0

  const statusColors = {
    'excellent': '#B1FA63',
    'good': '#B2A1FF',
    'needs-attention': '#FE7733',
    'at-risk': '#EF4444'
  }

  const statusText = {
    'excellent': 'Excellent Compliance',
    'good': 'Good Compliance',
    'needs-attention': 'Needs Attention',
    'at-risk': 'At Risk'
  }

  // Calculate stroke dash array for circular progress
  const radius = 90
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = `${(score / 100) * circumference} ${circumference}`

  return (
    <EtherealCard variant="gradient" className="bg-gradient-to-br from-[#243837] to-[#1a2827] text-white">
      <EtherealCardContent className="p-8">
        <div className="flex flex-col items-center">
          {/* Circular Progress */}
          <div className="relative w-[200px] h-[200px]">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r={radius}
                fill="none"
                stroke={statusColors[status]}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                style={{
                  transition: 'stroke-dasharray 1s ease-in-out',
                }}
              />
            </svg>
            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{score}%</span>
              <span className="text-sm text-gray-300 mt-1">Compliance Score</span>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 text-center">
            <p className="text-lg font-medium" style={{ color: statusColors[status] }}>
              {statusText[status]}
            </p>
            
            {/* Change indicator */}
            <div className="flex items-center justify-center gap-2 mt-2 text-sm">
              {isImproving ? (
                <>
                  <TrendingUp className="h-4 w-4 text-[#B1FA63]" />
                  <span className="text-gray-300">
                    +{change}% from last month
                  </span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-[#FE7733]" />
                  <span className="text-gray-300">
                    {change}% from last month
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </EtherealCardContent>
    </EtherealCard>
  )
}