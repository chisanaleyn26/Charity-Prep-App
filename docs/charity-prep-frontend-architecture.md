# Charity Prep Frontend Architecture Guide

## Overview

This document defines the frontend architecture for Charity Prep, a compliance management platform for UK charities. Built with Next.js 15.2, TypeScript, Zustand, and Supabase, this architecture maximizes performance through Server Components, Server Actions, and strategic client-side interactivity.

## Core Principles

1. **Server-First Architecture**: Leverage Next.js 15.2's Server Components by default
2. **Feature-Based Organization**: Group code by business domain, not technical layers
3. **Minimal Client State**: Use Zustand only for UI state, not server data
4. **Type Safety**: Full TypeScript coverage with Zod validation
5. **Progressive Enhancement**: Works without JavaScript, enhanced with interactivity

## Technology Stack

- **Framework**: Next.js 15.2 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **State Management**: Zustand 4.5+ (client state only)
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **UI Components**: Shadcn UI + Ethereal Design System
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **AI Integration**: OpenRouter (Gemini 2.5 Flash)

## Directory Structure

```
charity-prep/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   │   ├── login/
│   │   └── verify/
│   ├── (app)/                    # Main app route group
│   │   ├── layout.tsx            # App shell with sidebar
│   │   ├── dashboard/
│   │   ├── compliance/
│   │   │   ├── safeguarding/
│   │   │   ├── overseas/
│   │   │   └── fundraising/
│   │   ├── documents/
│   │   ├── reports/
│   │   └── settings/
│   └── api/                      # API routes
│
├── features/                     # Feature modules (main business logic)
│   ├── auth/
│   │   ├── components/           # Feature-specific components
│   │   ├── hooks/                # Feature-specific hooks
│   │   ├── actions/              # Server actions
│   │   ├── services/             # API services
│   │   └── types/                # TypeScript types
│   ├── compliance/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── actions/
│   │   ├── services/
│   │   ├── stores/               # Feature-specific Zustand stores
│   │   └── types/
│   ├── ai/
│   ├── documents/
│   ├── reports/
│   └── subscription/
│
├── components/                   # Shared components
│   ├── ui/                       # Shadcn UI (don't edit)
│   ├── layout/                   # App layout components
│   └── common/                   # Shared custom components
│
├── lib/                          # Core utilities
│   ├── supabase/                 # Supabase clients
│   ├── utils/                    # Helper functions
│   └── config/                   # App configuration
│
├── stores/                       # Global Zustand stores
│   ├── auth-store.ts
│   ├── ui-store.ts
│   └── organization-store.ts
│
├── types/                        # Global TypeScript types
│   ├── database.ts               # Supabase generated types
│   └── global.ts                 # App-wide types
│
└── hooks/                        # Global custom hooks
    ├── use-user.ts
    └── use-organization.ts
```

## Server Components vs Client Components

### Decision Framework

```
Is user interaction required?
├─ NO → Server Component (default)
│   └─ Examples: Data display, static content, layouts
├─ YES → Is it form input or real-time updates?
    ├─ Form → Server Component + Server Action
    │   └─ Examples: Create/edit forms
    └─ Real-time → Client Component
        └─ Examples: Charts, live updates, modals
```

### Server Component Patterns

```typescript
// app/(app)/dashboard/page.tsx - Server Component (default)
import { DashboardStats } from '@/features/compliance/components/dashboard-stats'
import { RecentActivity } from '@/features/compliance/components/recent-activity'
import { createServerClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  // Fetch data on the server
  const supabase = createServerClient()
  const { data: stats } = await supabase
    .from('compliance_scores')
    .select('*')
    .single()

  return (
    <div className="space-y-6">
      {/* Pass server data to components */}
      <DashboardStats initialStats={stats} />
      
      {/* Suspense for streaming */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity />
      </Suspense>
    </div>
  )
}
```

### Client Component Patterns

