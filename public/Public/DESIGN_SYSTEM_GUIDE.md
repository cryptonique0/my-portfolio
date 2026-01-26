# BaseChess UI Design System

## Overview

A modern, professional, and accessible UI design system built for the BaseChess platform. This document outlines all components, patterns, and design tokens used throughout the application.

## Design Principles

1. **Simplicity**: Clean, minimal design with purposeful whitespace
2. **Consistency**: Unified look and feel across the entire platform
3. **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
4. **Responsiveness**: Mobile-first approach with full tablet and desktop support
5. **Performance**: Optimized animations and transitions using GPU acceleration
6. **Usability**: Intuitive interactions with clear visual feedback

## Color Palette

### Primary Colors
- **Blue 600**: `#4338ca` - Primary actions and highlights
- **Blue 500**: `#667eea` - Secondary highlights
- **Purple 600**: `#9333ea` - Accent and secondary actions

### Semantic Colors
- **Green 600**: `#16a34a` - Success states
- **Amber 600**: `#d97706` - Warning states
- **Red 600**: `#dc2626` - Error states
- **Cyan 600**: `#0891b2` - Info states

### Neutral Colors
- **Slate 900**: `#111827` - Text primary (light mode)
- **Slate 600**: `#4b5563` - Text secondary (light mode)
- **Slate 400**: `#9ca3af` - Text disabled (light mode)
- **White**: `#ffffff` - Backgrounds (light mode)

### Dark Mode
- **Slate 950**: `#030712` - Background primary
- **Slate 900**: `#111827` - Background secondary
- **Slate 800**: `#1f2937` - Card backgrounds
- **White**: `#ffffff` - Text primary (dark mode)

## Typography

### Font Family
- Primary: Inter (system fonts as fallback)
- Weights: 100-900
- Line-height: 1.6 (body text), 1.2 (headings)

### Font Sizes

| Size | Desktop | Mobile | Use Case |
|------|---------|--------|----------|
| H1   | 3rem    | 1.875rem | Page titles |
| H2   | 2.25rem | 1.5rem   | Section titles |
| H3   | 1.875rem | 1.25rem | Subsection titles |
| Body | 1rem    | 0.875rem | Body text |
| Small| 0.875rem | 0.75rem | Secondary text |
| Tiny | 0.75rem  | 0.625rem | Labels |

## Spacing System

```
xs:  0.25rem (4px)
sm:  0.5rem  (8px)
md:  1rem    (16px)
lg:  1.5rem  (24px)
xl:  2rem    (32px)
2xl: 2.5rem  (40px)
3xl: 3rem    (48px)
4xl: 4rem    (64px)
```

## Components

### Button

The fundamental action component used throughout the app.

#### Variants
- **Primary**: Main call-to-action, blue gradient
- **Secondary**: Alternative action, purple gradient
- **Outline**: Secondary button with border
- **Ghost**: Minimal button without background
- **Danger**: Destructive actions, red background

#### Sizes
- **sm**: 0.75rem padding, 0.75rem text
- **md**: 1rem padding, 0.875rem text
- **lg**: 1.5rem padding, 1rem text
- **xl**: 2rem padding, 1.125rem text

#### States
- **Default**: Normal appearance
- **Hover**: Elevated shadow, color shift
- **Active**: Pressed appearance
- **Disabled**: 50% opacity, no pointer
- **Loading**: Spinner animation

### Card

Flexible container for content with multiple layout options.

#### Variants
- **default**: Subtle border, no shadow
- **elevated**: Strong shadow for prominence
- **outlined**: Emphasis border, transparent background

#### Components
- `Card`: Main container
- `CardHeader`: Title and subtitle section
- `CardBody`: Main content area
- `CardFooter`: Actions or metadata area

### Badge

Small visual label for status, tags, or categories.

#### Variants
- **primary**: Blue background
- **success**: Green background
- **warning**: Amber background
- **error**: Red background
- **info**: Cyan background
- **neutral**: Gray background

#### Styles
- **filled**: Colored background with white text
- **outline**: Transparent with colored border

### Input

Text, email, password, and other input types.

#### Features
- Label and helper text
- Error state with validation message
- Leading and trailing icons
- Full width option
- Size variants (sm, md, lg)
- Dark mode support

### Select

Dropdown selection component.

#### Features
- Label and helper text
- Error handling
- Icon support
- Options array configuration

### Textarea

Multi-line text input.

#### Features
- Resizable (vertical only recommended)
- Minimum height: 6rem
- Same validation as Input

### Modal

Dialog overlay for important actions and information.

#### Features
- Customizable size (sm, md, lg, xl)
- Backdrop blur effect
- Close button
- Keyboard accessible
- Focus trap

### Alert

Status and notification component.

#### Variants
- **info**: Blue with info icon
- **success**: Green with checkmark
- **warning**: Amber with warning icon
- **error**: Red with X icon

#### Features
- Dismissible
- Action button support
- Auto-animate on appearance

### Data Display

#### StatCard
Display key metrics with optional change indicator.

