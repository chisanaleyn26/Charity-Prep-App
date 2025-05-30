# Next.js 15 Architecture Guide for SaaS Applications

## Executive Summary

Next.js 15 represents a paradigm shift in React application development with uncached-by-default behavior, React 19 support, and enhanced developer control. This comprehensive guide provides a production-ready architecture for building scalable SaaS applications using Next.js 15's App Router, integrating modern tools like Zustand for state management, Supabase for backend services, Shadcn UI for components, and TanStack Table for data visualization.

## 1. Architecture Foundation

### Core Principles

Next.js 15 introduces **three fundamental architectural concepts** that define modern development:

1. **Server Components by Default** - Every component renders on the server unless explicitly marked with `'use client'`
2. **Uncached by Default** - Fetch requests and route handlers no longer cache automatically, giving developers explicit control
3. **Streaming-First Architecture** - Built-in support for React Suspense and progressive rendering

### Technology Stack

```typescript
// package.json core dependencies
{
  "dependencies": {
    "next": "15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/ssr": "latest",
    "zustand": "^4.5.0",
    "@tanstack/react-table": "^8.11.0",
    "zod": "^3.22.0",
    "tailwindcss": "^3.4.0"
  }
}
```

## 2. Project Structure & Organization

### Scalable Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Route group for auth pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # Protected dashboard routes
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [workspace]/
│   │       └── [project]/
│   ├── api/                     # API route handlers
│   │   └── webhooks/
│   ├── layout.tsx               # Root layout
│   └── globals.css
├── components/                   # React components
│   ├── ui/                      # Shadcn UI components
│   ├── forms/                   # Form components
│   ├── layouts/                 # Layout components
│   └── features/                # Feature-specific components
├── lib/                         # Core utilities
│   ├── supabase/               # Supabase clients
│   │   ├── server.ts
│   │   └── client.ts
│   ├── actions/                # Server actions
│   └── utils.ts
├── stores/                      # Zustand stores
│   ├── auth-store.ts
│   └── app-store.ts
├── types/                       # TypeScript definitions
│   ├── database.ts             # Generated from Supabase
│   └── app.ts
└── schemas/                     # Zod validation schemas
    ├── auth-schema.ts
    └── form-schemas.ts
```

### File Naming Conventions

- **Components**: kebab-case (`user-profile.tsx`)
- **Utilities**: kebab-case (`format-date.ts`)
- **Types**: kebab-case (`user.ts` or `database.d.ts`)
- **Server Actions**: kebab-case with descriptive names (`create-project.ts`)
- **Hooks**: kebab-case with `use-` prefix (`use-auth.ts`)
- **Stores**: kebab-case with `-store` suffix (`auth-store.ts`)
- **Schemas**: kebab-case (`project-schema.ts`)

## 3. Core Next.js 15 Implementation

### App Router Architecture

**Root Layout with Providers:**
```typescript
// app/layout.tsx
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### Server vs Client Components

**Server Component Pattern:**
```typescript
// app/dashboard/projects/page.tsx
import { createClient } from '@/lib/supabase/server'
import { ProjectCard } from '@/components/projects/project-card'

export default async function ProjectsPage() {
  const supabase = await createClient()
  
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects?.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
```

**Client Component Pattern:**
```typescript
// components/projects/project-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProject } from '@/lib/actions/create-project'
import { projectSchema } from '@/schemas/project-schema'

export function ProjectForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(projectSchema),
  })

  async function onSubmit(data: z.infer<typeof projectSchema>) {
    setIsSubmitting(true)
    const result = await createProject(data)
    setIsSubmitting(false)
    
    if (result.success) {
      form.reset()
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  )
}
```

### Server Actions

