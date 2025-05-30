import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization } from '@/lib/types/app.types'

interface AuthStore {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Single organization state
  currentOrganization: Organization | null
  setCurrentOrganization: (organization: Organization | null) => void

  // Legacy compatibility
  organization: Organization | null
  setOrganization: (organization: Organization | null) => void

  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Session state
  isAuthenticated: boolean
  sessionExpiry: Date | null
  
  // Actions
  login: (user: User, organization: Organization | null) => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      currentOrganization: null,
      organization: null, // Legacy compatibility
      isLoading: false,
      isAuthenticated: false,
      sessionExpiry: null,

      // Basic setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCurrentOrganization: (currentOrganization) => 
        set({ currentOrganization, organization: currentOrganization }), // Keep legacy in sync
      setOrganization: (organization) => 
        set({ organization, currentOrganization: organization }), // Legacy compatibility
      setLoading: (loading) => set({ isLoading: loading }),

      // Simplified login
      login: (user, organization) => {
        set({
          user,
          currentOrganization: organization,
          organization, // Legacy compatibility
          isAuthenticated: true,
          sessionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
      },

      logout: () =>
        set({
          user: null,
          currentOrganization: null,
          organization: null,
          isAuthenticated: false,
          sessionExpiry: null,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        currentOrganization: state.currentOrganization,
        organization: state.organization, // Legacy compatibility
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
)