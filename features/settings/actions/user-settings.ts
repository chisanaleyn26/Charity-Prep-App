'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Profile update schema
const profileUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone: z.string().optional(),
  job_title: z.string().optional(),
  department: z.string().optional(),
  bio: z.string().max(500).optional(),
  expertise_areas: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  years_in_charity_sector: z.number().min(0).max(50).optional()
})

// Preferences update schema
const preferencesUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z.string().optional(),
  timezone: z.string().optional(),
  date_format: z.string().optional(),
  currency: z.string().optional(),
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  weekly_digest: z.boolean().optional(),
  marketing_emails: z.boolean().optional(),
  product_updates: z.boolean().optional(),
  ai_suggestions_enabled: z.boolean().optional(),
  show_compliance_score: z.boolean().optional(),
  dashboard_layout: z.enum(['standard', 'compact', 'detailed']).optional()
})

// Notification channels schema
const notificationChannelsSchema = z.object({
  email: z.object({
    address: z.string().email(),
    enabled: z.boolean(),
    verified: z.boolean()
  }),
  sms: z.object({
    number: z.string().nullable(),
    enabled: z.boolean(),
    verified: z.boolean()
  }),
  slack: z.object({
    channel: z.string().nullable(),
    enabled: z.boolean(),
    webhook_url: z.string().nullable()
  }),
  teams: z.object({
    channel: z.string().nullable(),
    enabled: z.boolean(),
    webhook_url: z.string().nullable()
  }),
  whatsapp: z.object({
    number: z.string().nullable(),
    enabled: z.boolean(),
    verified: z.boolean()
  })
})

export async function updateUserProfile(data: z.infer<typeof profileUpdateSchema>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated',
        data: null
      }
    }

    // Validate input
    const validated = profileUpdateSchema.parse(data)
    
    // Update user profile
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...validated,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { 
        success: false, 
        error: updateError.message,
        data: null
      }
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile')

    return { 
      success: true, 
      error: null,
      data: updatedUser
    }
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        data: null
      }
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update profile',
      data: null
    }
  }
}

export async function updateUserPreferences(data: z.infer<typeof preferencesUpdateSchema>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated',
        data: null
      }
    }

    // Validate input
    const validated = preferencesUpdateSchema.parse(data)
    
    // Build preferences object
    const preferences: Record<string, any> = {}
    
    // Map preferences to database columns
    if (validated.theme !== undefined) preferences.theme = validated.theme
    if (validated.language !== undefined) preferences.language = validated.language
    if (validated.timezone !== undefined) preferences.timezone = validated.timezone
    if (validated.date_format !== undefined) preferences.date_format = validated.date_format
    if (validated.currency !== undefined) preferences.currency_format = validated.currency
    if (validated.dashboard_layout !== undefined) preferences.dashboard_layout = validated.dashboard_layout
    
    // Update notification preferences
    if (validated.email_notifications !== undefined) preferences.email_notifications = validated.email_notifications
    if (validated.sms_notifications !== undefined) preferences.urgent_notifications_sms = validated.sms_notifications
    if (validated.weekly_digest !== undefined) preferences.report_frequency = validated.weekly_digest ? 'weekly' : 'never'
    if (validated.marketing_emails !== undefined) preferences.marketing_opt_in = validated.marketing_emails
    if (validated.product_updates !== undefined) preferences.analytics_opt_in = validated.product_updates

    // Update the user preferences
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Preferences update error:', updateError)
      return { 
        success: false, 
        error: updateError.message,
        data: null
      }
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile')

    return { 
      success: true, 
      error: null,
      data: updatedUser
    }
  } catch (error) {
    console.error('Preferences update error:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        data: null
      }
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update preferences',
      data: null
    }
  }
}

export async function updateNotificationChannels(organizationId: string, channels: z.infer<typeof notificationChannelsSchema>) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated',
        data: null
      }
    }

    // Validate input
    const validated = notificationChannelsSchema.parse(channels)
    
    // Update notification channels in the database
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({
        notification_channels: validated,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Notification channels update error:', updateError)
      return { 
        success: false, 
        error: updateError.message,
        data: null
      }
    }

    // Revalidate the settings page
    revalidatePath('/settings/profile')

    return { 
      success: true, 
      error: null,
      data: updatedUser
    }
  } catch (error) {
    console.error('Notification channels update error:', error)
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        data: null
      }
    }
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update notification channels',
      data: null
    }
  }
}

export async function getUserSettings() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        success: false, 
        error: 'Not authenticated',
        data: null
      }
    }

    // Get user settings
    const { data: userSettings, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user settings:', error)
      return { 
        success: false, 
        error: error.message,
        data: null
      }
    }

    // Transform database fields to frontend format
    const transformedSettings = {
      ...userSettings,
      preferences: {
        theme: userSettings.theme || 'light',
        language: userSettings.language || 'en',
        timezone: userSettings.timezone || 'Europe/London',
        date_format: userSettings.date_format || 'DD/MM/YYYY',
        currency: userSettings.currency_format || 'GBP',
        email_notifications: userSettings.email_notifications ?? true,
        sms_notifications: userSettings.urgent_notifications_sms ?? false,
        weekly_digest: userSettings.report_frequency === 'weekly',
        marketing_emails: userSettings.marketing_opt_in ?? false,
        product_updates: userSettings.analytics_opt_in ?? true,
        ai_suggestions_enabled: true, // Default, not in current schema
        show_compliance_score: true, // Default, not in current schema
        dashboard_layout: userSettings.dashboard_layout || 'standard'
      },
      notification_channels: userSettings.notification_channels || {
        email: { address: userSettings.email, enabled: true, verified: true },
        sms: { number: null, enabled: false, verified: false },
        slack: { channel: null, enabled: false, webhook_url: null },
        teams: { channel: null, enabled: false, webhook_url: null },
        whatsapp: { number: null, enabled: false, verified: false }
      }
    }

    return { 
      success: true, 
      error: null,
      data: transformedSettings
    }
  } catch (error) {
    console.error('Error fetching user settings:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch user settings',
      data: null
    }
  }
}

export async function updateComplianceNotifications(notifications: any) {
  // TODO: Implement compliance notifications update
  // This would update notification preferences specific to compliance modules
  return { 
    success: true, 
    error: null,
    data: notifications
  }
}