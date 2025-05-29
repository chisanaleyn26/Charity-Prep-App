# Day 2 - Compliance Modules Implementation Plan

## 🎯 Goal: Build Core Compliance Features with Real Data

Building on Day 1's UI foundation and Supabase setup, Day 2 focuses on implementing the three core compliance modules that provide immediate value to charities.

## Prerequisites from Day 1 ✅
- [x] Supabase database schema created
- [x] Authentication flow UI ready
- [x] Dashboard shell with mock data
- [x] Ethereal design system implemented

## Phase 1: Auth Integration (Hour 1) 🔐

### 1.1 Supabase Auth Setup
- [x] Create `lib/supabase/client.ts` - Browser client
- [x] Create `lib/supabase/server.ts` - Server client with cookies
- [x] Create `lib/supabase/middleware.ts` - Auth middleware
- [x] Update `middleware.ts` - Protect `/app/*` routes

### 1.2 Auth Flow Implementation
- [x] Connect login form to Supabase magic link
- [x] Implement auth callback handler
- [x] Add user to `users` table on first login
- [x] Create organization setup flow for new users
- [x] Update auth store with real user data

### 1.3 Session Management
- [x] Implement auth state listener
- [x] Handle session refresh
- [x] Add logout functionality
- [x] Test protected route access

## Phase 2: Safeguarding Module (Hours 2-3) 🛡️

### 2.1 Database Integration
- [x] Generate TypeScript types from Supabase
  ```bash
  npx supabase gen types typescript --project-id rovdrincpttusrppftai > types/database.ts
  ```
- [x] Create `features/compliance/types/safeguarding.ts`
- [x] Define Zod schemas for validation

### 2.2 Server Actions
- [x] Create `features/compliance/actions/safeguarding.ts`
  - [x] `createDBSRecord(formData: FormData)`
  - [x] `updateDBSRecord(id: string, formData: FormData)`
  - [x] `deleteDBSRecord(id: string)`
  - [x] `bulkUpdateExpiredStatus()`

### 2.3 Data Fetching Services
- [x] Create `features/compliance/services/safeguarding.ts`
  - [x] `getSafeguardingRecords()` - With expiry sorting
  - [x] `getExpiringRecords(days: number)`
  - [x] `getComplianceStats()`

### 2.4 UI Components
- [x] Create `app/(app)/compliance/safeguarding/page.tsx`
- [x] Build `features/compliance/components/safeguarding/dbs-table.tsx`
  - [x] Sortable columns
  - [x] Status badges (Valid/Expiring/Expired)
  - [x] Search/filter functionality
  - [x] Bulk selection

- [x] Build `features/compliance/components/safeguarding/dbs-form.tsx`
  - [x] Person name input
  - [x] DBS number (12 digits validation)
  - [x] Issue/expiry date pickers
  - [x] Role selection
  - [x] Department field

- [x] Build `features/compliance/components/safeguarding/expiry-status.tsx`
  - [x] Color-coded badges
  - [x] Days remaining calculation
  - [x] Urgency indicators

### 2.5 Real-time Updates
- [x] Implement Supabase real-time subscription
- [x] Auto-refresh on record changes
- [x] Show notification on updates

## Phase 3: Overseas Activities Module (Hours 3-4) 🌍

### 3.1 Server Actions
- [x] Create `features/compliance/actions/overseas.ts`
  - [x] `createOverseasActivity(formData: FormData)`
  - [x] `updateOverseasActivity(id: string, formData: FormData)`
  - [x] `deleteOverseasActivity(id: string)`
  - [x] `createPartner(formData: FormData)`

### 3.2 Data Services
- [x] Create `features/compliance/services/overseas.ts`
  - [x] `getOverseasActivities(year?: number)`
  - [x] `getCountryBreakdown()`
  - [x] `getPartners()`
  - [x] `getTransferMethodStats()`

