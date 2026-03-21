// colors, spacing, and other design stuff we use everywhere
export const THEME = {
  colors: {
    // Swiss Platinum / Minimalist
    navy: '#0F0F11', // Obsidian Black (Primary)
    navyLight: '#27272A', // Anthracite (Secondary)

    // Platinum accents instead of gold
    accent: '#E2E8F0', // Platinum
    accentDark: '#94A3B8', // Steel
    accentSoft: '#F8FAFC', // Pearl

    // High contrast UI elements
    silver: '#D4D4D8', // Zinc
    silverLight: '#F4F4F5',
    white: '#FFFFFF',

    // Status colors (muting them slightly for a premium feel)
    success: '#059669', // Deep Emerald
    successLight: '#ECFDF5',
    warning: '#D97706', // Refined Amber
    danger: '#B91C1C', // Deep Crimson
    dangerLight: '#FEF2F2',

    // Text and borders
    textMain: '#0F0F11',
    textMuted: '#52525B', // Zinc 600
    borderLight: '#E4E4E7', // Zinc 200
    borderRich: '#D4D4D8', // Zinc 300
    glass: 'rgba(255, 255, 255, 0.85)',

    // A single sharp action color for crucial buttons
    highlight: '#3B82F6', // Electric Blue
  },

  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
    '3xl': '40px',
    '4xl': '64px',
  },

  borderRadius: {
    sm: '4px', // Harder edges often feel more premium and modern
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
    full: '100px',
  },

  shadows: {
    // Sharper, more defined shadows for a sleek metallic feel
    sm: '0 1px 2px rgba(15, 15, 17, 0.05)',
    md: '0 4px 6px -1px rgba(15, 15, 17, 0.1), 0 2px 4px -1px rgba(15, 15, 17, 0.06)',
    lg: '0 10px 15px -3px rgba(15, 15, 17, 0.1), 0 4px 6px -2px rgba(15, 15, 17, 0.05)',
    xl: '0 20px 25px -5px rgba(15, 15, 17, 0.1), 0 10px 10px -5px rgba(15, 15, 17, 0.04)',
  },

  breakpoints: {
    tablet: '1024px',
    mobileLg: '768px',
    mobile: '480px',
    mobileSm: '375px',
  },
};

// converts our theme values into CSS variables that we can use in <style> tags
export const THEME_CSS_VARIABLES = `
:root {
  --navy: ${THEME.colors.navy};
  --navy-light: ${THEME.colors.navyLight};
  --accent: ${THEME.colors.accent};
  --accent-dark: ${THEME.colors.accentDark};
  --accent-soft: ${THEME.colors.accentSoft};
  --accentDark: ${THEME.colors.accentDark};
  --accentSoft: ${THEME.colors.accentSoft};
  --silver: ${THEME.colors.silver};
  --silver-light: ${THEME.colors.silverLight};
  --bg: ${THEME.colors.silverLight};
  --white: ${THEME.colors.white};
  --success: ${THEME.colors.success};
  --success-light: ${THEME.colors.successLight};
  --successLight: ${THEME.colors.successLight};
  --warning: ${THEME.colors.warning};
  --danger: ${THEME.colors.danger};
  --danger-light: ${THEME.colors.dangerLight};
  --dangerLight: ${THEME.colors.dangerLight};
  --text-main: ${THEME.colors.textMain};
  --text-muted: ${THEME.colors.textMuted};
  --border-light: ${THEME.colors.borderLight};
  --border-rich: ${THEME.colors.borderRich};
  --glass: ${THEME.colors.glass};
  --highlight: ${THEME.colors.highlight};

  --space-xs: ${THEME.spacing.xs};
  --space-sm: ${THEME.spacing.sm};
  --space-md: ${THEME.spacing.md};
  --space-lg: ${THEME.spacing.lg};
  --space-xl: ${THEME.spacing.xl};
  --space-2xl: ${THEME.spacing['2xl']};
  --space-3xl: ${THEME.spacing['3xl']};
  --space-4xl: ${THEME.spacing['4xl']};

  --radius-sm: ${THEME.borderRadius.sm};
  --radius-md: ${THEME.borderRadius.md};
  --radius-lg: ${THEME.borderRadius.lg};
  --radius-xl: ${THEME.borderRadius.xl};
  --radius-2xl: ${THEME.borderRadius['2xl']};
  --radius-full: ${THEME.borderRadius.full};

  --shadow-sm: ${THEME.shadows.sm};
  --shadow-md: ${THEME.shadows.md};
  --shadow-lg: ${THEME.shadows.lg};
  --shadow-xl: ${THEME.shadows.xl};

  --bp-tablet: ${THEME.breakpoints.tablet};
  --bp-mobile-lg: ${THEME.breakpoints.mobileLg};
  --bp-mobile: ${THEME.breakpoints.mobile};
  --bp-mobile-sm: ${THEME.breakpoints.mobileSm};

  --font-family: 'Inter', sans-serif;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  --font-sizes-xs: 12px;
  --font-sizes-sm: 14px;
  --font-sizes-base: 16px;
  --font-sizes-lg: 18px;
  --font-sizes-xl: 20px;
  --font-sizes-2xl: 24px;
  --font-sizes-3xl: 30px;
  --font-sizes-4xl: 36px;

  --bs-primary: ${THEME.colors.navy};
  --bs-primary-rgb: 15, 15, 17;
  --bs-link-color: ${THEME.colors.navy};
  --bs-link-hover-color: ${THEME.colors.navyLight};

  --transition: all 0.3s ease;
}
`;

export default THEME;
