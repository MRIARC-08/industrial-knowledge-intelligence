// mobile/src/components/Badge.tsx
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { colors, radius, typography, spacing } from '@/lib/theme'

type Variant = 'success' | 'warning' | 'danger' | 'info' | 'default'

const variantColors: Record<Variant, { bg: string; text: string; border: string }> = {
  success: { bg: colors.semantic.operational, text: colors.text.onDark, border: 'transparent' },
  warning: { bg: colors.semantic.warning, text: colors.text.onDark, border: 'transparent' },
  danger: { bg: colors.semantic.critical, text: colors.text.onDark, border: 'transparent' },
  info: { bg: colors.semantic.blue, text: colors.text.onDark, border: 'transparent' },
  default: { bg: colors.text.secondary, text: colors.text.onDark, border: 'transparent' },
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
}

export function Badge({ children, variant = 'default', delay = 0 }: BadgeProps & { delay?: number }) {
  const c = variantColors[variant]
  return (
    <MotiView 
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 200, delay }}
      style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}
    >
      <Text style={[styles.text, { color: c.text }]}>
        {children}
      </Text>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    borderWidth: 0,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'capitalize',
  },
})
