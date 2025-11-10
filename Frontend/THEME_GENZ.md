# Gen Z Theme - SwapCircle

## Overview
The SwapCircle app now features a trendy Gen Z aesthetic with vibrant colors, gradient transitions, and a modern, youthful vibe inspired by TikTok, Instagram Stories, and Y2K nostalgia.

## Color Palette

### Primary Colors
- **Primary**: `#9333ea` - Vibrant purple (main brand color)
- **Primary Hover**: `#a855f7` - Lighter purple gradient
- **Gradient**: Pink to Purple (`linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)`)

### Secondary Colors
- **Purple**: `#8b5cf6` - Electric purple
- **Pink**: `#ec4899` - Bubblegum pink
- **Hot Pink**: `#ff006e` - Hot pink accent
- **Cyan**: `#06b6d4` - Cyan blue
- **Mint**: `#10b981` - Mint green
- **Yellow**: `#fbbf24` - Sunshine yellow
- **Orange**: `#f97316` - Tangerine
- **Neon Green**: `#00ff88` - Neon green accent

### Neutral Palette (Pink-Tinted)
- **50**: `#fdf2f8` - Soft pink-tinted white (background)
- **100**: `#fce7f3` - Light pink
- **200**: `#fbcfe8` - Soft pink (borders)
- **300**: `#f9a8d4` - Medium pink
- **400**: `#f472b6` - Vibrant pink
- **500**: `#a78bfa` - Purple-accented gray
- **600**: `#7c3aed` - Deep purple (text)
- **700**: `#6b21a8` - Dark purple
- **800**: `#4c1d95` - Very dark purple
- **900**: `#1e1b4b` - Deep navy-purple (primary text)

### Semantic Colors
- **Success**: `#10b981` - Emerald green
- **Error**: `#ff006e` - Hot pink (trendy alternative to red)
- **Warning**: `#fbbf24` - Sunshine yellow
- **Info**: `#06b6d4` - Cyan blue

## Design Elements

### Hero Section
- **Browse Section**: Hot pink → Pink → Purple gradient
- **List Section**: Yellow → Orange → Hot pink gradient

### Background
- Primary: Soft pink-tinted white (`#fdf2f8`)
- Secondary: Lavender-tinted gray (`#faf5ff`)

## Usage in Tailwind

All colors are available as Tailwind utility classes:

```jsx
// Primary colors
<button className="bg-primary text-white hover:bg-primary-hover">

// Secondary gradients
<div className="bg-gradient-to-br from-secondary-hotpink via-secondary-pink">

// Neutral colors
<div className="bg-neutral-50 text-neutral-900">

// Semantic colors
<span className="text-error">Error</span>
<span className="text-success">Success</span>
```

## Customization

To adjust the Gen Z theme, edit `Frontend/src/styles/theme.js`:

1. **Make it more vibrant**: Increase saturation in secondary colors
2. **Make it softer**: Use lighter shades of pink/purple
3. **Change accent color**: Modify the hotpink value
4. **Adjust contrast**: Tweak the neutral scale

## Inspiration

- TikTok's vibrant color schemes
- Instagram Story gradients
- Y2K nostalgia aesthetics
- Gen Z fashion trends
- Modern app UI design

## Files Updated

- `Frontend/src/styles/theme.js` - Updated color palette
- `Frontend/src/app/globals.css` - Updated CSS variables
- `Frontend/src/components/HeroSection.js` - Gen Z gradients
- `Frontend/tailwind.config.js` - Integrated theme

