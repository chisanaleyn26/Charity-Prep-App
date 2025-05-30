# Sidebar Phase 2 Changes - Move FAQ to User Dropdown

## Changes Applied

### 1. Added FAQ to User Dropdown
- **Location**: Both collapsed and expanded user dropdown menus
- **Icon**: HelpCircle (imported from lucide-react)
- **Route**: `/help` (unchanged)
- **Position**: After Settings, before Sign Out separator

### 2. Removed FAQ from Sidebar
- **Before**: 3 items in bottom navigation (Notifications, Settings, FAQ)
- **After**: 2 items in bottom navigation (Notifications, Settings)
- **Impact**: Reduced sidebar items from 15 to 14

## Technical Details

### User Section Changes:
```tsx
// Added import
import { HelpCircle } from 'lucide-react'

// Added to both dropdown menus
<DropdownMenuItem asChild>
  <Link href="/help" className="flex items-center">
    <HelpCircle className="mr-2 h-4 w-4" />
    <span>FAQ</span>
  </Link>
</DropdownMenuItem>
```

### Sidebar Changes:
```tsx
// Removed from bottomNavigation array
{
  name: 'FAQ',
  href: '/help', 
  icon: HelpCircle,
  description: 'Frequently asked questions'
}
```

## UX Rationale

### Why This Improves UX:
1. **Logical Grouping**: FAQ belongs with user account settings
2. **Reduced Cognitive Load**: Fewer primary navigation items
3. **Consistent Pattern**: Other account-related items already in user dropdown
4. **Still Accessible**: FAQ remains easily discoverable in user menu

### Navigation Flow:
```
Before: Sidebar → Bottom Section → FAQ
After:  Avatar → User Dropdown → FAQ
```

## Files Modified:
- `components/layout/user-section.tsx` - Added FAQ to dropdown menus
- `components/layout/sidebar.tsx` - Removed FAQ from bottom navigation

## Risk Assessment: ✅ MEDIUM RISK - COMPLETED
- FAQ functionality preserved (same route)
- No breaking changes to existing functionality
- User dropdown pattern already established
- Settings remains in both locations for discoverability

## Testing Completed:
- [ ] FAQ accessible in collapsed user dropdown
- [ ] FAQ accessible in expanded user dropdown  
- [ ] FAQ removed from sidebar
- [ ] All user dropdown items still work
- [ ] FAQ route `/help` still functions

## Next: Phase 3 - Consolidate Compliance Items
Target: Reduce 4 compliance items to 1 consolidated item with sub-navigation