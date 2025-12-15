# SwapCircle Styling Guide

## Overview

All components in SwapCircle use a centralized styling system through `globals.css` utility classes. This ensures consistency across the entire application and makes it easy to maintain and update the design system.

## Core Principle

**Never use inline styles.** Always use utility classes from `globals.css` that reference CSS variables. This ensures:
- Consistent design across all components
- Easy theme updates via CSS variables
- Better performance through CSS caching
- Maintainable codebase

---

## Available Utility Classes

### Background Colors

- `.bg-swapcircle-primary` - Primary blue background (#0046B0)
- `.bg-swapcircle-white` - White background (#FFFFFF)
- `.bg-swapcircle-alt` - Alternative background (off-white, #F9FAFB)
- `.bg-swapcircle-credit` - Credit display background (light blue, #DBEAFE)
- `.bg-swapcircle-success` - Success green background (#10b981)
- `.bg-swapcircle-error` - Error red background (#ef4444)
- `.bg-swapcircle-info` - Info blue background (#0046B0)
- `.bg-swapcircle-very-light-blue` - Very light blue background (#DBEAFE)
- `.bg-swapcircle-neutral-100` - Neutral light gray background (#F9FAFB)

### Text Colors

- `.text-swapcircle-primary` - Primary text (almost black, #0F0F0F)
- `.text-swapcircle-secondary` - Secondary text (dark gray, #374151)
- `.text-swapcircle-tertiary` - Tertiary text (medium gray, #6B7280)
- `.text-swapcircle-blue` - Blue text (#0046B0)
- `.text-swapcircle-credit` - Credit text color (dark blue, #1E40AF)
- `.text-swapcircle-success` - Success green text (#10b981)
- `.text-swapcircle-error` - Error red text (#ef4444)
- `.text-swapcircle-info` - Info blue text (#0046B0)
- `.text-white` - White text (#FFFFFF)

### Border Colors

- `.border-swapcircle` - Light gray border (#E5E7EB)
- `.border-swapcircle-hover` - Medium gray border for hover states (#D1D5DB)
- `.border-swapcircle-primary` - Primary blue border (#0046B0)

### Buttons

#### Primary Button (`.btn-primary`)
- Primary blue background with white text
- Padding: 0.625rem 1.5rem (10px 24px)
- Border radius: 0.5rem (8px)
- Font weight: 500
- Hover effect: Darker blue background with slight lift and shadow
- Active state: Returns to original position

**Usage:**
```jsx
<button className="btn-primary">Swap now</button>
```

#### Secondary Button (`.btn-secondary`)
- White background with border
- Padding: 0.625rem 1.5rem (10px 24px)
- Border radius: 0.5rem (8px)
- Border: 1.5px solid light gray
- Hover effect: Darker border and light background with lift

**Usage:**
```jsx
<button className="btn-secondary">Cancel</button>
```

#### Credit Button (`.btn-credit`)
- Light blue background with dark blue text
- Padding: 0.5rem 1.25rem (8px 20px)
- Border radius: 9999px (fully rounded)
- Smaller font size (0.875rem)
- Hover effect: Lighter blue background with blue border

**Usage:**
```jsx
<button className="btn-credit">2 Credits</button>
```

### Input Fields

#### Standard Input (`.input-swapcircle`)
- Full width
- Padding: 0.75rem 1rem (12px 16px)
- Border: 1px solid light gray
- Border radius: 0.375rem (6px)
- Focus state: Blue border with subtle shadow
- Placeholder: Medium gray text

**Usage:**
```jsx
<input className="input-swapcircle" placeholder="Enter text..." />
```

#### Search Bar - Tube/Pill Shape (`.search-tube`)
- Full width
- Padding: 0.625rem 1rem 0.625rem 2.75rem (10px 16px 10px 44px)
- Border radius: 9999px (fully rounded, pill shape)
- Border: 1px solid light gray
- Smaller font size (0.875rem)
- Focus state: Blue border with subtle shadow
- Designed for search inputs with left icon

**Usage:**
```jsx
<input className="search-tube" placeholder="Search items..." />
```

### Headings

#### Script Font Heading (`.heading-script`)
- Font: Dancing Script (cursive)
- Color: Primary text color
- Font weight: 400

**Usage:**
```jsx
<h1 className="heading-script text-5xl">The best way to swap clothes</h1>
```

#### Primary Heading (`.heading-primary`)
- Font: Serif font (EB Garamond, Georgia)
- Color: Primary text color
- Font weight: 600

**Usage:**
```jsx
<h2 className="heading-primary text-2xl">Section Title</h2>
```

### Links

#### Standard Link (`.link-swapcircle`)
- Color: Primary text color
- Hover effect: Opacity 0.7
- Smooth transition

**Usage:**
```jsx
<Link href="/browse" className="link-swapcircle">Browse Items</Link>
```

### Cards

#### Card Container (`.card-swapcircle`)
- White background
- Border radius: 0.5rem (8px)
- Border: 1px solid light gray

**Usage:**
```jsx
<div className="card-swapcircle p-4">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Sections

#### Standard Section (`.section-swapcircle`)
- White background
- Padding: 3rem 1rem (48px 16px)

**Usage:**
```jsx
<section className="section-swapcircle">
  <h2>Section Title</h2>
</section>
```

#### Alternative Section (`.section-swapcircle-alt`)
- Off-white background (#F9FAFB)
- Padding: 3rem 1rem (48px 16px)

**Usage:**
```jsx
<section className="section-swapcircle-alt">
  <h2>Alternate Section</h2>
</section>
```

### Icons

- `.icon-primary` - Primary blue icon color (#0046B0)
- `.icon-secondary` - Secondary gray icon color (#374151)
- `.icon-tertiary` - Tertiary gray icon color (#6B7280)
- `.icon-credit` - Credit icon color (dark blue, #1E40AF)

**Usage:**
```jsx
<svg className="w-5 h-5 icon-primary">
  <path d="..." />
</svg>
```

### Modals

#### Modal Backdrop (`.modal-backdrop`)
- Semi-transparent blue background (rgba(0, 70, 176, 0.1))
- Backdrop filter blur (4px)

**Usage:**
```jsx
<div className="modal-backdrop fixed inset-0 z-50">
  <div className="modal-content">...</div>
</div>
```

---

## Special Utility Classes

### Availability Indicators

#### Unavailable Listing (`.listing-unavailable`)
- Opacity: 0.95
- Smooth transition for opacity, filter, and transform
- Used for items that are pending or unavailable

#### Unavailable Overlay (`.unavailable-overlay`)
- Dark overlay (rgba(0, 0, 0, 0.6))
- Position: absolute, covers entire element
- Z-index: 5
- Used to darken unavailable items while keeping labels visible

### Swap History Tabs (`.swap-history-tabs`)
- Border radius: 9999px (fully rounded)
- Padding: 2px
- Inline flex display with gap
- Subtle box shadow
- Dialer-inspired look

**Usage:**
```jsx
<div className="swap-history-tabs">
  <button>All</button>
  <button>Completed</button>
</div>
```

### Tab Badge (`.tab-badge`)
- Light gray background (rgba(0,0,0,0.04))
- Padding: 0 6px
- Border radius: 9999px
- Small font size (0.75rem)
- Tertiary text color

---

## Animation Classes

### Swap Animations

- `.animate-swap-bounce-left` - Bounce animation from left (2s duration)
- `.animate-swap-bounce-right` - Bounce animation from right (2s duration)
- `.animate-swap-meet-left` - Meet animation moving left (0.8s duration)
- `.animate-swap-meet-right` - Meet animation moving right (0.8s duration)
- `.animate-check-scale` - Scale animation for checkmark (0.6s duration, 1.8s delay)

### General Animations

- `.animate-fade-in` - Fade in animation (0.3s duration)
- `.animate-slide-in-right` - Slide in from right (0.3s duration)

**Usage:**
```jsx
<div className="animate-swap-bounce-left">
  <div className="circle">...</div>
</div>
```

---

## CSS Variables

All colors are defined as CSS variables in `globals.css`. These variables are used by the utility classes:

### Primary Colors
- `--swapcircle-primary`: #0046B0 (Deep Phthalo Blue)
- `--swapcircle-primary-hover`: #002E7A (Darker blue)

### Secondary Colors
- `--swapcircle-blue`: #0046B0
- `--swapcircle-light-blue`: #0052CC
- `--swapcircle-lighter-blue`: #60A5FA
- `--swapcircle-dark-blue`: #002E7A
- `--swapcircle-very-light-blue`: #DBEAFE

### Neutral Colors
- `--swapcircle-neutral-50` through `--swapcircle-neutral-900`: Gray scale from white to almost black

### Semantic Colors
- `--swapcircle-success`: #10b981 (Green)
- `--swapcircle-error`: #ef4444 (Red)
- `--swapcircle-warning`: #f59e0b (Amber)
- `--swapcircle-info`: #0046B0 (Blue)

### Special Colors
- `--swapcircle-credit`: #DBEAFE (Light blue)
- `--swapcircle-credit-text`: #1E40AF (Dark blue)

### Text Colors
- `--swapcircle-text-primary`: #0F0F0F (Almost black)
- `--swapcircle-text-secondary`: #374151 (Dark gray)
- `--swapcircle-text-tertiary`: #6B7280 (Medium gray)

### Border Colors
- `--swapcircle-border`: #E5E7EB (Light gray)
- `--swapcircle-border-hover`: #D1D5DB (Medium gray)

---

## Usage Examples

### Button
```jsx
// ✅ Good - uses utility class
<button className="btn-primary">Swap now</button>

// ❌ Bad - inline style
<button style={{ backgroundColor: '#0046B0', color: '#FFFFFF' }}>Swap now</button>
```

### Heading
```jsx
// ✅ Good - uses utility class
<h1 className="heading-script text-5xl">The best way to swap clothes</h1>

// ❌ Bad - inline style
<h1 style={{ fontFamily: 'var(--font-dancing-script)', color: '#0F0F0F' }}>The best way</h1>
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

// ✅ Good - search input with pill shape
<input className="search-tube" placeholder="Search items..." />

// ❌ Bad - inline style
<input style={{ borderColor: '#E5E7EB', color: '#0F0F0F' }} />
```

### Card with Content
```jsx
// ✅ Good - uses utility classes
<div className="card-swapcircle p-6">
  <h3 className="heading-primary text-xl mb-2">Card Title</h3>
  <p className="text-swapcircle-secondary">Card content goes here</p>
</div>
```

### Icon
```jsx
// ✅ Good - uses utility class
<svg className="w-5 h-5 icon-primary" fill="none" viewBox="0 0 24 24">
  <path d="..." />
</svg>

// ❌ Bad - inline style
<svg style={{ color: '#0046B0' }}>...</svg>
```

---

## Combining with Tailwind CSS

Utility classes can be combined with Tailwind CSS classes:

```jsx
<div className="card-swapcircle p-6 mb-4 hover:shadow-lg transition-shadow">
  <h3 className="heading-primary text-xl mb-2">Title</h3>
  <p className="text-swapcircle-secondary text-sm">Content</p>
</div>
```

---

## Benefits

1. **Consistency** - All components use the same design system
2. **Maintainability** - Change colors in one place (CSS variables)
3. **Readability** - Clear, semantic class names
4. **Performance** - No inline styles means better CSS caching
5. **Theme Support** - Easy to switch themes by changing CSS variables
6. **Type Safety** - CSS variables prevent typos and invalid colors

---

## Migration Checklist

When updating a component:

- [ ] Remove all inline `style` attributes
- [ ] Replace with appropriate utility classes
- [ ] Use `.heading-script` for main headings
- [ ] Use `.btn-primary` or `.btn-secondary` for buttons
- [ ] Use `.input-swapcircle` for standard inputs
- [ ] Use `.search-tube` for search inputs
- [ ] Use `.text-swapcircle-*` for text colors
- [ ] Use `.icon-*` classes for icon colors
- [ ] Use `.card-swapcircle` for card containers
- [ ] Use `.section-swapcircle` or `.section-swapcircle-alt` for sections
- [ ] Test that the component looks correct
- [ ] Verify responsive behavior
- [ ] Check hover and focus states

---

## Responsive Design

While utility classes handle styling, use Tailwind CSS responsive prefixes for layout:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="card-swapcircle p-4">...</div>
</div>
```

---

## Notes

- All utility classes are defined in `Frontend/src/app/globals.css`
- CSS variables are defined in `:root` selector
- Dark mode support is available via `@media (prefers-color-scheme: dark)`
- Custom scrollbar styles are included in `globals.css`
- Smooth scrolling is enabled for the entire page
