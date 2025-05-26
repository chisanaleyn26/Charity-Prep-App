import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIStore {
  // Sidebar state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Modal state
  activeModal: string | null
  openModal: (modalId: string) => void
  closeModal: () => void

  // Theme state
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void

  // Global loading state
  isLoading: boolean
  setLoading: (loading: boolean) => void

  // Toast/notification state
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    description?: string
  }>
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Modal
      activeModal: null,
      openModal: (modalId) => set({ activeModal: modalId }),
      closeModal: () => set({ activeModal: null }),

      // Theme
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // Loading
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Date.now().toString(),
            },
          ],
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)