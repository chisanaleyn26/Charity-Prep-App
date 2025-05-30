'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KPICards } from '@/features/dashboard/components/kpi-cards'
import { RealtimeActivityFeed } from '@/features/dashboard/components/realtime-activity-feed'
import { ComplianceStatusDashboard } from '@/features/dashboard/components/compliance-status-dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  TrendingUp, 
  Shield, 
  FileText, 
  MessageSquare, 
  Users, 
  Globe, 
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'
import { useOrganization } from '@/features/organizations/components/organization-provider'
import { useAuthStore } from '@/stores/auth-store'
import { logActivity } from '@/lib/services/activity-logging.service'
import { ActivityTypes } from '@/lib/constants/activity-types'

interface DashboardStats {
  totalRecords: number
  safeguardingRecords: number
  overseasActivities: number
  fundraisingRecords: number
  documents: number
  lastUpdated: string
}

interface ComplianceData {
  score: number
  level: string
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { currentOrganization } = useOrganization()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentOrganization) {
      loadDashboardData()
      
      // Log dashboard page view
      logActivity({
        activity_type: ActivityTypes.PAGE_VIEW,
        metadata: { 
          page: 'dashboard',
          organization_id: currentOrganization.id,
          organization_name: currentOrganization.name
        }
      })
    }
  }, [currentOrganization?.id]) // Re-load when organization changes

  const loadDashboardData = async () => {
    if (!currentOrganization) return
    
    try {
      setLoading(true)
      setError('')
      const supabase = createClient()
      
      // Get stats for the current organization
      const [
        { count: safeguardingCount },
        { count: overseasCount },
        { count: incomeCount },
        { count: documentsCount }
      ] = await Promise.all([
        supabase
          .from('safeguarding_records')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id),
        supabase
          .from('overseas_activities')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id),
        supabase
          .from('income_records')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id),
        supabase
          .from('documents')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', currentOrganization.id)
      ])
      
      const statsData = {
        totalRecords: (safeguardingCount || 0) + (overseasCount || 0) + (incomeCount || 0),
        safeguardingRecords: safeguardingCount || 0,
        overseasActivities: overseasCount || 0,
        fundraisingRecords: incomeCount || 0,
        documents: documentsCount || 0,
        lastUpdated: new Date().toISOString()
      }
      setStats(statsData)
      
      // Fetch comprehensive compliance statistics
      try {
        const response = await fetch('/api/compliance/statistics')
        if (response.ok) {
          const statistics = await response.json()
          setComplianceData({
            score: statistics.overall.percentage,
            level: statistics.overall.level
          })
        } else {
          throw new Error('Failed to fetch compliance statistics')
        }
      } catch (err) {
        console.error('Error fetching compliance statistics:', err)
        // Fallback to simple calculation if statistics service fails
        const fallbackScore = Math.min(100, Math.round((statsData.totalRecords / 30) * 100))
        setComplianceData({
          score: fallbackScore,
          level: fallbackScore >= 80 ? 'Excellent' : fallbackScore >= 60 ? 'Good' : fallbackScore >= 40 ? 'Fair' : 'Poor'
        })
      }
      
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!currentOrganization) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">No organization selected</h3>
            <p className="text-base text-gray-600">Please select an organization from the dropdown above.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 leading-normal">Failed to load dashboard</h3>
            <p className="text-base text-gray-600 leading-relaxed">{error}</p>
          </div>
          <Button 
            onClick={() => loadDashboardData()}
            className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const complianceScore = complianceData?.score || 0
  const complianceLevel = complianceData?.level || 'Unknown'
  const isNewOrganization = stats?.totalRecords === 0

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Welcome back, {user?.email || 'User'}
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Managing {currentOrganization.name}
            {currentOrganization.charity_number && (
              <span className="text-sm text-gray-500"> • Charity #{currentOrganization.charity_number}</span>
            )}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-medium text-gray-900 leading-tight">Key Metrics</h2>
          <Badge variant="outline" className="text-sm font-medium">
            Last updated {new Date().toLocaleDateString()}
          </Badge>
        </div>
        <KPICards stats={stats} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compliance Status Dashboard */}
        <div className="lg:col-span-2">
          <ComplianceStatusDashboard organizationId={currentOrganization.id} />
        </div>
        
        {/* Live Activity Feed */}
        <div className="lg:col-span-1 lg:row-span-1">
          <div className="h-full">
            <RealtimeActivityFeed organizationId={currentOrganization.id} />
          </div>
        </div>
      </div>

      {/* Welcome Banner for New Organizations - Show first */}
      {isNewOrganization && (
        <Card className="bg-gradient-to-r from-[#B1FA63]/10 via-[#B1FA63]/5 to-transparent border border-gray-200 shadow-sm relative z-10">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#B1FA63]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-[#243837]" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-medium text-gray-900 leading-normal">
                  Welcome to Charity Prep! 🎉
                </CardTitle>
                <CardDescription className="text-gray-600 mt-1 text-base leading-relaxed">
                  Your organization is ready. Let's build your compliance foundation.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">Add safeguarding records (DBS checks, training)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">Record overseas activities and programs</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">Upload important compliance documents</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 leading-relaxed">Explore AI-powered compliance guidance</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">Safeguarding</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Manage DBS checks, training records, and safeguarding policies for your organization
              </CardDescription>
              <Link href="/compliance/safeguarding">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-10 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                >
                  <span>Manage Records</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">Overseas Activities</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Track international programs and overseas expenditure for compliance reporting
              </CardDescription>
              <Link href="/compliance/overseas-activities">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-10 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                >
                  <span>View Activities</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 rounded-2xl hover:shadow-sm transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">AI Assistant</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <CardDescription className="text-gray-600 leading-relaxed mb-4">
                Get instant answers to compliance questions and regulatory guidance
              </CardDescription>
              <Link href="/compliance/chat">
                <Button 
                  variant="outline" 
                  className="w-full justify-between h-10 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium"
                >
                  <span>Start Chat</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header Skeleton */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-48" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Status Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Skeleton className="h-48 rounded-2xl" />
              <Skeleton className="h-48 rounded-2xl" />
            </div>
            {/* Category Breakdown Skeleton */}
            <Skeleton className="h-64 rounded-2xl" />
            {/* Trend Skeleton */}
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 h-48">
              <div className="flex items-start gap-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-28 mb-1" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}