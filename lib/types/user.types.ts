// User profile types with enhanced details and preferences

export interface UserProfile {
  // Basic info (existing)
  id: string
  email: string
  full_name?: string | null
  phone?: string | null
  avatar_url?: string | null
  
  // Professional details (new)
  job_title?: string | null
  department?: string | null
  bio?: string | null
  linkedin_url?: string | null
  
  // Compliance preferences (new)
  compliance_reminder_days: number
  preferred_reminder_time: string // "HH:MM:SS"
  dashboard_layout: 'grid' | 'list' | 'compact' | 'detailed'
  compliance_areas_focus: string[] // ['safeguarding', 'overseas', 'fundraising']
  
  // UI/UX preferences (new)
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'cy' | 'gd' // English, Welsh, Scottish Gaelic
  timezone: string
  date_format: string
  currency_format: string
  
  // Notification preferences
  email_notifications: boolean
  sms_notifications: boolean
  weekly_digest: boolean
  urgent_notifications_sms: boolean
  report_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'never'
  notification_channels: NotificationChannels
  
  // Onboarding & help (new)
  onboarding_completed: boolean
  onboarding_step: number
  feature_tours_completed: string[]
  help_preferences: HelpPreferences
  
  // Data privacy (new)
  data_retention_preference: string
  analytics_opt_in: boolean
  marketing_opt_in: boolean
  
  // Account status
  is_active: boolean
  deactivated_at?: string | null
  deactivation_reason?: string | null
  
  // API access (new)
  api_key_hash?: string | null
  api_key_created_at?: string | null
  api_rate_limit: number
  
  // Metadata
  last_login_at?: string | null
  created_at: string
  updated_at: string
}

export interface NotificationChannels {
  email: {
    compliance_alerts: boolean
    deadline_reminders: boolean
    weekly_summary: boolean
    product_updates: boolean
    tips_and_tricks: boolean
  }
  sms: {
    urgent_compliance: boolean
    expiry_final_warning: boolean
  }
  in_app: {
    all: boolean
  }
}

export interface HelpPreferences {
  show_tooltips: boolean
  show_guided_tours: boolean
  show_keyboard_shortcuts: boolean
  accessibility_mode: boolean
}

export interface UserProfileCompleteness {
  id: string
  email: string
  completion_percentage: number
  missing_fields: string[]
}

// Update preferences payload
export interface UpdateUserPreferences {
  theme?: UserProfile['theme']
  language?: UserProfile['language']
  timezone?: string
  date_format?: string
  currency_format?: string
  dashboard_layout?: UserProfile['dashboard_layout']
  compliance_reminder_days?: number
  notification_channels?: Partial<NotificationChannels>
  help_preferences?: Partial<HelpPreferences>
}

// Profile update payload
export interface UpdateUserProfile {
  full_name?: string
  phone?: string
  job_title?: string
  department?: string
  bio?: string
  linkedin_url?: string
  avatar_url?: string
}

// Organization membership with user details
export interface OrganizationMember {
  user_id: string
  organization_id: string
  role: 'admin' | 'member' | 'viewer'
  user: Pick<UserProfile, 'email' | 'full_name' | 'job_title' | 'department' | 'avatar_url'>
  invited_by?: string
  invited_at?: string
  accepted_at?: string
  created_at: string
  updated_at: string
}