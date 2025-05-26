# Day 1 Frontend Component Hierarchy & Implementation Guide

## 🎯 Goal: Foundation UI with Landing, Auth, and Dashboard Shell

## 📁 File Structure to Create

```
charity-prep/
├── app/
│   ├── (marketing)/              # Public pages
│   │   ├── layout.tsx           # Marketing layout
│   │   └── page.tsx             # Landing page (moved from root)
│   ├── (auth)/                  # Auth pages  
│   │   ├── layout.tsx          # Minimal auth layout
│   │   ├── login/
│   │   │   └── page.tsx        # Magic link login
│   │   ├── verify/
│   │   │   └── page.tsx        # Check email page
│   │   └── callback/
│   │       └── page.tsx        # Auth callback handler
│   ├── (app)/                   # Protected app pages
│   │   ├── layout.tsx          # App shell with sidebar
│   │   └── dashboard/
│   │       └── page.tsx        # Main dashboard
│   ├── layout.tsx              # Root layout (fonts, providers)
│   ├── globals.css             # Ethereal design tokens
│   └── not-found.tsx           # 404 page
│
├── components/
│   ├── ui/                      # Shadcn components (customized)
│   ├── layout/
│   │   ├── site-header.tsx     # Marketing header
│   │   ├── site-footer.tsx     # Marketing footer
│   │   ├── sidebar.tsx         # App navigation
│   │   ├── mobile-nav.tsx      # Mobile menu
│   │   └── user-menu.tsx       # Avatar dropdown
│   ├── marketing/
│   │   ├── hero.tsx            # Hero section
│   │   ├── risk-calculator.tsx # Year-end calculator
│   │   ├── social-proof.tsx    # Stats section
│   │   ├── features.tsx        # Feature cards
│   │   ├── pricing.tsx         # Pricing tiers
│   │   └── cta-section.tsx     # Bottom CTA
│   └── common/
│       ├── logo.tsx            # Brand logo
│       ├── loading.tsx         # Spinner/skeleton
│       └── error-fallback.tsx  # Error boundary UI
│
├── features/
│   ├── auth/
│   │   └── components/
│   │       ├── login-form.tsx  # Email input form
│   │       └── verify-message.tsx # Email sent UI
│   └── compliance/
│       └── components/
│           ├── compliance-score.tsx # Big circle score
│           ├── risk-radar.tsx      # 4 risk cards
│           └── urgent-actions.tsx  # Action items
│
└── stores/
    ├── ui-store.ts             # Global UI state
    └── auth-store.ts           # Auth state
```

## 🎨 Design System Implementation

### 1. Update `tailwind.config.ts`
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Ethereal Primary Colors
        inchworm: {
          DEFAULT: '#B1FA63',
          dark: '#9FE050', // -10% lightness for hover
        },
        gunmetal: {
          DEFAULT: '#243837',
          light: '#2F4645', // +10% lightness
        },
        // Secondary Colors
        orange: {
          DEFAULT: '#FE7733',
          light: '#FF8A4C',
          dark: '#E56420',
        },
        'pale-violet': {
          DEFAULT: '#B2A1FF',
          light: '#C5B8FF',
          dark: '#9F8AFF',
        },
        // Grays
        'american-silver': '#D1D1D1',
        // Extended palette
        gray: {
          100: '#F8F8F8',
          200: '#EFEFEF', 
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        }
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.08em', // Global letter spacing
      },
      spacing: {
        '3xs': '2px',
        '2xs': '4px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        full: '9999px',
      },
      boxShadow: {
        'low': '0 1px 2px rgba(36, 56, 55, 0.05)',
        'medium': '0 4px 8px rgba(36, 56, 55, 0.08)',
        'high': '0 8px 16px rgba(36, 56, 55, 0.12)',
        'overlay': '0 16px 32px rgba(36, 56, 55, 0.16)',
      },
      animation: {
        'pulse-inchworm': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
}
```

### 2. Update `globals.css`
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Ethereal Colors */
    --color-inchworm: #B1FA63;
    --color-gunmetal: #243837;
    --color-orange: #FE7733;
    --color-pale-violet: #B2A1FF;
    
    /* Functional Colors */
    --color-background: #FFFFFF;
    --color-surface: #F8F8F8;
    --color-text-primary: #243837;
    --color-text-secondary: #757575;
    --color-border: #E0E0E0;
    
    /* Spacing */
    --space-unit: 8px;
    
    /* Animation */
    --duration-instant: 100ms;
    --duration-quick: 200ms;
    --duration-standard: 300ms;
    --duration-dramatic: 500ms;
  }
  
  * {
    letter-spacing: -0.08em;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-bold;
  }
}

@layer components {
  .btn-primary {
    @apply bg-inchworm text-gunmetal hover:bg-inchworm-dark 
           px-xl py-md rounded-md font-medium
           transition-all duration-quick
           hover:shadow-medium active:scale-95;
  }
  
  .btn-secondary {
    @apply border border-inchworm text-inchworm 
           hover:bg-inchworm hover:bg-opacity-10
           px-xl py-md rounded-md font-medium
           transition-all duration-quick;
  }
  
  .btn-tertiary {
    @apply text-gunmetal hover:bg-gray-200
           px-lg py-sm rounded-md
           transition-all duration-quick;
  }
  
  .card {
    @apply bg-white border border-gray-300 rounded-lg
           hover:shadow-medium hover:border-inchworm
           transition-all duration-quick p-lg;
  }
}
```

