// mobile/src/navigation/index.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '@/lib/theme'
import { useAuthStore } from '@/store/auth'

// Screens
import LoginScreen from '@/screens/LoginScreen'
import HomeScreen from '@/screens/HomeScreen'
import AskScreen from '@/screens/AskScreen'
import EquipmentListScreen from '@/screens/EquipmentListScreen'
import EquipmentDetailScreen from '@/screens/EquipmentDetailScreen'
import AlertsScreen from '@/screens/AlertsScreen'
import ProfileScreen from '@/screens/ProfileScreen'
import PersonnelScreen from '@/screens/PersonnelScreen'
import WorkOrdersScreen from '@/screens/WorkOrdersScreen'
import InventoryScreen from '@/screens/InventoryScreen'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Stack for Home (Dashboard -> Personnel, Work Orders, Inventory)
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.card },
        headerTintColor: colors.text.primary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen
        name="HomeDashboard"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Personnel"
        component={PersonnelScreen}
        options={{ title: 'Engineering Team' }}
      />
      <Stack.Screen
        name="WorkOrders"
        component={WorkOrdersScreen}
        options={{ title: 'Work Orders' }}
      />
      <Stack.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{ title: 'Spare Parts' }}
      />
    </Stack.Navigator>
  )
}

// Stack for Equipment (list → detail)
function EquipmentStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.card },
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
  const token = useAuthStore(state => state.token)

  return (
    <NavigationContainer>
      {token ? (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.bg.card },
            headerTintColor: colors.text.primary,
            headerTitleStyle: { fontWeight: '600', fontSize: 17 },
            tabBarStyle: {
              backgroundColor: colors.bg.card,
              borderTopColor: colors.bg.border,
              paddingTop: 4,
              height: 84,
              paddingBottom: 20,
            },
            tabBarActiveTintColor: colors.brand.primary,
            tabBarInactiveTintColor: colors.text.muted,
            tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
            tabBarIcon: ({ focused, color, size }) => {
              const icons: Record<string, { focused: string; unfocused: string }> = {
                Home: { focused: 'home', unfocused: 'home-outline' },
                Ask: { focused: 'mic', unfocused: 'mic-outline' },
                Equipment: { focused: 'construct', unfocused: 'construct-outline' },
                Alerts: { focused: 'notifications', unfocused: 'notifications-outline' },
                Profile: { focused: 'person', unfocused: 'person-outline' },
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
          <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Overview', headerShown: false }} />
          <Tab.Screen name="Ask" component={AskScreen} options={{ title: 'Ask AI' }} />
          <Tab.Screen name="Equipment" component={EquipmentStack} options={{ headerShown: false }} />
          <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        </Tab.Navigator>
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  )
}
