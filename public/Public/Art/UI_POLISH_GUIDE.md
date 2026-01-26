# UI Polish & Consistency Guide

## Color Scheme Standardization

### Primary Colors
- **Blue**: `#3b82f6` (interactive elements, links)
- **Green**: `#10b981` (success, positive metrics)
- **Red**: `#ef4444` (errors, negative metrics)
- **Purple**: `#8b5cf6` (featured, premium)
- **Orange**: `#f97316` (warnings, attention)

### Neutral Colors
- **Gray 50**: `#f9fafb` (light backgrounds)
- **Gray 100**: `#f3f4f6` (cards)
- **Gray 200**: `#e5e7eb` (borders, dividers)
- **Gray 600**: `#4b5563` (secondary text)
- **Gray 900**: `#111827` (primary text)

### Dark Mode
- **Gray 700**: `#374151` (dark backgrounds)
- **Gray 800**: `#1f2937` (dark cards)
- **Gray 900**: `#111827` (darkest background)

## Component Spacing Consistency

### Card Padding
- **Small cards**: `p-4` (16px)
- **Medium cards**: `p-6` (24px)
- **Large cards**: `p-8` (32px)

### Section Spacing
- **Between sections**: `space-y-6` or `space-y-8`
- **Between grid items**: `gap-4` or `gap-6`
- **Horizontal padding**: `px-4` (mobile) / `px-6` (desktop)

## Typography Consistency

### Headings
- **Page Title (h1)**: `text-3xl font-bold`
- **Section Title (h2)**: `text-xl font-bold`
- **Card Title (h3)**: `text-lg font-bold`
- **Metric Labels**: `text-sm font-medium text-gray-600 dark:text-gray-400`

### Text
- **Body**: `text-base` with `text-gray-900 dark:text-white`
- **Secondary**: `text-sm text-gray-600 dark:text-gray-400`
- **Small**: `text-xs text-gray-500 dark:text-gray-500`

## Button Consistency

### Primary Button
```tsx
className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
```

### Secondary Button
```tsx
className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors"
```

### Link Button
```tsx
className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
```

## Card Styling Consistency

### Standard Card
```tsx
className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
```

### Card with Hover
```tsx
className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-lg transition-shadow"
```

### Info Card (Light background)
```tsx
className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
```

## Dark Mode Implementation

### Verified Components (✅ Tested)
- [ ] Header
- [ ] Navigation
- [ ] NFTCard
- [ ] MarketplaceAnalytics
- [ ] CreatorProfilePage
- [ ] RoyaltiesDashboard
- [ ] TransactionStatus
- [ ] Notification

### Required Patterns
```tsx
// Backgrounds
"bg-white dark:bg-gray-800"

// Text
"text-gray-900 dark:text-white"

// Borders
"border-gray-200 dark:border-gray-700"

// Secondary text
"text-gray-600 dark:text-gray-400"
```

## Responsive Design Checklist

### Mobile (320px - 640px)
- [ ] Single column layouts
- [ ] Full-width components
- [ ] Touch-friendly button sizes (44px minimum)
- [ ] Readable font sizes
- [ ] Proper spacing for touch

### Tablet (641px - 1024px)
- [ ] Two-column layouts where appropriate
- [ ] Medium padding
- [ ] Optimized spacing

### Desktop (1025px+)
- [ ] Three-column layouts
- [ ] Sidebar layouts
- [ ] Full-width optimization

### Grid System
- **Mobile**: `grid-cols-1` or `grid-cols-2`
- **Tablet**: `md:grid-cols-2` or `md:grid-cols-3`
- **Desktop**: `lg:grid-cols-4` or more

## Loading States

### Spinner
```tsx
<div className="animate-spin">
  <svg className="w-8 h-8 text-blue-600" />
</div>
```

### Skeleton
```tsx
<div className="animate-pulse space-y-2">
  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
</div>
```

