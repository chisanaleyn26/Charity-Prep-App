# Charity Prep Frontend Architecture Reference

## Overview

This guide defines the frontend architecture for Charity Prep, leveraging Next.js 15.2's latest features with Zustand for state management. The architecture prioritizes Server Components, Server Actions, and minimal client-side state for optimal performance.

> **Updated**: January 2025 - Added Next.js 15 caching strategies, streaming patterns, and performance optimizations based on latest best practices.

## Core Principles

1. **Server-First**: Use Server Components by default, Client Components only when needed
2. **Feature-Based Structure**: Organize by business domain, not technical layers  
3. **Data on Server**: Fetch data in Server Components, use Zustand only for UI state
4. **Type Safety**: TypeScript + Zod for validation throughout
5. **Progressive Enhancement**: Works without JavaScript, enhanced with interactivity

## Project Structure

```
charity-prep/
├── app/                      # Next.js 15.2 App Router
├── features/                 # Feature modules (primary organization)
│   ├── auth/
│   ├── compliance/
│   ├── ai/
│   ├── documents/
│   └── reports/
├── components/              # Shared UI components
│   ├── ui/                  # Shadcn UI components
│   ├── layout/              # Layout components
│   └── common/              # Common components
├── stores/                  # Global Zustand stores (minimal)
├── lib/                     # Core utilities
├── types/                   # Global TypeScript types
└── hooks/                   # Global custom hooks
```

## 1. Zustand Store Setup (Client State Only)

### Important: Zustand is for UI State, Not Server Data

```typescript
// ❌ BAD: Storing server data in Zustand
const useStore = create((set) => ({
  users: [],        // Don't store server data
  posts: [],        // Fetch in Server Components instead
  fetchUsers: async () => { ... }  // Don't fetch in client
}))

// ✅ GOOD: UI state only
const useUIStore = create((set) => ({
  sidebarOpen: false,
  selectedTab: 'overview',
  modals: { createItem: false },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}))
```

### Basic UI Store Pattern

```typescript
// stores/ui-store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  // UI State only
  sidebarCollapsed: boolean
  activeModal: string | null
  selectedFilters: {
    status: string[]
    dateRange: [Date, Date] | null
  }
  
  // Actions
  toggleSidebar: () => void
  openModal: (modalId: string) => void
  closeModal: () => void
  setFilter: (key: string, value: any) => void
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set) => ({
      // Initial state
      sidebarCollapsed: false,
      activeModal: null,
      selectedFilters: {
        status: [],
        dateRange: null,
      },
      
      // Actions
      toggleSidebar: () => set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed
      }),
      
      openModal: (modalId) => set((state) => {
        state.activeModal = modalId
      }),
      
      closeModal: () => set((state) => {
        state.activeModal = null
      }),
      
      setFilter: (key, value) => set((state) => {
        state.selectedFilters[key] = value
      }),
    })),
    { name: 'charity-prep-ui' }
  )
)
```

### Feature-Based Store Pattern

```typescript
// features/compliance/stores/compliance-ui-store.ts
import { create } from 'zustand'

interface ComplianceUIState {
  // Feature-specific UI state
  activeTab: 'safeguarding' | 'overseas' | 'fundraising'
  expandedSections: Set<string>
  
  // Actions
  setActiveTab: (tab: ComplianceUIState['activeTab']) => void
  toggleSection: (sectionId: string) => void
}

export const useComplianceUIStore = create<ComplianceUIState>((set) => ({
  activeTab: 'safeguarding',
  expandedSections: new Set(),
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSection: (sectionId) => set((state) => {
    const newSections = new Set(state.expandedSections)
    if (newSections.has(sectionId)) {
      newSections.delete(sectionId)
    } else {
      newSections.add(sectionId)
    }
    return { expandedSections: newSections }
  }),
}))
```

## 2. Next.js 15.2 Page Patterns

### Server Component Page (Default)