```typescript
// features/compliance/components/compliance-score.tsx
'use client'

import { useComplianceStore } from '@/features/compliance/stores/compliance-store'
import { useEffect } from 'react'

interface ComplianceScoreProps {
  initialScore: number
}

export function ComplianceScore({ initialScore }: ComplianceScoreProps) {
  const { score, setScore } = useComplianceStore()
  
  // Hydrate client store with server data
  useEffect(() => {
    setScore(initialScore)
  }, [initialScore, setScore])
  
  return (
    <div className="relative">
      {/* Interactive UI */}
      <CircularProgress value={score} />
    </div>
  )
}
```

## Feature Module Structure

Each feature follows this pattern:

```
features/compliance/
├── components/               # UI components
│   ├── dbs-table.tsx        # Server Component
│   ├── dbs-form.tsx         # Client Component
│   └── expiry-badge.tsx     # Server Component
├── actions/                  # Server Actions
│   ├── safeguarding.ts      # 'use server' functions
│   └── compliance-score.ts
├── services/                 # API/Supabase calls
│   ├── safeguarding.ts      # Data fetching
│   └── compliance.ts
├── stores/                   # Feature-specific Zustand
│   └── safeguarding-store.ts
├── hooks/                    # Custom hooks
│   ├── use-dbs-records.ts
│   └── use-compliance.ts
├── types/                    # TypeScript types
│   ├── safeguarding.ts
│   └── compliance.ts
└── utils/                    # Feature utilities
    ├── dbs-validation.ts
    └── expiry-calculation.ts
```

## Zustand Store Patterns

### Global Store (Minimal)

```typescript
// stores/auth-store.ts
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

interface AuthState {
  user: User | null
  organization: Organization | null
  setUser: (user: User | null) => void
  setOrganization: (org: Organization | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        organization: null,
        
        setUser: (user) => set((state) => {
          state.user = user
        }),
        
        setOrganization: (org) => set((state) => {
          state.organization = org
        }),
      })),
      {
        name: 'charity-prep-auth',
        partialize: (state) => ({ 
          user: state.user,
          organization: state.organization 
        }),
      }
    )
  )
)
```

### Feature Store (UI State Only)

```typescript
// features/compliance/stores/safeguarding-store.ts
import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface SafeguardingUIState {
  // UI state only - no server data
  selectedRecordId: string | null
  isFormOpen: boolean
  filters: {
    status: 'all' | 'valid' | 'expiring' | 'expired'
    search: string
  }
  
  // Actions
  selectRecord: (id: string | null) => void
  toggleForm: (open?: boolean) => void
  setFilter: (key: string, value: any) => void
}

export const useSafeguardingStore = create<SafeguardingUIState>()(
  immer((set) => ({
    selectedRecordId: null,
    isFormOpen: false,
    filters: {
      status: 'all',
      search: '',
    },
    
    selectRecord: (id) => set((state) => {
      state.selectedRecordId = id
    }),
    
    toggleForm: (open) => set((state) => {
      state.isFormOpen = open ?? !state.isFormOpen
    }),
    
    setFilter: (key, value) => set((state) => {
      state.filters[key] = value
    }),
  }))
)
```

## Server Actions Pattern

```typescript
// features/compliance/actions/safeguarding.ts
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { SafeguardingRecordSchema } from '../types/safeguarding'
import { ActionResponse } from '@/types/global'

export async function createDBSRecord(
  formData: FormData
): Promise<ActionResponse<SafeguardingRecord>> {
  try {
    // Parse and validate with Zod
    const rawData = Object.fromEntries(formData.entries())
    const validated = SafeguardingRecordSchema.parse(rawData)
    
    // Get authenticated client
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Create record
    const { data, error } = await supabase
      .from('safeguarding_records')
      .insert({
        ...validated,
        created_by: user.id,
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Revalidate cache
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
    
    return { 
      success: false, 
      error: error.message || 'Failed to create record' 
    }
  }
}

export async function updateComplianceScore(): Promise<ActionResponse<number>> {
  const supabase = createServerClient()
  
  // Call Supabase Edge Function
  const { data, error } = await supabase.functions.invoke('calculate-score')
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  // Revalidate dashboard
  revalidateTag('compliance-score')
  revalidatePath('/dashboard')
  
  return { success: true, data: data.score }
}
```

## Data Fetching Patterns

### Server-Side Data Fetching

