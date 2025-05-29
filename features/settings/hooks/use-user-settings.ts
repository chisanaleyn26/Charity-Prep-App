'use client'

import { useState, useEffect, useCallback } from 'react'
import { getUserSettings } from '../actions/user-settings'

export interface UserSettings {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  job_title: string | null
  department: string | null
  bio: string | null
  expertise_areas: string[] | null
  certifications: string[] | null
  linkedin_url: string | null
  years_in_charity_sector: number | null
  avatar_url: string | null
  created_at: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
    date_format: string
    currency: string
    email_notifications: boolean
    sms_notifications: boolean
    weekly_digest: boolean
    marketing_emails: boolean
    product_updates: boolean
    ai_suggestions_enabled: boolean
    show_compliance_score: boolean
    dashboard_layout: 'standard' | 'compact' | 'detailed'
  }
  notification_channels: {
    email: { address: string; enabled: boolean; verified: boolean }
    sms: { number: string | null; enabled: boolean; verified: boolean }
    slack: { channel: string | null; enabled: boolean; webhook_url: string | null }
    teams: { channel: string | null; enabled: boolean; webhook_url: string | null }
    whatsapp: { number: string | null; enabled: boolean; verified: boolean }
  }
}

export function useUserSettings() {
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getUserSettings()
      
      if (result.success && result.data) {
        setUserSettings(result.data as UserSettings)
      } else {
        setError(result.error || 'Failed to load user settings')
      }
    } catch (err) {
      console.error('Error fetching user settings:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserSettings()
  }, [fetchUserSettings])

  return {
    userSettings,
    isLoading,
    error,
    refreshData: fetchUserSettings,
    complianceNotifications: [] // Placeholder for now
  }
}