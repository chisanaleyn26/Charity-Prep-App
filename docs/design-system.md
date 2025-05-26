# Ethereal UI — Design System

## Color Palette

### Primary Colors

| Color Name | Hex Code | RGB Value | HSL Value | Usage |
| --- | --- | --- | --- | --- |
| Inchworm | #B1FA63 | (177, 250, 99) | 90°, 94%, 68% | Primary accent, interactive elements, CTAs |
| Gunmetal | #243837 | (36, 56, 55) | 177°, 22%, 18% | Primary text, dark mode backgrounds |

### Secondary Colors

| Color Name | Hex Code | RGB Value | HSL Value | Usage |
| --- | --- | --- | --- | --- |
| Orange | #FE7733 | (254, 119, 51) | 21°, 99%, 60% | Warnings, important notifications, energy |
| Pale Violet | #B2A1FF | (178, 161, 255) | 252°, 100%, 82% | Selected states, subtle interactions |

### Neutral System

| Color Name | Hex Code | RGB Value | HSL Value | Usage |
| --- | --- | --- | --- | --- |
| Bright Snow | #FFFFFF | (255, 255, 255) | 0°, 0%, 100% | Light mode backgrounds, negative space |
| American Silver | #D1D1D1 | (209, 209, 209) | 0°, 0%, 82% | Subtle UI elements, disabled states |

### Extended Neutral Palette

| Name | Hex Code | Usage |
| --- | --- | --- |
| Grey 100 | #F8F8F8 | Background variations, hover states |
| Grey 200 | #EFEFEF | Cards, input fields |
| Grey 300 | #E0E0E0 | Borders, dividers |
| Grey 400 | #BDBDBD | Disabled text |
| Grey 500 | #9E9E9E | Secondary text, icons |
| Grey 600 | #757575 | Primary text on dark elements |
| Grey 700 | #616161 | Low-emphasis text |
| Grey 800 | #424242 | Deep UI elements |
| Grey 900 | #212121 | High-contrast text |

## Typography

### Font System

**Primary Font**: Inter

- A versatile neo-grotesque sans-serif with excellent legibility
- Apply -8% letter-spacing globally to achieve a more refined, premium look
- Use SF Pro as fallback for devices without Inter

```css
font-family: 'Inter', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif;
letter-spacing: -0.08em;

```

### Type Scale

| Name | Size | Line Height | Weight | Letter Spacing | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | 48px/3rem | 56px/3.5rem | 700 | -0.08em | Hero content |
| H1 | 40px/2.5rem | 48px/3rem | 700 | -0.08em | Page titles |
| H2 | 32px/2rem | 40px/2.5rem | 600 | -0.08em | Section headers |
| H3 | 24px/1.5rem | 32px/2rem | 600 | -0.08em | Card headers |
| H4 | 20px/1.25rem | 28px/1.75rem | 600 | -0.08em | Subsections |
| H5 | 16px/1rem | 24px/1.5rem | 600 | -0.08em | Minor headers |
| Body | 16px/1rem | 24px/1.5rem | 400 | -0.08em | Main content |
| Small | 14px/0.875rem | 20px/1.25rem | 400 | -0.06em | Secondary info |
| Caption | 12px/0.75rem | 16px/1rem | 400 | -0.04em | Footnotes, captions |
| Button | 14px/0.875rem | 20px/1.25rem | 500 | -0.06em | Interactive text |

## Spacing & Layout

### Spacing Scale (8px Base Grid)

| Name | Size | Usage |
| --- | --- | --- |
| 3xs | 2px | Minimum spacing (borders) |
| 2xs | 4px | Tight internal spacing |
| xs | 8px | Default component padding |
| sm | 12px | Close element spacing |
| md | 16px | Standard component spacing |
| lg | 24px | Section spacing |
| xl | 32px | Major section spacing |
| 2xl | 48px | Page section divisions |
| 3xl | 64px | Landmark spacing |
| 4xl | 96px | Page-level spacing |

### Container Widths

| Size | Max Width | Usage |
| --- | --- | --- |
| Small | 640px | Focused content (login forms) |
| Medium | 1024px | Standard content width |
| Large | 1280px | Full-width layouts |
| X-Large | 1440px | Maximum content width |

## Component Design

### Radius System

| Name | Size | Usage |
| --- | --- | --- |
| None | 0 | Flush elements |
| Sm | 4px | Small elements (buttons) |
| Md | 8px | Cards, modals |
| Lg | 12px | Large components |
| Full | 9999px | Pills, indicators |

### Elevation & Shadows

