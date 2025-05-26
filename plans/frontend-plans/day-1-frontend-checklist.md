# Day 1 Frontend Development Plan - Foundation Sprint

## Overview
Day 1 focuses on establishing the frontend foundation: landing page, authentication flow, and basic app shell with the Ethereal UI design system.

## Prerequisites ✅
- [x] Next.js 15.2 installed
- [x] Shadcn UI configured
- [x] Zustand installed
- [x] Tailwind CSS configured
- [ ] Ethereal color system implemented
- [ ] Inter font configured

## Phase 1: Design System Setup (Hour 1-2) 🎨

### 1.1 Ethereal Color Configuration
- [ ] Update `tailwind.config.ts` with Ethereal colors
  ```typescript
  colors: {
    inchworm: '#B1FA63',
    gunmetal: '#243837',
    orange: '#FE7733',
    'pale-violet': '#B2A1FF',
    'american-silver': '#D1D1D1',
  }
  ```
- [ ] Create CSS variables in `globals.css`
- [ ] Configure Inter font with -8% letter spacing
- [ ] Set up spacing scale (8px base grid)
- [ ] Configure border radius system (sm: 4px, md: 8px, lg: 12px)

### 1.2 Shadcn Components Installation
- [ ] Install essential components:
  ```bash
  npx shadcn@latest add button card form input label dialog dropdown-menu
  npx shadcn@latest add sheet skeleton table tabs badge toast avatar
  npx shadcn@latest add select separator popover command
  ```
- [ ] Customize component themes to match Ethereal design
- [ ] Create `components/ui/index.ts` for exports

### 1.3 Global Components Setup
- [ ] Create `components/layout/site-header.tsx`
- [ ] Create `components/layout/site-footer.tsx`
- [ ] Create `components/common/logo.tsx`
- [ ] Create `components/common/loading-spinner.tsx`

## Phase 2: Landing Page (Hour 2-3) 🏠

### 2.1 Route Structure
- [ ] Create `app/(marketing)/layout.tsx` for marketing pages
- [ ] Update `app/page.tsx` as landing page

### 2.2 Landing Page Components
- [ ] **Hero Section** (`components/marketing/hero.tsx`)
  - [ ] "Annual Return Stress? Sorted in minutes." headline
  - [ ] Risk calculator card with year-end date picker
  - [ ] CTA button with Inchworm background
  - [ ] Trust indicators below CTA

- [ ] **Social Proof Section** (`components/marketing/social-proof.tsx`)
  - [ ] Stats grid (3 columns)
  - [ ] "247 Charities compliant"
  - [ ] "92% Average compliance score"
  - [ ] "4.8 Trustpilot rating"

- [ ] **Features Grid** (`components/marketing/features.tsx`)
  - [ ] Compliance tracking card
  - [ ] AI-powered import card
  - [ ] Report generation card
  - [ ] Mobile-friendly card

- [ ] **Pricing Section** (`components/marketing/pricing.tsx`)
  - [ ] Three tier cards (Essentials, Standard, Premium)
  - [ ] Feature comparison
  - [ ] Annual pricing display

- [ ] **CTA Section** (`components/marketing/cta-section.tsx`)
  - [ ] Final call to action
  - [ ] Trust badges

### 2.3 Navigation
- [ ] Create `components/marketing/nav-bar.tsx`
  - [ ] Logo (left)
  - [ ] Navigation links (Features, Pricing, About)
  - [ ] Login button (tertiary)
  - [ ] Start Free Trial button (primary)

## Phase 3: Authentication Pages (Hour 3-4) 🔐

### 3.1 Auth Layout
- [ ] Create `app/(auth)/layout.tsx`
  - [ ] Minimal layout with centered content
  - [ ] Logo at top
  - [ ] Grey 100 background

### 3.2 Login Page
- [ ] Create `app/(auth)/login/page.tsx`
- [ ] Create `features/auth/components/login-form.tsx`
  - [ ] Email input field
  - [ ] "Send Magic Link" button (primary)
  - [ ] "No password needed" helper text
  - [ ] Link to landing page

