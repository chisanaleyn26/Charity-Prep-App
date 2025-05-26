# Charity Prep - Project Structure

## Overview

This structure is optimized for:

- **5-day AI-accelerated development**
- **Parallel development** (multiple devs/AI sessions)
- **Feature-based organization** (not layer-based)
- **Next.js 14 App Router** best practices
- **Type safety** throughout
- **Quick navigation** for AI tools

## Root Directory Structure

```
charity-prep/
├── app/                      # Next.js 14 App Router
├── components/               # Shared components
├── features/                 # Feature modules (main logic)
├── lib/                      # Core utilities
├── hooks/                    # Custom React hooks
├── services/                 # External service integrations
├── store/                    # Zustand state management
├── types/                    # TypeScript type definitions
├── styles/                   # Global styles
├── public/                   # Static assets
├── supabase/                 # Database migrations & types
├── tests/                    # Test files
└── config/                   # Configuration files

```

## Detailed Structure

### `/app` - Next.js App Router

```
app/
├── (auth)/                   # Auth layout group
│   ├── login/
│   │   └── page.tsx         # Magic link login
│   ├── verify/
│   │   └── page.tsx         # Email verification
│   └── layout.tsx           # Minimal auth layout
│
├── (app)/                    # Main app layout group
│   ├── layout.tsx           # Sidebar + main layout
│   ├── dashboard/
│   │   └── page.tsx         # Main dashboard
│   ├── compliance/
│   │   ├── page.tsx         # Compliance overview
│   │   ├── safeguarding/
│   │   │   ├── page.tsx     # DBS tracker
│   │   │   └── [id]/
│   │   │       └── page.tsx # Edit DBS record
│   │   ├── overseas/
│   │   │   └── page.tsx     # International activities
│   │   └── fundraising/
│   │       └── page.tsx     # Income tracking
│   ├── documents/
│   │   └── page.tsx         # Document vault
│   ├── reports/
│   │   ├── page.tsx         # Reports list
│   │   ├── annual-return/
│   │   │   └── page.tsx     # AR generator
│   │   └── board-pack/
│   │       └── page.tsx     # Board report generator
│   ├── settings/
│   │   └── page.tsx         # Org settings
│   └── advisor/              # Multi-charity portal
│       └── page.tsx
│
├── api/                      # API routes
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts     # Send magic link
│   │   └── callback/
│   │       └── route.ts     # Handle auth callback
│   ├── compliance/
│   │   ├── score/
│   │   │   └── route.ts     # Calculate compliance score
│   │   └── export/
│   │       └── route.ts     # Export compliance data
│   ├── ai/
│   │   ├── extract/
│   │   │   └── route.ts     # Document extraction
│   │   ├── generate/
│   │   │   └── route.ts     # Report generation
│   │   └── chat/
│   │       └── route.ts     # Q&A endpoint
│   ├── import/
│   │   ├── csv/
│   │   │   └── route.ts     # CSV import
│   │   └── email/
│   │       └── route.ts     # Email ingestion
│   ├── webhooks/
│   │   ├── paddle/
│   │   │   └── route.ts     # Payment webhooks
│   │   └── email/
│   │       └── route.ts     # Inbound email
│   └── cron/
│       ├── reminders/
│       │   └── route.ts     # Send reminders
│       └── digest/
│           └── route.ts     # Weekly digest
│
├── layout.tsx                # Root layout
├── page.tsx                  # Landing page
├── loading.tsx               # Global loading
├── error.tsx                 # Global error
├── not-found.tsx            # 404 page
└── globals.css              # Global styles

```

### `/features` - Feature Modules

