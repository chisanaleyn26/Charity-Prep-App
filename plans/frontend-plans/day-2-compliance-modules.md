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
- [ ] Create `lib/supabase/client.ts` - Browser client
- [ ] Create `lib/supabase/server.ts` - Server client with cookies
- [ ] Create `lib/supabase/middleware.ts` - Auth middleware
- [ ] Update `middleware.ts` - Protect `/app/*` routes

### 1.2 Auth Flow Implementation
- [ ] Connect login form to Supabase magic link
- [ ] Implement auth callback handler
- [ ] Add user to `users` table on first login
- [ ] Create organization setup flow for new users
- [ ] Update auth store with real user data

### 1.3 Session Management
- [ ] Implement auth state listener
- [ ] Handle session refresh
- [ ] Add logout functionality
- [ ] Test protected route access

## Phase 2: Safeguarding Module (Hours 2-3) 🛡️

### 2.1 Database Integration
- [ ] Generate TypeScript types from Supabase
  ```bash
  npx supabase gen types typescript --project-id rovdrincpttusrppftai > types/database.ts
  ```
- [ ] Create `features/compliance/types/safeguarding.ts`
- [ ] Define Zod schemas for validation

### 2.2 Server Actions
- [ ] Create `features/compliance/actions/safeguarding.ts`
  - [ ] `createDBSRecord(formData: FormData)`
  - [ ] `updateDBSRecord(id: string, formData: FormData)`
  - [ ] `deleteDBSRecord(id: string)`
  - [ ] `bulkUpdateExpiredStatus()`

### 2.3 Data Fetching Services
- [ ] Create `features/compliance/services/safeguarding.ts`
  - [ ] `getSafeguardingRecords()` - With expiry sorting
  - [ ] `getExpiringRecords(days: number)`
  - [ ] `getComplianceStats()`

### 2.4 UI Components
- [ ] Create `app/(app)/compliance/safeguarding/page.tsx`
- [ ] Build `features/compliance/components/safeguarding/dbs-table.tsx`
  - [ ] Sortable columns
  - [ ] Status badges (Valid/Expiring/Expired)
  - [ ] Search/filter functionality
  - [ ] Bulk selection

- [ ] Build `features/compliance/components/safeguarding/dbs-form.tsx`
  - [ ] Person name input
  - [ ] DBS number (12 digits validation)
  - [ ] Issue/expiry date pickers
  - [ ] Role selection
  - [ ] Department field

- [ ] Build `features/compliance/components/safeguarding/expiry-status.tsx`
  - [ ] Color-coded badges
  - [ ] Days remaining calculation
  - [ ] Urgency indicators

### 2.5 Real-time Updates
- [ ] Implement Supabase real-time subscription
- [ ] Auto-refresh on record changes
- [ ] Show notification on updates

## Phase 3: Overseas Activities Module (Hours 3-4) 🌍

### 3.1 Server Actions
- [ ] Create `features/compliance/actions/overseas.ts`
  - [ ] `createOverseasActivity(formData: FormData)`
  - [ ] `updateOverseasActivity(id: string, formData: FormData)`
  - [ ] `deleteOverseasActivity(id: string)`
  - [ ] `createPartner(formData: FormData)`

### 3.2 Data Services
- [ ] Create `features/compliance/services/overseas.ts`
  - [ ] `getOverseasActivities(year?: number)`
  - [ ] `getCountryBreakdown()`
  - [ ] `getPartners()`
  - [ ] `getTransferMethodStats()`

### 3.3 UI Components
- [ ] Create `app/(app)/compliance/overseas/page.tsx`
- [ ] Build `features/compliance/components/overseas/activity-form.tsx`
  - [ ] Country dropdown (with risk flags)
  - [ ] Partner selection/creation
  - [ ] Amount with currency conversion
  - [ ] Transfer method selection
  - [ ] Warning for non-bank transfers

- [ ] Build `features/compliance/components/overseas/country-map.tsx`
  - [ ] Interactive world map
  - [ ] Country coloring by spend
  - [ ] Hover tooltips
  - [ ] Click for details

- [ ] Build `features/compliance/components/overseas/activity-list.tsx`
  - [ ] Filter by country/year
  - [ ] Transfer method badges
  - [ ] Risk indicators
  - [ ] Total calculations

## Phase 4: Fundraising Module (Hours 4-5) 💰

