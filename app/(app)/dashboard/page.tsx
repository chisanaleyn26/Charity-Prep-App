import { redirect } from 'next/navigation'
import { getCurrentUser, getCurrentUserOrganization, createServerClient } from '@/lib/supabase/server'
import { KPICards } from '@/features/dashboard/components'
import { appConfig } from '@/lib/config'

// Route segment configuration
export const revalidate = 60
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Use mock data in mock mode
  if (appConfig.features.mockMode) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard (Mock Mode)</h1>
          <p className="text-muted-foreground">Welcome to CharityPrep</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Total Records</h3>
            <p className="text-2xl">45</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Safeguarding</h3>
            <p className="text-2xl">15</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Overseas</h3>
            <p className="text-2xl">10</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Documents</h3>
            <p className="text-2xl">20</p>
          </div>
        </div>
      </div>
    )
  }

  try {
    // Get user data
    const user = await getCurrentUser()
    
    if (!user) {
      redirect('/login')
    }
    
    const orgData = await getCurrentUserOrganization()
    
    if (!orgData) {
      redirect('/onboarding')
    }
    
    const { organization, organizationId } = orgData
    
    // Get basic stats
    const supabase = await createServerClient()
    
    const [
      { count: safeguardingCount },
      { count: overseasCount },
      { count: incomeCount },
      { count: documentsCount }
    ] = await Promise.all([
      supabase
        .from('safeguarding_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('overseas_activities')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('income_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
    ])
    
    const stats = {
      totalRecords: (safeguardingCount || 0) + (overseasCount || 0) + (incomeCount || 0),
      safeguardingRecords: safeguardingCount || 0,
      overseasActivities: overseasCount || 0,
      fundraisingRecords: incomeCount || 0,
      documents: documentsCount || 0,
      lastUpdated: new Date().toISOString()
    }
    
    const complianceScore = Math.min(100, Math.round((stats.totalRecords / 30) * 100))
    
    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.email ? `, ${user.email}` : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{complianceScore}%</div>
            <p className="text-sm text-muted-foreground">Compliance Score</p>
          </div>
        </div>
        
        {/* KPI Cards */}
        <KPICards stats={stats} />
        
        {/* Simple activity section */}
        <div className="border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <p className="text-muted-foreground">
            {stats.totalRecords > 0 
              ? `You have ${stats.totalRecords} compliance records`
              : 'No activity yet - start by adding your first compliance record'}
          </p>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </div>
    )
  }
}