### 3.3 UI Components
- [x] Create `app/(app)/compliance/overseas/page.tsx`
- [x] Build `features/compliance/components/overseas/activity-form.tsx`
  - [x] Country dropdown (with risk flags)
  - [x] Partner selection/creation
  - [x] Amount with currency conversion
  - [x] Transfer method selection
  - [x] Warning for non-bank transfers

- [x] Build `features/compliance/components/overseas/country-map.tsx`
  - [x] Interactive world map
  - [x] Country coloring by spend
  - [x] Hover tooltips
  - [x] Click for details

- [x] Build `features/compliance/components/overseas/activity-list.tsx`
  - [x] Filter by country/year
  - [x] Transfer method badges
  - [x] Risk indicators
  - [x] Total calculations

## Phase 4: Fundraising Module (Hours 4-5) 💰

### 4.1 Server Actions
- [x] Create `features/compliance/actions/fundraising.ts`
  - [x] `createIncomeRecord(formData: FormData)`
  - [x] `updateIncomeRecord(id: string, formData: FormData)`
  - [x] `deleteIncomeRecord(id: string)`
  - [x] `markAsRelatedParty(id: string, relationship: string)`

### 4.2 Data Services
- [x] Create `features/compliance/services/fundraising.ts`
  - [x] `getIncomeRecords(year?: number)`
  - [x] `getIncomeBySource()`
  - [x] `getMajorDonations()`
  - [x] `getRelatedPartyTransactions()`

### 4.3 UI Components
- [x] Create `app/(app)/compliance/fundraising/page.tsx`
- [x] Build `features/compliance/components/fundraising/income-form.tsx`
  - [x] Income source dropdown
  - [x] Amount input
  - [x] Donor information
  - [x] Gift Aid checkbox
  - [x] Restricted funds toggle

- [x] Build `features/compliance/components/fundraising/income-breakdown.tsx`
  - [x] Pie chart by source
  - [x] Year-over-year comparison
  - [x] Major donor highlights

- [x] Build `features/compliance/components/fundraising/donor-list.tsx`
  - [x] Sortable by amount
  - [x] Related party flags
  - [x] Anonymous handling

## Phase 5: Compliance Score Calculator (Hours 5-6) 📊

### 5.1 Score Calculation Service
- [x] Create `features/compliance/services/compliance-score.ts`
  - [x] Real calculation logic:
    ```typescript
    - 40% Safeguarding (% with valid DBS)
    - 30% Overseas (completeness of records)
    - 30% Fundraising (income sources tracked)
    ```
  - [x] Missing data identification
  - [x] Improvement suggestions

### 5.2 Update Dashboard
- [x] Replace mock score with real calculation
- [x] Create `features/compliance/components/score-breakdown.tsx`
- [x] Add drill-down navigation to problem areas
- [x] Implement score history tracking

### 5.3 Risk Radar Updates
- [x] Connect to real compliance data
- [x] Dynamic status calculations
- [x] Quick action buttons
- [x] Missing data alerts

## Phase 6: Document Management (Hours 6-7) 📄

### 6.1 Storage Setup
- [x] Configure Supabase Storage buckets
- [x] Set up storage policies
- [x] Create upload size limits

### 6.2 Document Service
- [x] Create `features/documents/services/document-service.ts`
  - [x] `uploadDocument(file: File, metadata: any)`
  - [x] `linkDocument(docId: string, recordId: string)`
  - [x] `getDocuments(filters: any)`
  - [x] `deleteDocument(id: string)`

### 6.3 UI Components
- [x] Create `app/(app)/documents/page.tsx`
- [x] Build `features/documents/components/document-upload.tsx`
  - [x] Drag & drop zone
  - [x] Progress indicator
  - [x] File type validation
  - [x] Auto-link to records

- [x] Build `features/documents/components/document-list.tsx`
  - [x] Grid/list view toggle
  - [x] Preview thumbnails
  - [x] Download buttons
  - [x] Link indicators

## Phase 7: Notifications System (Hours 7-8) 🔔

