// mobile/src/lib/theme.ts
// Consistent design tokens across mobile app

export const colors = {
  bg: {
    primary: '#030712',      // Near black — main background
    secondary: '#0f172a',    // Card background
    tertiary: '#1e293b',     // Input / elevated background
    border: '#1e293b',       // Border color
  },
  text: {
    primary: '#f1f5f9',
    secondary: '#94a3b8',
    muted: '#475569',
    inverse: '#030712',
  },
  accent: {
    blue: '#3b82f6',
    blueDark: '#1d4ed8',
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  },
  status: {
    operational: '#22c55e',
    warning: '#eab308',
    critical: '#ef4444',
  },
  severity: {
    high: '#ef4444',
    medium: '#eab308',
    low: '#22c55e',
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
  sm: 8,
  md: 12,
  lg: 16,
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
  },
}