```typescript
// app/(app)/dashboard/page.tsx
import { Suspense } from 'react'
import { ComplianceScore } from '@/features/compliance/components/compliance-score'
import { RecentActivity } from '@/features/compliance/components/recent-activity'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  // Fetch data directly in Server Component
  const supabase = createServerClient()
  const { data: complianceData } = await supabase
    .from('compliance_scores')
    .select('*')
    .single()
  
  return (
    <div className="container py-6">
      {/* Pass server data to components */}
      <ComplianceScore initialScore={complianceData?.score || 0} />
      
      {/* Use Suspense for streaming */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

### Client Component (Only When Needed)

```typescript
// features/compliance/components/dbs-filter.tsx
'use client'

import { useComplianceUIStore } from '../stores/compliance-ui-store'

export function DBSFilter() {
  const { filters, setFilter } = useComplianceUIStore()
  
  return (
    <div className="flex gap-2">
      <select 
        value={filters.status}
        onChange={(e) => setFilter('status', e.target.value)}
      >
        <option value="all">All</option>
        <option value="valid">Valid</option>
        <option value="expiring">Expiring Soon</option>
      </select>
    </div>
  )
}

## 3. Server Actions (Next.js 15.2)

```typescript
// features/compliance/actions/safeguarding.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { DBSRecordSchema } from '../types/safeguarding'

export async function createDBSRecord(formData: FormData) {
  try {
    // Get authenticated user
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Validate with Zod
    const rawData = Object.fromEntries(formData.entries())
    const validated = DBSRecordSchema.parse(rawData)
    
    // Create record in Supabase
    const { data, error } = await supabase
      .from('safeguarding_records')
      .insert({
        ...validated,
        organization_id: user.user_metadata.organization_id,
        created_by: user.id,
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Revalidate caches
    revalidateTag('safeguarding')
    revalidatePath('/compliance/safeguarding')
    
    return { success: true, data }
  } catch (error) {
    console.error('Failed to create DBS record:', error)
    
    if (error.name === 'ZodError') {
      return { 
        success: false, 
        error: 'Validation failed',
        fieldErrors: error.flatten().fieldErrors 
      }
    }
    
    return { success: false, error: error.message }
  }
}

## 4. Progressive Enhancement Forms

```typescript
// features/compliance/components/dbs-form.tsx
'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createDBSRecord } from '../actions/safeguarding'
import { toast } from 'sonner'

export function DBSForm() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  
  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createDBSRecord(formData)
      
      if (result.success) {
        toast.success('DBS record created')
        router.refresh() // Refresh server data
        // Note: Don't update Zustand - server is source of truth
      } else {
        toast.error(result.error)
        // Show field-specific errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            const input = document.querySelector(`[name="${field}"]`)
            // Add error styling to input
          })
        }
      }
    })
  }
  
  return (
    <form action={handleSubmit} className="space-y-4">
      <input
        name="person_name"
        required
        placeholder="Person Name"
        className="input"
      />
      
      <input
        name="dbs_number"
        pattern="^\d{12}$"
        required
        placeholder="DBS Number (12 digits)"
        className="input"
      />
      
      <button 
        type="submit" 
        disabled={isPending}
        className="btn-primary"
      >
        {isPending ? 'Creating...' : 'Create DBS Record'}
      </button>
    </form>
  )
}

## 5. Data Fetching with Supabase and Next.js 15 Caching

### Optimized Supabase Client with Request Memoization

```typescript
// lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'

// Memoize client creation to reuse within same request
export const createServerClient = cache(async () => {
  const cookieStore = await cookies()
  
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
})

### Next.js 15 Caching Strategies

```typescript
// features/compliance/services/safeguarding.ts
import { createServerClient } from '@/lib/supabase/server'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

// Request Memoization - Deduplicates within single request
export const getCurrentUser = cache(async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Direct server-side data fetching (no caching)
export async function getSafeguardingRecords() {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .select('*')
    .order('expiry_date', { ascending: true })
  
  if (error) throw error
  return data
}

// Data Cache - Persists across requests
export const getCachedSafeguardingRecords = unstable_cache(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from('safeguarding_records')
      .select('*')
      .eq('organization_id', orgId)
      .order('expiry_date', { ascending: true })
    
    if (error) throw error
    return data
  },
  ['safeguarding-records'],
  {
    revalidate: 300, // 5 minutes
    tags: ['safeguarding', `org-${orgId}-safeguarding`],
  }
)

