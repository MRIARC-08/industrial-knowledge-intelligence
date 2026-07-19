// mobile/src/screens/ProfileScreen.tsx
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MotiView } from 'moti'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { useAuthStore } from '@/store/auth'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const logout = useAuthStore(state => state.logout)
  const token = useAuthStore(state => state.token) || ''
  
  // Extract mock username from token if available
  const rawUser = token.startsWith('mock_token_') ? token.replace('mock_token_', '') : 'user'
  const username = rawUser.charAt(0).toUpperCase() + rawUser.slice(1)

  const [notifications, setNotifications] = useState(true)
  const [themeMode, setThemeMode] = useState('Light')

  const handlePress = (id: string) => {
    if (id === 'notifications') {
      setNotifications(prev => !prev)
    } else if (id === 'appearance') {
      setThemeMode(prev => prev === 'Light' ? 'Dark' : 'Light')
    } else {
      Alert.alert('Coming Soon', 'This feature is not yet available in the demo.')
    }
  }

  const settings = [
    { id: 'notifications', icon: notifications ? 'notifications' : 'notifications-off', title: 'Notifications', value: notifications ? 'Enabled' : 'Disabled' },
    { id: 'appearance', icon: 'color-palette', title: 'Appearance', value: themeMode },
    { id: 'privacy', icon: 'lock-closed', title: 'Privacy & Security', value: '' },
    { id: 'help', icon: 'help-circle', title: 'Help & Support', value: '' },
  ]

  return (
    <View style={[styles.safe, { paddingBottom: insets.bottom }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* Profile Card */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300 }}
          style={styles.profileCard}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{username.charAt(0)}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{username}</Text>
            <Text style={styles.role}>Industrial Platform User</Text>
          </View>
        </MotiView>

        {/* Settings List */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 100 }}
          style={styles.section}
        >
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.list}>
            {settings.map((s, i) => (
              <TouchableOpacity 
                key={i} 
                style={[styles.listItem, i === settings.length - 1 && { borderBottomWidth: 0 }]} 
                activeOpacity={0.7}
                onPress={() => handlePress(s.id)}
              >
                <View style={styles.listLeft}>
                  <Ionicons name={s.icon as any} size={20} color={colors.brand.primary} />
                  <Text style={styles.listTitle}>{s.title}</Text>
                </View>
                <View style={styles.listRight}>
                  {!!s.value && <Text style={styles.listValue}>{s.value}</Text>}
                  <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </MotiView>

        {/* Logout Button */}
        <MotiView
          from={{ opacity: 0, translateY: 10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: 200 }}
        >
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={colors.semantic.critical} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </MotiView>

      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.page },
  scroll: { padding: spacing.md, gap: spacing.md },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: typography.weights.bold,
    color: colors.text.onBlue,
  },
  info: { flex: 1 },
  name: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.text.primary },
  role: { fontSize: typography.sizes.sm, color: colors.text.secondary, marginTop: 4 },

  section: { gap: spacing.sm },
  sectionTitle: { 
    fontSize: typography.sizes.xs, 
    fontWeight: typography.weights.bold, 
    color: colors.text.muted, 
    textTransform: 'uppercase', 
    marginLeft: spacing.sm 
  },
  list: { backgroundColor: colors.bg.card, borderRadius: radius.lg, overflow: 'hidden' },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
  },
  listLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  listTitle: { fontSize: typography.sizes.base, color: colors.text.primary, fontWeight: typography.weights.medium },
  listRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  listValue: { fontSize: typography.sizes.sm, color: colors.text.secondary },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bg.card,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginTop: spacing.md,
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.semantic.critical,
  },
})
