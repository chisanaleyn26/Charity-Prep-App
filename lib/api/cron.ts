'use server'

import { createClient } from '@/lib/supabase/server'
import { 
  checkDBSExpiryNotifications, 
  checkOverseasNotifications 
} from './notifications'

/**
 * Daily cron job to check for notifications
 * This should be called by a cron service or scheduled function
 */
export async function runDailyChecks() {
  const supabase = await createClient()
  
  try {
    console.log('Starting daily notification checks...')
    
    // Get all active organizations
    const { data: organizations } = await supabase
      .from('organizations')
      .select('id')
      .is('deleted_at', null)
    
    if (!organizations) {
      console.log('No organizations found')
      return { success: true, processed: 0 }
    }
    
    let processed = 0
    
    // Process each organization
    for (const org of organizations) {
      try {
        // Check DBS expiry notifications
        await checkDBSExpiryNotifications(org.id)
        
        // Check overseas reporting notifications
        await checkOverseasNotifications(org.id)
        
        processed++
      } catch (error) {
        console.error(`Error processing organization ${org.id}:`, error)
      }
    }
    
    console.log(`Daily checks complete. Processed ${processed} organizations.`)
    return { success: true, processed }
    
  } catch (error) {
    console.error('Daily cron job error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Weekly summary email job
 * Generates and queues weekly summary emails for users
 */
export async function runWeeklySummary() {
  const supabase = await createClient()
  
  try {
    console.log('Starting weekly summary generation...')
    
    // Get all users with weekly summary enabled
    const { data: preferences } = await supabase
      .from('notification_preferences')
      .select(`
        *,
        user:users(*),
        organization:organizations(*)
      `)
      .eq('weekly_summary', true)
    
    if (!preferences || preferences.length === 0) {
      console.log('No users have weekly summary enabled')
      return { success: true, processed: 0 }
    }
    
    let processed = 0
    
    for (const pref of preferences) {
      try {
        // Get compliance scores for the organization
        const summary = await generateWeeklySummary(pref.organization_id, pref.user_id)
        
        if (summary) {
          // Create notification with summary
          await supabase
            .from('notifications')
            .insert({
              organization_id: pref.organization_id,
              user_id: pref.user_id,
              type: 'weekly_summary',
              title: 'Your Weekly Compliance Summary',
              message: summary,
              severity: 'info',
              link: '/dashboard'
            })
          
          processed++
        }
      } catch (error) {
        console.error(`Error generating summary for user ${pref.user_id}:`, error)
      }
    }
    
    console.log(`Weekly summaries complete. Processed ${processed} users.`)
    return { success: true, processed }
    
  } catch (error) {
    console.error('Weekly summary job error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Generate weekly summary for a user
 */
async function generateWeeklySummary(organizationId: string, userId: string): Promise<string | null> {
  const supabase = await createClient()
  
  // Get data from the past week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const weekAgoStr = weekAgo.toISOString()
  
  // Get recent activities count
  const [
    { count: safeguardingCount },
    { count: overseasCount },
    { count: incomeCount }
  ] = await Promise.all([
    supabase
      .from('safeguarding_records')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', weekAgoStr),
    supabase
      .from('overseas_activities')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', weekAgoStr),
    supabase
      .from('income_records')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', weekAgoStr)
  ])
  
  // Get compliance alerts
  const { data: dbsExpiring } = await supabase
    .from('safeguarding_records')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .lte('expiry_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString())
    .gte('expiry_date', new Date().toISOString())
  
  const totalActivities = (safeguardingCount || 0) + (overseasCount || 0) + (incomeCount || 0)
  
  if (totalActivities === 0 && !dbsExpiring) {
    return null // No summary needed
  }
  
  let summary = `This week's activity:\n`
  
  if (safeguardingCount) {
    summary += `• ${safeguardingCount} new safeguarding records\n`
  }
  if (overseasCount) {
    summary += `• ${overseasCount} new overseas activities\n`
  }
  if (incomeCount) {
    summary += `• ${incomeCount} new income records\n`
  }
  
  if (dbsExpiring) {
    summary += `\n⚠️ ${dbsExpiring} DBS checks expiring in the next 30 days`
  }
  
  return summary
}

/**
 * Clean up old notifications (older than 90 days)
 */
export async function cleanupOldNotifications() {
  const supabase = await createClient()
  
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 90)
    
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', cutoffDate.toISOString())
      .not('read_at', 'is', null) // Only delete read notifications
    
    if (error) {
      console.error('Cleanup error:', error)
      return { success: false, error: error.message }
    }
    
    console.log(`Cleaned up ${data?.length || 0} old notifications`)
    return { success: true, deleted: data?.length || 0 }
    
  } catch (error) {
    console.error('Cleanup job error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}