'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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
    console.log('Dashboard page loaded!')
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const supabase = createClient()
      
      // Get user
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) return
      
      setUser(user)
      
      // Get organization (we know it exists since layout passed)
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

  const complianceScore = stats ? Math.min(100, Math.round((stats.totalRecords / 30) * 100)) : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back{user?.email ? `, ${user.email}` : ''}
          </p>
          {organization && (
            <p className="text-sm text-gray-500">
              Organization: {organization.name}
              {organization.charity_number && ` (${organization.charity_number})`}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[#B1FA63]">{complianceScore}%</div>
          <p className="text-sm text-gray-500">Compliance Score</p>
        </div>
      </div>
      
      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Total Records</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.totalRecords}</p>
            <p className="text-sm text-gray-500 mt-1">All compliance records</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Safeguarding</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.safeguardingRecords}</p>
            <p className="text-sm text-gray-500 mt-1">DBS & training records</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Overseas Activities</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.overseasActivities}</p>
            <p className="text-sm text-gray-500 mt-1">International programs</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-gray-700 mb-2">Documents</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.documents}</p>
            <p className="text-sm text-gray-500 mt-1">Uploaded files</p>
          </div>
        </div>
      )}
      
      {/* Activity section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        <p className="text-gray-600">
          {stats && stats.totalRecords > 0 
            ? `You have ${stats.totalRecords} compliance records across your organization.`
            : 'No activity yet - start by adding your first compliance record!'}
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h4 className="font-medium text-gray-900">Add Safeguarding Record</h4>
            <p className="text-sm text-gray-500 mt-1">Track DBS checks and training</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h4 className="font-medium text-gray-900">Record Overseas Activity</h4>
            <p className="text-sm text-gray-500 mt-1">Log international programs</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left transition-colors">
            <h4 className="font-medium text-gray-900">Upload Documents</h4>
            <p className="text-sm text-gray-500 mt-1">Store compliance documents</p>
          </button>
        </div>
      </div>
      
      {/* Welcome message for new users */}
      {stats && stats.totalRecords === 0 && (
        <div className="bg-[#B1FA63]/10 border border-[#B1FA63]/20 rounded-lg p-6">
          <h3 className="font-semibold text-[#243837] mb-2">Welcome to Charity Prep! 🎉</h3>
          <p className="text-[#243837] mb-4">
            Your organization has been set up successfully. Here's what you can do next:
          </p>
          <ul className="text-sm text-[#243837] space-y-1">
            <li>• Add your first safeguarding records (DBS checks, training certificates)</li>
            <li>• Record any overseas activities your charity conducts</li>
            <li>• Upload important compliance documents</li>
            <li>• Explore the compliance modules to build your annual return data</li>
          </ul>
        </div>
      )}
    </div>
  )
}