```
features/
├── auth/
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   └── MagicLinkSent.tsx
│   ├── hooks/
│   │   └── useAuth.ts
│   └── utils/
│       └── session.ts
│
├── compliance/
│   ├── components/
│   │   ├── ComplianceScore.tsx
│   │   ├── RiskRadar.tsx
│   │   └── UrgentActions.tsx
│   ├── safeguarding/
│   │   ├── components/
│   │   │   ├── DBSTable.tsx
│   │   │   ├── DBSForm.tsx
│   │   │   └── ExpiryBadge.tsx
│   │   ├── hooks/
│   │   │   └── useSafeguarding.ts
│   │   └── utils/
│   │       └── dbs-validation.ts
│   ├── overseas/
│   │   ├── components/
│   │   │   ├── CountryMap.tsx
│   │   │   ├── ActivityList.tsx
│   │   │   └── TransferMethodBadge.tsx
│   │   └── hooks/
│   │       └── useOverseas.ts
│   └── fundraising/
│       ├── components/
│       │   ├── IncomeBreakdown.tsx
│       │   └── DonorForm.tsx
│       └── hooks/
│           └── useFundraising.ts
│
├── documents/
│   ├── components/
│   │   ├── DocumentUpload.tsx
│   │   ├── DocumentList.tsx
│   │   └── DocumentPreview.tsx
│   ├── hooks/
│   │   └── useDocuments.ts
│   └── utils/
│       └── file-upload.ts
│
├── reports/
│   ├── components/
│   │   ├── ReportPreview.tsx
│   │   └── ExportOptions.tsx
│   ├── annual-return/
│   │   ├── components/
│   │   │   └── ARMappingView.tsx
│   │   └── utils/
│   │       └── ar-generator.ts
│   └── board-pack/
│       ├── components/
│       │   └── TemplateSelector.tsx
│       └── utils/
│           └── narrative-generator.ts
│
├── ai/
│   ├── components/
│   │   ├── MagicImport.tsx
│   │   ├── ExtractionPreview.tsx
│   │   └── ComplianceChat.tsx
│   ├── hooks/
│   │   ├── useExtraction.ts
│   │   └── useGeneration.ts
│   └── utils/
│       ├── prompts.ts
│       └── extraction-parser.ts
│
└── subscription/
    ├── components/
    │   ├── PricingTiers.tsx
    │   ├── UpgradePrompt.tsx
    │   └── UsageIndicator.tsx
    ├── hooks/
    │   └── useSubscription.ts
    └── utils/
        └── limits.ts

```

### `/components` - Shared UI Components

```
components/
├── ui/                       # Shadcn components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── form.tsx
│   ├── input.tsx
│   ├── table.tsx
│   └── ... (all shadcn)
│
├── layout/
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── MobileNav.tsx
│   └── Footer.tsx
│
├── common/
│   ├── LoadingSpinner.tsx
│   ├── ErrorBoundary.tsx
│   ├── EmptyState.tsx
│   ├── ProgressRing.tsx
│   └── StatusBadge.tsx
│
└── charts/
    ├── ComplianceChart.tsx
    ├── SpendingMap.tsx
    └── TrendLine.tsx

```

### `/lib` - Core Utilities

```
lib/
├── supabase/
│   ├── client.ts            # Browser client
│   ├── server.ts            # Server client
│   ├── middleware.ts        # Auth middleware
│   └── types.ts             # Generated types
│
├── api/
│   ├── client.ts            # API client wrapper
│   ├── errors.ts            # Error handling
│   └── fetcher.ts           # SWR/React Query fetcher
│
├── utils/
│   ├── constants.ts         # App constants
│   ├── dates.ts             # Date utilities
│   ├── currency.ts          # Money formatting
│   ├── validation.ts        # Zod schemas
│   └── cn.ts                # Classname helper
│
└── config/
    ├── site.ts              # Site metadata
    ├── navigation.ts        # Nav structure
    └── features.ts          # Feature flags

```

### `/services` - External Services

```
services/
├── ai/
│   ├── openai.ts            # OpenAI integration
│   ├── anthropic.ts         # Claude integration
│   ├── embeddings.ts        # Vector search
│   └── prompts/
│       ├── extraction.ts
│       ├── generation.ts
│       └── qa.ts
│
├── email/
│   ├── resend.ts            # Email sending
│   ├── templates/
│   │   ├── magic-link.tsx
│   │   ├── reminder.tsx
│   │   └── digest.tsx
│   └── inbound.ts           # Email parsing
│
├── storage/
│   ├── upload.ts            # File uploads
│   ├── documents.ts         # Document management
│   └── images.ts            # Image optimization
│
├── export/
│   ├── pdf.ts               # PDF generation
│   ├── csv.ts               # CSV export
│   └── annual-return.ts     # AR format
│
└── payments/
    ├── paddle.ts            # Paddle SDK
    ├── checkout.ts          # Checkout flow
    └── webhooks.ts          # Webhook handlers

```

### `/store` - State Management

```
store/
├── auth.ts                  # Auth state
├── organization.ts          # Current org
├── compliance.ts            # Compliance data
├── ui.ts                    # UI state (modals, etc)
└── index.ts                 # Store configuration

```

### `/types` - TypeScript Definitions

```
types/
├── database.ts              # Supabase schema types
├── api.ts                   # API response types
├── compliance.ts            # Domain types
├── ai.ts                    # AI service types
└── index.ts                 # Re-exports

```

