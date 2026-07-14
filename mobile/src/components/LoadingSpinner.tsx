// mobile/src/components/LoadingSpinner.tsx
import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { colors } from '@/lib/theme'

export function LoadingSpinner() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.accent.blue} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
})
