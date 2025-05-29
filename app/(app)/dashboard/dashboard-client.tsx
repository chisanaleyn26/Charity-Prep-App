'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getComplianceStatistics, type ComplianceStatistics } from '@/lib/services/compliance-statistics.service'
import { ComplianceScoreCard } from '@/features/compliance/components/score/compliance-score-card'
import { ActivityFeed } from '@/features/dashboard/components/activity-feed'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  Globe, 
  DollarSign,
  FileText,
  ArrowRight
} from 'lucide-react'

interface DashboardStats {
  totalRecords: number
  safeguardingRecords: number
  overseasActivities: number
  fundraisingRecords: number
  documents: number
  lastUpdated: string
}

interface ComplianceData {
  statistics: ComplianceStatistics | null
  loading: boolean
  error: string | null
}

export default function DashboardClient() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceData>({
    statistics: null,
    loading: true,
    error: null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkUserAndOrganization()
  }, [])

  const checkUserAndOrganization = async () => {
    try {
      const supabase = createClient()
      
      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      
      // Check organization membership
      const { data: memberships, error: memberError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .order('created_at', { ascending: false })
      
      console.log('Memberships found:', memberships)
      console.log('Membership error:', memberError)
      
      if (memberError || !memberships || memberships.length === 0) {
        console.log('No organization found, redirecting to onboarding')
        router.push('/onboarding')
        return
      }
      
      // Use the most recent organization
      const membership = memberships[0]
      
      setOrganization(membership.organization)
      
      // Get basic stats
      const [
        { count: safeguardingCount },
        { count: overseasCount },
        { count: incomeCount },
        { count: documentsCount }
      ] = await Promise.all([
        supabase
          .from('safeguarding_records')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', membership.organization_id),
        supabase
          .from('overseas_activities')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', membership.organization_id),
        supabase
          .from('income_records')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', membership.organization_id),
        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', membership.organization_id)
      ])
      
      const dashboardStats = {
        totalRecords: (safeguardingCount || 0) + (overseasCount || 0) + (incomeCount || 0),
        safeguardingRecords: safeguardingCount || 0,
        overseasActivities: overseasCount || 0,
        fundraisingRecords: incomeCount || 0,
        documents: documentsCount || 0,
        lastUpdated: new Date().toISOString()
      }
      
      setStats(dashboardStats)
      
      // Fetch comprehensive compliance statistics
      try {
        const complianceStats = await getComplianceStatistics(membership.organization_id)
        setComplianceData({
          statistics: complianceStats,
          loading: false,
          error: null
        })
      } catch (complianceError: any) {
        console.error('Failed to load compliance statistics:', complianceError)
        setComplianceData({
          statistics: null,
          loading: false,
          error: complianceError.message || 'Failed to load compliance data'
        })
      }
      
      setLoading(false)
      
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B1FA63] mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-[#B1FA63] text-[#243837] rounded hover:bg-[#9FE851]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!user || !organization || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  // Use real compliance score or fallback to basic calculation
  const complianceScore = complianceData.statistics 
    ? Math.round(complianceData.statistics.overall.percentage)
    : Math.min(100, Math.round((stats.totalRecords / 30) * 100))
  
  const getTrendIcon = () => {
    if (!complianceData.statistics?.trends.direction) return <Minus className="h-4 w-4" />
    
    switch (complianceData.statistics.trends.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Minus className="h-4 w-4 text-gray-400" />
    }
  }
  
  const getTrendText = () => {
    if (!complianceData.statistics?.trends.change) return null
    
    const change = complianceData.statistics.trends.change
    const direction = change > 0 ? 'up' : 'down'
    return `${Math.abs(change)}% ${direction} from last month`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back{user?.email ? `, ${user.email}` : ''}
          </p>
          <p className="text-sm text-gray-500">
            Organization: {organization.name}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <div className="text-4xl font-bold text-[#B1FA63]">{complianceScore}%</div>
            {getTrendIcon()}
          </div>
          <p className="text-sm text-gray-500">Compliance Score</p>
          {getTrendText() && (
            <p className="text-xs text-gray-400">{getTrendText()}</p>
          )}
        </div>
      </div>
      
      {/* Compliance Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safeguarding</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceData.statistics?.breakdown.safeguarding.percentage 
                ? `${Math.round(complianceData.statistics.breakdown.safeguarding.percentage)}%`
                : `${stats.safeguardingRecords} records`}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData.statistics?.breakdown.safeguarding.score
                ? `${complianceData.statistics.breakdown.safeguarding.score}/${complianceData.statistics.breakdown.safeguarding.maxScore} points`
                : 'DBS checks and training'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overseas Activities</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceData.statistics?.breakdown.overseas.percentage 
                ? `${Math.round(complianceData.statistics.breakdown.overseas.percentage)}%`
                : `${stats.overseasActivities} activities`}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData.statistics?.breakdown.overseas.score
                ? `${complianceData.statistics.breakdown.overseas.score}/${complianceData.statistics.breakdown.overseas.maxScore} points`
                : 'International programs'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fundraising</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceData.statistics?.breakdown.fundraising.percentage 
                ? `${Math.round(complianceData.statistics.breakdown.fundraising.percentage)}%`
                : `${stats.fundraisingRecords} records`}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceData.statistics?.breakdown.fundraising.score
                ? `${complianceData.statistics.breakdown.fundraising.score}/${complianceData.statistics.breakdown.fundraising.maxScore} points`
                : 'Income tracking'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.documents}</div>
            <p className="text-xs text-muted-foreground">
              Stored compliance documents
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Action Items */}
      {complianceData.statistics?.actionItems && complianceData.statistics.actionItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Priority Actions
            </CardTitle>
            <CardDescription>
              Items requiring immediate attention to improve compliance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {complianceData.statistics.actionItems.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-gray-50">
                <div className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${
                  item.priority === 'high' ? 'bg-red-500' : 
                  item.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <Badge variant={item.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                      {item.priority}
                    </Badge>
                    {item.count && (
                      <Badge variant="outline" className="text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity Fallback */}
      {(!complianceData.statistics?.actionItems || complianceData.statistics.actionItems.length === 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              {stats.totalRecords > 0 
                ? `You have ${stats.totalRecords} compliance records. Great work!`
                : 'No activity yet - start by adding your first compliance record'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Add new compliance data or access key features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => router.push('/compliance/safeguarding')}
            >
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Add Safeguarding Record</h4>
                  <p className="text-sm text-gray-500">Track DBS checks and training</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => router.push('/compliance/overseas-activities')}
            >
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Record Overseas Activity</h4>
                  <p className="text-sm text-gray-500">Log international programs</p>
                </div>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 justify-start text-left"
              onClick={() => router.push('/documents')}
            >
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Upload Documents</h4>
                  <p className="text-sm text-gray-500">Store compliance documents</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}