### `/supabase` - Database

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_rls_policies.sql
│   ├── 003_functions.sql
│   └── 004_seed_data.sql
├── functions/              # Edge functions
│   └── calculate-score/
│       └── index.ts
├── seed.sql                # Development data
└── types.ts                # Generated types

```

### `/tests` - Testing

```
tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── compliance.spec.ts
│   └── critical-path.spec.ts
├── unit/
│   ├── utils/
│   └── components/
└── fixtures/
    └── test-data.ts

```

### `/config` - Configuration

```
config/
├── .env.local              # Local environment
├── .env.production         # Production environment
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind + Ethereal UI
├── tsconfig.json           # TypeScript config
└── eslint.config.js        # ESLint rules

```

## File Naming Conventions

### Components

- **PascalCase**: `ComplianceScore.tsx`
- **Suffix with type**: `DBSForm.tsx`, `UserTable.tsx`
- **Index files**: For clean imports `index.ts`

### Utilities & Hooks

- **kebab-case**: `date-utils.ts`, `api-client.ts`
- **Hook prefix**: `useAuth.ts`, `useCompliance.ts`

### API Routes

- **Folder-based**: `/api/compliance/score/route.ts`
- **RESTful naming**: Not `/api/getScore`

### Types

- **PascalCase interfaces**: `interface ComplianceData {}`
- **lowercase types**: `type ApiResponse<T> = {}`
- **UPPER_CASE enums**: `enum COMPLIANCE_STATUS {}`

## Import Organization

```tsx
// 1. React/Next
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// 2. External libraries
import { format } from 'date-fns'
import { z } from 'zod'

// 3. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { api } from '@/lib/api/client'

// 4. Relative imports
import { ComplianceScore } from './ComplianceScore'

// 5. Types
import type { ComplianceData } from '@/types'

```

## Parallel Development Strategy

### Day 1 Assignments

**Developer 1: Foundation**

- `/app` structure
- `/components/ui` setup
- `/lib/supabase` integration
- Authentication flow

**Developer 2: Core Features**

- `/features/compliance`
- Database schema
- Basic CRUD operations

**Developer 3: AI & Import**

- `/features/ai`
- `/services/ai`
- Import flows

### Module Boundaries

Each feature module is self-contained:

- Own components
- Own hooks
- Own utilities
- Own types

This allows AI to work on one module without affecting others.

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# AI Services
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Email
RESEND_API_KEY=
INBOUND_EMAIL_DOMAIN=

# Payments
PADDLE_API_KEY=
PADDLE_PUBLIC_KEY=
PADDLE_WEBHOOK_SECRET=

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_CHAT=
NEXT_PUBLIC_ENABLE_ADVISOR_PORTAL=

```

## Quick Start Commands

```bash
# Clone and setup
git clone [repo]
cd charity-prep
npm install

# Generate types from Supabase
npm run generate:types

# Development
npm run dev         # Start dev server
npm run dev:email   # Email webhook tunnel
npm run studio      # Supabase Studio

# Testing
npm run test:e2e    # Playwright tests
npm run test:unit   # Jest tests

# Production
npm run build       # Production build
npm run start       # Start production

```

## Build Order (5-Day Plan)

### Day 1: Foundation

- `/app/(auth)` - Authentication
- `/app/(app)/layout.tsx` - Main layout
- `/lib/supabase` - Database setup
- `/components/ui` - Shadcn setup

### Day 2: Core Features

- `/features/compliance/*` - All modules
- `/app/(app)/compliance/*` - Pages
- `/store/*` - State management

### Day 3: AI Features

- `/features/ai` - Import/generation
- `/services/ai` - AI integrations
- `/app/api/ai/*` - AI endpoints

### Day 4: Reports & Export

- `/features/reports` - Generators
- `/app/api/export` - Export endpoints
- `/services/export` - PDF/CSV

### Day 5: Polish & Deploy

- `/app/api/webhooks` - Paddle
- `/app/api/cron` - Scheduled jobs
- Error handling
- Production deployment

## Key Architecture Decisions

1. **Feature-based structure** over technical layers for better AI collaboration
2. **App Router** for better performance and layouts
3. **Server Components** by default, Client Components when needed
4. **Route handlers** over API pages for better types
5. **Zustand** over Context for simpler state management
6. **Feature flags** for safe deployment of partial features

This structure supports rapid parallel development while maintaining clean architecture.