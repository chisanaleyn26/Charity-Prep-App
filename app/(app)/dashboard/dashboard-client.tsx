'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  totalRecords: number
  safeguardingRecords: number
  overseasActivities: number
  fundraisingRecords: number
  documents: number
  lastUpdated: string
}

export default function DashboardClient() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [organization, setOrganization] = useState<any>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
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

  const complianceScore = Math.min(100, Math.round((stats.totalRecords / 30) * 100))

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
          <div className="text-4xl font-bold text-[#B1FA63]">{complianceScore}%</div>
          <p className="text-sm text-gray-500">Compliance Score</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700">Total Records</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.totalRecords}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700">Safeguarding</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.safeguardingRecords}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700">Overseas Activities</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.overseasActivities}</p>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-gray-700">Documents</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.documents}</p>
        </div>
      </div>
      
      {/* Activity section */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-600">
          {stats.totalRecords > 0 
            ? `You have ${stats.totalRecords} compliance records`
            : 'No activity yet - start by adding your first compliance record'}
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium">Add Safeguarding Record</h4>
            <p className="text-sm text-gray-500">Track DBS checks and training</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium">Record Overseas Activity</h4>
            <p className="text-sm text-gray-500">Log international programs</p>
          </button>
          <button className="p-4 border rounded-lg hover:bg-gray-50 text-left">
            <h4 className="font-medium">Upload Documents</h4>
            <p className="text-sm text-gray-500">Store compliance documents</p>
          </button>
        </div>
      </div>
    </div>
  )
}