# Day 1 Frontend Development Plan - Foundation Sprint

## Overview
Day 1 focuses on establishing the frontend foundation: landing page, authentication flow, and basic app shell with the Ethereal UI design system.

## Prerequisites ✅
- [x] Next.js 15.2 installed
- [x] Shadcn UI configured
- [x] Zustand installed
- [x] Tailwind CSS configured
- [x] Ethereal color system implemented
- [x] Inter font configured

## Phase 1: Design System Setup (Hour 1-2) 🎨

### 1.1 Ethereal Color Configuration
- [x] Update `tailwind.config.ts` with Ethereal colors
  ```typescript
  colors: {
    inchworm: '#B1FA63',
    gunmetal: '#243837',
    orange: '#FE7733',
    'pale-violet': '#B2A1FF',
    'american-silver': '#D1D1D1',
  }
  ```
- [x] Create CSS variables in `globals.css`
- [x] Configure Inter font with -8% letter spacing
- [x] Set up spacing scale (8px base grid)
- [x] Configure border radius system (sm: 4px, md: 8px, lg: 12px)

### 1.2 Shadcn Components Installation
- [x] Install essential components:
  ```bash
  npx shadcn@latest add button card form input label dialog dropdown-menu
  npx shadcn@latest add sheet skeleton table tabs badge toast avatar
  npx shadcn@latest add select separator popover command
  ```
- [x] Customize component themes to match Ethereal design
- [x] Create `components/ui/index.ts` for exports

### 1.3 Global Components Setup
- [x] Create `components/layout/site-header.tsx`
- [x] Create `components/layout/site-footer.tsx`
- [x] Create `components/common/logo.tsx`
- [x] Create `components/common/loading-spinner.tsx`

## Phase 2: Landing Page (Hour 2-3) 🏠

### 2.1 Route Structure
- [x] Create `app/(marketing)/layout.tsx` for marketing pages
- [x] Update `app/page.tsx` as landing page

### 2.2 Landing Page Components
- [x] **Hero Section** (`components/marketing/hero.tsx`)
  - [x] "Annual Return Stress? Sorted in minutes." headline
  - [x] Risk calculator card with year-end date picker
  - [x] CTA button with Inchworm background
  - [x] Trust indicators below CTA

- [x] **Social Proof Section** (`components/marketing/social-proof.tsx`)
  - [x] Stats grid (3 columns)
  - [x] "247 Charities compliant"
  - [x] "92% Average compliance score"
  - [x] "4.8 Trustpilot rating"

- [x] **Features Grid** (`components/marketing/features.tsx`)
  - [x] Compliance tracking card
  - [x] AI-powered import card
  - [x] Report generation card
  - [x] Mobile-friendly card

- [x] **Pricing Section** (`components/marketing/pricing.tsx`)
  - [x] Three tier cards (Essentials, Standard, Premium)
  - [x] Feature comparison
  - [x] Annual pricing display

- [x] **CTA Section** (`components/marketing/cta-section.tsx`)
  - [x] Final call to action
  - [x] Trust badges

### 2.3 Navigation
- [x] Create `components/marketing/nav-bar.tsx`
  - [x] Logo (left)
  - [x] Navigation links (Features, Pricing, About)
  - [x] Login button (tertiary)
  - [x] Start Free Trial button (primary)

## Phase 3: Authentication Pages (Hour 3-4) 🔐

### 3.1 Auth Layout
- [x] Create `app/(auth)/layout.tsx`
  - [x] Minimal layout with centered content
  - [x] Logo at top
  - [x] Grey 100 background

### 3.2 Login Page
- [x] Create `app/(auth)/login/page.tsx`
- [x] Create `features/auth/components/login-form.tsx`
  - [x] Email input field
  - [x] "Send Magic Link" button (primary)
  - [x] "No password needed" helper text
  - [x] Link to landing page

### 3.3 Verify Page
- [x] Create `app/(auth)/verify/page.tsx`
- [x] Create `features/auth/components/verify-message.tsx`
  - [x] Email sent illustration
  - [x] "Check your email" message
  - [x] Resend link option
  - [x] What to do next instructions

### 3.4 Auth Callback
- [x] Create `app/(auth)/callback/page.tsx`
  - [x] Loading state while verifying
  - [x] Redirect logic to dashboard

## Phase 4: App Shell & Dashboard (Hour 4-5) 🏗️

### 4.1 App Layout
- [x] Create `app/(app)/layout.tsx`
  - [x] Sidebar navigation (280px width)
  - [x] Main content area
  - [x] Mobile responsive

