// mobile/src/screens/EquipmentListScreen.tsx
import React, { useState } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  TextInput, StyleSheet, RefreshControl
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Badge } from '@/components/Badge'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { statusColor } from '@/lib/utils'
import { Equipment, EquipmentStatus } from '@iki/shared'

const statusVariant = (s: EquipmentStatus) =>
  s === 'operational' ? 'success' : s === 'warning' ? 'warning' : 'danger'

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

  const renderItem = ({ item: eq }: { item: Equipment }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('EquipmentDetail', { tag: eq.tag })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tagRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor(eq.status) }]} />
          <Text style={styles.tag}>{eq.tag}</Text>
        </View>
        <Badge variant={statusVariant(eq.status)}>{eq.status}</Badge>
      </View>
      <Text style={styles.name} numberOfLines={1}>{eq.name}</Text>
      <Text style={styles.type}>{eq.type}</Text>
      <View style={styles.cardFooter}>
        <View style={styles.statChip}>
          <Ionicons name="warning-outline" size={11} color={
            eq.failures > 3 ? colors.accent.red : colors.text.muted
          } />
          <Text style={[
            styles.statText,
            { color: eq.failures > 3 ? colors.accent.red : colors.text.muted }
          ]}>
            {eq.failures} failures
          </Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="thermometer-outline" size={11} color={colors.text.muted} />
          <Text style={styles.statText}>{eq.max_temp}°C</Text>
        </View>
        <View style={styles.statChip}>
          <Ionicons name="speedometer-outline" size={11} color={colors.text.muted} />
          <Text style={styles.statText}>{eq.max_pressure} PSI</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) return <LoadingSpinner />

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
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
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent.blue}
          />
        }
        ListHeaderComponent={
          <Text style={styles.count}>{filtered.length} equipment</Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No equipment found</Text>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: spacing.md,
    padding: spacing.sm + 4,
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tag: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.accent.blue,
    fontFamily: 'monospace',
  },
  name: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  type: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  cardFooter: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  empty: {
    textAlign: 'center',
    color: colors.text.muted,
    fontSize: typography.sizes.base,
    padding: spacing.xl,
  },
})
