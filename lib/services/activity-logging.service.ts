'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/admin'

export interface ActivityLogEntry {
  activity_type: string
  resource_type?: string
  resource_id?: string
  resource_name?: string
  metadata?: Record<string, any>
  duration_ms?: number
}

export interface AuditLogEntry {
  action: string
  resource_type?: string
  resource_id?: string
  resource_name?: string
  changes?: Record<string, any>
  severity?: 'info' | 'warning' | 'error' | 'critical'
  ip_address?: string
  user_agent?: string
}

/**
 * Log a user activity (page views, searches, exports, etc.)
 */
export async function logActivity(entry: ActivityLogEntry) {
  try {
    const supabase = await createClient()
    
    // Get current user and organization
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()
    
    if (!orgMember) return
    
    // Use service client to bypass RLS
    const serviceClient = createServiceClient()
    await serviceClient
      .from('user_activities')
      .insert({
        organization_id: orgMember.organization_id,
        user_id: user.id,
        ...entry,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log activity:', error)
    // Don't throw - logging shouldn't break the app
  }
}

/**
 * Log an audit event (critical actions, security events)
 * Note: Most audit events are logged automatically via database triggers
 */
export async function logAuditEvent(entry: AuditLogEntry) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Get user details
    const { data: userDetails } = await supabase
      .from('users')
      .select('email')
      .eq('id', user.id)
      .single()
    
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .not('accepted_at', 'is', null)
      .single()
    
    if (!orgMember) return
    
    // Use service client to bypass RLS
    const serviceClient = createServiceClient()
    await serviceClient
      .from('audit_logs')
      .insert({
        organization_id: orgMember.organization_id,
        user_id: user.id,
        user_email: userDetails?.email,
        ...entry,
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Failed to log audit event:', error)
  }
}

/**
 * Get recent activities for an organization
 */
export async function getRecentActivities(
  organizationId: string,
  limit: number = 50
): Promise<any[]> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('recent_activities')
      .select('*')
      .eq('organization_id', organizationId)
      .limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch recent activities:', error)
    return []
  }
}

/**
 * Get recent audit logs for an organization
 */
export async function getRecentAuditLogs(
  organizationId: string,
  limit: number = 50,
  severity?: string
): Promise<any[]> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('recent_audit_logs')
      .select('*')
      .eq('organization_id', organizationId)
    
    if (severity) {
      query = query.eq('severity', severity)
    }
    
    const { data, error } = await query.limit(limit)
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
    return []
  }
}

/**
 * Get activity statistics for an organization
 */
export async function getActivityStatistics(
  organizationId: string,
  days: number = 7
): Promise<any> {
  try {
    const supabase = await createClient()
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    // Get activity counts by type
    const { data: activityCounts } = await supabase
      .from('user_activities')
      .select('activity_type')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
    
    // Get unique active users
    const { data: activeUsers } = await supabase
      .from('user_activities')
      .select('user_id')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())
    
    // Group activities by type
    const activityByType = activityCounts?.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    // Get unique user count
    const uniqueUsers = new Set(activeUsers?.map(a => a.user_id) || []).size
    
    return {
      totalActivities: activityCounts?.length || 0,
      uniqueActiveUsers: uniqueUsers,
      activityByType,
      periodDays: days
    }
  } catch (error) {
    console.error('Failed to fetch activity statistics:', error)
    return {
      totalActivities: 0,
      uniqueActiveUsers: 0,
      activityByType: {},
      periodDays: days
    }
  }
}