### 4.2 Sidebar Component
- [x] Create `components/layout/sidebar.tsx`
  - [x] Gunmetal background
  - [x] White logo
  - [x] Navigation items (Dashboard, Safeguarding, International, Fundraising, Documents, Reports)
  - [x] Selected state with Inchworm background
  - [x] User menu at bottom

### 4.3 Dashboard Page
- [x] Create `app/(app)/dashboard/page.tsx`
- [x] Create dashboard sections:
  - [x] `features/compliance/components/compliance-score.tsx`
  - [x] `features/compliance/components/risk-radar.tsx`
  - [x] `features/compliance/components/urgent-actions.tsx`
  - [x] `features/compliance/components/recent-activity.tsx`

### 4.4 Dashboard Components
- [x] **Compliance Score Card**
  - [x] Gradient background (Gunmetal to Grey 800)
  - [x] Circular progress ring (200px)
  - [x] Percentage in center
  - [x] Status text below

- [x] **Risk Radar Grid**
  - [x] 4-column grid
  - [x] Cards for each compliance area
  - [x] Color-coded icons (Green/Orange/Red)
  - [x] Quick stats

- [x] **Urgent Actions Panel**
  - [x] Orange background banner
  - [x] Warning icon
  - [x] Action items list
  - [x] "Fix Now" buttons

## Phase 5: UI State Management (Hour 5-6) 💾

### 5.1 Global UI Store
- [x] Create `stores/ui-store.ts`
  ```typescript
  - sidebarCollapsed: boolean
  - activeModal: string | null
  - theme: 'light' | 'dark'
  ```

### 5.2 Auth Store
- [x] Create `stores/auth-store.ts`
  ```typescript
  - user: User | null
  - organization: Organization | null
  - isLoading: boolean
  ```

### 5.3 Feature Stores
- [x] Create `features/compliance/stores/compliance-ui-store.ts`
  - [x] Selected view states
  - [x] Filter preferences
  - [x] Expanded sections

## Phase 6: Mobile Responsiveness (Hour 6-7) 📱

### 6.1 Responsive Layouts
- [x] Test and adjust landing page for mobile
- [x] Implement mobile navigation (hamburger menu)
- [x] Create `components/layout/mobile-nav.tsx`
- [x] Adjust dashboard grid for tablet/mobile

### 6.2 Touch Optimizations
- [x] Ensure 44px minimum touch targets
- [x] Add proper hover/active states
- [x] Test form inputs on mobile

## Phase 7: Polish & Integration (Hour 7-8) ✨

### 7.1 Loading States
- [x] Create skeleton loaders for:
  - [x] Dashboard cards
  - [x] Tables
  - [x] Forms
- [x] Implement Suspense boundaries

### 7.2 Error States
- [x] Create `components/common/error-boundary.tsx`
- [x] Design error messages
- [x] 404 page (`app/not-found.tsx`)
- [x] Error page (`app/error.tsx`)

### 7.3 Animations
- [x] Page transitions (duration-standard: 300ms)
- [x] Button hover states (duration-quick: 200ms)
- [x] Card hover elevations
- [x] Loading spinner animations

### 7.4 Final Checks
- [x] Accessibility audit (ARIA labels, keyboard navigation)
- [x] Cross-browser testing
- [x] Performance check (Lighthouse)
- [x] Deploy to Vercel

## Success Criteria ✅

By end of Day 1, we should have:
1. ✅ Fully styled landing page with Ethereal design
2. ✅ Working auth pages (login/verify)
3. ✅ Basic dashboard with mock data
4. ✅ Responsive layouts for all pages
5. ✅ Consistent design system implementation
6. ✅ Deployed to production URL

## Notes & Considerations

### Design Tokens to Remember
- **Primary**: Inchworm (#B1FA63) - CTAs, success states
- **Text**: Gunmetal (#243837) - All primary text
- **Warning**: Orange (#FE7733) - Urgent items, deadlines
- **Accent**: Pale Violet (#B2A1FF) - Selected states
- **Letter Spacing**: -8% globally on Inter font

### Component Patterns
- Server Components by default
- Client Components only for interactivity
- Use Suspense for loading states
- Progressive enhancement for forms

### Mobile First
- Start with mobile layout
- Enhance for larger screens
- Test touch interactions early

## Dependencies & Resources

### Required NPM Packages
```json
{
  "dependencies": {
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.309.0",
    "sonner": "^1.4.0"
  }
}
```

### Figma/Design References
- Ethereal UI Design System
- Charity Prep Brand Guidelines
- Component Library Reference

---

## Checklist Summary
Total Tasks: ~120
Estimated Time: 8 hours
Priority: Foundation > Landing > Auth > Dashboard > Polish

This plan provides a solid foundation for the remaining 4 days of development.