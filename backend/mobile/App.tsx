// mobile/App.tsx
import React from 'react'
import { StatusBar } from 'expo-status-bar'
import { QueryClientProvider } from '@tanstack/react-query'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'
import { queryClient } from '@/lib/queryClient'
import { AppNavigator } from '@/navigation'
import { useAuthStore } from '@/store/auth'

export default function App() {
  React.useEffect(() => {
    useAuthStore.getState().loadToken()
  }, [])

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" backgroundColor="#030712" />
          <AppNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