#### ProgressBar
Visual progress indication with label and percentage.

#### Avatar
User profile picture with status indicator.

#### Rating
Star rating display and input (1-5 stars).

#### TagCloud
Display multiple tags with hover effects.

## Layout Patterns

### Hero Section
Large attention-grabbing section at page top.

```tsx
<section className="py-20 md:py-32">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1>Headline</h1>
    <p>Description</p>
  </div>
</section>
```

### Feature Grid
Three-column layout for features.

```tsx
<div className="grid md:grid-cols-3 gap-6">
  {/* Feature cards */}
</div>
```

### Stats Section
Four-column metric display.

```tsx
<div className="grid md:grid-cols-4 gap-6">
  {/* Stat cards */}
</div>
```

### Testimonials
User feedback section.

```tsx
<div className="grid md:grid-cols-3 gap-6">
  {/* Testimonial cards */}
</div>
```

## Animations

### Entrance Animations
- **fadeIn**: 0.5s ease-in-out
- **slideInUp**: 0.5s ease-out
- **slideInDown**: 0.5s ease-out
- **slideInLeft**: 0.5s ease-out
- **slideInRight**: 0.5s ease-out

### Continuous Animations
- **bounce**: 2s ease-in-out infinite
- **pulse**: 2s ease-in-out infinite
- **rotate**: 20s linear infinite

### Interaction Animations
- **hover-lift**: -4px translateY
- **hover-scale**: 1.05 scale
- **hover-glow**: 30px shadow glow

## Responsive Design

### Breakpoints
| Screen | Width | Use Case |
|--------|-------|----------|
| xs     | 320px | Small phones |
| sm     | 640px | Phones |
| md     | 768px | Tablets |
| lg     | 1024px| Small laptops |
| xl     | 1280px| Desktops |
| 2xl    | 1536px| Large displays |

### Mobile-First Approach
1. Design for mobile first
2. Add enhancements for tablet (md:)
3. Further optimize for desktop (lg:)

### Container Queries
Use max-width containers for consistent layout:

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

## Accessibility

### WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for text
- Focus indicators on all interactive elements
- Semantic HTML structure
- ARIA labels where necessary

### Keyboard Navigation
- Tab order follows visual flow
- Enter/Space to activate buttons
- Escape to close modals
- Arrow keys for lists and selections

### Screen Readers
- Descriptive link text
- Form labels associated with inputs
- Alt text for images
- Skip to main content link

### Reduced Motion
Respects `prefers-reduced-motion` for users:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

## Dark Mode

All components support dark mode with:
- `dark:` prefix for dark-specific styles
- Automatic color scheme detection
- High contrast in dark mode
- Proper shadow adjustments

Example:
```tsx
<div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
  {/* Content */}
</div>
```

## Usage Examples

### Basic Button
```tsx
import { Button } from '@/app/components/ui/Button';

<Button variant="primary" size="md">
  Click Me
</Button>
```

### Card with Content
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';

<Card variant="elevated">
  <CardHeader title="Title" subtitle="Subtitle" />
  <CardBody>Content here</CardBody>
  <CardFooter>
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Submit</Button>
  </CardFooter>
</Card>
```

### Form with Validation
```tsx
import { Input } from '@/app/components/ui/Input';
import { Button } from '@/app/components/ui/Button';

<form className="space-y-4">
  <Input
    label="Email"
    type="email"
    required
    error={errors.email}
    helperText="We'll never share your email"
  />
  <Button type="submit" fullWidth>
    Submit
  </Button>
</form>
```

### Modal Dialog
```tsx
import { Modal } from '@/app/components/ui/Modal';

<Modal isOpen={isOpen} onClose={onClose} title="Confirm Action">
  <p>Are you sure you want to continue?</p>
  <div className="flex gap-2 mt-4">
    <Button variant="ghost" onClick={onClose}>Cancel</Button>
    <Button variant="danger">Delete</Button>
  </div>
</Modal>
```

## Best Practices

1. **Consistency**: Use components from the design system
2. **Spacing**: Use spacing scale consistently
3. **Colors**: Use semantic color names (primary, success, error)
4. **Typography**: Follow font size and weight guidelines
5. **Accessibility**: Always include labels and error messages
6. **Performance**: Use dark mode optimizations
7. **Responsiveness**: Test on all breakpoints
8. **Testing**: Verify with keyboard navigation and screen readers

## Future Enhancements

- [ ] Advanced form components (date picker, file upload)
- [ ] Data table component
- [ ] Carousel/slider component
- [ ] Tree view component
- [ ] Command palette component
- [ ] Notification toast system
- [ ] Sidebar navigation pattern
- [ ] Breadcrumb navigation
- [ ] Tabs component with lazy loading
- [ ] Accordion/collapsible sections

## Contributing

When adding new components:
1. Follow the existing structure and naming conventions
2. Include TypeScript types
3. Support dark mode
4. Add keyboard accessibility
5. Document with examples
6. Test on multiple devices

---

**Last Updated**: January 2024  
**Maintained by**: BaseChess Design Team
