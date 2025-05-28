# Home Page Root Cause Analysis

## Critical Finding: Layout Mismatch

### The Problem
The home page was at `/app/page.tsx` but the marketing layout (with header/footer) is at `/app/(marketing)/layout.tsx`. This means:

1. **Home page location**: `/app/page.tsx` 
2. **Marketing layout**: `/app/(marketing)/layout.tsx`
3. **Result**: Home page was NOT getting the marketing layout

### Why This Matters
- The marketing layout includes `<SiteHeader>` and `<SiteFooter>`
- Without this layout, the page might be missing crucial wrapper elements
- The marketing components might expect to be within this layout context

## Additional Issues Found

### 1. CSS Variable Resolution
The body styles in `globals.css` use:
```css
body {
  @apply bg-background text-foreground;
}
```

Where:
- `--background: 0 0% 100%` (white)
- `--foreground: 155 20% 18%` (dark greenish)

If these CSS variables don't resolve properly, text could be invisible.

### 2. Component Color Issues (Already Fixed)
Components were using theme colors that weren't resolving:
- `text-foreground` → Changed to `text-gray-900`
- `bg-ethereal` → Changed to `bg-green-400`
- etc.

### 3. Fragment Return Issue
The home page returns a fragment `<>...</>` which might cause issues with certain layouts or hydration.

## Step-by-Step Process to Fix

### Step 1: Understand the Route Structure ✓
```
/app
  /page.tsx (OLD - was here)
  /(marketing)
    /layout.tsx (marketing layout with header/footer)
    /page.tsx (NEW - moved here)
```

### Step 2: Move Home Page to Marketing Group ✓
- Moved `/app/page.tsx` to `/app/(marketing)/page.tsx`
- Now the home page will get the marketing layout

### Step 3: Verify Component Imports
All imports should work the same:
- `import Hero from '@/components/marketing/hero'` ✓
- `import { Features } from '@/components/marketing/features'` ✓
- `import { Pricing } from '@/components/marketing/pricing'` ✓
- `import { Footer } from '@/components/marketing/footer'` ✓

### Step 4: Consider Wrapper Div
Instead of fragment, use a div:
```tsx
export default function HomePage() {
  return (
    <div>
      <Hero />
      <Features />
      <Pricing />
      <Footer />
    </div>
  )
}
```

## My Thoughts

The root cause was likely the missing marketing layout. Here's why:

1. **Layout Context**: Marketing components might expect certain CSS classes or wrapper elements from the marketing layout
2. **Missing Structure**: Without SiteHeader/SiteFooter, the page structure was incomplete
3. **CSS Scope**: The marketing layout might provide CSS context that components depend on

By moving the home page into the `(marketing)` route group, it now:
- Gets wrapped by the marketing layout
- Has proper header/footer structure
- Maintains the same URL path `/` (route groups don't affect URLs)

This should fix the display issues!