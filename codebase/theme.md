# SwapCircle Theme Documentation

## Overview

The SwapCircle theme uses a clean, minimalist design with deep phthalo blue accents. The design is inspired by modern, professional campus platforms and emphasizes clarity, usability, and visual consistency.

---

## Fonts

### Script Font (Headings)
- **Font**: Dancing Script (from Google Fonts)
- **Usage**: Used for main headings and section titles
- **CSS Variable**: `--font-dancing-script`
- **Font Weight**: 400 (normal)
- **Example**: "The best way to swap clothes on campus." and "How it works"

### Sans-Serif Font (Body)
- **Font**: Geist Sans (default system font)
- **Usage**: Used for body text, navigation, and general content
- **CSS Variable**: `--font-geist-sans`
- **Fallback**: `system-ui, sans-serif`

### Serif Font (Headings)
- **Font**: EB Garamond (from Google Fonts)
- **Usage**: Used for primary headings (alternative to script)
- **CSS Variable**: `--font-garamond`
- **Fallback**: `Georgia, serif`
- **Font Weight**: 600 (semibold)

### Monospace Font
- **Font**: Geist Mono
- **Usage**: Code blocks and technical content
- **CSS Variable**: `--font-geist-mono`
- **Fallback**: `monospace`

---

## Color Palette

### Primary Colors

#### Deep Phthalo Blue
- **Primary Blue**: `#0046B0` - Main brand color for buttons and interactive elements
- **Primary Hover**: `#002E7A` - Darker blue for hover states
- **Primary Light**: `#0052CC` - Lighter blue variant

**CSS Variables:**
- `--swapcircle-primary`: #0046B0
- `--swapcircle-primary-hover`: #002E7A
- `--swapcircle-primary-light`: #0052CC

### Secondary Colors (Blue Palette)

- **Blue**: `#0046B0` - Primary blue
- **Light Blue**: `#0052CC` - Light blue
- **Lighter Blue**: `#60A5FA` - Lighter blue
- **Dark Blue**: `#002E7A` - Dark blue
- **Very Light Blue**: `#DBEAFE` - Very light blue for backgrounds

**CSS Variables:**
- `--swapcircle-blue`: #0046B0
- `--swapcircle-light-blue`: #0052CC
- `--swapcircle-lighter-blue`: #60A5FA
- `--swapcircle-dark-blue`: #002E7A
- `--swapcircle-very-light-blue`: #DBEAFE

### Neutral Colors (Gray Scale)

Clean whites and grays for backgrounds, borders, and text:

- **Neutral 50**: `#FFFFFF` - Pure white
- **Neutral 100**: `#F9FAFB` - Off-white
- **Neutral 200**: `#F3F4F6` - Light gray
- **Neutral 300**: `#E5E7EB` - Medium light gray
- **Neutral 400**: `#D1D5DB` - Medium gray
- **Neutral 500**: `#9CA3AF` - Gray
- **Neutral 600**: `#6B7280` - Dark gray
- **Neutral 700**: `#4B5563` - Darker gray
- **Neutral 800**: `#374151` - Very dark gray
- **Neutral 900**: `#0F0F0F` - Almost black

**CSS Variables:**
- `--swapcircle-neutral-50` through `--swapcircle-neutral-900`

### Semantic Colors

Standard status colors for feedback and notifications:

- **Success**: `#10b981` - Green for success messages
- **Success Text**: `#065F46` - Dark green for text
- **Error**: `#EF4444` - Red for error messages
- **Error Text**: `#7F1D1D` - Dark red for text
- **Warning**: `#F59E0B` - Amber for warnings
- **Warning Text**: `#92400E` - Dark amber for text
- **Info**: `#0046B0` - Blue for informational messages
- **Info Text**: `#001F5C` - Dark blue for text
- **Pending**: `#FEF3C7` - Light yellow background
- **Pending Text**: `#92400E` - Dark yellow text

**CSS Variables:**
- `--swapcircle-success`: #10b981
- `--swapcircle-error`: #ef4444
- `--swapcircle-warning`: #f59e0b
- `--swapcircle-info`: #0046B0

### Special Colors

- **Credit Display Background**: `#DBEAFE` - Light blue background
- **Credit Display Text**: `#1E40AF` - Dark blue text

**CSS Variables:**
- `--swapcircle-credit`: #DBEAFE
- `--swapcircle-credit-text`: #1E40AF

### Background Colors

- **Background**: `#FFFFFF` - Pure white
- **Background Alt**: `#F9FAFB` - Off-white for alternate sections

**CSS Variables:**
- `--background`: #FFFFFF
- `--swapcircle-background-alt`: #F9FAFB

### Text Colors

- **Text Primary**: `#0F0F0F` - Almost black (primary text)
- **Text Secondary**: `#374151` - Dark gray (secondary text)
- **Text Tertiary**: `#6B7280` - Medium gray (tertiary text)
- **Text Inverse**: `#FFFFFF` - White text (for dark backgrounds)
- **Text Blue**: `#0046B0` - Blue text for accents

**CSS Variables:**
- `--swapcircle-text-primary`: #0F0F0F
- `--swapcircle-text-secondary`: #374151
- `--swapcircle-text-tertiary`: #6B7280

