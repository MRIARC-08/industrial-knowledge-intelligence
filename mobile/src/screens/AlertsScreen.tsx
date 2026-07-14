// mobile/src/screens/AlertsScreen.tsx
import React from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { daysUntil, formatDate } from '@/lib/utils'

interface Alert {
  id: string
  type: 'certificate' | 'compliance_gap'
  severity: 'high' | 'medium' | 'low'
  title: string
  subtitle: string
  message: string
  equipment: string
  actionText: string
}

export default function AlertsScreen() {
  const { data: certs, refetch: refetchCerts, isRefetching: r1 } = useQuery({
    queryKey: ['compliance', 'certificates'],
    queryFn: api.compliance.certificates,
    refetchInterval: 60000,
  })

  const { data: gaps, refetch: refetchGaps, isRefetching: r2 } = useQuery({
    queryKey: ['compliance', 'gaps'],
    queryFn: () => api.compliance.gaps(undefined, 'open'),
    refetchInterval: 60000,
  })

  const onRefresh = () => {
    refetchCerts()
    refetchGaps()
  }

  // Build unified alerts list
  const alerts: Alert[] = [
    // Expiring / expired certificates
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: c.id,
        type: 'certificate' as const,
        severity: c.status === 'expired' ? 'high' as const : 'medium' as const,
        title: c.name,
        subtitle: c.standard,
        message: c.status === 'expired'
          ? `Certificate EXPIRED on ${formatDate(c.expiry)}`
          : `Expires in ${daysUntil(c.expiry)} days (${formatDate(c.expiry)})`,
        equipment: c.equipment,
        actionText: 'Schedule Inspection',
      })) ?? []),
    // Compliance gaps
    ...(gaps?.gaps.map(g => ({
      id: g.id,
      type: 'compliance_gap' as const,
      severity: g.severity,
      title: g.regulation,
      subtitle: g.clause,
      message: g.description,
      equipment: g.equipment,
      actionText: 'View Details',
    })) ?? []),
  ].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.severity] - order[b.severity]
  })

  const severityConfig = {
    high: {
      color: colors.accent.red,
      icon: 'alert-circle' as const,
      bg: colors.accent.red + '15',
      border: colors.accent.red + '30',
    },
    medium: {
      color: colors.accent.yellow,
      icon: 'warning' as const,
      bg: colors.accent.yellow + '15',
      border: colors.accent.yellow + '30',
    },
    low: {
      color: colors.accent.green,
      icon: 'information-circle' as const,
      bg: colors.accent.green + '15',
      border: colors.accent.green + '30',
    },
  }

  const renderAlert = ({ item }: { item: Alert }) => {
    const cfg = severityConfig[item.severity]
    return (
      <View style={[styles.alertCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
        <View style={styles.alertHeader}>
          <Ionicons name={cfg.icon} size={18} color={cfg.color} />
          <View style={styles.alertHeaderText}>
            <Text style={[styles.alertTitle, { color: cfg.color }]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.alertSubtitle}>{item.subtitle}</Text>
          </View>
          <View style={[styles.severityBadge, { backgroundColor: cfg.color + '20' }]}>
            <Text style={[styles.severityText, { color: cfg.color }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>
        <Text style={styles.alertMessage}>{item.message}</Text>
        <View style={styles.alertFooter}>
          <View style={styles.equipmentTag}>
            <Ionicons name="hardware-chip-outline" size={11} color={colors.text.muted} />
            <Text style={styles.equipmentTagText}>{item.equipment}</Text>
          </View>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: cfg.color + '50' }]}>
            <Text style={[styles.actionBtnText, { color: cfg.color }]}>
              {item.actionText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (!certs && !gaps) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.red }]}>
            {alerts.filter(a => a.severity === 'high').length}
          </Text>
          <Text style={styles.summaryLabel}>High</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.yellow }]}>
            {alerts.filter(a => a.severity === 'medium').length}
          </Text>
          <Text style={styles.summaryLabel}>Medium</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.accent.green }]}>
            {alerts.filter(a => a.severity === 'low').length}
          </Text>
          <Text style={styles.summaryLabel}>Low</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryNum, { color: colors.text.primary }]}>
            {alerts.length}
          </Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlert}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl
            refreshing={r1 || r2}
            onRefresh={onRefresh}
            tintColor={colors.accent.blue}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.accent.green} />
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySubtitle}>No active alerts</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  summaryStrip: {
    flexDirection: 'row',
    backgroundColor: colors.bg.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
    padding: spacing.md,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  summaryLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  summaryDivider: { width: 1, backgroundColor: colors.bg.border },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  alertCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  alertHeaderText: { flex: 1, gap: 2 },
  alertTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  alertSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  severityText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
  },
  alertMessage: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  alertFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipmentTagText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  actionBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  emptySubtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
  },
})