// Cached compliance score with granular invalidation
export const getCachedComplianceScore = unstable_cache(
  async (orgId: string) => {
    const supabase = await createServerClient()
    
    const { data } = await supabase
      .from('compliance_scores')
      .select('*')
      .eq('organization_id', orgId)
      .single()
    
    return data
  },
  ['compliance-score'],
  {
    revalidate: 300, // 5 minutes
    tags: ['compliance', `org-${orgId}-compliance`],
  }
)

// Invalidate caches in Server Actions
import { revalidateTag } from 'next/cache'

export async function updateSafeguardingRecord(id: string, data: any) {
  const user = await getCurrentUser() // Uses memoization
  
  // Update record...
  
  // Invalidate specific caches
  revalidateTag('safeguarding')
  revalidateTag(`org-${user.organizationId}-safeguarding`)
  revalidateTag(`org-${user.organizationId}-compliance`)
}

## 6. Models with Zod

```typescript
// models/item-models.ts
import { z } from 'zod'

// Zod schemas
export const CreateItemSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
})

// Types
export type CreateItemRequest = z.infer<typeof CreateItemSchema>

export interface Item extends CreateItemRequest {
  id: string
  createdAt: string
  updatedAt: string
}
```

## 7. Custom Hooks (Client-Side Only)

```typescript
// features/compliance/hooks/use-realtime-updates.ts
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'

export function useRealtimeUpdates(table: string, filter?: Record<string, any>) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter,
        },
        (payload) => {
          console.log('Change received:', payload)
          // Refresh server data instead of updating client state
          router.refresh()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, filter, router, supabase])
}

// hooks/use-debounced-value.ts
import { useState, useEffect } from 'react'

export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

## 8. Optimistic UI with Server Actions

```typescript
// features/compliance/components/dbs-quick-actions.tsx
'use client'

import { useState, useOptimistic } from 'react'
import { deleteDBSRecord } from '../actions/safeguarding'

export function DBSQuickActions({ records }: { records: DBSRecord[] }) {
  const [optimisticRecords, addOptimisticUpdate] = useOptimistic(
    records,
    (state, { type, id }) => {
      if (type === 'delete') {
        return state.filter(record => record.id !== id)
      }
      return state
    }
  )
  
  async function handleDelete(id: string) {
    // Optimistic update
    addOptimisticUpdate({ type: 'delete', id })
    
    // Server action
    const result = await deleteDBSRecord(id)
    
    if (!result.success) {
      toast.error('Failed to delete record')
      // Router refresh will restore the original state
    }
  }
  
  return (
    <div>
      {optimisticRecords.map(record => (
        <RecordCard 
          key={record.id} 
          record={record}
          onDelete={() => handleDelete(record.id)}
        />
      ))}
    </div>
  )
}
```

## 9. Performance Patterns

### Parallel Data Loading

```typescript
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  // Load all data in parallel
  const [stats, activities, notifications] = await Promise.all([
    getComplianceStats(),
    getRecentActivities(), 
    getActiveNotifications(),
  ])
  
  return (
    <>
      <StatsGrid data={stats} />
      <ActivityFeed data={activities} />
      <NotificationBell count={notifications.length} />
    </>
  )
}
```

### Streaming with Suspense (Next.js 15 Pattern)

```typescript
// app/(app)/compliance/page.tsx
import { Suspense } from 'react'

// Route configuration
export const revalidate = 300 // 5 minutes
export const dynamic = 'force-dynamic' // Always fresh data

