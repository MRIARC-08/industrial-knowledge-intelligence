// mobile/src/lib/theme.ts
// PhonePe-inspired design system — 100% solid colors, zero transparency

export const colors = {
  // Backgrounds — pure solid whites and light blues
  bg: {
    page: '#F0F4FF',       // App page background — soft solid blue-white
    card: '#FFFFFF',       // Card surfaces — pure white
    input: '#EEF2FF',      // Input fields — light indigo fill
    border: '#D1D9FF',     // Borders — solid medium blue-grey
    section: '#E8EEFF',    // Section separators / strips
  },

  // Text — dark navy for maximum readability on white
  text: {
    primary: '#11175E',    // Dark navy — headings and important text
    secondary: '#4A5299',  // Medium blue — supporting text
    muted: '#8893CC',      // Muted blue — labels, timestamps
    onBlue: '#FFFFFF',     // White text — on solid blue buttons
    onDark: '#FFFFFF',     // White text — on dark surfaces
  },

  // Primary brand — solid blues only
  brand: {
    primary: '#2D5BE3',    // Main brand blue — buttons, CTAs
    dark: '#1A3DB5',       // Pressed / dark variant
    light: '#EEF2FF',      // Light blue fill — icon backgrounds
    lighter: '#F5F7FF',    // Lightest blue fill — subtle highlights
  },

  // Status colors — solid pastel fills with strong text
  status: {
    successBg: '#D1FAE5',
    successText: '#065F46',
    successBorder: '#6EE7B7',

    warningBg: '#FEF3C7',
    warningText: '#92400E',
    warningBorder: '#FCD34D',

    dangerBg: '#FEE2E2',
    dangerText: '#991B1B',
    dangerBorder: '#FCA5A5',

    infoBg: '#DBEAFE',
    infoText: '#1E40AF',
    infoBorder: '#93C5FD',
  },

  // Semantic — operational indicators
  semantic: {
    operational: '#059669',
    warning: '#D97706',
    critical: '#DC2626',
    blue: '#2D5BE3',
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
}

export const typography = {
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },
}

export const shadow = {
  card: {
    shadowColor: '#2D5BE3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
}