**Type-Safe Server Action with Revalidation:**
```typescript
// lib/actions/create-project.ts
'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { projectSchema } from '@/schemas/project-schema'

export async function createProject(data: z.infer<typeof projectSchema>) {
  const supabase = await createClient()
  
  // Validate on server
  const validated = projectSchema.safeParse(data)
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten() }
  }

  const { data: project, error } = await supabase
    .from('projects')
    .insert(validated.data)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate specific tags
  revalidateTag('projects')
  revalidateTag(`workspace-${validated.data.workspace_id}`)
  revalidatePath('/dashboard/projects')
  
  return { success: true, data: project }
}

export async function updateProject(id: string, data: Partial<Project>) {
  const supabase = await createClient()
  
  const { data: project, error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate all related tags
  revalidateTag('projects')
  revalidateTag(`project-${id}`)
  revalidateTag(`workspace-${project.workspace_id}`)
  
  return { success: true, data: project }
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  
  // Get project first to know which tags to invalidate
  const { data: project } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  // Revalidate all related tags
  revalidateTag('projects')
  revalidateTag(`project-${id}`)
  if (project) {
    revalidateTag(`workspace-${project.workspace_id}`)
  }
  
  return { success: true }
}
```

## 4. Data Management Architecture

### Zustand Store Configuration

**SSR-Safe Store Implementation:**
```typescript
// stores/app-store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AppState {
  // State
  workspace: Workspace | null
  projects: Project[]
  
  // Actions
  setWorkspace: (workspace: Workspace) => void
  addProject: (project: Project) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      workspace: null,
      projects: [],
      
      setWorkspace: (workspace) => set({ workspace }),
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        workspace: state.workspace 
      }),
    }
  )
)
```

### Data Fetching Patterns

**Fetch with Cache Tags:**
```typescript
// lib/data/fetch-projects.ts
export async function fetchProjects(workspaceId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/projects?workspace=${workspaceId}`,
    {
      next: {
        tags: ['projects', `workspace-${workspaceId}-projects`],
        revalidate: 3600, // Optional: time-based revalidation
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects')
  }
  
  return response.json()
}

// lib/data/fetch-user.ts
export async function fetchUserProfile(userId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/users/${userId}`,
    {
      next: {
        tags: ['users', `user-${userId}`],
      }
    }
  )
  
  if (!response.ok) {
    throw new Error('Failed to fetch user')
  }
  
  return response.json()
}

// Using Supabase with fetch-style caching
export async function fetchProjectWithTags(projectId: string) {
  // For external APIs or when you need tag-based caching with Supabase
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/projects?id=eq.${projectId}`,
    {
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
      },
      next: {
        tags: ['projects', `project-${projectId}`],
      }
    }
  )
  
  const data = await response.json()
  return data[0]
}
```

**Parallel Data Fetching with Tagged Caching:**
```typescript
// app/dashboard/page.tsx
import { unstable_cache } from 'next/cache'

// Create cached data fetchers with tags
const getCachedAnalytics = unstable_cache(
  async (workspaceId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('analytics')
      .select('*')
      .eq('workspace_id', workspaceId)
    return data
  },
  ['analytics'],
  {
    tags: ['analytics'],
    revalidate: 3600, // 1 hour
  }
)

const getCachedProjects = unstable_cache(
  async (workspaceId: string) => {
    const supabase = await createClient()
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    return data
  },
  ['projects'],
  {
    tags: ['projects'],
    revalidate: false, // Only revalidate on demand
  }
)

export default async function DashboardPage() {
  const workspaceId = await getWorkspaceId()
  
  // Execute queries in parallel
  const [analyticsPromise, projectsPromise, tasksPromise] = [
    getCachedAnalytics(workspaceId),
    getCachedProjects(workspaceId),
    fetchRecentTasks(workspaceId),
  ]

  // Stream results as they complete
  return (
    <div className="space-y-8">
      <Suspense fallback={<AnalyticsSkeleton />}>
        <Analytics dataPromise={analyticsPromise} />
      </Suspense>
      
      <Suspense fallback={<ProjectsSkeleton />}>
        <Projects dataPromise={projectsPromise} />
      </Suspense>
      
      <Suspense fallback={<TasksSkeleton />}>
        <RecentTasks dataPromise={tasksPromise} />
      </Suspense>
    </div>
  )
}
```

### Caching Strategy

**Native Fetch with Cache Tags:**
```typescript
// lib/data/api-fetchers.ts

// Basic fetch with tags
export async function getProjectData(projectId: string) {
  const response = await fetch(`https://api.example.com/projects/${projectId}`, {
    next: { 
      tags: ['projects', `project-${projectId}`],
      revalidate: 3600 // Optional: 1 hour cache
    }
  })
  
  if (!response.ok) throw new Error('Failed to fetch project')
  return response.json()
}

