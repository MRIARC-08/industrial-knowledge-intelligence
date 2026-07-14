// mobile/src/components/Typography.tsx
import React from 'react'
import { Text, TextStyle, StyleSheet } from 'react-native'
import { colors, typography } from '@/lib/theme'

interface TextProps {
  children: React.ReactNode
  style?: TextStyle
  numberOfLines?: number
}

export function Title({ children, style }: TextProps) {
  return <Text style={[styles.title, style]}>{children}</Text>
}

export function Subtitle({ children, style }: TextProps) {
  return <Text style={[styles.subtitle, style]}>{children}</Text>
}

export function Body({ children, style, numberOfLines }: TextProps) {
  return <Text style={[styles.body, style]} numberOfLines={numberOfLines}>{children}</Text>
}

export function Caption({ children, style }: TextProps) {
  return <Text style={[styles.caption, style]}>{children}</Text>
}

export function Mono({ children, style }: TextProps) {
  return <Text style={[styles.mono, style]}>{children}</Text>
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * 1.5,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.text.muted,
  },
  mono: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.accent.blue,
    fontFamily: 'monospace',
  },
})
