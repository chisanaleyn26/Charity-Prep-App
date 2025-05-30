# TemplateSelector TypeError Fix Summary

## Issue
The `/reports/board-pack` page was throwing a TypeError: "Cannot read properties of undefined (reading 'map')" in the TemplateSelector component.

## Root Cause
The error occurred when trying to call `.map()` on potentially undefined arrays, specifically:
1. `template.sections` when displaying template options
2. `customizedTemplate.sections` when rendering sortable sections
3. Array methods in drag-and-drop handlers

## Fix Applied
Added defensive programming with optional chaining (`?.`) and default values throughout TemplateSelector.tsx:

### 1. Template Display (Line 248)
```typescript
// Before
{template.sections.filter(s => s.enabled).map((section) => {

// After  
{template.sections?.filter(s => s.enabled).map((section) => {
```

### 2. Section Toggle Handler (Line 165)
```typescript
// Before
sections: customizedTemplate.sections.map(section =>

// After
sections: customizedTemplate.sections?.map(section =>
  section.id === sectionId ? { ...section, enabled } : section
) || []
```

### 3. Drag End Handler (Lines 178-181)
```typescript
// Before
const oldIndex = customizedTemplate.sections.findIndex(s => s.id === active.id)
const newIndex = customizedTemplate.sections.findIndex(s => s.id === over.id)

// After
const oldIndex = customizedTemplate.sections?.findIndex(s => s.id === active.id) ?? -1
const newIndex = customizedTemplate.sections?.findIndex(s => s.id === over.id) ?? -1

if (oldIndex === -1 || newIndex === -1 || !customizedTemplate.sections) return
```

### 4. SortableContext Items (Line 288)
```typescript
// Before
items={customizedTemplate.sections.map(s => s.id)}

// After
items={customizedTemplate.sections?.map(s => s.id) || []}
```

### 5. Section Rendering (Line 292)
```typescript
// Before
{customizedTemplate.sections.map((section) => (

// After
{customizedTemplate.sections?.map((section) => (
  <SortableSection ... />
)) || null}
```

### 6. Section Count Display (Lines 305-306)
```typescript
// Before
{customizedTemplate.sections.filter(s => s.enabled).length} of{' '}
{customizedTemplate.sections.length} sections enabled

// After
{customizedTemplate.sections?.filter(s => s.enabled).length || 0} of{' '}
{customizedTemplate.sections?.length || 0} sections enabled
```

### 7. Template Loading (Lines 138-148)
Added validation to ensure templates have sections:
```typescript
const validTemplates = data.filter(t => Array.isArray(t.sections))
setTemplates(validTemplates)
```

## Testing
- Build completed successfully without errors
- All map operations now safely handle undefined values
- Other report modules were checked and found to already have proper safeguards

## Best Practices Applied
1. Always use optional chaining (`?.`) when accessing properties that might be undefined
2. Provide default values with `|| []` for array operations
3. Validate data structure when receiving from APIs
4. Add early returns when required data is missing

## Result
The TypeError has been resolved and the board pack page should now load without errors.