export default async function CompliancePage() {
  // Critical data - await immediately
  const user = await getCurrentUser()
  const org = await getCachedOrganization(user.organizationId)
  
  // Non-critical - don't await (stream)
  const scorePromise = getCachedComplianceScore(org.id)
  const recordsPromise = getCachedSafeguardingRecords(org.id)
  const activitiesPromise = getOverseasActivities(org.id)
  
  return (
    <div className="space-y-6">
      {/* Critical content renders immediately */}
      <ComplianceHeader user={user} organization={org} />
      
      {/* Stream compliance score */}
      <Suspense fallback={<ScoreSkeleton />}>
        <ComplianceScoreCard scorePromise={scorePromise} />
      </Suspense>
      
      {/* Stream safeguarding records */}
      <Suspense fallback={<TableSkeleton />}>
        <SafeguardingTable recordsPromise={recordsPromise} />
      </Suspense>
      
      {/* Stream overseas activities */}
      <Suspense fallback={<TableSkeleton />}>
        <OverseasActivitiesTable activitiesPromise={activitiesPromise} />
      </Suspense>
    </div>
  )
}

// Components that handle promises
async function ComplianceScoreCard({ scorePromise }: { scorePromise: Promise<Score> }) {
  const score = await scorePromise
  return <ComplianceScore data={score} />
}

async function SafeguardingTable({ recordsPromise }: { recordsPromise: Promise<Record[]> }) {
  const records = await recordsPromise
  return <SafeguardingRecords data={records} />
}
```

### Route Segment Configuration

```typescript
// app/(app)/dashboard/page.tsx
// Configure how this route behaves
export const revalidate = 60 // Revalidate every minute
export const dynamic = 'force-dynamic' // Always render fresh

// app/(app)/help/page.tsx
// Static content
export const revalidate = 3600 // 1 hour
export const dynamic = 'force-static' // Build-time generation

// app/(app)/reports/annual-return/page.tsx
// On-demand generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs' // Use Node.js runtime for PDF generation
```

### Dynamic Imports for Code Splitting

```typescript
// app/(app)/reports/page.tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const PDFGenerator = dynamic(
  () => import('@/features/reports/components/PDFGenerator'),
  {
    loading: () => <div>Loading PDF generator...</div>,
    ssr: false, // Don't render on server
  }
)

const DataVisualizations = dynamic(
  () => import('@/features/analytics/components/Charts'),
  {
    loading: () => <ChartSkeleton />,
  }
)

export default function ReportsPage() {
  const [showPDF, setShowPDF] = useState(false)
  
  return (
    <div>
      <button onClick={() => setShowPDF(true)}>
        Generate PDF Report
      </button>
      
      {/* Component only loads when needed */}
      {showPDF && <PDFGenerator />}
      
      <Suspense fallback={<ChartSkeleton />}>
        <DataVisualizations />
      </Suspense>
    </div>
  )
}

## 10. Testing Patterns

```typescript
// __tests__/features/compliance/actions/safeguarding.test.ts
import { createDBSRecord } from '@/features/compliance/actions/safeguarding'
import { createServerClient } from '@/lib/supabase/server'

jest.mock('@/lib/supabase/server')

describe('Safeguarding Actions', () => {
  it('creates DBS record successfully', async () => {
    const mockSupabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: '123' } } }) },
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: '456' }, error: null })
    }
    
    createServerClient.mockReturnValue(mockSupabase)
    
    const formData = new FormData()
    formData.set('person_name', 'John Doe')
    formData.set('dbs_number', '123456789012')
    
    const result = await createDBSRecord(formData)
    
    expect(result.success).toBe(true)
    expect(result.data.id).toBe('456')
  })
})

// __tests__/stores/ui-store.test.ts
import { renderHook, act } from '@testing-library/react'
import { useUIStore } from '@/stores/ui-store'

describe('UI Store', () => {
  it('toggles sidebar', () => {
    const { result } = renderHook(() => useUIStore())
    
    expect(result.current.sidebarCollapsed).toBe(false)
    
    act(() => {
      result.current.toggleSidebar()
    })
    
    expect(result.current.sidebarCollapsed).toBe(true)
  })
})
```

## Common Patterns for Charity Prep

### Real-time Compliance Updates

