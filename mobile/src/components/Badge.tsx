// mobile/src/components/Badge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, radius, typography } from '@/lib/theme'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const variantColors: Record<Variant, { bg: string; text: string; border: string }> = {
  success: { bg: '#052e16', text: colors.accent.green, border: '#14532d' },
  warning: { bg: '#422006', text: colors.accent.yellow, border: '#713f12' },
  danger: { bg: '#450a0a', text: colors.accent.red, border: '#7f1d1d' },
  info: { bg: '#172554', text: colors.accent.blue, border: '#1e3a8a' },
  default: { bg: colors.bg.tertiary, text: colors.text.secondary, border: colors.bg.border },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export function Badge({ children, variant = 'default' }: BadgeProps) {
  const c = variantColors[variant]
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
})
