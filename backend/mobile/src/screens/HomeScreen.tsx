// mobile/src/screens/HomeScreen.tsx
import React from 'react'
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, StatusBar } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView, MotiText } from 'moti'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { api } from '@/lib/api'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { formatDate, daysUntil } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = React.useState(false)

  const token = useAuthStore(state => state.token) || ''
  const rawUser = token.startsWith('mock_token_') ? token.replace('mock_token_', '') : 'User'
  const username = rawUser.charAt(0).toUpperCase() + rawUser.slice(1)



  const { data: certs, refetch: refetchCerts } = useQuery({
    queryKey: ['compliance', 'certificates'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  const { data: gaps, refetch: refetchGaps } = useQuery({
    queryKey: ['compliance', 'gaps', 'high'],
    queryFn: () => api.compliance.gaps('high', 'open'),
    refetchInterval: 60000,
  })

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([refetchCerts(), refetchGaps()])
    setRefreshing(false)
  }

  const alerts = [
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: 'cert-' + c.id,
        severity: c.status === 'expired' ? 'high' : 'medium',
        title: c.name,
        message: c.status === 'expired' ? 'Expired' : `Due in ${daysUntil(c.expiry)}d`,
        equipment: c.equipment,
      })) ?? []),
    ...(gaps?.gaps.slice(0, 2).map(g => ({
      id: 'gap-' + g.id,
      severity: g.severity,
      title: g.regulation,
      message: g.description,
      equipment: g.equipment,
    })) ?? []),
  ]

  const quickActions = [
    {
      icon: 'mic' as const,
      label: 'Ask AI',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        navigation.navigate('Ask')
      },
    },
    {
      icon: 'construct' as const,
      label: 'Equipment',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Equipment')
      },
    },
    {
      icon: 'notifications' as const,
      label: 'Alerts',
      bg: colors.bg.card,
      iconColor: alerts.length > 0 ? colors.semantic.warning : colors.brand.primary,
      badge: alerts.length,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Alerts')
      },
    },
    {
      icon: 'shield-checkmark' as const,
      label: 'Compliance',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Alerts')
      },
    },
    {
      icon: 'people' as const,
      label: 'Personnel',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Personnel')
      },
    },
    {
      icon: 'construct' as const,
      label: 'Work Orders',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('WorkOrders')
      },
    },
    {
      icon: 'cube' as const,
      label: 'Inventory',
      bg: colors.bg.card,
      iconColor: colors.brand.primary,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Inventory')
      },
    },
  ]

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.card} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.topBarLeft}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.7}
        >
          <View style={styles.topLogoBox}>
            <Text style={{ fontSize: 16, fontWeight: typography.weights.bold, color: colors.text.onBlue }}>
              {username.charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={styles.topTitle}>Hello, {username}</Text>
            <Text style={styles.topSub}>Ready for inspection?</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.notifBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
            navigation.navigate('Alerts')
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text.primary} />
          {alerts.length > 0 && <View style={styles.notifDot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Alert Banner */}
        {alerts.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300, delay: 50 }}
          >
            <TouchableOpacity
              style={styles.alertBanner}
              onPress={() => navigation.navigate('Alerts')}
              activeOpacity={0.8}
            >
              <MotiView
                from={{ scale: 1 }}
                animate={{ scale: 1.15 }}
                transition={{ type: 'timing', duration: 800, loop: true }}
              >
                <Ionicons name="warning" size={20} color={colors.text.onDark} />
              </MotiView>
              <Text style={styles.alertBannerText}>
                {alerts.length} active alert{alerts.length > 1 ? 's' : ''} — tap to view
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.text.onDark} />
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Quick Actions */}
        <MotiText 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'timing', duration: 300, delay: 150 }}
          style={styles.sectionLabel}
        >
          Quick Actions
        </MotiText>
        
        <View style={styles.actionsGrid}>
          {quickActions.map((action, i) => (
            <MotiView
              key={action.label}
              from={{ opacity: 0, translateY: 15 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: 150 + (i * 50) }}
              style={styles.actionCardWrap}
            >
              <TouchableOpacity
                style={[styles.actionCard, { backgroundColor: action.bg }]}
                onPress={action.onPress}
                activeOpacity={0.75}
              >
              <View style={styles.actionIconWrap}>
                <Ionicons name={action.icon} size={20} color={action.iconColor} />
                {action.badge ? (
                  <View style={styles.actionBadge}>
                    <Text style={styles.actionBadgeText}>{action.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={[
                styles.actionLabel,
                { color: colors.text.primary }
              ]} numberOfLines={1}>
                {action.label}
              </Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* Recent Alerts */}
        {alerts.length > 0 && (
          <>
            <MotiText 
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 300, delay: 250 }}
              style={styles.sectionLabel}
            >
              Recent Alerts
            </MotiText>
            {alerts.slice(0, 3).map((alert, i) => {
              const isHigh = alert.severity === 'high'
              return (
                <MotiView
                  key={alert.id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ type: 'timing', duration: 300, delay: 300 + (i * 50) }}
                >
                  <TouchableOpacity
                    style={[
                      styles.alertCard,
                      { borderLeftColor: isHigh ? colors.semantic.critical : colors.semantic.warning }
                    ]}
                  onPress={() => navigation.navigate('Alerts')}
                  activeOpacity={0.8}
                >
                  <View style={styles.alertCardTop}>
                    <View style={[
                      styles.alertSeverityPill,
                      { backgroundColor: isHigh ? colors.status.dangerBg : colors.status.warningBg }
                    ]}>
                      <Text style={[
                        styles.alertSeverityText,
                        { color: isHigh ? colors.status.dangerText : colors.status.warningText }
                      ]}>
                        {alert.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.alertEquipment}>{alert.equipment}</Text>
                  </View>
                  <Text style={styles.alertTitle} numberOfLines={1}>{alert.title}</Text>
                  <Text style={styles.alertMessage} numberOfLines={1}>{alert.message}</Text>
                  </TouchableOpacity>
                </MotiView>
              )
            })}
          </>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.page },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  topLogoBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  topSub: { fontSize: typography.sizes.xs, color: colors.text.muted },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bg.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.critical,
    borderWidth: 1.5,
    borderColor: colors.bg.card,
  },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },

  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.semantic.warning,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  alertBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.onDark,
  },

  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionCardWrap: {
    width: '47.5%',
  },
  actionCard: {
    width: '100%',
    borderRadius: radius.lg,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  actionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bg.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.semantic.critical,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  actionBadgeText: { fontSize: 9, color: '#fff', fontWeight: typography.weights.bold },
  actionLabel: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    textAlign: 'left',
  },

  alertCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    gap: 4,
  },
  alertCardTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  alertSeverityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  alertSeverityText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  alertEquipment: { fontSize: typography.sizes.xs, color: colors.text.muted },
  alertTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  alertMessage: { fontSize: typography.sizes.xs, color: colors.text.secondary },
})
