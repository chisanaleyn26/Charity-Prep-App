/**
 * Cached query functions using NextJS 15 caching
 * These provide optimized data fetching with automatic deduplication
 */

import { createCachedFunction, CACHE_CONFIG, CACHE_TAGS } from './caching'
import { createServerClient, getCurrentUser, getCurrentUserOrganization } from '@/lib/supabase/server'
import type { Database } from '@/lib/types/database.types'

// Re-export auth functions from supabase/server
export { getCurrentUser, getCurrentUserOrganization }

/**
 * Get organization details (cached)
 */
export const getCachedOrganization = createCachedFunction(
  async (orgId: string) => {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single()
    
    if (error) throw error
    return data
  },
  ['organization'],
  {
    ...CACHE_CONFIG.MEDIUM,
    tags: ['organization'],
  }
)

/**
 * Get compliance score (cached)
 */
export const getCachedComplianceScore = createCachedFunction(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    // Get all compliance data
    const [safeguarding, overseas, fundraising] = await Promise.all([
      supabase
        .from('safeguarding_records')
        .select('id')
        .eq('organization_id', orgId),
      supabase
        .from('overseas_activities')
        .select('id')
        .eq('organization_id', orgId),
      supabase
        .from('fundraising_records')
        .select('id')
        .eq('organization_id', orgId)
    ])
    
    // Calculate score
    const totalRecords = 
      (safeguarding.data?.length || 0) + 
      (overseas.data?.length || 0) + 
      (fundraising.data?.length || 0)
    
    const score = Math.min(100, Math.round((totalRecords / 30) * 100))
    
    return {
      score,
      safeguarding: safeguarding.data?.length || 0,
      overseas: overseas.data?.length || 0,
      fundraising: fundraising.data?.length || 0,
      lastUpdated: new Date().toISOString()
    }
  },
  ['compliance-score'],
  {
    ...CACHE_CONFIG.SHORT,
    tags: ['compliance'],
  }
)

/**
 * Get recent activity (cached)
 */
export const getCachedRecentActivity = createCachedFunction(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    // Get recent records from all modules
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const [safeguarding, overseas, fundraising] = await Promise.all([
      supabase
        .from('safeguarding_records')
        .select('id, person_name, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('overseas_activities')
        .select('id, country_code, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
      supabase
        .from('fundraising_records')
        .select('id, description, created_at')
        .eq('organization_id', orgId)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5)
    ])
    
    // Combine and sort all activities
    const activities = [
      ...(safeguarding.data?.map(r => ({
        id: r.id,
        type: 'safeguarding' as const,
        description: `Added safeguarding record for ${r.person_name}`,
        createdAt: r.created_at
      })) || []),
      ...(overseas.data?.map(r => ({
        id: r.id,
        type: 'overseas' as const,
        description: `Added overseas activity in ${r.country_code}`,
        createdAt: r.created_at
      })) || []),
      ...(fundraising.data?.map(r => ({
        id: r.id,
        type: 'fundraising' as const,
        description: r.description || 'Added fundraising record',
        createdAt: r.created_at
      })) || [])
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return activities.slice(0, 10)
  },
  ['recent-activity'],
  {
    ...CACHE_CONFIG.REALTIME,
    tags: ['activity'],
  }
)

/**
 * Get dashboard stats (cached)
 */
export const getCachedDashboardStats = createCachedFunction(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    const [
      { count: safeguardingCount },
      { count: overseasCount },
      { count: fundraisingCount },
      { count: documentsCount }
    ] = await Promise.all([
      supabase
        .from('safeguarding_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('overseas_activities')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('fundraising_records')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId),
      supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId)
    ])
    
    return {
      totalRecords: (safeguardingCount || 0) + (overseasCount || 0) + (fundraisingCount || 0),
      safeguardingRecords: safeguardingCount || 0,
      overseasActivities: overseasCount || 0,
      fundraisingRecords: fundraisingCount || 0,
      documents: documentsCount || 0,
      lastUpdated: new Date().toISOString()
    }
  },
  ['dashboard-stats'],
  {
    ...CACHE_CONFIG.SHORT,
    tags: ['dashboard'],
  }
)

/**
 * Get organization members (cached)
 */
export const getCachedOrganizationMembers = createCachedFunction(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        id,
        role,
        created_at,
        user:users(id, email, full_name)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },
  ['organization-members'],
  {
    ...CACHE_CONFIG.MEDIUM,
    tags: ['organization'],
  }
)

/**
 * Get urgent actions (no memoization for now)
 */
export const getUrgentActions = async (orgId: string) => {
  const supabase = await createServerClient()
  
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  // Check for expiring DBS records
  const { data: expiringDBS } = await supabase
    .from('safeguarding_records')
    .select('id, person_name, expiry_date')
    .eq('organization_id', orgId)
    .lte('expiry_date', thirtyDaysFromNow.toISOString())
    .gte('expiry_date', new Date().toISOString())
    .order('expiry_date', { ascending: true })
    .limit(5)
  
  const actions = expiringDBS?.map(record => ({
    id: record.id,
    type: 'warning' as const,
    title: `DBS expiring for ${record.person_name}`,
    description: `Expires on ${new Date(record.expiry_date).toLocaleDateString()}`,
    action: '/compliance/safeguarding'
  })) || []
  
  return actions
}