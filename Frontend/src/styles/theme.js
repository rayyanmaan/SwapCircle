/**
 * SwapCircle Theme Configuration - Clean & Modern
 * 
 * Clean, minimalist design with blue accents
 * Inspired by modern, professional campus platforms
 */

export const theme = {
  colors: {
    // Primary brand color - Deep Phthalo-inspired Blue
    primary: '#0046B0', // Blue
    primaryHover: '#002E7A', // Darker blue
    primaryLight: '#0052CC', // Lighter blue
    primaryGradient: 'linear-gradient(135deg, #0046B0 0%, #002E7A 100%)', // Blue gradient
    
    // Secondary/accent colors - Blue palette
    secondary: {
      blue: '#0046B0',       // Primary blue
      lightBlue: '#0052CC',  // Light blue
      lighterBlue: '#60A5FA', // Lighter blue
      darkBlue: '#002E7A',   // Dark blue
      veryLightBlue: '#DBEAFE', // Very light blue for backgrounds
    },
    
    // Neutral colors - Clean whites and grays
    neutral: {
      50: '#FFFFFF',   // Pure white
      100: '#F9FAFB',  // Off-white
      200: '#F3F4F6',  // Light gray
      300: '#E5E7EB',  // Medium light gray
      400: '#D1D5DB',  // Medium gray
      500: '#9CA3AF',  // Gray
      600: '#6B7280',  // Dark gray
      700: '#4B5563',  // Darker gray
      800: '#374151',  // Very dark gray
      900: '#0F0F0F',  // Almost black
    },
    
    // Semantic colors - Standard status colors
    success: '#10B981',      // Green
    successText: '#065F46',  // Dark green text
    error: '#EF4444',        // Red
    errorText: '#7F1D1D',    // Dark red text
    warning: '#F59E0B',      // Amber
    warningText: '#92400E',  // Dark amber text
    pending: '#FEF3C7',      // Light yellow background
    pendingText: '#92400E',  // Dark yellow text
    info: '#0046B0',         // Blue
    infoText: '#001F5C',     // Dark blue text
    
    // Special colors
    credit: '#DBEAFE',   // Light blue for credits display
    creditText: '#1E40AF', // Dark blue for credit text
    
    // Backgrounds
    background: '#FFFFFF',  // Pure white
    backgroundAlt: '#F9FAFB', // Off-white
    
    // Text - Almost black and grays
    text: {
      primary: '#0F0F0F',      // Almost black
      secondary: '#374151',    // Dark gray
      tertiary: '#6B7280',     // Medium gray
      inverse: '#FFFFFF',       // White text
      blue: '#0046B0',         // Blue text for accents
    },
    
    // Borders - Clean grays
    border: '#E5E7EB',         // Light gray
    borderHover: '#D1D5DB',    // Medium gray
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
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  
  // Shadows
  shadow: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      sans: 'var(--font-geist-sans), system-ui, sans-serif',
      serif: 'var(--font-garamond), Georgia, serif', // EB Garamond
      script: 'var(--font-dancing-script), cursive',
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
      '6xl': '3.75rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
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
      linear: 'linear',
    },
  },
  
  // Breakpoints (for responsive design)
  breakpoints: {
    sm: '640px',   // Small phones
    md: '768px',   // Tablets
    lg: '1024px',  // Desktops
    xl: '1280px',  // Large desktops
    '2xl': '1536px', // Extra large
  },
};

/**
 * Get color by path
 * Example: getColor('primary') or getColor('neutral.900')
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
 * Get font size by key
 */
export const getFontSize = (key) => theme.typography.fontSize[key] || key;

/**
 * Export theme as default
 */
export default theme;