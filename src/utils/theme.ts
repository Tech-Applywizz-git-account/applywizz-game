// Color palette inspired by refero.design
export interface Colors {
  // Primary colors (dark theme)
  background: string;
  surface: string;
  surfaceLight: string;
  
  // Accent colors inspired by refero.design
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary colors
  secondary: string;
  secondaryLight: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // HP bar colors
  hpFull: string;
  hpMedium: string;
  hpLow: string;
  hpBackground: string;
}

export const colors: Colors = {
  // Primary colors (dark theme)
  background: '#0a0a0a',
  surface: '#1a1a1a',
  surfaceLight: '#2a2a2a',
  
  // Accent colors inspired by refero.design
  primary: '#6366f1',
  primaryLight: '#818cf8',
  primaryDark: '#4338ca',
  
  // Secondary colors
  secondary: '#f59e0b',
  secondaryLight: '#fbbf24',
  
  // Text colors
  textPrimary: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // HP bar colors
  hpFull: '#10b981',
  hpMedium: '#f59e0b',
  hpLow: '#ef4444',
  hpBackground: '#374151',
};

export interface Fonts {
  logo: string;
  body: string;
}

export const fonts: Fonts = {
  logo: '"Titillium Web", sans-serif',
  body: '"Open Sans", sans-serif',
};

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
}

export const spacing: Spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
};

export interface BorderRadius {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export const borderRadius: BorderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};