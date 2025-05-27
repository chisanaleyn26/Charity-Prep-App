'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { COMPLIANCE_THRESHOLDS } from '@/lib/constants'
import { daysUntil } from './helpers'

// Notification schemas
const createNotificationSchema = z.object({
  type: z.string(),
  title: z.string().min(1).max(255),
  message: z.string(),
  link: z.string().optional(),
  severity: z.enum(['info', 'warning', 'error', 'success']).default('info'),
  userId: z.string().uuid().optional(),
  scheduledFor: z.string().datetime().optional(),
})

const updatePreferencesSchema = z.object({
  dbs_expiry_reminder: z.boolean().optional(),
  dbs_expiry_days: z.number().min(1).max(90).optional(),
  overseas_reporting_reminder: z.boolean().optional(),
  income_documentation_reminder: z.boolean().optional(),
  weekly_summary: z.boolean().optional(),
})

export type CreateNotification = z.infer<typeof createNotificationSchema>
export type UpdatePreferences = z.infer<typeof updatePreferencesSchema>

/**
 * Get notifications for the current user
 */
export async function getNotifications(
  organizationId: string,
  filters?: {
    unreadOnly?: boolean
    page?: number
    pageSize?: number
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  let query = supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${organizationId})`)
    .is('dismissed_at', null)

  if (filters?.unreadOnly) {
    query = query.is('read_at', null)
  }

  // Apply pagination
  const page = filters?.page || 1
  const pageSize = filters?.pageSize || 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  query = query
    .order('created_at', { ascending: false })
    .range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { error: error.message }
  }

  return {
    data,
    pagination: {
      page,
      pageSize,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / pageSize),
    },
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${organizationId})`)
    .is('read_at', null)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Dismiss a notification
 */
export async function dismissNotification(notificationId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('notifications')
    .update({ dismissed_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}

/**
 * Get notification preferences
 */
export async function getNotificationPreferences(organizationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .eq('organization_id', organizationId)
    .single()

  if (error && error.code !== 'PGRST116') { // Not found is ok
    return { error: error.message }
  }

  // Return defaults if no preferences exist
  if (!data) {
    return {
      data: {
        dbs_expiry_reminder: true,
        dbs_expiry_days: 30,
        overseas_reporting_reminder: true,
        income_documentation_reminder: true,
        weekly_summary: true,
      }
    }
  }

  return { data }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  organizationId: string,
  preferences: UpdatePreferences
) {
  const validatedFields = updatePreferencesSchema.safeParse(preferences)

  if (!validatedFields.success) {
    return { error: 'Invalid preferences data' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data, error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: user.id,
      organization_id: organizationId,
      ...validatedFields.data,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  return { data }
}

/**
 * Create a notification (internal use)
 */
async function createNotification(
  organizationId: string,
  notification: CreateNotification
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('notifications')
    .insert({
      organization_id: organizationId,
      ...notification,
      user_id: notification.userId,
      scheduled_for: notification.scheduledFor,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create notification:', error)
    return { error: error.message }
  }

  return { data }
}

/**
 * Check and create DBS expiry notifications
 */
export async function checkDBSExpiryNotifications(organizationId: string) {
  const supabase = await createClient()

  // Get all active safeguarding records
  const { data: records } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .is('deleted_at', null)

  if (!records) return

  // Get notification preferences for all users in org
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('*, user:users(*)')
    .eq('organization_id', organizationId)
    .eq('dbs_expiry_reminder', true)

  const defaultDays = COMPLIANCE_THRESHOLDS.dbs.expiryWarningDays

  for (const record of records) {
    const daysToExpiry = daysUntil(record.expiry_date)

    // Check if notification needed based on preferences
    for (const pref of preferences || []) {
      const notifyDays = pref.dbs_expiry_days || defaultDays

      if (daysToExpiry <= notifyDays && daysToExpiry > 0) {
        // Check if notification already exists
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('user_id', pref.user_id)
          .eq('type', 'dbs_expiry')
          .eq('link', `/compliance/safeguarding/${record.id}`)
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        if (!existing || existing.length === 0) {
          await createNotification(organizationId, {
            type: 'dbs_expiry',
            title: 'DBS Check Expiring Soon',
            message: `${record.person_name}'s DBS check expires in ${daysToExpiry} days`,
            link: `/compliance/safeguarding/${record.id}`,
            severity: daysToExpiry <= 7 ? 'error' : 'warning',
            userId: pref.user_id,
          })
        }
      }

      // Expired notification
      if (daysToExpiry < 0) {
        const { data: existing } = await supabase
          .from('notifications')
          .select('id')
          .eq('organization_id', organizationId)
          .eq('user_id', pref.user_id)
          .eq('type', 'dbs_expired')
          .eq('link', `/compliance/safeguarding/${record.id}`)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

        if (!existing || existing.length === 0) {
          await createNotification(organizationId, {
            type: 'dbs_expired',
            title: 'DBS Check Expired',
            message: `${record.person_name}'s DBS check has expired`,
            link: `/compliance/safeguarding/${record.id}`,
            severity: 'error',
            userId: pref.user_id,
          })
        }
      }
    }
  }
}

/**
 * Check and create overseas reporting notifications
 */
export async function checkOverseasNotifications(organizationId: string) {
  const supabase = await createClient()

  // Get high-risk unreported activities
  const { data: activities } = await supabase
    .from('overseas_activities')
    .select('*, country:countries(*)')
    .eq('organization_id', organizationId)
    .eq('reported_to_commission', false)
    .is('deleted_at', null)

  const highRiskActivities = activities?.filter(a => a.country?.is_high_risk) || []

  if (highRiskActivities.length === 0) return

  // Get users with overseas notifications enabled
  const { data: preferences } = await supabase
    .from('notification_preferences')
    .select('user_id')
    .eq('organization_id', organizationId)
    .eq('overseas_reporting_reminder', true)

  for (const pref of preferences || []) {
    // Check if notification already sent this week
    const { data: existing } = await supabase
      .from('notifications')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('user_id', pref.user_id)
      .eq('type', 'overseas_reporting')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (!existing || existing.length === 0) {
      await createNotification(organizationId, {
        type: 'overseas_reporting',
        title: 'High-Risk Activities Need Reporting',
        message: `${highRiskActivities.length} overseas activities in high-risk countries need to be reported to the Commission`,
        link: '/compliance/overseas',
        severity: 'warning',
        userId: pref.user_id,
      })
    }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(organizationId: string): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return 0
  }

  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .or(`user_id.eq.${user.id},and(user_id.is.null,organization_id.eq.${organizationId})`)
    .is('read_at', null)
    .is('dismissed_at', null)

  return count || 0
}