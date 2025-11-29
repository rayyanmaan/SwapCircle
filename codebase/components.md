# SwapCircle Components Documentation

## Logo Component

**Location**: `Frontend/src/components/Logo.js`

### Description
A reusable logo component that displays the SwapCircle logo with a blue circular icon containing white stylized "O" or concentric circles, followed by the "SwapCircle" text.

### Props
- `className` (string, optional): Additional CSS classes
- `showText` (boolean, optional, default: true): Whether to show the "SwapCircle" text

### Usage
```jsx
import Logo from './Logo';

// Full logo with text
<Logo />

// Logo without text
<Logo showText={false} />

// With custom className
<Logo className="my-custom-class" />
```

## Header Component

**Location**: `Frontend/src/components/Header.js`

### Description
The main navigation header with logo, navigation links, search bar, and action buttons.

### Features
- Responsive design (mobile menu)
- Logo integration
- Navigation links: Browse, How it works, Profile
- Credit display button
- "List Item" button
- Search functionality

## HeroSection Component

**Location**: `Frontend/src/components/HeroSection.js`

### Description
The main hero section on the landing page with:
- Main headline in script font: "The best way to swap clothes on campus."
- Sub-headline explaining the concept
- Two call-to-action buttons: "Swap now" and "List an item"

## ValueProposition Component

**Location**: `Frontend/src/components/ValueProposition.js`

### Description
The "How it works" section displaying three steps:
1. List your clothes
2. Browse and discover
3. Swap with credits

Uses script font for the section title.

