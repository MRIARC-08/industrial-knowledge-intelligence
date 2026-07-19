// mobile/src/screens/AlertsScreen.tsx
import React from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, StatusBar } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { MotiView, MotiText } from 'moti'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
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

const SEV = {
  high: {
    borderColor: colors.semantic.critical,
    pillBg: colors.status.dangerBg,
    pillText: colors.status.dangerText,
    iconColor: colors.semantic.critical,
    icon: 'alert-circle' as const,
    label: 'HIGH',
  },
  medium: {
    borderColor: colors.semantic.warning,
    pillBg: colors.status.warningBg,
    pillText: colors.status.warningText,
    iconColor: colors.semantic.warning,
    icon: 'warning' as const,
    label: 'MEDIUM',
  },
  low: {
    borderColor: colors.semantic.operational,
    pillBg: colors.status.successBg,
    pillText: colors.status.successText,
    iconColor: colors.semantic.operational,
    icon: 'information-circle' as const,
    label: 'LOW',
  },
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

  const onRefresh = () => { refetchCerts(); refetchGaps() }

  const alerts: Alert[] = [
    ...(certs?.certificates
      .filter(c => c.status !== 'valid')
      .map(c => ({
        id: 'cert-' + c.id,
        type: 'certificate' as const,
        severity: c.status === 'expired' ? 'high' as const : 'medium' as const,
        title: c.name,
        subtitle: c.standard,
        message: c.status === 'expired'
          ? `Expired on ${formatDate(c.expiry)}`
          : `Expires in ${daysUntil(c.expiry)} days (${formatDate(c.expiry)})`,
        equipment: c.equipment,
        actionText: 'Schedule Inspection',
      })) ?? []),
    ...(gaps?.gaps.map(g => ({
      id: 'gap-' + g.id,
      type: 'compliance_gap' as const,
      severity: g.severity,
      title: g.regulation,
      subtitle: g.clause,
      message: g.description,
      equipment: g.equipment,
      actionText: 'View Details',
    })) ?? []),
  ].sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]))

  const renderAlert = ({ item, index }: { item: Alert, index: number }) => {
    const s = SEV[item.severity]
    return (
      <MotiView 
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 250, delay: index * 40 }}
        style={[styles.alertCard, { borderLeftColor: s.borderColor }]}
      >
        {/* Header */}
        <View style={styles.alertHeader}>
          <Ionicons name={s.icon} size={18} color={s.iconColor} />
          <Text style={styles.alertTitle} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.pill, { backgroundColor: s.pillBg }]}>
            <Text style={[styles.pillText, { color: s.pillText }]}>{s.label}</Text>
          </View>
        </View>

        {/* Sub & Message */}
        <Text style={styles.alertSub}>{item.subtitle}</Text>
        <Text style={styles.alertMsg}>{item.message}</Text>

        {/* Footer */}
        <View style={styles.alertFooter}>
          <View style={styles.equipChip}>
            <Ionicons name="hardware-chip-outline" size={11} color={colors.text.muted} />
            <Text style={styles.equipText}>{item.equipment}</Text>
          </View>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: s.borderColor }]}>
            <Text style={[styles.actionBtnText, { color: s.iconColor }]}>{item.actionText}</Text>
          </TouchableOpacity>
        </View>
      </MotiView>
    )
  }

  if (!certs && !gaps) return <LoadingSpinner />

  const highCount = alerts.filter(a => a.severity === 'high').length
  const medCount = alerts.filter(a => a.severity === 'medium').length
  const lowCount = alerts.filter(a => a.severity === 'low').length

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.card} />

      {/* Summary Strip */}
      <View style={styles.strip}>
        <View style={styles.stripItem}>
          <Text style={[styles.stripNum, { color: colors.semantic.critical }]}>{highCount}</Text>
          <Text style={styles.stripLabel}>High</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={[styles.stripNum, { color: colors.semantic.warning }]}>{medCount}</Text>
          <Text style={styles.stripLabel}>Medium</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={[styles.stripNum, { color: colors.semantic.operational }]}>{lowCount}</Text>
          <Text style={styles.stripLabel}>Low</Text>
        </View>
        <View style={styles.stripDivider} />
        <View style={styles.stripItem}>
          <Text style={[styles.stripNum, { color: colors.text.primary }]}>{alerts.length}</Text>
          <Text style={styles.stripLabel}>Total</Text>
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
            tintColor={colors.brand.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="checkmark-circle" size={32} color={colors.semantic.operational} />
            </View>
            <Text style={styles.emptyTitle}>All Clear</Text>
            <Text style={styles.emptySub}>No active alerts</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
    padding: spacing.md,
  },
  stripItem: { flex: 1, alignItems: 'center' },
  stripNum: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold },
  stripLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, marginTop: 2 },
  stripDivider: { width: 1, backgroundColor: colors.bg.border },
  list: { padding: spacing.md, paddingBottom: spacing.xxl },
  alertCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    borderLeftWidth: 4,
    padding: spacing.md,
    gap: spacing.xs,
  },
  alertHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  alertTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  pillText: { fontSize: 10, fontWeight: typography.weights.bold, letterSpacing: 0.5 },
  alertSub: { fontSize: typography.sizes.xs, color: colors.text.muted },
  alertMsg: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  alertFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  equipChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  equipText: { fontSize: typography.sizes.xs, color: colors.text.muted },
  actionBtn: {
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1.5,
  },
  actionBtnText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  empty: { alignItems: 'center', paddingTop: 80, gap: spacing.sm },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.status.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.text.primary },
  emptySub: { fontSize: typography.sizes.base, color: colors.text.secondary },
})
