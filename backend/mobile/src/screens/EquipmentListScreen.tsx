// mobile/src/screens/EquipmentListScreen.tsx
import React, { useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, StatusBar } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { MotiView } from 'moti'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { Equipment, EquipmentStatus } from '@iki/shared'

const statusStyle = (s: EquipmentStatus) => {
  if (s === 'operational') return { dot: colors.semantic.operational, text: colors.semantic.operational, bg: colors.status.successBg, label: 'Operational' }
  if (s === 'warning') return { dot: colors.semantic.warning, text: colors.semantic.warning, bg: colors.status.warningBg, label: 'Warning' }
  return { dot: colors.semantic.critical, text: colors.semantic.critical, bg: colors.status.dangerBg, label: 'Critical' }
}

export default function EquipmentListScreen() {
  const navigation = useNavigation<any>()
  const [search, setSearch] = useState('')

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['equipment', 'list'],
    queryFn: api.equipment.list,
    refetchInterval: 30000,
  })

  const filtered = (data?.equipment ?? []).filter(eq =>
    eq.tag.toLowerCase().includes(search.toLowerCase()) ||
    eq.name.toLowerCase().includes(search.toLowerCase())
  )

  const renderItem = ({ item: eq, index }: { item: Equipment, index: number }) => {
    const s = statusStyle(eq.status)
    return (
      <MotiView
        from={{ opacity: 0, translateY: 15 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: index * 50 }}
      >
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('EquipmentDetail', { tag: eq.tag })}
          activeOpacity={0.75}
        >
          <View style={styles.cardTop}>
            <View style={styles.cardTopLeft}>
              <View style={[styles.statusDot, { backgroundColor: s.dot }]} />
              <Text style={styles.tag}>{eq.tag}</Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: s.bg }]}>
              <Text style={[styles.statusPillText, { color: s.text }]}>{s.label}</Text>
            </View>
          </View>

          <Text style={styles.name} numberOfLines={1}>{eq.name}</Text>
          <Text style={styles.type}>{eq.type}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.stat}>
              <Ionicons name="warning-outline" size={11} color={eq.failures > 3 ? colors.semantic.critical : colors.text.muted} />
              <Text style={[styles.statText, eq.failures > 3 && { color: colors.semantic.critical }]}>
                {eq.failures} failures
              </Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="thermometer-outline" size={11} color={colors.text.muted} />
              <Text style={styles.statText}>{eq.max_temp}°C</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="speedometer-outline" size={11} color={colors.text.muted} />
              <Text style={styles.statText}>{eq.max_pressure} PSI</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={colors.text.muted} style={{ marginLeft: 'auto' }} />
          </View>
        </TouchableOpacity>
      </MotiView>
    )
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.card} />

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={colors.text.muted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tag or name..."
          placeholderTextColor={colors.text.muted}
          style={styles.searchInput}
          autoCapitalize="characters"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={colors.text.muted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.tag}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.brand.primary} />
        }
        ListHeaderComponent={
          <Text style={styles.count}>{filtered.length} equipment</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="construct-outline" size={36} color={colors.text.muted} />
            <Text style={styles.emptyText}>No equipment found</Text>
          </View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.page },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    padding: spacing.sm + 4,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  searchInput: { flex: 1, fontSize: typography.sizes.base, color: colors.text.primary },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: typography.weights.bold,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tag: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  statusPillText: { fontSize: 11, fontWeight: typography.weights.semibold },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  type: { fontSize: typography.sizes.sm, color: colors.text.secondary },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: 4, alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: typography.sizes.xs, color: colors.text.muted },
  empty: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyText: { fontSize: typography.sizes.base, color: colors.text.muted },
})