```typescript
// features/compliance/components/compliance-dashboard.tsx
'use client'

import { useRealtimeUpdates } from '../hooks/use-realtime-updates'

export function ComplianceDashboard({ initialData }) {
  // Subscribe to real-time updates
  useRealtimeUpdates('safeguarding_records')
  useRealtimeUpdates('compliance_scores')
  
  return <DashboardContent data={initialData} />
}
```

### AI-Powered Features

```typescript
// features/ai/components/document-upload.tsx
'use client'

import { useState } from 'react'
import { processDocument } from '../actions/document-processing'

export function DocumentUpload() {
  const [processing, setProcessing] = useState(false)
  
  async function handleUpload(file: File) {
    setProcessing(true)
    
    const formData = new FormData()
    formData.append('document', file)
    
    const result = await processDocument(formData)
    
    if (result.success) {
      toast.success('Document processed - check your records!')
      router.push(`/documents/${result.data.id}`)
    }
    
    setProcessing(false)
  }
  
  return (
    <DropZone 
      onDrop={handleUpload}
      processing={processing}
      accept=".pdf,.jpg,.png"
    />
  )
}
```

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_KEY=xxx

# AI Services
OPENROUTER_API_KEY=xxx

# Email
RESEND_API_KEY=xxx

# Payments
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx
```

## Project Setup

```bash
# Install dependencies
npm install next@15.2 react@19 react-dom@19
npm install @supabase/ssr @supabase/supabase-js
npm install zustand immer
npm install zod react-hook-form @hookform/resolvers
npm install @tanstack/react-query
npm install sonner
npm install date-fns
npm install ai openai

# Shadcn UI setup
npx shadcn@latest init
npx shadcn@latest add button card form input table tabs

# Generate Supabase types
npx supabase gen types typescript --project-id [id] > types/database.ts
```

## Architecture Best Practices

### Do's ✅

1. **Server Components by default** - Only use 'use client' when needed
2. **Server Actions for mutations** - Progressive enhancement
3. **Zustand for UI state only** - Not for server data
4. **Use Next.js caching** - unstable_cache() and cache() for performance
5. **Parallel data fetching** - Use Promise.all()
6. **Streaming with Suspense** - Better perceived performance
7. **Type everything** - TypeScript + Zod validation
8. **Feature-based organization** - Colocate related code
9. **Configure route segments** - Set revalidate and dynamic options
10. **Memoize expensive operations** - Use React cache() for deduplication

### Don'ts ❌

1. **Don't fetch in useEffect** - Use Server Components
2. **Don't store server data in Zustand** - Server is source of truth
3. **Don't block on non-critical data** - Use Suspense boundaries
4. **Don't use 'use client' in pages/layouts** - Keep them as Server Components
5. **Don't forget error boundaries** - Handle failures gracefully
6. **Don't create multiple Supabase clients** - Use memoized singleton
7. **Don't put redirect() in try-catch** - Next.js 15 requirement
8. **Don't await non-critical data** - Stream with Suspense instead

## Summary

This architecture leverages:

- **Next.js 15.2**: Server Components, Server Actions, Streaming, Built-in Caching
- **Zustand**: Minimal client state management (UI only)
- **Supabase**: Real-time database with auth
- **TypeScript + Zod**: End-to-end type safety
- **Feature-based structure**: Scalable organization
- **Performance Optimizations**: Request memoization, data caching, streaming, code splitting

The result is a performant, type-safe, and maintainable codebase that delivers excellent user experience while being developer-friendly.

### Key Performance Features

1. **Next.js Caching Layers**
   - Request Memoization with `cache()`
   - Data Cache with `unstable_cache()`
   - Granular invalidation with tags

2. **Streaming Architecture**
   - Critical content renders immediately
   - Non-critical data streams in progressively
   - Better perceived performance

3. **Optimized Data Fetching**
   - Parallel loading with Promise.all()
   - Deduplicated requests within single render
   - Cached Supabase client creation

For migration guide and detailed recommendations, see [nextjs-15-recommendations.md](./nextjs-15-recommendations.md).