// Fetch with multiple tags
export async function getWorkspaceData(workspaceId: string) {
  const response = await fetch(`https://api.example.com/workspaces/${workspaceId}`, {
    next: { 
      tags: [
        'workspaces', 
        `workspace-${workspaceId}`,
        `workspace-${workspaceId}-data`
      ]
    }
  })
  
  return response.json()
}

// Combining fetch tags with authorization
export async function fetchProtectedData(endpoint: string, tags: string[]) {
  const session = await getSession()
  
  const response = await fetch(`${process.env.API_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${session?.accessToken}`,
      'Content-Type': 'application/json',
    },
    next: { tags }
  })
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }
  
  return response.json()
}
```

**Using the `use cache` Directive with Tags:**
```typescript
// lib/data/analytics.ts
async function getAnalytics(workspaceId: string) {
  'use cache'
  cacheTag(`analytics-${workspaceId}`)
  cacheLife('hours')
  
  const supabase = await createClient()
  const { data } = await supabase
    .from('analytics')
    .select('*')
    .eq('workspace_id', workspaceId)
    
  return data
}

// lib/data/projects.ts
import { unstable_cache } from 'next/cache'

export const getProjectById = unstable_cache(
  async (projectId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()
    
    if (error) throw error
    return data
  },
  ['project-by-id'],
  {
    tags: ['projects'],
    revalidate: false, // Only revalidate on mutation
  }
)

export const getProjectsByWorkspace = unstable_cache(
  async (workspaceId: string) => {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },
  ['projects-by-workspace'],
  {
    tags: ['projects'],
    revalidate: 300, // 5 minutes
  }
)
```

### Mixed Data Sources with Caching

```typescript
// app/dashboard/overview/page.tsx
export default async function OverviewPage() {
  const workspaceId = await getWorkspaceId()
  
  // Mix different caching strategies
  const [internalData, externalData, realtimeData] = await Promise.all([
    // Supabase with unstable_cache
    getCachedProjects(workspaceId),
    
    // External API with fetch tags
    fetch(`https://api.analytics.com/workspace/${workspaceId}`, {
      next: { 
        tags: ['external-analytics', `workspace-${workspaceId}`],
        revalidate: 3600 
      }
    }).then(res => res.json()),
    
    // Fresh data without caching
    getRealtimeMetrics(workspaceId)
  ])
  
  return (
    <div>
      <ProjectsList projects={internalData} />
      <AnalyticsChart data={externalData} />
      <LiveMetrics data={realtimeData} />
    </div>
  )
}
```

```typescript
// app/api/projects/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { revalidateTag } from 'next/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'max-age=60, stale-while-revalidate=300',
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('projects')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Revalidate all related caches
  revalidateTag('projects')
  revalidateTag(`project-${params.id}`)
  revalidateTag(`workspace-${data.workspace_id}`)

  return NextResponse.json(data, {
    headers: {
      'X-Revalidated': 'true',
    },
  })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  // First get the project to know which tags to invalidate
  const { data: project } = await supabase
    .from('projects')
    .select('workspace_id')
    .eq('id', params.id)
    .single()
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Revalidate all related caches
  revalidateTag('projects')
  revalidateTag(`project-${params.id}`)
  if (project) {
    revalidateTag(`workspace-${project.workspace_id}`)
  }

  return NextResponse.json({ success: true }, {
    headers: {
      'X-Revalidated': 'true',
    },
  })
}
```

## 5. Advanced Routing Patterns

### Parallel Routes for Dashboards

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
  metrics,
  activity,
  notifications,
}: {
  children: React.ReactNode
  metrics: React.ReactNode
  activity: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-12 gap-6">
      <main className="col-span-8">{children}</main>
      <aside className="col-span-4 space-y-6">
        {metrics}
        {activity}
        {notifications}
      </aside>
    </div>
  )
}
```

### Intercepting Routes for Modals

```typescript
// app/projects/@modal/(.)new/page.tsx
import { Modal } from '@/components/ui/modal'
import { ProjectForm } from '@/components/projects/project-form'

export default function NewProjectModal() {
  return (
    <Modal>
      <ProjectForm />
    </Modal>
  )
}
```

