// Responsive breakpoints
export const breakpoints = {
  mobile: '640px',
  tablet: '768px',
  desktop: '1024px',
  largeDesktop: '1280px',
} as const;

// Media query helper
export const mediaQuery = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
  largeDesktop: `@media (max-width: ${breakpoints.largeDesktop})`,
} as const;

// Responsive styles helper
export const responsive = {
  // Grid columns based on screen size
  getGridColumns: (mobile: number, tablet: number, desktop: number) => ({
    gridTemplateColumns: `repeat(${mobile}, 1fr)`,
    [`@media (min-width: ${breakpoints.mobile})`]: {
      gridTemplateColumns: `repeat(${tablet}, 1fr)`,
    },
    [`@media (min-width: ${breakpoints.desktop})`]: {
      gridTemplateColumns: `repeat(${desktop}, 1fr)`,
    },
  }),

  // Spacing based on screen size
  getSpacing: (mobile: string, tablet?: string, desktop?: string) => ({
    padding: mobile,
    [`@media (min-width: ${breakpoints.mobile})`]: {
      padding: tablet || mobile,
    },
    [`@media (min-width: ${breakpoints.desktop})`]: {
      padding: desktop || tablet || mobile,
    },
  }),

  // Font size based on screen size
  getFontSize: (mobile: string, tablet?: string, desktop?: string) => ({
    fontSize: mobile,
    [`@media (min-width: ${breakpoints.mobile})`]: {
      fontSize: tablet || mobile,
    },
    [`@media (min-width: ${breakpoints.desktop})`]: {
      fontSize: desktop || tablet || mobile,
    },
  }),

  // Flex direction based on screen size
  getFlexDirection: (mobile: 'row' | 'column', desktop?: 'row' | 'column') => ({
    flexDirection: mobile,
    [`@media (min-width: ${breakpoints.desktop})`]: {
      flexDirection: desktop || mobile,
    },
  }),
};

// Hook to check if screen is mobile
export const useIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= parseInt(breakpoints.mobile);
};

// Hook to check if screen is tablet
export const useIsTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= parseInt(breakpoints.tablet);
};

// Common responsive styles
export const responsiveStyles = {
  // Sidebar responsive margin
  sidebarMargin: {
    marginLeft: '0',
    [`@media (min-width: ${breakpoints.desktop})`]: {
      marginLeft: '280px',
    },
  },

  // Container responsive styles
  container: {
    padding: '1rem',
    [`@media (min-width: ${breakpoints.tablet})`]: {
      padding: '2rem',
    },
    [`@media (min-width: ${breakpoints.desktop})`]: {
      padding: '3rem',
    },
  },

  // Grid responsive styles
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1rem',
    [`@media (min-width: ${breakpoints.mobile})`]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    [`@media (min-width: ${breakpoints.desktop})`]: {
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
    },
  },
};