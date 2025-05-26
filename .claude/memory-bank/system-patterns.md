# System Patterns

## Code Patterns

[2025-01-26 09:00:00] - Server Component Data Fetching
**Description**: Fetch data directly in Server Components
**Usage**: Default pattern for all data display
**Example**:
```typescript
// app/(app)/dashboard/page.tsx
export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('table').select('*')
  return <Dashboard data={data} />
}
```

[2025-01-26 09:00:00] - Server Action Pattern
**Description**: Handle mutations with Server Actions
**Usage**: All form submissions and data updates
**Example**:
```typescript
// actions/create-record.ts
'use server'
export async function createRecord(formData: FormData) {
  const validated = Schema.parse(Object.fromEntries(formData))
  const supabase = createServerClient()
  const { data, error } = await supabase.from('table').insert(validated)
  revalidatePath('/path')
  return { success: !error, data }
}
```

[2025-01-26 09:00:00] - Zustand UI Store
**Description**: Client state for UI interactions only
**Usage**: Modals, sidebars, filters, selections
**Example**:
```typescript
// stores/ui-store.ts
export const useUIStore = create((set) => ({
  sidebarOpen: false,
  selectedId: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen }))
}))
```

## Naming Conventions

- **Components**: PascalCase (ComplianceScore.tsx)
- **Actions**: camelCase with verb (createDBSRecord.ts)
- **Stores**: kebab-case with -store suffix (ui-store.ts)
- **Types**: PascalCase for interfaces, camelCase for types
- **API Routes**: RESTful folder structure (/api/compliance/score/route.ts)
- **Database**: snake_case for tables and columns (safeguarding_records)
- **Files**: kebab-case for non-component files (dbs-validation.ts)

## MCP Integration Patterns

[2025-01-26 09:15:00] - MCP Supabase Direct Access
**Description**: Use MCP Supabase integration for direct database operations
**Usage**: Database schema creation, data seeding, direct queries during development
**Example**: Can execute SQL directly through MCP tools rather than through application code

## Development Guidelines

[2025-01-26 09:15:00] - CLAUDE.md Compliance
**Description**: Follow all guidelines in CLAUDE.md
**Key Points**:
- Always read entire files before editing
- Commit early and often at logical milestones
- Never implement dummy code - always implement fully
- Organize code into appropriate files
- Optimize for readability
- Get plan approval before coding
- Look up latest library syntax when unsure