### 4.1 Server Actions
- [ ] Create `features/compliance/actions/fundraising.ts`
  - [ ] `createIncomeRecord(formData: FormData)`
  - [ ] `updateIncomeRecord(id: string, formData: FormData)`
  - [ ] `deleteIncomeRecord(id: string)`
  - [ ] `markAsRelatedParty(id: string, relationship: string)`

### 4.2 Data Services
- [ ] Create `features/compliance/services/fundraising.ts`
  - [ ] `getIncomeRecords(year?: number)`
  - [ ] `getIncomeBySource()`
  - [ ] `getMajorDonations()`
  - [ ] `getRelatedPartyTransactions()`

### 4.3 UI Components
- [ ] Create `app/(app)/compliance/fundraising/page.tsx`
- [ ] Build `features/compliance/components/fundraising/income-form.tsx`
  - [ ] Income source dropdown
  - [ ] Amount input
  - [ ] Donor information
  - [ ] Gift Aid checkbox
  - [ ] Restricted funds toggle

- [ ] Build `features/compliance/components/fundraising/income-breakdown.tsx`
  - [ ] Pie chart by source
  - [ ] Year-over-year comparison
  - [ ] Major donor highlights

- [ ] Build `features/compliance/components/fundraising/donor-list.tsx`
  - [ ] Sortable by amount
  - [ ] Related party flags
  - [ ] Anonymous handling

## Phase 5: Compliance Score Calculator (Hours 5-6) 📊

### 5.1 Score Calculation Service
- [ ] Create `features/compliance/services/compliance-score.ts`
  - [ ] Real calculation logic:
    ```typescript
    - 40% Safeguarding (% with valid DBS)
    - 30% Overseas (completeness of records)
    - 30% Fundraising (income sources tracked)
    ```
  - [ ] Missing data identification
  - [ ] Improvement suggestions

### 5.2 Update Dashboard
- [ ] Replace mock score with real calculation
- [ ] Create `features/compliance/components/score-breakdown.tsx`
- [ ] Add drill-down navigation to problem areas
- [ ] Implement score history tracking

### 5.3 Risk Radar Updates
- [ ] Connect to real compliance data
- [ ] Dynamic status calculations
- [ ] Quick action buttons
- [ ] Missing data alerts

## Phase 6: Document Management (Hours 6-7) 📄

### 6.1 Storage Setup
- [ ] Configure Supabase Storage buckets
- [ ] Set up storage policies
- [ ] Create upload size limits

### 6.2 Document Service
- [ ] Create `features/documents/services/document-service.ts`
  - [ ] `uploadDocument(file: File, metadata: any)`
  - [ ] `linkDocument(docId: string, recordId: string)`
  - [ ] `getDocuments(filters: any)`
  - [ ] `deleteDocument(id: string)`

### 6.3 UI Components
- [ ] Create `app/(app)/documents/page.tsx`
- [ ] Build `features/documents/components/document-upload.tsx`
  - [ ] Drag & drop zone
  - [ ] Progress indicator
  - [ ] File type validation
  - [ ] Auto-link to records

- [ ] Build `features/documents/components/document-list.tsx`
  - [ ] Grid/list view toggle
  - [ ] Preview thumbnails
  - [ ] Download buttons
  - [ ] Link indicators

## Phase 7: Notifications System (Hours 7-8) 🔔

### 7.1 Notification Service
- [ ] Create `features/notifications/services/notification-service.ts`
  - [ ] `createNotification(type: string, data: any)`
  - [ ] `markAsRead(id: string)`
  - [ ] `getUnreadCount()`

### 7.2 Scheduled Jobs Setup
- [ ] Create `app/api/cron/check-expirations/route.ts`
  - [ ] Check DBS expiring in 30/60/90 days
  - [ ] Create notifications for each
  - [ ] Send email reminders

### 7.3 UI Components
- [ ] Build `features/notifications/components/notification-bell.tsx`
- [ ] Build `features/notifications/components/notification-list.tsx`
- [ ] Add real-time notification updates
- [ ] Toast notifications for urgent items

## Testing & Integration (Hour 8) 🧪

### 8.1 End-to-End Testing
- [ ] Test complete DBS workflow
- [ ] Test overseas activity with warnings
- [ ] Test income tracking with Gift Aid
- [ ] Test document upload and linking

### 8.2 Performance Optimization
- [ ] Add loading states for all data fetches
- [ ] Implement error boundaries
- [ ] Add optimistic updates
- [ ] Test with large datasets

### 8.3 Deployment
- [ ] Update environment variables
- [ ] Test production build
- [ ] Deploy to Vercel
- [ ] Verify all features in production

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
- CSV import with AI mapping
- Natural language search