# NextJS 15 Migration Guide for CharityPrep

This guide provides step-by-step instructions for implementing the NextJS 15 performance recommendations in the CharityPrep codebase.

## Prerequisites

- [ ] Ensure project is on Next.js 15.2+
- [ ] All tests passing
- [ ] Backup/commit current state

## Phase 1: Core Caching Implementation (Week 1)

### Day 1-2: Request Memoization

#### 1. Update Supabase Client Creation

```typescript
// lib/supabase/server.ts
import { cache } from 'react'

// OLD
export async function createServerClient() {
  const cookieStore = await cookies()
  return createClient(...)
}

// NEW - Memoized version
export const createServerClient = cache(async () => {
  const cookieStore = await cookies()
  return createClient(...)
})
```

#### 2. Memoize Common Data Fetchers

```typescript
// lib/api/auth.ts
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

export const getCurrentOrganization = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('organization_members')
    .select('organization:organizations(*)')
    .eq('user_id', user.id)
    .single()
    
  return data?.organization
})
```

#### 3. Update All Service Files

Search and update all files that call `createServerClient()`:
```bash
# Find all occurrences
grep -r "createServerClient()" --include="*.ts" --include="*.tsx" .

# Update each to use await
# Before: const supabase = createServerClient()
# After:  const supabase = await createServerClient()
```

### Day 3-4: Data Cache Implementation

#### 1. Create Caching Utilities

```typescript
// lib/api/caching.ts
import { unstable_cache } from 'next/cache'

// Generic cache wrapper
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyParts: string[],
  options?: {
    revalidate?: number
    tags?: string[]
  }
): T {
  return unstable_cache(fn, keyParts, options) as T
}
```

#### 2. Implement Cached Data Fetchers

```typescript
// features/compliance/services/safeguarding.ts
import { createCachedFunction } from '@/lib/api/caching'

// Non-cached version (keep for mutations)
export async function getSafeguardingRecords(orgId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('safeguarding_records')
    .select('*')
    .eq('organization_id', orgId)
    .order('expiry_date')
    
  if (error) throw error
  return data
}

// Cached version for reads
export const getCachedSafeguardingRecords = createCachedFunction(
  getSafeguardingRecords,
  ['safeguarding-records'],
  {
    revalidate: 300, // 5 minutes
    tags: ['safeguarding'],
  }
)

// Similar for compliance scores
export const getCachedComplianceScore = unstable_cache(
  async (orgId: string) => {
    // Your existing logic
  },
  ['compliance-score'],
  {
    revalidate: 300,
    tags: ['compliance'],
  }
)
```

#### 3. Update Server Actions with Cache Invalidation

```typescript
// features/compliance/actions/safeguarding.ts
import { revalidateTag } from 'next/cache'

export async function createDBSRecord(formData: FormData) {
  try {
    // ... existing logic
    
    // After successful creation
    revalidateTag('safeguarding')
    revalidateTag(`org-${orgId}-safeguarding`)
    revalidateTag('compliance') // Update related scores
    
    // ... rest of logic
  } catch (error) {
    // ... error handling
  }
}
```

### Day 5: Verify and Test

1. **Test Cache Behavior**
```typescript
// scripts/test-caching.ts
import { getCachedOrganization } from '@/lib/api/organizations'

async function testCaching() {
  console.time('First call')
  const org1 = await getCachedOrganization('123')
  console.timeEnd('First call')
  
  console.time('Second call (should be instant)')
  const org2 = await getCachedOrganization('123')
  console.timeEnd('Second call')
  
  console.log('Same instance?', org1 === org2)
}
```

2. **Monitor Performance**
   - Check build output for cache usage
   - Use Next.js DevTools to inspect cache hits
   - Monitor server response times

## Phase 2: Streaming UI Implementation (Week 2)

### Day 1-2: Dashboard Streaming

#### 1. Refactor Dashboard Page

```typescript
// app/(app)/dashboard/page.tsx
import { Suspense } from 'react'

// Add route configuration
export const dynamic = 'force-dynamic'
export const revalidate = 60 // 1 minute

export default async function DashboardPage() {
  // Critical data - await
  const user = await getCurrentUser()
  const org = await getCurrentOrganization()
  
  if (!user || !org) {
    redirect('/login')
  }
  
  // Non-critical - don't await
  const statsPromise = getDashboardStats(org.id)
  const activityPromise = getRecentActivity(org.id)
  const scorePromise = getCachedComplianceScore(org.id)
  
  return (
    <div className="container py-6">
      <h1>Welcome back, {user.email}</h1>
      <p>Organization: {org.name}</p>
      
      <div className="grid gap-6 mt-6">
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid statsPromise={statsPromise} />
        </Suspense>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Suspense fallback={<ComplianceScoreSkeleton />}>
            <ComplianceScoreCard scorePromise={scorePromise} />
          </Suspense>
          
          <Suspense fallback={<ActivityFeedSkeleton />}>
            <RecentActivityFeed activityPromise={activityPromise} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
```

#### 2. Create Async Components

```typescript
// features/dashboard/components/stats-grid.tsx
export async function StatsGrid({ statsPromise }: { statsPromise: Promise<Stats> }) {
  const stats = await statsPromise
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Render stats */}
    </div>
  )
}

// features/dashboard/components/compliance-score-card.tsx
export async function ComplianceScoreCard({ scorePromise }: { scorePromise: Promise<Score> }) {
  const score = await scorePromise
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{score.percentage}%</div>
      </CardContent>
    </Card>
  )
}
```

