// mobile/src/screens/EquipmentDetailScreen.tsx
import React from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { statusColor, formatDate } from '@/lib/utils'

export default function EquipmentDetailScreen() {
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const { tag } = route.params

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['equipment', 'history', tag],
    queryFn: () => api.equipment.history(tag),
  })

  if (isLoading) return <LoadingSpinner />
  if (!data) return null

  const { equipment: eq, failures, documents } = data

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.accent.blue}
        />
      }
    >
      {/* Status header */}
      <Card style={styles.headerCard}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(eq.status) }]} />
          <Text style={[styles.statusText, { color: statusColor(eq.status) }]}>
            {eq.status.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.equipName}>{eq.name}</Text>
        <Text style={styles.equipType}>{eq.type}</Text>
      </Card>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Failures', value: eq.failures.toString(), warn: eq.failures > 3 },
          { label: 'Max Temp', value: `${eq.max_temp}°C`, warn: false },
          { label: 'Max Pressure', value: `${eq.max_pressure} PSI`, warn: false },
          { label: 'Max Flow', value: `${eq.max_flow} m³/h`, warn: false },
        ].map(({ label, value, warn }) => (
          <Card key={label} style={styles.statCard}>
            <Text style={styles.statLabel}>{label}</Text>
            <Text style={[styles.statValue, warn && { color: colors.accent.red }]}>
              {value}
            </Text>
          </Card>
        ))}
      </View>

      {/* Ask AI button */}
      <TouchableOpacity
        style={styles.askButton}
        onPress={() => navigation.navigate('Ask')}
        activeOpacity={0.8}
      >
        <Ionicons name="mic-outline" size={18} color="#fff" />
        <Text style={styles.askButtonText}>Ask AI about {tag}</Text>
      </TouchableOpacity>

      {/* Failure History */}
      <Text style={styles.sectionTitle}>Failure History ({failures.length})</Text>
      {failures.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No failures recorded</Text>
        </Card>
      ) : (
        failures.map((f, i) => (
          <Card key={f.id} style={styles.failureCard}>
            <View style={styles.failureHeader}>
              <View style={styles.failureDot} />
              <Text style={styles.failureDate}>{formatDate(f.date)}</Text>
              <Text style={styles.failureNum}>#{failures.length - i}</Text>
            </View>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Symptoms: </Text>
              {f.symptoms}
            </Text>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Root Cause: </Text>
              {f.root_cause}
            </Text>
            <Text style={styles.failureField}>
              <Text style={styles.failureLabel}>Action: </Text>
              {f.action}
            </Text>
          </Card>
        ))
      )}

      {/* Documents */}
      <Text style={styles.sectionTitle}>Documents ({documents.length})</Text>
      {documents.map((doc) => (
        <Card key={doc.doc_id} style={styles.docCard}>
          <Ionicons name="document-text-outline" size={16} color={colors.accent.blue} />
          <View style={styles.docInfo}>
            <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
            <View style={styles.docMeta}>
              <Badge variant="info">{doc.doc_type.replace('_', ' ')}</Badge>
              <Text style={styles.docDate}>{formatDate(doc.date)}</Text>
            </View>
          </View>
        </Card>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xl },
  headerCard: { gap: spacing.xs },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold },
  equipName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  equipType: { fontSize: typography.sizes.sm, color: colors.text.secondary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: { width: '47%', gap: 4 },
  statLabel: { fontSize: typography.sizes.xs, color: colors.text.muted },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  askButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent.blue,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  askButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#fff',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
  },
  failureCard: { gap: spacing.xs },
  failureHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  failureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },
  failureDate: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.accent.blue,
    flex: 1,
  },
  failureNum: { fontSize: typography.sizes.xs, color: colors.text.muted },
  failureField: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: typography.sizes.sm * 1.5,
  },
  failureLabel: { color: colors.text.primary, fontWeight: typography.weights.medium },
  emptyCard: { alignItems: 'center', padding: spacing.lg },
  emptyText: { fontSize: typography.sizes.sm, color: colors.text.muted },
  docCard: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  docInfo: { flex: 1, gap: 4 },
  docTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  docMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  docDate: { fontSize: typography.sizes.xs, color: colors.text.muted },
})
