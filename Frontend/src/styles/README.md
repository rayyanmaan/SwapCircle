# SwapCircle Theme System

This directory contains the theme configuration for the SwapCircle platform.

## Overview

The theme system provides a centralized location for all design tokens, making it easy to customize the look and feel of the entire application by modifying a single file.

## Usage

### Changing Colors

To change the primary color, accent colors, or any other design elements, edit the `theme.js` file:

```javascript
// In theme.js, change any color value:
colors: {
  primary: '#000000',  // Change this to update the main brand color
  primaryHover: '#1a1a1a',
  // ... other colors
}
```

The changes will automatically apply throughout all components that use the theme classes.

### Available Theme Tokens

- **Primary Colors**: `primary`, `primaryHover`
- **Secondary Colors**: `secondary.purple`, `secondary.pink`, `secondary.red`, etc.
- **Neutral Colors**: `neutral.50` through `neutral.900` (grays for text and backgrounds)
- **Semantic Colors**: `success`, `error`, `warning`, `info`
- **Special Colors**: `credit` (gold color for currency display)
- **Spacing**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`, `4xl`
- **Border Radius**: `sm`, `md`, `lg`, `full`
- **Shadows**: `sm`, `md`, `lg`, `xl`
- **Typography**: Font families, sizes, weights

## Tailwind Integration

The theme is integrated with Tailwind CSS through `tailwind.config.js`. All colors from the theme are available as Tailwind utility classes:

- Use `bg-primary` for primary background
- Use `text-neutral-600` for secondary text
- Use `border-neutral-300` for borders
- And more...

## Component Usage

Components should use theme-based classes instead of hardcoded colors:

```jsx
// ✅ Good - uses theme
<button className="bg-primary text-white hover:bg-primary-hover">

// ❌ Bad - hardcoded colors
<button className="bg-black text-white hover:bg-gray-800">
```

## Customization Examples

### Changing the Primary Brand Color

Edit `theme.js`:
```javascript
colors: {
  primary: '#6366f1',  // Change to indigo
  primaryHover: '#818cf8',
}
```

### Adding New Colors

```javascript
colors: {
  // ... existing colors
  custom: {
    brandBlue: '#1e40af',
    brandGreen: '#059669',
  },
}
```

Then use in Tailwind: `bg-custom-brandBlue`

## Files

- `theme.js` - Main theme configuration with all design tokens
- `README.md` - This file

## Benefits

1. **Single Source of Truth**: All design values in one place
2. **Easy Theming**: Change colors without touching component code
3. **Consistency**: All components use the same color palette
4. **Maintainability**: Easy to update and manage
5. **Brand Flexibility**: Can rebrand by editing one file