```typescript
// features/compliance/services/safeguarding.ts
import { createServerClient } from '@/lib/supabase/server'
import { cache } from 'react'

// Cache function results during request
export const getSafeguardingRecords = cache(async () => {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .select('*')
    .order('expiry_date', { ascending: true })
  
  if (error) throw error
  return data
})

// Tagged fetch for revalidation
export const getComplianceScore = async () => {
  const supabase = createServerClient()
  
  // Use unstable_cache for tagged caching
  return unstable_cache(
    async () => {
      const { data } = await supabase
        .from('compliance_scores')
        .select('*')
        .single()
      return data
    },
    ['compliance-score'],
    {
      tags: ['compliance-score'],
      revalidate: 300, // 5 minutes
    }
  )()
}
```

### Client-Side Data Synchronization

```typescript
// features/compliance/hooks/use-realtime-compliance.ts
'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useRealtimeCompliance() {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  useEffect(() => {
    const channel = supabase
      .channel('compliance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safeguarding_records',
        },
        () => {
          // Refresh server data
          router.refresh()
        }
      )
      .subscribe()
    
    return () => {
      supabase.removeChannel(channel)
    }
  }, [router, supabase])
}
```

## Form Handling with Server Actions

### Progressive Enhancement Form

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
        // Don't update Zustand - let server be source of truth
      } else {
        toast.error(result.error)
        // Show field errors
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, errors]) => {
            toast.error(`${field}: ${errors.join(', ')}`)
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
        className="input"
        placeholder="Person Name"
      />
      
      <input
        name="dbs_number"
        pattern="^\d{12}$"
        required
        className="input"
        placeholder="DBS Number (12 digits)"
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
```

## AI Integration Patterns

### Streaming AI Responses

```typescript
// features/ai/components/compliance-chat.tsx
'use client'

import { useChat } from 'ai/react'

export function ComplianceChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I can help answer your compliance questions.',
      },
    ],
  })
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about compliance..."
          disabled={isLoading}
        />
      </form>
    </div>
  )
}
```

### Document Processing

```typescript
// features/ai/actions/document-extraction.ts
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { extractWithAI } from '@/lib/ai/extraction'

export async function processDocument(
  documentId: string
): Promise<ActionResponse<ExtractedData>> {
  const supabase = createServerClient()
  
  // Get document from storage
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single()
  
  // Queue AI processing
  const { data: task } = await supabase
    .from('ai_tasks')
    .insert({
      type: 'document_extraction',
      status: 'pending',
      input_data: { documentId },
    })
    .select()
    .single()
  
  // Process in background (could use Queue/Job system)
  processInBackground(task.id)
  
  return { 
    success: true, 
    data: { taskId: task.id, status: 'processing' } 
  }
}
```

## Performance Optimization

### 1. Parallel Data Loading

```typescript
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  // Load data in parallel
  const [stats, recentActivity, notifications] = await Promise.all([
    getComplianceStats(),
    getRecentActivity(),
    getNotifications(),
  ])
  
  return (
    <>
      <DashboardStats data={stats} />
      <RecentActivity data={recentActivity} />
      <NotificationBell count={notifications.length} />
    </>
  )
}
```

### 2. Streaming with Suspense

```typescript
// app/(app)/compliance/page.tsx
export default function CompliancePage() {
  return (
    <div className="space-y-6">
      {/* Static content loads immediately */}
      <ComplianceHeader />
      
      {/* Stream in dynamic content */}
      <Suspense fallback={<ScoreSkeleton />}>
        <ComplianceScore />
      </Suspense>
      
      <Suspense fallback={<ModulesSkeleton />}>
        <ComplianceModules />
      </Suspense>
    </div>
  )
}
```

### 3. Optimistic Updates

```typescript
// features/compliance/components/dbs-quick-add.tsx
'use client'

