/**
 * SwapCircle Theme Configuration - Gen Z Aesthetic
 * 
 * Trending Gen Z vibes: Bubblegum pinks, electric blues, neon greens
 * Inspired by TikTok, Instagram Stories, and Y2K nostalgia
 * 
 * Color Usage Guide:
 * - Primary: Main brand color (trendy purple-pink gradient)
 * - Secondary: Vibrant accent colors for gradients and highlights
 * - Neutral: Soft pastels mixed with bold darks
 * - Semantic: Bright, attention-grabbing status colors
 * - Credit: Eye-catching gold/amber for credits display
 */

export const theme = {
  colors: {
    // Primary brand color - Gen Z purple-pink
    primary: '#9333ea', // Vibrant purple
    primaryHover: '#a855f7', // Lighter purple
    primaryGradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', // Pink to purple
    
    // Secondary/accent colors - Neon & Vibrant palette
    secondary: {
      purple: '#8b5cf6',     // Electric purple
      pink: '#ec4899',       // Bubblegum pink
      hotpink: '#ff006e',    // Hot pink
      blue: '#06b6d4',       // Cyan blue
      mint: '#10b981',       // Mint green
      yellow: '#fbbf24',     // Sunshine yellow
      orange: '#f97316',      // Tangerine
      neon: '#00ff88',       // Neon green
    },
    
    // Neutral colors - Gen Z palette with subtle pastels
    neutral: {
      50: '#fdf2f8',   // Soft pink-tinted white
      100: '#fce7f3',
      200: '#fbcfe8',
      300: '#f9a8d4',
      400: '#f472b6',   // Pink accent
      500: '#a78bfa',   // Purple-accented gray
      600: '#7c3aed',   // Deep purple
      700: '#6b21a8',
      800: '#4c1d95',
      900: '#1e1b4b',   // Dark navy-purple
    },
    
    // Semantic colors - Bright & attention-grabbing
    success: '#10b981',  // Emerald green
    error: '#ff006e',    // Hot pink error (trendy)
    warning: '#fbbf24',  // Sunshine yellow
    info: '#06b6d4',     // Cyan blue
    
    // Special colors
    credit: '#fbbf24',   // Gold for credits
    creditNeon: '#00ff88', // Neon green alternative
    
    // Backgrounds
    background: '#fdf2f8',  // Soft pink-tinted white
    backgroundAlt: '#faf5ff', // Lavender-tinted gray
    
    // Text - Gen Z friendly contrasts
    text: {
      primary: '#1e1b4b',      // Deep purple
      secondary: '#7c3aed',    // Medium purple
      tertiary: '#a78bfa',     // Light purple
      inverse: '#ffffff',       // White text
      pink: '#ec4899',         // Pink text for accents
    },
    
    // Borders - Soft with color accents
    border: '#fbcfe8',         // Soft pink
    borderHover: '#f472b6',    // Vibrant pink
  },
  
  // Spacing scale (used throughout components)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  // Border radius
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  
  // Shadows
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), system-ui, sans-serif',
      mono: 'var(--font-geist-mono), monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Transitions
  transition: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
    },
    timingFunction: {
      default: 'ease-in-out',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
    },
  },
  
  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

/**
 * Get color by path
 * Example: getColor('primary') or getColor('neutral.500')
 */
export const getColor = (path) => {
  const parts = path.split('.');
  let value = theme.colors;
  
  for (const part of parts) {
    value = value?.[part];
    if (value === undefined) return path;
  }
  
  return value;
};

/**
 * Get spacing by key
 */
export const getSpacing = (key) => theme.spacing[key] || key;

/**
 * Export theme as default
 */
export default theme;

