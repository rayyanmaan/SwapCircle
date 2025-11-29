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
        // Primary colors
        primary: {
          DEFAULT: theme.colors.primary,
          hover: theme.colors.primaryHover,
        },
        
        // Secondary colors
        secondary: theme.colors.secondary,
        
        // Neutral grays
        neutral: theme.colors.neutral,
        
        // Semantic colors
        success: theme.colors.success,
        error: theme.colors.error,
        warning: theme.colors.warning,
        info: theme.colors.info,
        
        // Special colors
        credit: theme.colors.credit,
        
        // Text colors
        text: theme.colors.text,
        
        // Border colors
        border: {
          DEFAULT: theme.colors.border,
          hover: theme.colors.borderHover,
        },
      },
      
      fontSize: theme.typography.fontSize,
      fontWeight: theme.typography.fontWeight,
      fontFamily: theme.typography.fontFamily,
      
      borderRadius: theme.borderRadius,
      
      boxShadow: theme.shadow,
      
      transitionDuration: theme.transition.duration,
      transitionTimingFunction: theme.transition.timingFunction,
      
      screens: theme.breakpoints,
      
      spacing: {
        ...theme.spacing,
      },
    },
  },
  plugins: [],
};

