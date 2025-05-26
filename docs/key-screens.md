# Charity Prep - Key Screen Specifications

## Design System Application

Using the Ethereal UI design system with Charity Prep brand adaptations:

- **Primary Action Color**: Inchworm (#B1FA63) - for CTAs and positive actions
- **Text**: Gunmetal (#243837) - for all primary text
- **Warnings/Urgent**: Orange (#FE7733) - for deadlines and alerts
- **Success States**: Pale Violet (#B2A1FF) - for achievements
- **Typography**: Inter with -8% letter spacing throughout

## 1. Landing Page

### Hero Section

```
Background: White (#FFFFFF)
Container: X-Large (1440px max-width)

[Navigation Bar]
- Height: 72px
- Background: White with shadow-low on scroll
- Logo: "Charity Prep" in Gunmetal, H4 weight
- Right: "Login" (tertiary button) + "Start Free Trial" (primary button)

[Hero Content]
- Spacing: 4xl (96px) top padding
- Headline: Display size (48px/700)
  "Annual Return Stress?"
  Color: Gunmetal

- Subheadline: Display size with Inchworm highlight
  "Sorted in minutes."
  Color: Inchworm

- Description: Body size (16px/400)
  "Stop panicking about compliance. Track everything the Charity Commission needs, all year round."
  Color: Grey 600
  Max-width: 640px

[Risk Calculator Card]
- Background: Grey 100
- Border-radius: lg (12px)
- Padding: xl (32px)
- Shadow: medium
- Content:
  - H3: "When's your year end?"
  - Date picker with Inchworm accent
  - Auto-calculation: "Your Annual Return is due in 127 days"
  - Orange (#FE7733) warning if < 60 days

[CTA Section]
- Primary button: "Start 30-Day Free Trial"
  - Background: Inchworm
  - Text: Gunmetal
  - Size: Large (padding: md vertical, xl horizontal)
  - Hover: 10% darker with shadow-medium
  - Animation: duration-quick

- Trust indicators below:
  - Small text: "No credit card required • 5 minute setup"
  - Color: Grey 500

```

### Social Proof Section

```
Background: Grey 100
Padding: 3xl (64px) vertical

[Stats Grid]
- 3 columns on desktop, stack on mobile
- Each stat:
  - Number: H1 size, Inchworm color
  - Label: Body size, Gunmetal
  - Examples:
    - "247" / "Charities compliant"
    - "92%" / "Average compliance score"
    - "4.8" / "Trustpilot rating"

```

## 2. Main Dashboard

### Layout Structure

```
[Sidebar - 280px width]
- Background: Gunmetal
- Logo: White version
- Navigation items:
  - Selected: Inchworm background, Gunmetal text, radius-md
  - Hover: Grey 800 background
  - Icons: 20px, spacing-sm from text
  - Items: Dashboard, Safeguarding, International, Fundraising, Documents, Reports

[Main Content Area]
- Background: White
- Padding: xl (32px)

[Header Bar]
- H2: "Welcome back, Sarah"
- Right side: Notification bell + Avatar
- Border-bottom: 1px Grey 300

```

### Compliance Score Card

```
[Hero Card]
- Full width
- Background: Linear gradient (Gunmetal to Grey 800)
- Border-radius: lg
- Padding: 2xl
- Content:
  - Large circular progress (200px)
  - Center number: "73%" in Display size, White
  - Status text: "Getting There" in H3, Grey 300
  - Progress ring:
    - Background: Grey 700
    - Fill: Inchworm with glow effect
    - Animation: dramatic duration on load

```

### Risk Radar Grid

```
[4-Column Grid]
- Gap: lg (24px)
- Each card:
  - Background: White
  - Border: 1px Grey 300
  - Border-radius: md
  - Padding: lg
  - Hover: shadow-medium, border-color Inchworm

[Card Content]
- Icon: 32px, colored by status
  - Green (Inchworm): Compliant
  - Orange: Attention needed
  - Red (#FF5252): Urgent
- Title: H4, Gunmetal
- Status: Body, Grey 600
- Quick stat: H3, color matches icon

Examples:
- Safeguarding: "3 expiring soon" (Orange)
- International: "All recorded" (Inchworm)
- Fundraising: "Missing data" (Red)
- Documents: "12 uploaded" (Inchworm)

```

### Urgent Actions Panel

```
[Alert Banner]
- Background: Orange with 10% opacity
- Border-left: 4px solid Orange
- Border-radius: md
- Padding: md
- Content:
  - Icon: Warning, Orange, 24px
  - Text: "3 DBS checks expire this month"
  - Right: "Fix Now" button (secondary style with Orange)

```

## 3. DBS Tracker Screen

### Header Section

```
[Page Header]
- H1: "Safeguarding Records"
- Subtitle: Body text, Grey 600: "Track DBS checks and training"
- Right side:
  - Search bar (Grey 200 background)
  - "Add DBS Check" button (primary)

```

### Table Design

```
[Table Container]
- Background: White
- Border: 1px Grey 300
- Border-radius: lg
- Shadow: low

[Table Header]
- Background: Grey 100
- Border-bottom: 2px Grey 300
- Padding: md
- Text: Small size, Grey 700, uppercase, letter-spacing-loose

[Table Rows]
- Padding: md vertical
- Border-bottom: 1px Grey 200
- Hover: Grey 100 background
- Columns:
  - Name (H5 weight)
  - Role (Body)
  - DBS Number (Small, monospace)
  - Expiry (with color coding)
  - Actions (icon buttons)

[Expiry Color Coding]
- > 3 months: Gunmetal
- 1-3 months: Orange
- < 1 month: Red (#FF5252)
- Expired: Red background with white text, radius-sm

```

### Quick Add Modal

```
[Modal Overlay]
- Background: Gunmetal with 80% opacity
- Blur backdrop

[Modal Content]
- Width: 640px max
- Background: White
- Border-radius: lg
- Shadow: overlay
- Padding: xl

[Form Fields]
- Input style:
  - Background: Grey 100
  - Border: 1px Grey 300
  - Focus: Border Inchworm, shadow-low with Inchworm tint
  - Border-radius: md
  - Padding: sm vertical, md horizontal

[Photo Upload Zone]
- Dashed border: 2px Grey 400
- Background: Grey 100 on hover
- Center content: Upload icon + "Drop DBS certificate or click"
- On file: Show preview with Inchworm checkmark overlay

```

## 4. Overseas Activities Screen

### Country Map View

```
[Interactive Map]
- Height: 400px
- Background: Grey 100
- Countries with activity: Filled with gradient
  - Low spend: Pale Violet
  - Medium spend: Inchworm
  - High spend: Orange
- Hover: Tooltip with country name + total
- Border-radius: lg

```

### Activity List

```
[Filter Bar]
- Background: Grey 100
- Padding: md
- Border-radius: md
- Filters:
  - Country dropdown
  - Date range
  - Transfer method chips
  - Each chip: selected = Inchworm bg

[Activity Cards]
- Stack with gap-md
- Each card:
  - Left border: 4px, color by transfer method
    - Bank: Inchworm
    - Cash/Crypto: Orange
  - Content grid:
    - Country flag + name (H5)
    - Amount in GBP (H4, Gunmetal)
    - Partner name (Body, Grey 600)
    - Transfer method badge
    - Date (Small, Grey 500)

```

## 5. Annual Return Preview

### Split Screen Layout

```
[Left Panel - 50%]
- Background: Grey 100
- Padding: xl
- Header: "Your Data"
- Scrollable content area

[Right Panel - 50%]
- Background: White
- Border-left: 2px Grey 300
- Header: "Annual Return Form"
- Mock form that looks official

[Sync Indicator]
- Connecting line between matching fields
- Animated pulse when hovering
- Green checkmark for complete fields
- Orange warning for missing

```

### Copy Interface

```
[Field Mapping]
- Each field row:
  - Your data: Grey 200 background box
  - Arrow icon: Inchworm when filled
  - Form field: Highlighted on hover
  - Copy button: Appears on hover

[Completion Banner]
- Fixed bottom
- Background: Gradient (Gunmetal to Grey 800)
- Progress bar: Inchworm fill
- Text: "87% Complete - 3 fields remaining"
- Action: "Export All Data" button

```

## 6. Board Report Generator

### Template Selection

```
[Template Grid]
- 2 columns
- Each template card:
  - Preview thumbnail
  - Title: H4
  - Description: Small, Grey 600
  - Selected: Inchworm border, shadow-medium
  - Tags: "Quick", "Detailed", "Trustee-friendly"

```

### Generation Screen

```
[AI Processing State]
- Center screen
- Animated Inchworm circle pulse
- Text: "Creating your report..."
- Subtext: "This usually takes 15-30 seconds"
- Tips cycling below: "Did you know..." facts

[Preview Panel]
- Document preview with charity branding
- Editable sections highlighted on hover
- Right sidebar:
  - Section toggles
  - Regenerate button per section
  - Download options (PDF, Word)

```

## 7. Mobile Quick Entry

### Mobile Navigation

```
[Bottom Tab Bar]
- Height: 72px
- Background: White
- Shadow: high (inverted)
- 5 tabs with icons + labels:
  - Home (selected: Inchworm)
  - Add (FAB style, Inchworm background)
  - Compliance
  - Documents
  - More

```

### Quick Add Screen

```
[Action Grid]
- 2x2 grid
- Gap: md
- Each tile:
  - Height: 120px
  - Background: Grey 100
  - Icon: 48px, Inchworm
  - Label: Body weight 500
  - Tap: Scale 0.95 with spring animation

[Photo Capture UI]
- Full screen camera
- Guide overlay: Rounded rectangle
- Bottom bar:
  - Cancel (left)
  - Capture button (center, 64px, Inchworm)
  - Flash toggle (right)

```

## 8. AI Magic Import

### Email Forward Success

```
[Toast Notification]
- Position: Top center
- Background: Gunmetal
- Text: White
- Icon: Checkmark in Inchworm circle
- Message: "Email received! Processing..."
- Auto-dismiss: 3 seconds
- Animation: Slide down + fade

```

### Import Review Screen

```
[Header]
- Icon: Magic wand with sparkles (animated)
- H2: "We found 6 items in your email"
- Subtitle: "Review and confirm below"

[Extracted Items List]
- Each item card:
  - Confidence badge: High (Green), Medium (Orange), Low (Red)
  - Original text: Quoted in Grey 200 box
  - Extracted data: Editable fields
  - Category suggestion: Dropdown with Inchworm accent
  - Actions: Confirm (Inchworm) or Reject (Grey)

[Bulk Actions Bar]
- Sticky bottom
- Background: White with shadow-high
- "Confirm All" (primary button)
- "X of 6 reviewed" progress

```

## Component Specifications

### Loading States

```
- Skeleton screens: Grey 200 animated gradient
- Spinners: Inchworm with rotation
- Progress bars: Grey 300 track, Inchworm fill
- Shimmer effect: duration-dramatic

```

### Empty States

```
- Illustration: Simple line art in Grey 400
- Message: H3, Gunmetal
- Description: Body, Grey 600
- CTA: Primary button to add first item
- Padding: 3xl all sides

```

### Success Animations

```
- Checkmark: Draw-in effect, Inchworm stroke
- Confetti: Inchworm and Pale Violet particles
- Score increase: Number counter animation
- Duration: dramatic (500ms)

```

### Error States

```
- Inline errors: Red text below fields
- Error banner: Red background, white text
- Form validation: Red border on fields
- Error icon: 20px, inline with message

```

## Responsive Breakpoints

```
Mobile: < 640px
- Single column layouts
- Bottom navigation
- Full-width buttons
- Larger touch targets (44px min)

Tablet: 640px - 1024px
- 2-column grids max
- Collapsible sidebar
- Adjusted spacing (md instead of lg)

Desktop: > 1024px
- Full layouts as specified
- Hover states enabled
- Keyboard navigation

```

## Motion Principles Applied

1. **Micro-interactions**: duration-instant (100ms)
    - Button hovers
    - Checkbox selections
    - Tab switches
2. **State Changes**: duration-quick (200ms)
    - Loading to loaded
    - Error appearances
    - Toast notifications
3. **Page Transitions**: duration-standard (300ms)
    - Route changes
    - Modal opens
    - Drawer slides
4. **Feature Animations**: duration-dramatic (500ms)
    - Score updates
    - Progress rings
    - Success celebrations

All animations use the Ethereal UI easing curves and maintain 60fps performance.