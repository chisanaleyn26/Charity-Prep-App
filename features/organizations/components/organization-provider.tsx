'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { initializeUserContext, subscribeToOrganizationChanges } from '../services/org-service'
import type { Organization, OrganizationMember } from '@/lib/types/app.types'

interface OrganizationContextType {
  organizations: OrganizationMember[]
  currentOrganization: Organization | null
  isLoading: boolean
  switchOrganization: (organizationId: string) => Promise<boolean>
  refreshOrganizations: () => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: React.ReactNode
  initialOrganization?: Organization
}

export function OrganizationProvider({ children, initialOrganization }: OrganizationProviderProps) {
  const { 
    user, 
    organizations, 
    currentOrganization, 
    setOrganizations, 
    setCurrentOrganization, 
    switchOrganization: storeSwitchOrganization,
    isAuthenticated 
  } = useAuthStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Set initial organization immediately if provided
  useEffect(() => {
    if (initialOrganization && !currentOrganization && !initialized) {
      setCurrentOrganization(initialOrganization)
      setInitialized(true)
    }
  }, [initialOrganization, currentOrganization, initialized, setCurrentOrganization])

  // Initialize organizations when user changes
  useEffect(() => {
    async function initializeOrganizations() {
      if (!user || !isAuthenticated) {
        setOrganizations([])
        if (!initialOrganization) {
          setCurrentOrganization(null)
        }
        return
      }

      if (organizations.length === 0) {
        setIsLoading(true)
        try {
          const { organizations: userOrgs, defaultOrganization } = await initializeUserContext(user)
          setOrganizations(userOrgs)
          // Only set default organization if we don't have an initial one
          if (defaultOrganization && !currentOrganization && !initialOrganization) {
            setCurrentOrganization(defaultOrganization)
          }
        } catch (error) {
          console.error('Failed to initialize organizations:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    initializeOrganizations()
  }, [user, isAuthenticated, organizations.length, currentOrganization, initialOrganization, setOrganizations, setCurrentOrganization])

  // Subscribe to real-time updates for current organization
  useEffect(() => {
    if (!currentOrganization) return

    const subscription = subscribeToOrganizationChanges(
      currentOrganization.id,
      (payload) => {
        console.log('Organization change detected:', payload)
        // Refresh organizations when changes are detected
        refreshOrganizations()
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [currentOrganization])

  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const success = await storeSwitchOrganization(organizationId)
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const refreshOrganizations = async (): Promise<void> => {
    if (!user) return

    setIsLoading(true)
    try {
      const { organizations: updatedOrgs } = await initializeUserContext(user)
      setOrganizations(updatedOrgs)
    } catch (error) {
      console.error('Failed to refresh organizations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const value: OrganizationContextType = {
    organizations,
    currentOrganization,
    isLoading,
    switchOrganization,
    refreshOrganizations,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}