### 3.3 Verify Page
- [ ] Create `app/(auth)/verify/page.tsx`
- [ ] Create `features/auth/components/verify-message.tsx`
  - [ ] Email sent illustration
  - [ ] "Check your email" message
  - [ ] Resend link option
  - [ ] What to do next instructions

### 3.4 Auth Callback
- [ ] Create `app/(auth)/callback/page.tsx`
  - [ ] Loading state while verifying
  - [ ] Redirect logic to dashboard

## Phase 4: App Shell & Dashboard (Hour 4-5) 🏗️

### 4.1 App Layout
- [ ] Create `app/(app)/layout.tsx`
  - [ ] Sidebar navigation (280px width)
  - [ ] Main content area
  - [ ] Mobile responsive

### 4.2 Sidebar Component
- [ ] Create `components/layout/sidebar.tsx`
  - [ ] Gunmetal background
  - [ ] White logo
  - [ ] Navigation items (Dashboard, Safeguarding, International, Fundraising, Documents, Reports)
  - [ ] Selected state with Inchworm background
  - [ ] User menu at bottom

### 4.3 Dashboard Page
- [ ] Create `app/(app)/dashboard/page.tsx`
- [ ] Create dashboard sections:
  - [ ] `features/compliance/components/compliance-score.tsx`
  - [ ] `features/compliance/components/risk-radar.tsx`
  - [ ] `features/compliance/components/urgent-actions.tsx`
  - [ ] `features/compliance/components/recent-activity.tsx`

### 4.4 Dashboard Components
- [ ] **Compliance Score Card**
  - [ ] Gradient background (Gunmetal to Grey 800)
  - [ ] Circular progress ring (200px)
  - [ ] Percentage in center
  - [ ] Status text below

- [ ] **Risk Radar Grid**
  - [ ] 4-column grid
  - [ ] Cards for each compliance area
  - [ ] Color-coded icons (Green/Orange/Red)
  - [ ] Quick stats

- [ ] **Urgent Actions Panel**
  - [ ] Orange background banner
  - [ ] Warning icon
  - [ ] Action items list
  - [ ] "Fix Now" buttons

## Phase 5: UI State Management (Hour 5-6) 💾

### 5.1 Global UI Store
- [ ] Create `stores/ui-store.ts`
  ```typescript
  - sidebarCollapsed: boolean
  - activeModal: string | null
  - theme: 'light' | 'dark'
  ```

### 5.2 Auth Store
- [ ] Create `stores/auth-store.ts`
  ```typescript
  - user: User | null
  - organization: Organization | null
  - isLoading: boolean
  ```

### 5.3 Feature Stores
- [ ] Create `features/compliance/stores/compliance-ui-store.ts`
  - [ ] Selected view states
  - [ ] Filter preferences
  - [ ] Expanded sections

## Phase 6: Mobile Responsiveness (Hour 6-7) 📱

### 6.1 Responsive Layouts
- [ ] Test and adjust landing page for mobile
- [ ] Implement mobile navigation (hamburger menu)
- [ ] Create `components/layout/mobile-nav.tsx`
- [ ] Adjust dashboard grid for tablet/mobile

### 6.2 Touch Optimizations
- [ ] Ensure 44px minimum touch targets
- [ ] Add proper hover/active states
- [ ] Test form inputs on mobile

## Phase 7: Polish & Integration (Hour 7-8) ✨

### 7.1 Loading States
- [ ] Create skeleton loaders for:
  - [ ] Dashboard cards
  - [ ] Tables
  - [ ] Forms
- [ ] Implement Suspense boundaries

### 7.2 Error States
- [ ] Create `components/common/error-boundary.tsx`
- [ ] Design error messages
- [ ] 404 page (`app/not-found.tsx`)
- [ ] Error page (`app/error.tsx`)

### 7.3 Animations
- [ ] Page transitions (duration-standard: 300ms)
- [ ] Button hover states (duration-quick: 200ms)
- [ ] Card hover elevations
- [ ] Loading spinner animations

### 7.4 Final Checks
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] Cross-browser testing
- [ ] Performance check (Lighthouse)
- [ ] Deploy to Vercel

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