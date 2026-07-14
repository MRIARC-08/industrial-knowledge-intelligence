// mobile/src/navigation/index.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/theme'

// Screens
import HomeScreen from '@/screens/HomeScreen'
import AskScreen from '@/screens/AskScreen'
import EquipmentListScreen from '@/screens/EquipmentListScreen'
import EquipmentDetailScreen from '@/screens/EquipmentDetailScreen'
import AlertsScreen from '@/screens/AlertsScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack for Equipment (list → detail)
function EquipmentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.secondary },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="EquipmentList"
        component={EquipmentListScreen}
        options={{ title: 'Equipment' }}
      />
      <Stack.Screen
        name="EquipmentDetail"
        component={EquipmentDetailScreen}
        options={({ route }) => ({
          title: (route.params as any)?.tag ?? 'Equipment Detail'
        })}
      />
    </Stack.Navigator>
  )
}

// Bottom tab navigator
export function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.bg.secondary },
          headerTintColor: colors.text.primary,
          headerTitleStyle: { fontWeight: '600', fontSize: 17 },
          tabBarStyle: {
            backgroundColor: colors.bg.secondary,
            borderTopColor: colors.bg.border,
            paddingTop: 4,
            height: 84,
            paddingBottom: 20,
          },
          tabBarActiveTintColor: colors.accent.blue,
          tabBarInactiveTintColor: colors.text.muted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
          tabBarIcon: ({ focused, color, size }) => {
            const icons: Record<string, { focused: string; unfocused: string }> = {
              Home: { focused: 'home', unfocused: 'home-outline' },
              Ask: { focused: 'mic', unfocused: 'mic-outline' },
              Equipment: { focused: 'construct', unfocused: 'construct-outline' },
              Alerts: { focused: 'notifications', unfocused: 'notifications-outline' },
            }
            const icon = icons[route.name]
            return (
              <Ionicons
                name={(focused ? icon?.focused : icon?.unfocused) as any}
                size={size}
                color={color}
              />
            )
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Overview' }} />
        <Tab.Screen name="Ask" component={AskScreen} options={{ title: 'Ask AI' }} />
        <Tab.Screen name="Equipment" component={EquipmentStack} options={{ headerShown: false }} />
        <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}