### Middleware for Authentication

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

## 6. UI Component Architecture

### Shadcn UI Integration

**Component Library Setup:**
```bash
npx shadcn@latest init --force
npx shadcn@latest add button card form table --force
```

**Compound Component Pattern:**
```typescript
// components/ui/data-card.tsx
interface DataCardProps {
  children: React.ReactNode
  className?: string
}

const DataCard = ({ children, className }: DataCardProps) => (
  <Card className={cn("p-6", className)}>{children}</Card>
)

const DataCardHeader = ({ children }: { children: React.ReactNode }) => (
  <CardHeader className="pb-3">{children}</CardHeader>
)

const DataCardContent = ({ children }: { children: React.ReactNode }) => (
  <CardContent>{children}</CardContent>
)

export { DataCard, DataCardHeader, DataCardContent }
```

### TanStack Table Implementation

**Server-Side Data Table:**
```typescript
// components/data-table/columns.tsx
'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from './data-table-column-header'

export const columns: ColumnDef<Project>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('name')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      return (
        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
          {status}
        </Badge>
      )
    },
  },
]
```

## 7. Type System Architecture

### Centralized Type Definitions

```typescript
// types/database.ts (Generated from Supabase)
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          workspace_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          workspace_id: string
        }
        Update: {
          name?: string
          updated_at?: string
        }
      }
    }
  }
}

// types/app.ts
export type Project = Database['public']['Tables']['projects']['Row']
export type NewProject = Database['public']['Tables']['projects']['Insert']
```

### Zod Schema Integration

```typescript
// schemas/project-schema.ts
import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().optional(),
  workspace_id: z.string().uuid(),
})

export type ProjectFormData = z.infer<typeof projectSchema>
```

## 8. Authentication & Security

### Supabase Auth Integration

**Auth Context Provider:**
```typescript
// components/providers/auth-provider.tsx
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### Row Level Security Patterns

```sql
-- Optimized RLS for team-based access
CREATE POLICY "Team members can access projects"
ON projects FOR ALL
TO authenticated
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid()
  )
);

-- Index for performance
CREATE INDEX idx_workspace_members_user_id 
ON workspace_members(user_id);
```

## 9. Testing Strategy

### Jest Configuration

```typescript
// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
}

export default createJestConfig(config)
```

### Playwright E2E Tests

```typescript
// e2e/auth-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('user can sign up and access dashboard', async ({ page }) => {
    await page.goto('/signup')
    
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Welcome to your dashboard')).toBeVisible()
  })
})
```

## 10. Performance Optimization

### Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    ppr: 'incremental',
    optimizePackageImports: ['@supabase/ssr', 'zustand'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
}

export default nextConfig
```

### Core Web Vitals Optimization

```typescript
// components/optimized-image.tsx
import Image from 'next/image'

export function OptimizedImage({ 
  src, 
  alt, 
  priority = false 
}: { 
  src: string
  alt: string
  priority?: boolean 
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={630}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder="blur"
      blurDataURL={generateBlurDataURL()}
    />
  )
}
```

## 11. PWA Implementation

### Service Worker Setup

```typescript
// app/sw.ts
import { defaultCache } from '@serwist/next/worker'
import { Serwist } from 'serwist'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

### Web App Manifest

```typescript
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SaaS Application',
    short_name: 'SaaSApp',
    description: 'Modern SaaS application built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
```

## 12. Advanced Caching Patterns

### Revalidation Strategy

```typescript
// lib/cache/revalidation-tags.ts
export const CACHE_TAGS = {
  // Entity-based tags
  projects: 'projects',
  users: 'users',
  workspaces: 'workspaces',
  
  // Specific entity tags
  project: (id: string) => `project-${id}`,
  user: (id: string) => `user-${id}`,
  workspace: (id: string) => `workspace-${id}`,
  
  // Relationship tags
  workspaceProjects: (workspaceId: string) => `workspace-${workspaceId}-projects`,
  userProjects: (userId: string) => `user-${userId}-projects`,
} as const

// lib/cache/revalidation-helpers.ts
import { revalidateTag } from 'next/cache'
import { CACHE_TAGS } from './revalidation-tags'