### 7.1 Notification Service
- [x] Create `features/notifications/services/notification-service.ts`
  - [x] `createNotification(type: string, data: any)`
  - [x] `markAsRead(id: string)`
  - [x] `getUnreadCount()`

### 7.2 Scheduled Jobs Setup
- [x] Create `app/api/cron/check-expirations/route.ts`
  - [x] Check DBS expiring in 30/60/90 days
  - [x] Create notifications for each
  - [x] Send email reminders

### 7.3 UI Components
- [x] Build `features/notifications/components/notification-bell.tsx`
- [x] Build `features/notifications/components/notification-list.tsx`
- [x] Add real-time notification updates
- [x] Toast notifications for urgent items

## Testing & Integration (Hour 8) 🧪

### 8.1 End-to-End Testing
- [x] Test complete DBS workflow
- [x] Test overseas activity with warnings
- [x] Test income tracking with Gift Aid
- [x] Test document upload and linking

### 8.2 Performance Optimization
- [x] Add loading states for all data fetches
- [x] Implement error boundaries
- [x] Add optimistic updates
- [x] Test with large datasets

### 8.3 Deployment
- [x] Update environment variables
- [x] Test production build
- [x] Deploy to Vercel
- [x] Verify all features in production

## Success Criteria ✅

By end of Day 2:
1. ✅ Real authentication working
2. ✅ All 3 compliance modules functional with CRUD
3. ✅ Real compliance score calculating
4. ✅ Document upload working
5. ✅ Basic notifications system
6. ✅ Data persisting in production

## Component Structure Created

```
features/
├── compliance/
│   ├── actions/
│   │   ├── safeguarding.ts
│   │   ├── overseas.ts
│   │   └── fundraising.ts
│   ├── services/
│   │   ├── safeguarding.ts
│   │   ├── overseas.ts
│   │   ├── fundraising.ts
│   │   └── compliance-score.ts
│   ├── components/
│   │   ├── safeguarding/
│   │   │   ├── dbs-table.tsx
│   │   │   ├── dbs-form.tsx
│   │   │   └── expiry-status.tsx
│   │   ├── overseas/
│   │   │   ├── activity-form.tsx
│   │   │   ├── country-map.tsx
│   │   │   └── activity-list.tsx
│   │   └── fundraising/
│   │       ├── income-form.tsx
│   │       ├── income-breakdown.tsx
│   │       └── donor-list.tsx
│   └── types/
│       ├── safeguarding.ts
│       ├── overseas.ts
│       └── fundraising.ts
├── documents/
│   ├── services/
│   │   └── document-service.ts
│   └── components/
│       ├── document-upload.tsx
│       └── document-list.tsx
└── notifications/
    ├── services/
    │   └── notification-service.ts
    └── components/
        ├── notification-bell.tsx
        └── notification-list.tsx
```

## Key Implementation Patterns

### Server Action Pattern
```typescript
'use server'

import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createDBSRecord(formData: FormData) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { error: 'Unauthorized' }
  
  // Validate with Zod
  const validated = DBSRecordSchema.parse({
    person_name: formData.get('person_name'),
    dbs_number: formData.get('dbs_number'),
    // ... etc
  })
  
  const { data, error } = await supabase
    .from('safeguarding_records')
    .insert(validated)
    .select()
    .single()
    
  if (error) return { error: error.message }
  
  revalidatePath('/compliance/safeguarding')
  return { data }
}
```

### Real-time Subscription Pattern
```typescript
'use client'

import { createBrowserClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useRealtimeRecords(table: string) {
  const router = useRouter()
  const supabase = createBrowserClient()
  
  useEffect(() => {
    const channel = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table },
        () => router.refresh()
      )
      .subscribe()
      
    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, router, supabase])
}
```

## Risk Mitigation

If behind schedule:
1. Simplify overseas map (use list view only)
2. Basic notifications (no email)
3. Skip document linking UI
4. Focus on core CRUD operations

## Tomorrow (Day 3)

With compliance modules complete, Day 3 will add the AI magic:
- Email forwarding system
- Document OCR
- Natural language search