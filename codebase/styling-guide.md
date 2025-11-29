# SwapCircle Styling Guide

## Overview

All components in SwapCircle use a centralized styling system through `globals.css` utility classes. This ensures consistency across the entire application.

## Core Principle

**Never use inline styles.** Always use utility classes from `globals.css` that reference CSS variables.

## Available Utility Classes

### Background Colors
- `.bg-swapcircle-primary` - Primary blue background
- `.bg-swapcircle-white` - White background
- `.bg-swapcircle-alt` - Alternative background (off-white)
- `.bg-swapcircle-credit` - Credit display background (light blue)

### Text Colors
- `.text-swapcircle-primary` - Black text
- `.text-swapcircle-secondary` - Dark gray text
- `.text-swapcircle-tertiary` - Medium gray text
- `.text-swapcircle-blue` - Blue text
- `.text-swapcircle-credit` - Credit text color (dark blue)
- `.text-white` - White text

### Border Colors
- `.border-swapcircle` - Light gray border
- `.border-swapcircle-hover` - Medium gray border (hover state)

### Buttons
- `.btn-primary` - Primary blue button with white text
- `.btn-secondary` - Secondary button with border
- `.btn-credit` - Credit display button (light blue background)

### Input Fields
- `.input-swapcircle` - Standard input field with proper styling and focus states

### Headings
- `.heading-script` - Script font for main headings
- `.heading-primary` - Standard heading with primary text color

### Links
- `.link-swapcircle` - Standard link with hover effects

### Cards
- `.card-swapcircle` - Card container with border and background

### Sections
- `.section-swapcircle` - Standard section with white background
- `.section-swapcircle-alt` - Alternative section with off-white background

### Icons
- `.icon-primary` - Primary blue icon color
- `.icon-secondary` - Secondary gray icon color
- `.icon-tertiary` - Tertiary gray icon color
- `.icon-credit` - Credit icon color (dark blue)

### Modals
- `.modal-backdrop` - Modal backdrop with blur effect

## Usage Examples

### Button
```jsx
// ✅ Good - uses utility class
<button className="btn-primary">Swap now</button>

// ❌ Bad - inline style
<button style={{ backgroundColor: '#2563EB', color: '#FFFFFF' }}>Swap now</button>
```

### Heading
```jsx
// ✅ Good - uses utility class
<h1 className="heading-script text-5xl">The best way to swap clothes</h1>

// ❌ Bad - inline style
<h1 style={{ fontFamily: 'var(--font-dancing-script)', color: '#000000' }}>The best way</h1>
```

### Text
```jsx
// ✅ Good - uses utility class
<p className="text-swapcircle-secondary">Description text</p>

// ❌ Bad - inline style
<p style={{ color: '#374151' }}>Description text</p>
```

### Input
```jsx
// ✅ Good - uses utility class
<input className="input-swapcircle" placeholder="Search..." />

// ❌ Bad - inline style
<input style={{ borderColor: '#E5E7EB', color: '#000000' }} />
```

## CSS Variables

All colors are defined as CSS variables in `globals.css`. These variables are used by the utility classes:

- `--swapcircle-primary` - Primary blue (#2563EB)
- `--swapcircle-text-primary` - Black (#000000)
- `--swapcircle-text-secondary` - Dark gray (#374151)
- `--swapcircle-border` - Light gray border (#E5E7EB)
- And more...

## Benefits

1. **Consistency** - All components use the same design system
2. **Maintainability** - Change colors in one place (CSS variables)
3. **Readability** - Clear, semantic class names
4. **Performance** - No inline styles means better CSS caching
5. **Theme Support** - Easy to switch themes by changing CSS variables

## Migration Checklist

When updating a component:
- [ ] Remove all inline `style` attributes
- [ ] Replace with appropriate utility classes
- [ ] Use `.heading-script` for main headings
- [ ] Use `.btn-primary` or `.btn-secondary` for buttons
- [ ] Use `.input-swapcircle` for form inputs
- [ ] Use `.text-swapcircle-*` for text colors
- [ ] Use `.icon-*` classes for icon colors
- [ ] Test that the component looks correct