export async function revalidateProject(projectId: string, workspaceId: string) {
  // Revalidate all related caches
  await Promise.all([
    revalidateTag(CACHE_TAGS.projects),
    revalidateTag(CACHE_TAGS.project(projectId)),
    revalidateTag(CACHE_TAGS.workspaceProjects(workspaceId)),
  ])
}

export async function revalidateWorkspace(workspaceId: string) {
  await Promise.all([
    revalidateTag(CACHE_TAGS.workspaces),
    revalidateTag(CACHE_TAGS.workspace(workspaceId)),
    revalidateTag(CACHE_TAGS.workspaceProjects(workspaceId)),
  ])
}
```

### Optimistic Updates with Revalidation

```typescript
// components/projects/project-list.tsx
'use client'

import { useOptimistic } from 'react'
import { deleteProject } from '@/lib/actions/delete-project'

export function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, optimisticUpdate] = useOptimistic(
    initialProjects,
    (state, { action, project }: { action: string; project?: Project }) => {
      switch (action) {
        case 'delete':
          return state.filter(p => p.id !== project?.id)
        case 'add':
          return [...state, project!]
        default:
          return state
      }
    }
  )

  async function handleDelete(project: Project) {
    // Optimistic update
    optimisticUpdate({ action: 'delete', project })
    
    // Server action with revalidation
    const result = await deleteProject(project.id)
    
    if (!result.success) {
      // The revalidation will restore the correct state
      toast.error('Failed to delete project')
    }
  }

  return (
    <div className="space-y-4">
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project}
          onDelete={() => handleDelete(project)}
        />
      ))}
    </div>
  )
}
```

## Development Workflow

### Environment Setup

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Git Workflow

```bash
# Feature branch workflow
git checkout -b feature/new-feature
npm run dev
npm run test
npm run build
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
```

### CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Best Practices Summary

1. **Architecture**: Default to Server Components, use Client Components only for interactivity
2. **Data Fetching**: Leverage parallel fetching and streaming for optimal performance
3. **State Management**: Use Zustand for client state, Server Components for server state
4. **Type Safety**: Enforce strict TypeScript with Zod validation throughout
5. **Performance**: Implement progressive enhancement with Suspense boundaries
6. **Testing**: Combine unit tests with Jest and E2E tests with Playwright
7. **Security**: Implement RLS policies and validate all inputs on the server
8. **Caching & Revalidation**: Use granular cache tags for precise invalidation
   - Tag all data fetching with relevant cache tags
   - Revalidate specific tags on mutations (create/update/delete)
   - Use `unstable_cache` for on-demand revalidation
   - Implement optimistic updates for better UX

### Revalidation Best Practices

1. **Granular Tags**: Use specific tags like `project-${id}` instead of broad tags
2. **Hierarchical Invalidation**: When updating a project, also invalidate its workspace
3. **API Consistency**: Always include revalidation in API routes that mutate data
4. **Error Handling**: Ensure revalidation happens even if the main operation fails partially
5. **Performance**: Use `Promise.all()` for multiple revalidations to run in parallel
6. **Fetch Caching**: Use `fetch()` with `next: { tags: [] }` for external APIs
7. **Mixed Strategies**: Combine `unstable_cache`, `fetch` tags, and `use cache` directive appropriately

### Cache Tag Patterns

```typescript
// Consistent tag naming conventions
const CACHE_PATTERNS = {
  // List/collection tags
  ALL_PROJECTS: 'projects',
  ALL_USERS: 'users',
  
  // Specific resource tags
  PROJECT: (id: string) => `project-${id}`,
  USER: (id: string) => `user-${id}`,
  
  // Relationship tags
  WORKSPACE_PROJECTS: (wsId: string) => `workspace-${wsId}-projects`,
  USER_PROJECTS: (userId: string) => `user-${userId}-projects`,
  
  // External API tags
  EXTERNAL_ANALYTICS: 'external-analytics',
  THIRD_PARTY_DATA: (source: string) => `external-${source}`,
}
```

This architecture guide provides a solid foundation for building scalable, performant SaaS applications with Next.js 15. The patterns and practices outlined here have been tested in production environments and represent current best practices in the React ecosystem.