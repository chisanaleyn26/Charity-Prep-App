# Charity Prep - Current Architecture

## Project Structure

```
/home/runner/workspace/
├── app/
│   ├── (app)/
│   │   ├── dashboard/page.tsx (bento-style KPI dashboard)
│   │   └── compliance/
│   │       ├── safeguarding/page.tsx (DBS management)
│   │       ├── overseas-activities/page.tsx (international ops)
│   │       ├── fundraising/page.tsx (campaign tracking)
│   │       └── score/page.tsx (compliance calculator)
│   ├── api/
│   │   └── hello.ts (placeholder)
│   └── _app.tsx
├── features/
│   ├── dashboard/components/ (KPI cards, charts)
│   └── compliance/
│       ├── types/ (Zod schemas, TypeScript interfaces)
│       ├── services/ (data fetching functions)
│       ├── actions/ (server actions for CRUD)
│       └── components/ (UI components by module)
├── components/
│   ├── ui/ (shadcn components)
│   └── layout/ (sidebar, navigation)
├── lib/
│   ├── supabase/ (client/server configuration)
│   ├── utils.ts (utility functions)
│   └── data/countries.ts (country list)
└── styles/ (global CSS, Tailwind config)
```

## Tech Stack Details

### Frontend
- **Next.js 15.2** with App Router
- **React 19** with Server Components
- **TypeScript** for type safety
- **Tailwind CSS v3** with Ethereal design system
- **Shadcn UI** components (textarea, select, etc.)

### Backend
- **Supabase** for database and auth
- **Server Actions** for CRUD operations
- **Row-Level Security** for data protection
- **Zod** for schema validation

### Design System (Ethereal)
```css
Primary: #B1FA63 (Inchworm green)
Dark: #243837 (Gunmetal)
Accents: Sage and Mist color scales
```

## Data Models

### Safeguarding (DBS Records)
```typescript
interface SafeguardingRecord {
  id: string
  person_name: string
  dbs_number?: string
  dbs_type: 'standard' | 'enhanced'
  status: 'valid' | 'expired' | 'pending'
  issue_date: string
  expiry_date: string
  role: string
  department?: string
}
```

### Overseas Activities
```typescript
interface OverseasActivity {
  id: string
  country: string
  activity_type: 'grant_making' | 'service_delivery' | 'fundraising' | 'other'
  annual_spend?: number
  partner_organization?: string
  risk_level?: 'low' | 'medium' | 'high'
  status: 'active' | 'completed' | 'planned'
}
```

### Fundraising Activities
```typescript
interface FundraisingActivity {
  id: string
  activity_name: string
  activity_type: 'event' | 'campaign' | 'regular_giving' | 'major_donor' | 'grant' | 'corporate'
  target_amount: number
  raised_amount: number
  status: 'planning' | 'active' | 'completed' | 'cancelled'
  compliance_checks_completed?: boolean
}
```

## Navigation Structure

### Sidebar Navigation
- Dashboard (overview with KPI cards)
- Safeguarding (/compliance/safeguarding)
- Overseas (/compliance/overseas-activities)
- Fundraising (/compliance/fundraising)
- Compliance Score (/compliance/score)
- Documents (placeholder)
- Reports (placeholder)

### Key Features
- Organization selector in sidebar
- Badge indicators for urgent items
- Tooltips for collapsed sidebar state
- Mobile-responsive design

## API Patterns

### Server Actions
```typescript
'use server'
export async function createRecord(formData: FormData) {
  // Validation with Zod
  // Supabase CRUD operation
  // revalidatePath for cache updates
  return { data/error }
}
```

### Data Fetching
```typescript
export async function getRecords(): Promise<Record[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('table')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}
```

## UI Patterns

### Layout Structure
- Bento-style grids for dashboards
- Consistent card-based layouts
- Modal forms for data entry
- Tables with search/filter capabilities
- Progress indicators and status badges

### Loading States
- Suspense boundaries for all async components
- Skeleton placeholders during loading
- Toast notifications for success/error states

This architecture supports rapid development while maintaining code quality and user experience consistency.