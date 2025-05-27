import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization, OrganizationMember, UserRole } from '@/lib/types/app.types'

interface AuthStore {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Multi-organization state
  organizations: OrganizationMember[]
  currentOrganization: Organization | null
  setOrganizations: (organizations: OrganizationMember[]) => void
  setCurrentOrganization: (organization: Organization | null) => void

  // Legacy single-org state (deprecated, keeping for compatibility)
  organization: Organization | null
  setOrganization: (organization: Organization | null) => void

  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Session state
  isAuthenticated: boolean
  sessionExpiry: Date | null
  
  // Actions
  login: (user: User, organizations: OrganizationMember[], initialOrg?: Organization) => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  switchOrganization: (organizationId: string) => Promise<boolean>
  
  // Multi-org utilities
  getCurrentUserRole: () => UserRole | null
  canAccessOrganization: (organizationId: string) => boolean
  isAdmin: () => boolean
  isAdvisor: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      organizations: [],
      currentOrganization: null,
      organization: null, // Legacy compatibility
      isLoading: false,
      isAuthenticated: false,
      sessionExpiry: null,

      // Basic setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setOrganizations: (organizations) => set({ organizations }),
      setCurrentOrganization: (currentOrganization) => 
        set({ currentOrganization, organization: currentOrganization }), // Keep legacy in sync
      setOrganization: (organization) => 
        set({ organization, currentOrganization: organization }), // Legacy compatibility
      setLoading: (loading) => set({ isLoading: loading }),

      // Enhanced login for multi-org
      login: (user, organizations, initialOrg) => {
        const currentOrganization = initialOrg || (organizations[0] ? null : null) // Will be set by organization service
        set({
          user,
          organizations,
          currentOrganization,
          organization: currentOrganization, // Legacy compatibility
          isAuthenticated: true,
          sessionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
      },

      logout: () =>
        set({
          user: null,
          organizations: [],
          currentOrganization: null,
          organization: null,
          isAuthenticated: false,
          sessionExpiry: null,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      // Enhanced organization switching
      switchOrganization: async (organizationId: string) => {
        const state = get()
        const orgMember = state.organizations.find(org => org.organization_id === organizationId)
        
        if (!orgMember) {
          return false
        }

        try {
          // Fetch full organization data
          const { getOrganization } = await import('@/features/organizations/services/org-service')
          const organization = await getOrganization(organizationId)
          
          if (organization) {
            set({ 
              currentOrganization: organization,
              organization: organization // Legacy compatibility
            })
            return true
          }
          return false
        } catch (error) {
          console.error('Failed to switch organization:', error)
          return false
        }
      },

      // Multi-org utilities
      getCurrentUserRole: () => {
        const state = get()
        if (!state.currentOrganization || !state.organizations) return null
        
        const currentMembership = state.organizations.find(
          org => org.organization_id === state.currentOrganization?.id
        )
        return currentMembership?.role || null
      },

      canAccessOrganization: (organizationId: string) => {
        const state = get()
        return state.organizations.some(org => org.organization_id === organizationId)
      },

      isAdmin: () => {
        const role = get().getCurrentUserRole()
        return role === 'admin'
      },

      isAdvisor: () => {
        const role = get().getCurrentUserRole()
        // In this system, we'll consider members with access to multiple orgs as advisors
        const state = get()
        return state.organizations.length > 1 || role === 'admin'
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        organizations: state.organizations,
        currentOrganization: state.currentOrganization,
        organization: state.organization, // Legacy compatibility
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
)