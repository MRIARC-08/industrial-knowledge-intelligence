// mobile/src/components/Card.tsx
import React from 'react'
import { View, ViewStyle, StyleSheet } from 'react-native'
import { colors, spacing, radius } from '@/lib/theme'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: number
}

export function Card({ children, style, padding = spacing.md }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
})
