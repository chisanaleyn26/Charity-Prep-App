import { create } from 'zustand'

interface ComplianceUIStore {
  // View states
  activeView: 'grid' | 'list' | 'calendar'
  setActiveView: (view: 'grid' | 'list' | 'calendar') => void

  // Filter states
  filters: {
    status: string[]
    category: string[]
    dateRange: { start: Date | null; end: Date | null }
    search: string
  }
  setFilter: <K extends keyof ComplianceUIStore['filters']>(
    key: K,
    value: ComplianceUIStore['filters'][K]
  ) => void
  resetFilters: () => void

  // Sorting
  sortBy: 'date' | 'name' | 'status' | 'priority'
  sortOrder: 'asc' | 'desc'
  setSort: (sortBy: ComplianceUIStore['sortBy'], sortOrder: ComplianceUIStore['sortOrder']) => void

  // Expanded sections
  expandedSections: string[]
  toggleSection: (sectionId: string) => void
  expandAllSections: () => void
  collapseAllSections: () => void

  // Selected items (for bulk actions)
  selectedItems: string[]
  selectItem: (itemId: string) => void
  deselectItem: (itemId: string) => void
  selectAllItems: (itemIds: string[]) => void
  clearSelection: () => void

  // Modal states
  activeDetailId: string | null
  setActiveDetailId: (id: string | null) => void
}

const defaultFilters = {
  status: [],
  category: [],
  dateRange: { start: null, end: null },
  search: '',
}

export const useComplianceUIStore = create<ComplianceUIStore>((set) => ({
  // View states
  activeView: 'grid',
  setActiveView: (view) => set({ activeView: view }),

  // Filter states
  filters: defaultFilters,
  setFilter: (key, value) =>
    set((state) => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
    })),
  resetFilters: () => set({ filters: defaultFilters }),

  // Sorting
  sortBy: 'date',
  sortOrder: 'desc',
  setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder }),

  // Expanded sections
  expandedSections: [],
  toggleSection: (sectionId) =>
    set((state) => ({
      expandedSections: state.expandedSections.includes(sectionId)
        ? state.expandedSections.filter((id) => id !== sectionId)
        : [...state.expandedSections, sectionId],
    })),
  expandAllSections: () => set({ expandedSections: ['all'] }),
  collapseAllSections: () => set({ expandedSections: [] }),

  // Selected items
  selectedItems: [],
  selectItem: (itemId) =>
    set((state) => ({
      selectedItems: [...state.selectedItems, itemId],
    })),
  deselectItem: (itemId) =>
    set((state) => ({
      selectedItems: state.selectedItems.filter((id) => id !== itemId),
    })),
  selectAllItems: (itemIds) => set({ selectedItems: itemIds }),
  clearSelection: () => set({ selectedItems: [] }),

  // Modal states
  activeDetailId: null,
  setActiveDetailId: (id) => set({ activeDetailId: id }),
}))