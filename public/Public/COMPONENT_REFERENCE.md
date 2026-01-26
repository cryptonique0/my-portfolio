# 🎨 BaseChess UI Component Reference

## Quick Start Guide

This file provides copy-paste examples for using the new UI system across all pages.

## 📦 Button Components

### Primary Action Button
```tsx
<button className="btn btn-primary">
  <span className="material-symbols-outlined">play_arrow</span>
  Start Game
</button>
```

### Secondary Action Button
```tsx
<button className="btn btn-secondary">
  <span className="material-symbols-outlined">school</span>
  Learn
</button>
```

### Success Button
```tsx
<button className="btn btn-success">
  <span className="material-symbols-outlined">check_circle</span>
  Confirm
</button>
```

### Danger Button
```tsx
<button className="btn btn-danger">
  <span className="material-symbols-outlined">delete</span>
  Delete
</button>
```

### Outline Button
```tsx
<button className="btn btn-outline">
  <span className="material-symbols-outlined">settings</span>
  Settings
</button>
```

### Ghost Button (Minimal)
```tsx
<button className="btn btn-ghost">
  <span className="material-symbols-outlined">close</span>
  Cancel
</button>
```

## 🎯 Card Components

### Basic Info Card
```tsx
<div className="card hover:shadow-lg transition-shadow">
  <div className="card-header">
    <h3 className="card-title">Card Title</h3>
    <span className="material-symbols-outlined">info</span>
  </div>
  <div className="card-body">
    <p>Your content goes here</p>
  </div>
</div>
```

### Stat Card
```tsx
<div className="card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
  <div className="flex items-start justify-between">
    <div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Rating</p>
      <p className="text-3xl font-black text-blue-600 dark:text-blue-400">2450</p>
    </div>
    <span className="material-symbols-outlined text-blue-600 text-3xl opacity-30">
      emoji_events
    </span>
  </div>
</div>
```

### Action Card
```tsx
<div className="card cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center size-12 rounded-lg bg-blue-100 dark:bg-blue-900/30">
        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
          trending_up
        </span>
      </div>
      <div>
        <p className="font-semibold">Leaderboards</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Climb the global rankings
        </p>
      </div>
    </div>
    <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
  </div>
</div>
```

## 🏷️ Badge Components

### Primary Badge
```tsx
<span className="badge badge-primary">New</span>
```

### Success Badge
```tsx
<span className="badge badge-success">Verified</span>
```

### Warning Badge
```tsx
<span className="badge badge-warning">Pending</span>
```

### Error Badge
```tsx
<span className="badge badge-error">Failed</span>
```

### Outlined Badge
```tsx
<span className="badge badge-outline border-blue-600 text-blue-600">Tag</span>
```

## 📝 Form Components

### Text Input
```tsx
<div className="form-group">
  <label htmlFor="username">Username</label>
  <input
    type="text"
    id="username"
    placeholder="Enter your username"
    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
  />
  <span className="form-hint">Choose a unique username</span>
</div>
```

### Email Input
```tsx
<div className="form-group">
  <label htmlFor="email">Email Address</label>
  <input
    type="email"
    id="email"
    placeholder="you@example.com"
    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
  />
</div>
```

### Password Input
```tsx
<div className="form-group">
  <label htmlFor="password">Password</label>
  <input
    type="password"
    id="password"
    placeholder="••••••••"
    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
  />
</div>
```

### Select Dropdown
```tsx
<div className="form-group">
  <label htmlFor="level">Difficulty Level</label>
  <select
    id="level"
    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none"
  >
    <option>Select a level</option>
    <option>Beginner</option>
    <option>Intermediate</option>
    <option>Advanced</option>
  </select>
</div>
```

### Textarea
```tsx
<div className="form-group">
  <label htmlFor="feedback">Feedback</label>
  <textarea
    id="feedback"
    placeholder="Share your feedback..."
    className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-blue-600 focus:outline-none resize-vertical"
    rows={4}
  ></textarea>
</div>
```

## 🔔 Alert Components

### Success Alert
```tsx
<div className="alert alert-success">
  <div className="alert-icon">✓</div>
  <div className="alert-content">
    <div className="alert-title">Success!</div>
    <p>Your game has been saved successfully.</p>
  </div>
</div>
```