| Level | Style | Usage |
| --- | --- | --- |
| Surface | none | Background elements |
| Low | `0 1px 2px rgba(36, 56, 55, 0.05)` | Cards, subtle elevation |
| Medium | `0 4px 8px rgba(36, 56, 55, 0.08)` | Popovers, dropdowns |
| High | `0 8px 16px rgba(36, 56, 55, 0.12)` | Modals, dialogs |
| Overlay | `0 16px 32px rgba(36, 56, 55, 0.16)` | Full-screen elements |

### Button Styles

| Type | Background | Text | Border | Hover State |
| --- | --- | --- | --- | --- |
| Primary | Inchworm | Gunmetal | None | 10% darker |
| Secondary | Transparent | Inchworm | 1px Inchworm | Inchworm 10% opacity |
| Tertiary | Transparent | Gunmetal | None | Grey 200 bg |
| Danger | Orange | White | None | 10% darker |
| Disabled | Grey 300 | Grey 500 | None | No change |

## Motion & Animation

### Timing

| Speed | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Instant | 100ms | ease-out | Micro-interactions |
| Quick | 200ms | ease-out | Button states |
| Standard | 300ms | ease-in-out | Page transitions |
| Dramatic | 500ms | cubic-bezier(0.19, 1, 0.22, 1) | Feature animations |

### Principles

- Use subtle motion to enhance usability, not for decoration
- Maintain 60fps performance across all animations
- Elements should move no more than 100px during transitions
- Avoid multiple simultaneous animations that compete for attention

## Component Architecture

### Separation of Concerns

To maintain a clean and maintainable codebase, we separate base UI components from custom themed components:

#### Base Components (`/components/ui/`)
- Standard Shadcn UI components
- Use CSS variables for theming
- Can be updated via `npx shadcn@latest` without losing customizations
- Examples: `button.tsx`, `card.tsx`, `input.tsx`

#### Custom Ethereal Components (`/components/custom-ui/`)
- Ethereal-specific styled components
- Hardcoded brand colors and styling
- Named with `ethereal-` prefix
- Examples: `ethereal-button.tsx`, `ethereal-card.tsx`

### Usage Pattern

```tsx
// For standard UI elements that follow the theme
import { Button } from '@/components/ui/button'

// For brand-specific elements with Ethereal styling
import { EtherealButton } from '@/components/custom-ui/ethereal-button'

// Example usage
<Button variant="default">Standard Button</Button>
<EtherealButton variant="primary">Brand Button</EtherealButton>
```

### Custom Component Guidelines

1. **Naming Convention**: Always prefix with `ethereal-`
2. **Color Values**: Use hardcoded hex values, not CSS variables
3. **Variants**: Create brand-specific variants (primary, secondary, tertiary)
4. **Animations**: Include Ethereal-specific transitions and hover states
5. **Documentation**: Comment on when to use custom vs base components

## Implementation Variables

```css
:root {
  /* Color System */
  --color-inchworm: #B1FA63;
  --color-inchworm-dark: #9FE050; /* For hover states */
  --color-gunmetal: #243837;
  --color-orange: #FE7733;
  --color-pale-violet: #B2A1FF;
  --color-white: #FFFFFF;
  --color-silver: #D1D1D1;

  /* Grey Scale */
  --color-grey-100: #F8F8F8;
  --color-grey-200: #EFEFEF;
  --color-grey-300: #E0E0E0;
  --color-grey-400: #BDBDBD;
  --color-grey-500: #9E9E9E;
  --color-grey-600: #757575;
  --color-grey-700: #616161;
  --color-grey-800: #424242;
  --color-grey-900: #212121;

  /* Functional Variables */
  --color-background: var(--color-white);
  --color-surface: var(--color-grey-100);
  --color-text-primary: var(--color-gunmetal);
  --color-text-secondary: var(--color-grey-600);
  --color-accent: var(--color-inchworm);
  --color-warning: var(--color-orange);
  --color-highlight: var(--color-pale-violet);
  --color-border: var(--color-grey-300);

  /* Typography */
  --font-family: 'Inter', 'SF Pro', -apple-system, BlinkMacSystemFont, sans-serif;
  --letter-spacing-tight: -0.08em;
  --letter-spacing-normal: -0.06em;
  --letter-spacing-loose: -0.04em;

  /* Spacing */
  --space-3xs: 2px;
  --space-2xs: 4px;
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  --space-4xl: 96px;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-low: 0 1px 2px rgba(36, 56, 55, 0.05);
  --shadow-medium: 0 4px 8px rgba(36, 56, 55, 0.08);
  --shadow-high: 0 8px 16px rgba(36, 56, 55, 0.12);
  --shadow-overlay: 0 16px 32px rgba(36, 56, 55, 0.16);

  /* Animation */
  --duration-instant: 100ms;
  --duration-quick: 200ms;
  --duration-standard: 300ms;
  --duration-dramatic: 500ms;
  --ease-standard: ease-in-out;
  --ease-emphasize: cubic-bezier(0.19, 1, 0.22, 1);
}

```