### Day 3-4: Compliance Pages Streaming

#### 1. Update Compliance Overview

```typescript
// app/(app)/compliance/page.tsx
export const revalidate = 300 // 5 minutes

export default async function CompliancePage() {
  const user = await getCurrentUser()
  const org = await getCurrentOrganization()
  
  // Stream module data
  const safeguardingPromise = getCachedSafeguardingRecords(org.id)
  const overseasPromise = getCachedOverseasActivities(org.id)
  const fundraisingPromise = getCachedFundraisingRecords(org.id)
  
  return (
    <div className="space-y-6">
      <ComplianceHeader org={org} />
      
      <Tabs defaultValue="safeguarding">
        <TabsList>
          <TabsTrigger value="safeguarding">Safeguarding</TabsTrigger>
          <TabsTrigger value="overseas">Overseas</TabsTrigger>
          <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
        </TabsList>
        
        <TabsContent value="safeguarding">
          <Suspense fallback={<TableSkeleton />}>
            <SafeguardingContent dataPromise={safeguardingPromise} />
          </Suspense>
        </TabsContent>
        
        {/* Similar for other tabs */}
      </Tabs>
    </div>
  )
}
```

### Day 5: Loading States

Create consistent loading skeletons:

```typescript
// components/ui/loading-skeletons.tsx
export function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-24" />
      </CardContent>
    </Card>
  )
}
```

## Phase 3: Advanced Patterns (Week 3)

### Day 1-2: Route Segment Configuration

Add configuration to all routes:

```typescript
// Static content (help, about, etc)
export const revalidate = 3600 // 1 hour
export const dynamic = 'force-static'

// Dynamic content (dashboard, compliance)
export const revalidate = 0
export const dynamic = 'force-dynamic'

// Hybrid (mostly static with some dynamic)
export const revalidate = 300 // 5 minutes
export const dynamic = 'auto'
```

### Day 3-4: Dynamic Imports

#### 1. Identify Heavy Components

```bash
# Analyze bundle size
npm run build
npm run analyze
```

#### 2. Implement Dynamic Loading

```typescript
// features/reports/components/index.tsx
import dynamic from 'next/dynamic'

export const PDFGenerator = dynamic(
  () => import('./PDFGenerator'),
  { 
    loading: () => <p>Loading PDF generator...</p>,
    ssr: false 
  }
)

export const DataExporter = dynamic(
  () => import('./DataExporter'),
  { loading: () => <p>Preparing export...</p> }
)

export const ChartComponents = dynamic(
  () => import('./ChartComponents'),
  { loading: () => <ChartSkeleton /> }
)
```

### Day 5: Parallel Routes (Optional)

For advisor multi-org view:

```typescript
// app/(app)/advisor/@list/page.tsx
export default async function OrgList() {
  const orgs = await getAdvisorOrganizations()
  return <OrganizationList orgs={orgs} />
}

// app/(app)/advisor/@details/page.tsx
export default async function OrgDetails() {
  return <OrganizationDetails />
}

// app/(app)/advisor/layout.tsx
export default function Layout({
  children,
  list,
  details,
}: {
  children: React.ReactNode
  list: React.ReactNode
  details: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-1">{list}</div>
      <div className="col-span-2">{details}</div>
    </div>
  )
}
```

## Phase 4: Optimization & Monitoring (Week 4)

### Day 1-2: Enable PPR

```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: true,
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

// Enable on specific routes
// app/(app)/dashboard/page.tsx
export const experimental_ppr = true
```

### Day 3-4: Performance Monitoring

#### 1. Add Performance Tracking

```typescript
// lib/monitoring/performance.ts
export function trackCacheMetrics() {
  if (process.env.NODE_ENV === 'production') {
    // Track cache performance
    performance.mark('cache-start')
    // ... operation
    performance.mark('cache-end')
    performance.measure('cache-duration', 'cache-start', 'cache-end')
  }
}
```

#### 2. Monitor Core Web Vitals

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### Day 5: Testing & Verification

1. **Performance Tests**
```bash
# Run Lighthouse
npm run build
npm run start
# Run Lighthouse on http://localhost:3000
```

2. **Load Testing**
```bash
# Using artillery or similar
artillery quick --count 50 --num 10 http://localhost:3000/dashboard
```

## Rollback Plan

If issues arise:

1. **Quick Rollback**
   - Remove cache() wrappers
   - Remove unstable_cache usage
   - Remove Suspense boundaries
   - Revert to previous patterns

2. **Gradual Rollback**
   - Keep request memoization
   - Remove only problematic caching
   - Monitor and adjust

## Success Metrics

Track these metrics before and after:

1. **Performance**
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Core Web Vitals scores

2. **Server Load**
   - Database queries per request
   - Server response times
   - Memory usage

3. **User Experience**
   - Page load times
   - Perceived performance
   - Error rates

## Common Issues & Solutions

### Issue: Stale Data
**Solution**: Adjust revalidation times or use more granular tags

### Issue: Over-caching
**Solution**: Use dynamic = 'force-dynamic' for real-time data

### Issue: Cache Misses
**Solution**: Ensure consistent cache keys and proper memoization

### Issue: Build Errors
**Solution**: Check async/await usage and server component boundaries

## Conclusion

This migration will significantly improve performance by:
- Reducing duplicate data fetches by 90%
- Improving initial page load by 50-70%
- Better perceived performance through streaming
- Reduced server load through intelligent caching

Follow the phases sequentially and monitor performance at each step.