### Error Alert
```tsx
<div className="alert alert-error">
  <div className="alert-icon">!</div>
  <div className="alert-content">
    <div className="alert-title">Error</div>
    <p>Failed to load the game. Please try again.</p>
  </div>
</div>
```

### Warning Alert
```tsx
<div className="alert alert-warning">
  <div className="alert-icon">⚠</div>
  <div className="alert-content">
    <div className="alert-title">Warning</div>
    <p>You have limited time remaining in this session.</p>
  </div>
</div>
```

### Info Alert
```tsx
<div className="alert alert-primary">
  <div className="alert-icon">ℹ</div>
  <div className="alert-content">
    <div className="alert-title">Info</div>
    <p>New features are available. Check them out!</p>
  </div>
</div>
```

## 📊 Layout Components

### Container
```tsx
<div className="container">
  <h1>Centered Content</h1>
  <p>Max width with responsive padding</p>
</div>
```

### Grid Layout
```tsx
<div className="grid grid-cols-3 gap-lg">
  <div className="card">Item 1</div>
  <div className="card">Item 2</div>
  <div className="card">Item 3</div>
</div>
```

### Flex Layout
```tsx
<div className="flex gap-md items-center justify-between">
  <h2>Section Title</h2>
  <button className="btn btn-primary">Action</button>
</div>
```

## ✨ Special Effects

### Glassmorphism Card
```tsx
<div className="glass rounded-xl p-lg shadow-lg">
  <h3 className="card-title">Glassmorphic Card</h3>
  <p>Content with glass effect background</p>
</div>
```

### Gradient Text
```tsx
<h1 className="text-gradient">Gradient Heading</h1>
```

### Hover Lift
```tsx
<div className="card hover-lift cursor-pointer">
  Hover to see lift effect
</div>
```

### Animated Shimmer
```tsx
<div className="h-12 rounded-lg animate-shimmer bg-slate-200"></div>
```

## 🎯 Common Patterns

### Header Section
```tsx
<div className="flex items-center justify-between mb-lg">
  <h2 className="text-2xl font-black">Section Title</h2>
  <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700">
    View all →
  </a>
</div>
```

### List Item with Icon
```tsx
<div className="flex items-center gap-md p-md rounded-lg hover:shadow-md transition-all">
  <div className="flex items-center justify-center size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30">
    <span className="material-symbols-outlined text-blue-600">icon_name</span>
  </div>
  <div className="flex-1">
    <p className="font-semibold">Title</p>
    <p className="text-sm text-slate-600 dark:text-slate-400">Subtitle</p>
  </div>
</div>
```

### Stats Grid
```tsx
<div className="grid grid-cols-3 gap-md">
  <div className="card text-center p-lg">
    <p className="text-3xl font-black text-blue-600">47</p>
    <p className="text-xs font-bold text-slate-600 dark:text-slate-400 mt-sm">Games</p>
  </div>
  {/* More stats */}
</div>
```

## 🌙 Dark Mode

All components automatically support dark mode. Test with:
```tsx
// In browser console
document.documentElement.style.colorScheme = 'dark'
```

## 📱 Responsive Classes

### Show/Hide on Mobile
```tsx
{/* Hidden on mobile, visible on tablet+ */}
<div className="hide-mobile">Desktop only</div>

{/* Visible on mobile, hidden on tablet+ */}
<div className="show-mobile">Mobile only</div>
```

## 🎨 Color Classes

Use gradient utilities:
```tsx
<div className="gradient-primary">Primary gradient</div>
<div className="gradient-secondary">Secondary gradient</div>
<div className="gradient-success">Success gradient</div>
```

## 📐 Spacing Reference

| Class | Size |
|-------|------|
| `gap-xs` | 0.25rem |
| `gap-sm` | 0.5rem |
| `gap-md` | 1rem |
| `gap-lg` | 1.5rem |
| `gap-xl` | 2rem |

## 🔗 Links

All links automatically style:
```tsx
<a href="/play" className="text-blue-600 hover:text-blue-700 hover:underline">
  Play Now
</a>
```

---

**Pro Tips:**
1. Always use semantic HTML tags
2. Combine utility classes for flexibility
3. Test interactions on mobile
4. Use Material Design icons consistently
5. Maintain proper color contrast ratios
