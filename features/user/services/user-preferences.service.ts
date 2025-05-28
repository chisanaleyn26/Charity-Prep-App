import { createClient } from '@/lib/supabase/client'
import type { UpdateUserPreferences, UserProfile } from '@/lib/types/user.types'

export class UserPreferencesService {
  /**
   * Update user preferences (theme, notifications, etc.)
   */
  static async updatePreferences(
    userId: string, 
    preferences: UpdateUserPreferences
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // Call the update preferences function
      const { data, error } = await supabase
        .rpc('update_user_preferences', {
          p_user_id: userId,
          p_preferences: preferences
        })
      
      if (error) {
        console.error('Error updating preferences:', error)
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update notification preferences
   */
  static async updateNotificationPreferences(
    userId: string,
    channel: 'email' | 'sms' | 'in_app',
    preferences: Record<string, boolean>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // Get current notification channels
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('notification_channels')
        .eq('id', userId)
        .single()
      
      if (fetchError) {
        return { success: false, error: fetchError.message }
      }
      
      // Merge preferences
      const updatedChannels = {
        ...user.notification_channels,
        [channel]: {
          ...user.notification_channels[channel],
          ...preferences
        }
      }
      
      // Update
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          notification_channels: updatedChannels,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update help preferences
   */
  static async updateHelpPreferences(
    userId: string,
    preferences: Partial<UserProfile['help_preferences']>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // Get current help preferences
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('help_preferences')
        .eq('id', userId)
        .single()
      
      if (fetchError) {
        return { success: false, error: fetchError.message }
      }
      
      // Merge preferences
      const updatedPreferences = {
        ...user.help_preferences,
        ...preferences
      }
      
      // Update
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          help_preferences: updatedPreferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update help preferences:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Mark feature tour as completed
   */
  static async completeFeatureTour(
    userId: string,
    tourId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      // Get current tours
      const { data: user, error: fetchError } = await supabase
        .from('users')
        .select('feature_tours_completed')
        .eq('id', userId)
        .single()
      
      if (fetchError) {
        return { success: false, error: fetchError.message }
      }
      
      // Add tour if not already completed
      const tours = user.feature_tours_completed || []
      if (!tours.includes(tourId)) {
        tours.push(tourId)
        
        // Update
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            feature_tours_completed: tours,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
        
        if (updateError) {
          return { success: false, error: updateError.message }
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to complete feature tour:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Update onboarding progress
   */
  static async updateOnboardingProgress(
    userId: string,
    step: number,
    completed: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('users')
        .update({ 
          onboarding_step: step,
          onboarding_completed: completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
      
      if (error) {
        return { success: false, error: error.message }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update onboarding progress:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  /**
   * Get user's preferred date format
   */
  static formatDate(date: Date | string, format: string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    
    switch (format) {
      case 'DD/MM/YYYY':
        return d.toLocaleDateString('en-GB')
      case 'MM/DD/YYYY':
        return d.toLocaleDateString('en-US')
      case 'YYYY-MM-DD':
        return d.toISOString().split('T')[0]
      default:
        return d.toLocaleDateString()
    }
  }

  /**
   * Get user's preferred currency format
   */
  static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }
}