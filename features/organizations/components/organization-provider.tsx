'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import type { Organization, OrganizationMember } from '@/lib/types/app.types'

interface OrganizationContextType {
  organization: Organization | null
  currentOrganization: Organization | null // For backward compatibility
  isLoading: boolean
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
  const { currentOrganization, setCurrentOrganization } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  
  // Set initial organization if provided and not already set
  useEffect(() => {
    if (initialOrganization && !currentOrganization) {
      setCurrentOrganization(initialOrganization)
    }
  }, [initialOrganization, currentOrganization, setCurrentOrganization])

  const value: OrganizationContextType = {
    organization: currentOrganization,
    currentOrganization, // For backward compatibility
    isLoading,
  }

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}