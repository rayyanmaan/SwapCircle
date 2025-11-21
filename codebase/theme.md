# SwapCircle Theme Documentation

## Overview

The SwapCircle theme uses a clean, minimalist design with blue accents, matching the design from the reference image.

## Fonts

### Script Font (Headings)
- **Font**: Dancing Script (from Google Fonts)
- **Usage**: Used for main headings and section titles
- **CSS Variable**: `--font-dancing-script`
- **Example**: "The best way to swap clothes on campus." and "How it works"

### Sans-Serif Font (Body)
- **Font**: Geist Sans (default)
- **Usage**: Used for body text, navigation, and general content
- **CSS Variable**: `--font-geist-sans`

## Colors

### Primary Colors
- **Primary Blue**: `#2563EB` - Main brand color for buttons and interactive elements
- **Primary Hover**: `#1D4ED8` - Darker blue for hover states

### Neutral Colors
- **Background**: `#FFFFFF` (Pure white)
- **Text Primary**: `#000000` (Black)
- **Text Secondary**: `#374151` (Dark gray)
- **Border**: `#E5E7EB` (Light gray)

### Special Colors
- **Credit Display**: `#DBEAFE` (Light blue background) with `#1E40AF` (Dark blue text)

## Logo

The logo consists of:
- Blue circular icon with white stylized "O" or concentric circles
- "SwapCircle" text in black, semibold weight

See `Frontend/src/components/Logo.js` for implementation.

## Usage

### In Components

```jsx
// Script font for headings
<h1 style={{ 
  fontFamily: 'var(--font-dancing-script), cursive',
  color: '#000000',
  fontWeight: 400
}}>
  The best way to swap clothes on campus.
</h1>

// Primary blue button
<button style={{ 
  backgroundColor: '#2563EB',
  color: '#FFFFFF'
}}>
  Swap now
</button>
```

### Theme File

The theme configuration is located in `Frontend/src/styles/theme.js` and is integrated with Tailwind CSS through `Frontend/tailwind.config.js`.

