// mobile/src/components/Card.tsx
import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { colors, spacing, radius } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: number
}

export function Card({ children, style, padding = spacing.md, delay = 0 }: CardProps & { delay?: number }) {
  return (
    <MotiView 
      from={{ opacity: 0, translateY: 10, scale: 0.98 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay }}
      style={[styles.card, { padding }, style]}
    >
      {children}
    </MotiView>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
})