### Placeholder
```tsx
<div className="text-center py-8 text-gray-500 dark:text-gray-400">
  No data available
</div>
```

## Error Handling Display

### Error Banner
```tsx
<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
  <p className="text-red-800 dark:text-red-200">Error message</p>
</div>
```

### Warning Banner
```tsx
<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
  <p className="text-yellow-800 dark:text-yellow-200">Warning message</p>
</div>
```

### Success Banner
```tsx
<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
  <p className="text-green-800 dark:text-green-200">Success message</p>
</div>
```

## Animation Consistency

### Transitions
```tsx
// Smooth color transitions
className="transition-colors"

// Smooth all transitions
className="transition-all duration-200"

// Smooth shadow transitions
className="transition-shadow hover:shadow-lg"

// Smooth opacity transitions
className="transition-opacity"
```

### Hover States
- Links: Darker color
- Buttons: Darker background
- Cards: Subtle shadow or background change
- Icons: Scale or color change

## Badge Styling

### Success Badge
```tsx
className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-xs font-bold"
```

### Info Badge
```tsx
className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold"
```

### Warning Badge
```tsx
className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-bold"
```

## Table Styling

### Header Row
```tsx
<tr className="border-b border-gray-200 dark:border-gray-700">
  <th className="text-left py-3 px-2 text-gray-600 dark:text-gray-400 font-medium">
    Column
  </th>
</tr>
```

### Body Row
```tsx
<tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
  <td className="py-3 px-2 text-gray-900 dark:text-white">Data</td>
</tr>
```

## Accessibility Improvements

### Semantic HTML
- Use `<nav>`, `<main>`, `<section>`, `<article>` appropriately
- Use `<button>` for clickable elements
- Use `<a>` for navigation
- Use `<form>` for form inputs

### ARIA Labels
```tsx
// For icons
<button aria-label="Close menu">×</button>

// For live regions
<div aria-live="polite" aria-atomic="true">
  Status message
</div>

// For links
<a href="/page" aria-label="View full profile">
  View more →
</a>
```

### Color Contrast
- All text should have sufficient contrast ratio (4.5:1 for normal text)
- Don't rely solely on color to convey information
- Use icons + text for status indicators

## Performance Optimization

### Image Optimization
- Use next-gen formats (WebP)
- Implement lazy loading
- Optimize SVG icons
- Use appropriate sizing

### Code Splitting
- Lazy load routes
- Code split heavy components
- Defer non-critical imports

### Caching
- Cache API responses (5-minute TTL)
- Use localStorage for user preferences
- Implement service worker for offline support

## Testing Checklist

- [ ] All components render correctly in light mode
- [ ] All components render correctly in dark mode
- [ ] Responsive design works on mobile (320px)
- [ ] Responsive design works on tablet (768px)
- [ ] Responsive design works on desktop (1440px)
- [ ] All buttons and links are keyboard accessible
- [ ] All forms are accessible
- [ ] Loading states display correctly
- [ ] Error states display correctly
- [ ] No console errors or warnings
- [ ] Performance is acceptable (Lighthouse score >85)

## Documentation Standards

### Component Documentation
```tsx
/**
 * Component description
 * 
 * @example
 * <MyComponent prop="value" />
 */
export const MyComponent: React.FC<Props> = () => {}
```

### Type Documentation
```tsx
/**
 * User data interface
 */
interface User {
  /** Unique identifier */
  id: string;
  /** User's display name */
  name: string;
}
```

## Deployment Checklist

- [ ] All features implemented
- [ ] All components styled consistently
- [ ] Dark mode tested across all components
- [ ] Responsive design verified on all breakpoints
- [ ] Performance optimizations applied
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Accessibility verified
- [ ] SEO optimization applied
- [ ] Analytics tracking added
- [ ] Error logging configured
- [ ] Environment variables configured
- [ ] Build passes without warnings
- [ ] E2E tests passing
- [ ] Manual testing completed

