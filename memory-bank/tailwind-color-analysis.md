# Tailwind Color Analysis

## Issue Summary
The home page and other pages have broken Tailwind styling because components are using hardcoded hex colors in arbitrary value syntax `[#hexcode]` instead of using the theme colors defined in the Tailwind config.

## Hardcoded Colors Found
- `[#B1FA63]` → Should use `ethereal` or `primary` (this is the Inchworm color)
- `[#1a1a1a]` → Should use `foreground` or `gray-900`
- `[#666]` → Should use `muted-foreground` or `gray-600`
- `[#999]` → Should use `muted-foreground` or `gray-500`
- `[#ddd]` → Should use `border` or `gray-300`
- `[#9FE050]` → Should use `ethereal-600` (darker shade of ethereal)

## Root Causes
1. **Arbitrary Values**: Using `[#hexcode]` syntax bypasses Tailwind's theme system
2. **No Theme Usage**: Not using the CSS variables or theme colors defined in `tailwind.config.ts`
3. **Inconsistent Design System**: Not following the established color palette

## Color Mapping Strategy
```
Hardcoded → Theme Color
[#B1FA63] → ethereal or primary
[#1a1a1a] → foreground
[#666] → muted-foreground
[#999] → muted-foreground/70
[#ddd] → border
[#9FE050] → ethereal/90 (hover state)
```

## Components Affected
- `/components/marketing/hero.tsx`
- `/components/marketing/features.tsx`
- `/components/marketing/pricing.tsx`
- `/components/marketing/footer.tsx`
- `/components/marketing/nav-bar.tsx`
- `/components/marketing/cta-section.tsx`
- `/components/marketing/social-proof.tsx`
- `/components/layout/site-header.tsx`
- `/components/layout/site-footer.tsx`
- `/components/common/logo.tsx`
- `/components/common/loading-spinner.tsx`