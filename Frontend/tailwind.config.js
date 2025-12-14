import theme from './src/styles/theme.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        primary: theme.colors.primary,
        'primary-hover': theme.colors.primaryHover,
        'primary-light': theme.colors.primaryLight,
        
        // Secondary colors
        secondary: theme.colors.secondary,
        
        // Neutral colors
        neutral: theme.colors.neutral,
        
        // Semantic colors
        success: theme.colors.success,
        error: theme.colors.error,
        warning: theme.colors.warning,
        info: theme.colors.info,
        
        // Special colors
        credit: theme.colors.credit,
        'credit-text': theme.colors.creditText,
        
        // Text colors
        'text-primary': theme.colors.text.primary,
        'text-secondary': theme.colors.text.secondary,
        'text-tertiary': theme.colors.text.tertiary,
        'text-inverse': theme.colors.text.inverse,
        'text-blue': theme.colors.text.blue,
        
        // Border colors
        border: theme.colors.border,
        'border-hover': theme.colors.borderHover,
        
        // Backgrounds
        background: theme.colors.background,
        'background-alt': theme.colors.backgroundAlt,
      },
      
      // Typography
      fontFamily: theme.typography.fontFamily,
      
      fontSize: theme.typography.fontSize,
      
      fontWeight: theme.typography.fontWeight,
      
      lineHeight: theme.typography.lineHeight,
      
      // Spacing
      spacing: theme.spacing,
      
      // Border Radius
      borderRadius: theme.borderRadius,
      
      // Border Width - Add border-3 support
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        2: '2px',
        3: '3px',
        4: '4px',
        8: '8px',
      },
      
      // Shadows
      boxShadow: theme.shadow,
      
      // Transitions
      transitionDuration: theme.transition.duration,
      
      transitionTimingFunction: theme.transition.timingFunction,
      
      // Breakpoints (Responsive)
      screens: theme.breakpoints,
    },
  },
  plugins: [],
};