export function DBSQuickAdd() {
  const [optimisticRecords, setOptimisticRecords] = useState([])
  
  async function handleAdd(formData: FormData) {
    // Create optimistic record
    const optimisticRecord = {
      id: crypto.randomUUID(),
      ...Object.fromEntries(formData),
      status: 'pending',
    }
    
    // Add to UI immediately
    setOptimisticRecords(prev => [...prev, optimisticRecord])
    
    // Sync with server
    const result = await createDBSRecord(formData)
    
    if (!result.success) {
      // Remove on failure
      setOptimisticRecords(prev => 
        prev.filter(r => r.id !== optimisticRecord.id)
      )
      toast.error('Failed to add record')
    }
  }
  
  return (
    <>
      {optimisticRecords.map(record => (
        <OptimisticDBSCard key={record.id} record={record} />
      ))}
      <QuickAddForm onSubmit={handleAdd} />
    </>
  )
}
```

## Testing Strategy

### Server Component Testing

```typescript
// __tests__/features/compliance/components/dbs-table.test.tsx
import { render } from '@testing-library/react'
import { DBSTable } from '@/features/compliance/components/dbs-table'

describe('DBSTable', () => {
  it('renders records correctly', async () => {
    const mockRecords = [
      { id: '1', person_name: 'John Doe', expiry_date: '2025-12-31' },
    ]
    
    const { getByText } = render(
      await DBSTable({ records: mockRecords })
    )
    
    expect(getByText('John Doe')).toBeInTheDocument()
  })
})
```

### Server Action Testing

```typescript
// __tests__/features/compliance/actions/safeguarding.test.ts
import { createDBSRecord } from '@/features/compliance/actions/safeguarding'

describe('createDBSRecord', () => {
  it('creates record successfully', async () => {
    const formData = new FormData()
    formData.append('person_name', 'Jane Doe')
    formData.append('dbs_number', '123456789012')
    
    const result = await createDBSRecord(formData)
    
    expect(result.success).toBe(true)
    expect(result.data?.person_name).toBe('Jane Doe')
  })
})
```

## Security Considerations

### 1. Server Actions Security

```typescript
// Always validate user permissions in server actions
export async function deleteDBSRecord(id: string) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }
  
  // Check user has permission for this organization
  const { data: member } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', user.id)
    .single()
  
  if (!member || member.role === 'viewer') {
    return { success: false, error: 'Insufficient permissions' }
  }
  
  // Proceed with deletion
}
```

### 2. Client State Security

```typescript
// Never store sensitive data in Zustand
// ❌ Bad
const useStore = create((set) => ({
  apiKey: 'secret-key', // Never do this
}))

// ✅ Good
const useStore = create((set) => ({
  isAuthenticated: false, // Only store UI state
}))
```

## Migration from Redux to Zustand

### Key Differences

1. **No Providers Required**: Zustand stores work without providers
2. **Simpler API**: Direct function calls instead of dispatch
3. **Built-in DevTools**: Automatic Redux DevTools support
4. **Smaller Bundle**: ~8KB vs ~60KB for Redux Toolkit

### Migration Steps

```typescript
// Before (Redux)
const dispatch = useAppDispatch()
dispatch(setUser(userData))

// After (Zustand)
const setUser = useAuthStore(state => state.setUser)
setUser(userData)
```

## Best Practices Summary

### Do's

1. **Server Components by Default**: Only use 'use client' when needed
2. **Server Actions for Mutations**: Handle forms and data updates
3. **Zustand for UI State**: Keep client state minimal
4. **Parallel Data Fetching**: Use Promise.all() for performance
5. **Streaming with Suspense**: Progressive page loading
6. **Type Everything**: Use TypeScript and Zod for safety
7. **Cache Aggressively**: Use Next.js caching features

### Don'ts

1. **Don't Store Server Data in Zustand**: Let server be source of truth
2. **Don't Use useEffect for Data Fetching**: Fetch on server
3. **Don't Block on Non-Critical Data**: Use Suspense boundaries
4. **Don't Over-Optimize**: Next.js handles most optimizations
5. **Don't Forget Error Boundaries**: Handle failures gracefully

## Conclusion

This architecture leverages Next.js 15.2's powerful features while maintaining simplicity with Zustand for client state. By defaulting to Server Components and using Server Actions for mutations, we achieve excellent performance, SEO, and user experience while keeping the codebase maintainable and type-safe.

The feature-based organization allows teams to work independently while sharing common patterns, and the minimal client state approach reduces complexity and improves performance.