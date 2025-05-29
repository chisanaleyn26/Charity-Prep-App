'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Award,
  TrendingUp, 
  TrendingDown, 
  Minus,
  Shield, 
  Globe, 
  DollarSign,
  ChevronDown,
  ChevronUp,
  Info,
  AlertTriangle,
  CheckCircle,
  Target,
  Calculator,
  Lightbulb,
  ExternalLink,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComplianceStatistics } from '@/lib/services/compliance-statistics.service'

interface OptimizedComplianceScoreProps {
  statistics: ComplianceStatistics
}

export function OptimizedComplianceScore({ statistics }: OptimizedComplianceScoreProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  
  const score = Math.round(statistics.overall.percentage)
  const grade = statistics.overall.grade || getGradeFromScore(score)
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }
  
  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-50 border-green-200'
    if (score >= 75) return 'bg-blue-50 border-blue-200'
    if (score >= 50) return 'bg-amber-50 border-amber-200'
    return 'bg-red-50 border-red-200'
  }
  
  const getStatusMessage = (score: number) => {
    if (score >= 90) return 'Excellent compliance - you\'re meeting all key requirements'
    if (score >= 75) return 'Good compliance with minor areas for improvement'
    if (score >= 50) return 'Fair compliance - several areas need attention'
    return 'Poor compliance - urgent action required'
  }
  
  const getTrendIcon = () => {
    if (!statistics.trends.direction) return <Minus className="h-4 w-4 text-gray-400" />
    
    switch (statistics.trends.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <Card>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Overall Score */}
            <div className="md:col-span-1">
              <div className={cn(
                'h-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-300',
                getScoreBgColor(score)
              )}>
                <div className="flex items-baseline gap-1 mb-2">
                  <div className={cn('text-5xl font-bold', getScoreColor(score))}>
                    {score}
                  </div>
                  <div className="text-2xl text-gray-500 font-light">%</div>
                </div>
                
                <Badge variant="outline" className="mb-2">
                  Grade {grade}
                </Badge>
                
                {statistics.trends.change && (
                  <div className="flex items-center gap-1 text-sm">
                    {getTrendIcon()}
                    <span>{Math.abs(statistics.trends.change)}%</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Category Scores */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              <CategoryScoreCard
                icon={Shield}
                title="Safeguarding"
                score={Math.round(statistics.breakdown.safeguarding.percentage)}
                level={statistics.breakdown.safeguarding.level}
              />
              <CategoryScoreCard
                icon={Globe}
                title="Overseas"
                score={Math.round(statistics.breakdown.overseas.percentage)}
                level={statistics.breakdown.overseas.level}
              />
              <CategoryScoreCard
                icon={DollarSign}
                title="Fundraising"
                score={Math.round(statistics.breakdown.fundraising.percentage)}
                level={statistics.breakdown.fundraising.level}
              />
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-600 text-center">
              {getStatusMessage(score)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How Your Score is Calculated */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            How Your Score is Calculated
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-gray-600">
            Your compliance score is weighted across three key areas. Each category contributes differently 
            to your overall score based on regulatory importance.
          </p>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* Safeguarding */}
            <ScoreBreakdownCard
              icon={Shield}
              title="Safeguarding"
              score={Math.round(statistics.breakdown.safeguarding.percentage)}
              weight={40}
              color="blue"
              explanation="DBS checks, training records, and safeguarding policies"
              calculation="100% base score - 10 points per expiring record - 20 points per expired record"
              expanded={expandedSection === 'safeguarding'}
              onToggle={() => setExpandedSection(expandedSection === 'safeguarding' ? null : 'safeguarding')}
            />
            
            {/* Overseas */}
            <ScoreBreakdownCard
              icon={Globe}
              title="Overseas Activities"
              score={Math.round(statistics.breakdown.overseas.percentage)}
              weight={30}
              color="green"
              explanation="International program compliance and risk management"
              calculation="100% base score - 15 points per unreported high-risk activity - 10 points per missing sanctions check"
              expanded={expandedSection === 'overseas'}
              onToggle={() => setExpandedSection(expandedSection === 'overseas' ? null : 'overseas')}
            />
            
            {/* Fundraising */}
            <ScoreBreakdownCard
              icon={DollarSign}
              title="Fundraising"
              score={Math.round(statistics.breakdown.fundraising.percentage)}
              weight={30}
              color="purple"
              explanation="Income documentation and donation compliance"
              calculation="Documentation rate × 80 + 20 bonus for related party compliance - 5 points per unclaimed gift aid"
              expanded={expandedSection === 'fundraising'}
              onToggle={() => setExpandedSection(expandedSection === 'fundraising' ? null : 'fundraising')}
            />
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Final Calculation
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Overall Score = (Safeguarding × 40%) + (Overseas × 30%) + (Fundraising × 30%)
            </p>
            <div className="text-sm font-mono bg-white rounded p-2 border">
              {score} = ({Math.round(statistics.breakdown.safeguarding.percentage)} × 0.4) + 
              ({Math.round(statistics.breakdown.overseas.percentage)} × 0.3) + 
              ({Math.round(statistics.breakdown.fundraising.percentage)} × 0.3)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {statistics.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Priority Actions to Improve Your Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {statistics.actionItems.slice(0, 5).map((item, index) => (
                <ActionItemCard key={index} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold">Immediate Actions (This Week)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Review high-priority action items above
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Update any expired DBS checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Complete missing documentation
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold">Long-term Improvements (This Month)</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Set up automated reminder systems
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Review and update policies
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  Schedule regular compliance reviews
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex gap-3 pt-4 border-t">
            <Button className="gap-2">
              <ExternalLink className="h-4 w-4" />
              View Detailed Reports
            </Button>
            <Button variant="outline" className="gap-2">
              <HelpCircle className="h-4 w-4" />
              Get Compliance Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ScoreBreakdownCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  score: number
  weight: number
  color: 'blue' | 'green' | 'purple'
  explanation: string
  calculation: string
  expanded: boolean
  onToggle: () => void
}

function ScoreBreakdownCard({ 
  icon: Icon, 
  title, 
  score, 
  weight, 
  color, 
  explanation, 
  calculation,
  expanded,
  onToggle
}: ScoreBreakdownCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    green: 'text-green-600 bg-green-50 border-green-200', 
    purple: 'text-purple-600 bg-purple-50 border-purple-200'
  }
  
  return (
    <div className={cn('border rounded-xl p-4 transition-all duration-200', colorClasses[color])}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {weight}% weight
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{score}%</span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggle}
            className="p-1 h-auto"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        <Progress value={score} className="h-2" />
        
        <p className="text-sm opacity-80">{explanation}</p>
        
        <Collapsible open={expanded}>
          <CollapsibleContent className="space-y-2">
            <div className="bg-white/60 rounded p-3 text-xs">
              <h5 className="font-semibold mb-1">Calculation Method:</h5>
              <p>{calculation}</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  )
}

interface ActionItemCardProps {
  item: {
    category: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    count?: number
  }
}

function ActionItemCard({ item }: ActionItemCardProps) {
  const priorityConfig = {
    high: { 
      color: 'bg-red-100 text-red-700 border-red-200',
      icon: AlertTriangle,
      label: 'High Priority'
    },
    medium: { 
      color: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: Info,
      label: 'Medium Priority'
    },
    low: { 
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: Info,
      label: 'Low Priority'
    }
  }
  
  const config = priorityConfig[item.priority]
  const Icon = config.icon
  
  return (
    <div className="flex items-start gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
      <div className={cn('p-2 rounded-lg border', config.color)}>
        <Icon className="h-4 w-4" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-gray-900">{item.title}</h4>
          {item.count && (
            <Badge variant="outline" className="text-xs">
              {item.count}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs capitalize">
            {item.category}
          </Badge>
          <Badge variant="outline" className={cn('text-xs', config.color)}>
            {config.label}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

interface CategoryScoreCardProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  score: number
  level: string
}

function CategoryScoreCard({ icon: Icon, title, score, level }: CategoryScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 50) return 'text-amber-600'
    return 'text-red-600'
  }
  
  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-900">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {level}
        </Badge>
      </div>
      
      <div className="space-y-2">
        <div className={cn('text-3xl font-bold', getScoreColor(score))}>
          {score}%
        </div>
        <Progress value={score} className="h-2" />
      </div>
    </div>
  )
}