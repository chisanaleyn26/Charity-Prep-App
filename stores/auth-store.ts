import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization } from '@/lib/types/app.types'

interface AuthStore {
  // User state
  user: User | null
  setUser: (user: User | null) => void

  // Organization state
  organization: Organization | null
  setOrganization: (organization: Organization | null) => void

  // Loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Session state
  isAuthenticated: boolean
  sessionExpiry: Date | null
  
  // Actions
  login: (user: User, organization: Organization) => void
  logout: () => void
  updateProfile: (updates: Partial<User>) => void
  switchOrganization: (organization: Organization) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      organization: null,
      isLoading: false,
      isAuthenticated: false,
      sessionExpiry: null,

      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setOrganization: (organization) => set({ organization }),
      setLoading: (loading) => set({ isLoading: loading }),

      login: (user, organization) =>
        set({
          user,
          organization,
          isAuthenticated: true,
          sessionExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }),

      logout: () =>
        set({
          user: null,
          organization: null,
          isAuthenticated: false,
          sessionExpiry: null,
        }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      switchOrganization: (organization) =>
        set({ organization }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        isAuthenticated: state.isAuthenticated,
        sessionExpiry: state.sessionExpiry,
      }),
    }
  )
)