### Border Colors

- **Border**: `#E5E7EB` - Light gray border
- **Border Hover**: `#D1D5DB` - Medium gray border (hover state)

**CSS Variables:**
- `--swapcircle-border`: #E5E7EB
- `--swapcircle-border-hover`: #D1D5DB

---

## Typography

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)
- **6xl**: 3.75rem (60px)

### Font Weights

- **normal**: 400
- **medium**: 500
- **semibold**: 600
- **bold**: 700

### Line Heights

- **tight**: 1.2
- **normal**: 1.5
- **relaxed**: 1.75

---

## Spacing Scale

Consistent spacing values used throughout components:

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **2xl**: 3rem (48px)
- **3xl**: 4rem (64px)
- **4xl**: 6rem (96px)

---

## Border Radius

- **none**: 0
- **sm**: 0.25rem (4px)
- **md**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **full**: 9999px (fully rounded, pill shape)

---

## Shadows

- **none**: none
- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

---

## Transitions

### Duration
- **fast**: 150ms
- **normal**: 200ms
- **slow**: 300ms

### Timing Functions
- **default**: ease-in-out
- **easeIn**: ease-in
- **easeOut**: ease-out
- **linear**: linear

---

## Breakpoints (Responsive Design)

- **sm**: 640px (Small phones)
- **md**: 768px (Tablets)
- **lg**: 1024px (Desktops)
- **xl**: 1280px (Large desktops)
- **2xl**: 1536px (Extra large screens)

---

## Logo

The SwapCircle logo consists of:
- **Blue circular icon**: Contains white stylized "O" or concentric circles
- **Text**: "SwapCircle" in black, semibold weight
- **Implementation**: See `Frontend/src/components/Logo.js`

---

## Dark Mode Support

The theme includes dark mode support via `@media (prefers-color-scheme: dark)`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

---

## Theme Configuration Files

### 1. CSS Variables (`Frontend/src/app/globals.css`)
- Defines all CSS custom properties
- Contains utility classes
- Includes animations and transitions

### 2. Theme Object (`Frontend/src/styles/theme.js`)
- JavaScript theme configuration
- Exported as `theme` object
- Used by Tailwind CSS configuration
- Provides helper functions: `getColor()`, `getSpacing()`, `getFontSize()`

### 3. Tailwind Config (`Frontend/tailwind.config.js`)
- Extends Tailwind with theme values
- Maps theme colors to Tailwind utilities
- Configures typography, spacing, and breakpoints

---

## Usage in Components

### Using CSS Variables Directly

```jsx
// In CSS/globals.css
.my-custom-class {
  color: var(--swapcircle-primary);
  background-color: var(--swapcircle-neutral-50);
}
```

### Using Theme Object in JavaScript

```jsx
import { theme } from '@/styles/theme';
import { getColor } from '@/styles/theme';

// Access theme values
const primaryColor = theme.colors.primary; // #0046B0
const spacing = theme.spacing.md; // 1rem

// Use helper function
const color = getColor('primary'); // #0046B0
const nestedColor = getColor('neutral.900'); // #0F0F0F
```

### Using Utility Classes

```jsx
// Use utility classes from globals.css
<button className="btn-primary">Click me</button>
<h1 className="heading-script text-5xl">Title</h1>
<p className="text-swapcircle-secondary">Description</p>
```

### Using Tailwind Classes

```jsx
// Tailwind classes use theme values
<div className="bg-primary text-white p-md rounded-lg">
  Content
</div>
```

---

## Color Usage Guidelines

### Primary Blue (#0046B0)
- Use for: Primary buttons, links, active states, brand elements
- Avoid: Large background areas, body text

### Neutral Grays
- Use for: Backgrounds, borders, secondary text
- **Neutral 50-200**: Backgrounds
- **Neutral 300-400**: Borders
- **Neutral 500-600**: Secondary text
- **Neutral 700-900**: Primary text, emphasis

### Semantic Colors
- **Success**: Confirmation messages, success states
- **Error**: Error messages, destructive actions
- **Warning**: Warning messages, caution states
- **Info**: Informational messages, tips

---

## Accessibility

- **Text Contrast**: All text colors meet WCAG AA contrast requirements
- **Focus States**: Interactive elements have visible focus indicators
- **Color Independence**: Information is not conveyed by color alone

---

## Custom Scrollbar

The theme includes custom scrollbar styling:

```css
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
```

---

## Smooth Scrolling

Smooth scrolling is enabled globally:

```css
html {
  scroll-behavior: smooth;
}
```

---

## Notes

- All colors are defined as CSS variables for easy theme switching
- The theme follows a mobile-first responsive design approach
- Typography uses system fonts for better performance
- The design emphasizes clean, minimalist aesthetics
- Blue is the primary brand color, used consistently throughout

---

## Theme Updates

To update the theme:

1. **Colors**: Modify CSS variables in `globals.css`
2. **Typography**: Update font families in `globals.css` and `theme.js`
3. **Spacing**: Adjust spacing scale in `theme.js`
4. **Components**: Update utility classes in `globals.css`

All changes will automatically propagate through the application via CSS variables and the theme object.
