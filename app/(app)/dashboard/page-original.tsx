'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { KPICards } from '@/features/dashboard/components/kpi-cards'
import { ActivityFeed } from '@/features/dashboard/components/activity-feed'
import { ComplianceTrendChart } from '@/features/dashboard/components/compliance-trend-chart'
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

interface DashboardStats {
  totalRecords: number
  safeguardingRecords: number
  overseasActivities: number
  fundraisingRecords: number
  documents: number
  lastUpdated: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      
      // Get user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return
      
      setUser(user)
      
      // Get organization
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .not('accepted_at', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (memberships && memberships[0]) {
        const membership = memberships[0]
        setOrganization(membership.organization)
        
        // Get stats
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
        
        setStats({
          totalRecords: (safeguardingCount || 0) + (overseasCount || 0) + (incomeCount || 0),
          safeguardingRecords: safeguardingCount || 0,
          overseasActivities: overseasCount || 0,
          fundraisingRecords: incomeCount || 0,
          documents: documentsCount || 0,
          lastUpdated: new Date().toISOString()
        })
      }
      
    } catch (err: any) {
      console.error('Dashboard error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
            onClick={() => window.location.reload()}
            className="bg-[#B1FA63] hover:bg-[#9FE851] text-[#243837] font-medium"
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const complianceScore = stats ? Math.min(100, Math.round((stats.totalRecords / 30) * 100)) : 0
  const isNewOrganization = stats?.totalRecords === 0

  return (
    <div className="space-y-8 pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#B1FA63]/5 via-[#B1FA63]/3 to-transparent rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-gray-900 leading-tight">
                Welcome back
              </h1>
              <p className="text-base text-gray-600 leading-relaxed">
                {organization?.name || 'Your Organization'}
              </p>
              {organization?.charity_number && (
                <div className="pt-2">
                  <Badge variant="secondary" className="text-sm font-medium px-3 py-1">
                    Charity #{organization.charity_number}
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-w-[180px] text-center">
              <div className="text-3xl font-semibold text-gray-900 mb-2 leading-tight">
                {complianceScore}%
              </div>
              <div className="flex items-center gap-2 justify-center mb-3">
                <div className="h-2 w-2 bg-[#B1FA63] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-600">Compliance Score</span>
              </div>
              {complianceScore >= 80 && (
                <div className="flex items-center gap-2 justify-center text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Excellent</span>
                </div>
              )}
            </div>
          </div>
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
        {/* Compliance Trend */}
        <div className="lg:col-span-2">
          <ComplianceTrendChart />
        </div>
        
        {/* Activity Feed */}
        <div className="lg:col-span-1">
          <ActivityFeed />
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

      {/* Action Zone */}
      <div className="space-y-6 relative z-0">
        <h2 className="text-2xl font-medium text-gray-900 leading-tight">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="group hover:shadow-md transition-all duration-300 border border-gray-200 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-25 hover:shadow-emerald-100/50 flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">Safeguarding</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex flex-col flex-1">
              <CardDescription className="text-gray-600 leading-relaxed mb-4 flex-1">
                Manage DBS checks, training records, and safeguarding policies for your organization
              </CardDescription>
              <div className="mt-auto">
                <Link href="/compliance/safeguarding">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-10 group-hover:bg-emerald-100/80 transition-colors font-medium"
                  >
                    <span>Manage Records</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-300 border border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-blue-25 hover:shadow-blue-100/50 flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Globe className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">Overseas Activities</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex flex-col flex-1">
              <CardDescription className="text-gray-600 leading-relaxed mb-4 flex-1">
                Track international programs and overseas expenditure for compliance reporting
              </CardDescription>
              <div className="mt-auto">
                <Link href="/compliance/overseas-activities">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-10 group-hover:bg-blue-100/80 transition-colors font-medium"
                  >
                    <span>View Activities</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-all duration-300 border border-gray-200 shadow-sm bg-gradient-to-br from-purple-50 to-purple-25 hover:shadow-purple-100/50 flex flex-col h-full">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200 flex-shrink-0">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg font-medium text-gray-900 leading-normal">AI Assistant</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6 flex flex-col flex-1">
              <CardDescription className="text-gray-600 leading-relaxed mb-4 flex-1">
                Get instant answers to compliance questions and regulatory guidance
              </CardDescription>
              <div className="mt-auto">
                <Link href="/compliance/chat">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-between h-10 group-hover:bg-purple-100/80 transition-colors font-medium"
                  >
                    <span>Start Chat</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
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
      {/* Hero Skeleton */}
      <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white rounded-xl p-6 border border-gray-200 min-w-[180px]">
              <Skeleton className="h-8 w-16 mx-auto mb-2" />
              <Skeleton className="h-4 w-20 mx-auto mb-3" />
              <Skeleton className="h-4 w-12 mx-auto" />
            </div>
          </div>
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
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-96 rounded-xl" />
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