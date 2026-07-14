// mobile/src/screens/HomeScreen.tsx
import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { formatDate, daysUntil } from '@/lib/utils'

export default function HomeScreen() {
  const navigation = useNavigation<any>()
  const [refreshing, setRefreshing] = React.useState(false)

  const { data: kpis, refetch: refetchKpis } = useQuery({
    queryKey: ['analytics', 'kpis'],
    queryFn: api.analytics.kpis,
    refetchInterval: 60000,
  })

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
    await Promise.all([refetchKpis(), refetchCerts(), refetchGaps()])
    setRefreshing(false)
  }

  // Build combined alerts
  const alerts = [
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: c.id,
        severity: c.status === 'expired' ? 'high' : 'medium',
        title: `${c.name}`,
        message: c.status === 'expired'
          ? 'Certificate has expired'
          : `Expires in ${daysUntil(c.expiry)} days`,
        equipment: c.equipment,
      })) ?? []),
    ...(gaps?.gaps
      .slice(0, 2)
      .map(g => ({
        id: g.id,
        severity: g.severity,
        title: g.regulation,
        message: g.description,
        equipment: g.equipment,
      })) ?? []),
  ]

  const quickActions = [
    {
      icon: 'mic-outline',
      label: 'Ask Aloud',
      color: colors.accent.blue,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
        navigation.navigate('Ask')
      },
    },
    {
      icon: 'construct-outline',
      label: 'Find Equipment',
      color: colors.accent.green,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Equipment')
      },
    },
    {
      icon: 'notifications-outline',
      label: 'My Alerts',
      color: colors.accent.yellow,
      badge: alerts.length,
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Alerts')
      },
    },
    {
      icon: 'shield-outline',
      label: 'Compliance',
      color: '#a855f7',
      onPress: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        navigation.navigate('Alerts')
      },
    },
  ]

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="hardware-chip-outline" size={20} color={colors.accent.blue} />
          </View>
          <View>
            <Text style={styles.headerTitle}>KnowledgeAI</Text>
            <Text style={styles.headerSub}>Field Technician View</Text>
          </View>
        </View>

        {/* Alerts Banner */}
        {alerts.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate('Alerts')}
            activeOpacity={0.8}
          >
            <Ionicons name="warning-outline" size={18} color={colors.accent.yellow} />
            <Text style={styles.alertBannerText}>
              {alerts.length} active alert{alerts.length > 1 ? 's' : ''} — tap to view
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent.yellow} />
          </TouchableOpacity>
        )}

        {/* KPI Strip */}
        {kpis && (
          <View style={styles.kpiStrip}>
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.system_accuracy}%</Text>
              <Text style={styles.kpiLabel}>Accuracy</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.time_reduction}%</Text>
              <Text style={styles.kpiLabel}>Faster</Text>
            </View>
            <View style={styles.kpiDivider} />
            <View style={styles.kpiItem}>
              <Text style={styles.kpiValue}>{kpis.active_users}</Text>
              <Text style={styles.kpiLabel}>Users</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.quickAction}
              onPress={action.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
                {action.badge ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{action.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Alerts Preview */}
        {alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <View style={styles.alertsList}>
              {alerts.slice(0, 2).map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  onPress={() => navigation.navigate('Alerts')}
                  activeOpacity={0.8}
                >
                  <Card style={[
                    styles.alertCard,
                    { borderColor: alert.severity === 'high' ? colors.accent.red + '40' : colors.accent.yellow + '40' }
                  ]}>
                    <View style={styles.alertCardHeader}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={16}
                        color={alert.severity === 'high' ? colors.accent.red : colors.accent.yellow}
                      />
                      <Text style={[
                        styles.alertCardTitle,
                        { color: alert.severity === 'high' ? colors.accent.red : colors.accent.yellow }
                      ]}>
                        {alert.title}
                      </Text>
                    </View>
                    <Text style={styles.alertCardMsg} numberOfLines={2}>{alert.message}</Text>
                    <Text style={styles.alertCardEquipment}>Equipment: {alert.equipment}</Text>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { padding: spacing.md, paddingBottom: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent.yellow + '15',
    borderColor: colors.accent.yellow + '30',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm + 4,
    marginBottom: spacing.md,
  },
  alertBannerText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.accent.yellow,
    fontWeight: typography.weights.medium,
  },
  kpiStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  kpiItem: { flex: 1, alignItems: 'center' },
  kpiDivider: { width: 1, backgroundColor: colors.bg.border },
  kpiValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.accent.blue,
  },
  kpiLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  quickAction: {
    width: '47%',
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickActionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.accent.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: typography.weights.bold,
  },
  alertsList: { gap: spacing.sm, marginBottom: spacing.md },
  alertCard: { gap: spacing.xs },
  alertCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  alertCardMsg: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  alertCardEquipment: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
})
