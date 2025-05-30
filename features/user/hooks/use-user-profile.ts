'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile as BaseUserProfile, UpdateUserProfile, UpdateUserPreferences } from '@/lib/types/user.types'

export interface UserProfile extends BaseUserProfile {
  profile_completed: boolean
  profile_completion_percentage: number
  missing_fields: string[]
}

export interface ProfileCompletionStatus {
  isComplete: boolean
  percentage: number
  missingFields: string[]
  criticalMissing: boolean // Missing name or other critical info
}

interface UseUserProfileReturn {
  profile: UserProfile | null
  isLoading: boolean
  completionStatus: ProfileCompletionStatus
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>
  refreshProfile: () => Promise<void>
  checkProfileCompletion: () => ProfileCompletionStatus
}

// Required fields for a complete profile
const REQUIRED_FIELDS = ['full_name', 'email'] as const
const RECOMMENDED_FIELDS = ['job_title', 'phone'] as const
const CRITICAL_FIELDS = ['full_name'] as const

export function useUserProfile(): UseUserProfileReturn {
  const { user } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Calculate profile completion status
  const checkProfileCompletion = (userProfile?: UserProfile | null): ProfileCompletionStatus => {
    const currentProfile = userProfile || profile
    if (!currentProfile) {
      return {
        isComplete: false,
        percentage: 0,
        missingFields: [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS],
        criticalMissing: true
      }
    }

    const allFields = [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS]
    const missingFields: string[] = []

    // Check required fields
    REQUIRED_FIELDS.forEach(field => {
      if (!currentProfile[field] || currentProfile[field]?.trim() === '') {
        missingFields.push(field)
      }
    })

    // Check recommended fields
    RECOMMENDED_FIELDS.forEach(field => {
      if (!currentProfile[field] || currentProfile[field]?.trim() === '') {
        missingFields.push(field)
      }
    })

    const completedFields = allFields.length - missingFields.length
    const percentage = Math.round((completedFields / allFields.length) * 100)
    
    // Critical missing if any critical fields are missing
    const criticalMissing = CRITICAL_FIELDS.some(field => 
      !currentProfile[field] || currentProfile[field]?.trim() === ''
    )

    return {
      isComplete: missingFields.length === 0,
      percentage,
      missingFields,
      criticalMissing
    }
  }

  // Load user profile data
  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const supabase = createClient()
        
        // Get the auth user first to ensure we have the correct ID and email
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          console.error('No authenticated user in loadProfile')
          setProfile(null)
          setIsLoading(false)
          return
        }
        
        // Get user profile from users table
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single()

        if (error) {
          console.error('Error loading user profile - Full JSON:', JSON.stringify(error, null, 2))
          console.error('Error details:', {
            message: error?.message,
            code: error?.code,
            details: error?.details,
            hint: error?.hint
          })
          // If user doesn't exist in users table, create basic profile from auth user
          const basicProfile: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            created_at: authUser.created_at || new Date().toISOString(),
            profile_completed: false,
            profile_completion_percentage: 0,
            missing_fields: [...REQUIRED_FIELDS, ...RECOMMENDED_FIELDS]
          }
          const completion = checkProfileCompletion(basicProfile)
          basicProfile.profile_completed = completion.isComplete
          basicProfile.profile_completion_percentage = completion.percentage
          basicProfile.missing_fields = completion.missingFields
          
          setProfile(basicProfile)
        } else {
          // Calculate completion status
          const profileWithCompletion: UserProfile = {
            ...userProfile,
            profile_completed: false,
            profile_completion_percentage: 0,
            missing_fields: []
          }
          
          const completion = checkProfileCompletion(profileWithCompletion)
          profileWithCompletion.profile_completed = completion.isComplete
          profileWithCompletion.profile_completion_percentage = completion.percentage
          profileWithCompletion.missing_fields = completion.missingFields
          
          setProfile(profileWithCompletion)
        }
      } catch (error) {
        console.error('Failed to load user profile:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  // Update profile function
  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false // Allow updating even if profile doesn't exist yet

    try {
      const supabase = createClient()
      
      // Get the auth user to ensure we have the email
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        console.error('No authenticated user found')
        return false
      }
      
      console.log('Debug - Auth user email:', authUser.email)
      console.log('Debug - Profile email:', profile?.email)
      console.log('Debug - User email:', user.email)
      
      // Remove completion fields from updates (calculated dynamically)
      const { profile_completed, profile_completion_percentage, missing_fields, ...profileUpdates } = updates
      
      const upsertData = {
        id: authUser.id, // Use auth user ID to ensure consistency
        email: authUser.email || '', // Auth user should always have email
        ...profileUpdates,
        updated_at: new Date().toISOString(),
        created_at: profile?.created_at || new Date().toISOString() // Include created_at for new records
      }
      
      console.log('Debug - Upsert data:', JSON.stringify(upsertData, null, 2))
      
      const { error } = await supabase
        .from('users')
        .upsert(upsertData, {
          onConflict: 'id'
        })

      if (error) {
        console.error('Error updating profile:', JSON.stringify(error, null, 2))
        // Throw the error so it can be caught in the component
        throw error
      }

      // Update local state with new completion status
      const updatedProfile = { 
        ...profile, 
        ...profileUpdates,
        id: authUser.id,
        email: authUser.email || ''
      }
      const completion = checkProfileCompletion(updatedProfile)
      
      const finalProfile: UserProfile = {
        ...updatedProfile,
        profile_completed: completion.isComplete,
        profile_completion_percentage: completion.percentage,
        missing_fields: completion.missingFields
      }
      
      setProfile(finalProfile)
      return true
    } catch (error) {
      console.error('Failed to update profile:', error)
      return false
    }
  }

  // Refresh profile from server
  const refreshProfile = async (): Promise<void> => {
    if (!user) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userProfile) {
        const completion = checkProfileCompletion(userProfile)
        const profileWithCompletion: UserProfile = {
          ...userProfile,
          profile_completed: completion.isComplete,
          profile_completion_percentage: completion.percentage,
          missing_fields: completion.missingFields
        }
        setProfile(profileWithCompletion)
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completionStatus = checkProfileCompletion(profile)

  return {
    profile,
    isLoading,
    completionStatus,
    updateProfile,
    refreshProfile,
    checkProfileCompletion: () => completionStatus
  }
}