## 🔄 Implementation Order

### Phase 1: Core Setup (30 mins)
1. Configure Tailwind with Ethereal colors ✓
2. Set up global CSS with design tokens ✓
3. Install and customize Shadcn components ✓
4. Create base layout components ✓

### Phase 2: Landing Page (2 hours)
```
Order of Implementation:
1. (marketing)/layout.tsx - Basic shell
2. components/layout/site-header.tsx - Navigation
3. components/marketing/hero.tsx - Hero section
4. components/marketing/risk-calculator.tsx - Interactive calculator
5. components/marketing/social-proof.tsx - Stats
6. components/marketing/features.tsx - Feature grid
7. components/marketing/pricing.tsx - Pricing cards
8. (marketing)/page.tsx - Compose all sections
```

### Phase 3: Auth Flow (1.5 hours)
```
Order of Implementation:
1. (auth)/layout.tsx - Centered layout
2. features/auth/components/login-form.tsx - Email form
3. (auth)/login/page.tsx - Login page
4. features/auth/components/verify-message.tsx - Check email UI
5. (auth)/verify/page.tsx - Verify page
6. (auth)/callback/page.tsx - Handle magic link
```

### Phase 4: App Shell (2 hours)
```
Order of Implementation:
1. stores/ui-store.ts - Sidebar state
2. components/layout/sidebar.tsx - Navigation sidebar
3. (app)/layout.tsx - App shell with sidebar
4. features/compliance/components/compliance-score.tsx - Score widget
5. features/compliance/components/risk-radar.tsx - Risk cards
6. (app)/dashboard/page.tsx - Compose dashboard
```

### Phase 5: Mobile & Polish (1.5 hours)
```
Order of Implementation:
1. components/layout/mobile-nav.tsx - Mobile menu
2. Responsive adjustments for all pages
3. Loading states and skeletons
4. Error boundaries
5. Final testing and deployment
```

## 🧩 Key Component Examples

### Hero Section Structure
```tsx
// components/marketing/hero.tsx
<section className="bg-white py-4xl">
  <div className="container max-w-6xl mx-auto px-lg">
    <div className="grid lg:grid-cols-2 gap-3xl items-center">
      <div>
        <h1 className="text-5xl font-bold text-gunmetal mb-lg">
          Annual Return Stress?
          <span className="text-inchworm block">Sorted in minutes.</span>
        </h1>
        <p className="text-xl text-gray-600 mb-xl">
          Stop panicking about compliance. Track everything the 
          Charity Commission needs, all year round.
        </p>
        <button className="btn-primary text-lg">
          Start 30-Day Free Trial
        </button>
        <p className="text-sm text-gray-500 mt-sm">
          No credit card required • 5 minute setup
        </p>
      </div>
      <RiskCalculator />
    </div>
  </div>
</section>
```

### Dashboard Layout Pattern
```tsx
// (app)/dashboard/page.tsx
<div className="p-xl space-y-xl">
  {/* Header */}
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-gunmetal">
        Welcome back, Sarah
      </h1>
      <p className="text-gray-600">
        Your compliance status at a glance
      </p>
    </div>
    <Button variant="primary">Generate Report</Button>
  </div>
  
  {/* Compliance Score Hero */}
  <ComplianceScore score={73} />
  
  {/* Risk Radar Grid */}
  <RiskRadar />
  
  {/* Urgent Actions */}
  <UrgentActions />
</div>
```

## ✅ Day 1 Deliverables Checklist

### Must Have (Core Foundation)
- [ ] Ethereal design system configured
- [ ] Landing page with all sections
- [ ] Login/verify auth flow
- [ ] Basic dashboard with mock data
- [ ] Responsive layouts
- [ ] Deployed to Vercel

### Nice to Have (If Time Permits)
- [ ] Loading animations
- [ ] Micro-interactions
- [ ] Advanced mobile optimizations
- [ ] Additional marketing pages

## 🚀 Quick Start Commands

```bash
# Install all Shadcn components at once
npx shadcn@latest add alert badge button card checkbox dialog \
  dropdown-menu form input label popover select separator \
  sheet skeleton table tabs textarea toast avatar command

# Create folder structure
mkdir -p app/{marketing,auth,app} 
mkdir -p components/{layout,marketing,common}
mkdir -p features/{auth,compliance}/components
mkdir -p stores

# Start development
npm run dev
```

## 📝 Notes for Tomorrow (Day 2)

Based on Day 1 foundation, Day 2 will focus on:
1. Implementing real Supabase auth
2. Building out compliance CRUD modules
3. Connecting to database
4. Adding real-time features

The solid UI foundation from Day 1 will make Day 2's feature implementation much smoother!