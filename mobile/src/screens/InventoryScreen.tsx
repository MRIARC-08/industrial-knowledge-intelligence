import React from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { colors, spacing } from '@/lib/theme'
import { Card } from '@/components/Card'
import { Ionicons } from '@expo/vector-icons'
import { Badge } from '@/components/Badge'

export default function InventoryScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['spareParts'],
    queryFn: () => api.spareParts.inventory(),
  })

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.brand.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load inventory.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.parts}
        keyExtractor={item => item.part_number}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isLowStock = item.reorder_level !== null && item.stock_quantity <= item.reorder_level;
          
          return (
            <Card>
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <Ionicons name="cube" size={20} color={colors.brand.primary} />
                  <Text style={styles.title}>{item.name}</Text>
                </View>
                {isLowStock && (
                  <Badge label="Low Stock" variant="error" />
                )}
              </View>
              
              <Text style={styles.partNo}>PN: {item.part_number}</Text>
              
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stock:</Text>
                  <Text style={[styles.detailValue, isLowStock && styles.lowStockText]}>
                    {item.stock_quantity}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price:</Text>
                  <Text style={styles.detailValue}>${item.price.toFixed(2)}</Text>
                </View>
              </View>
            </Card>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.main,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.main,
  },
  errorText: {
    color: colors.status.error,
    fontSize: 16,
  },
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flexShrink: 1,
  },
  partNo: {
    fontSize: 13,
    color: colors.text.muted,
    marginBottom: spacing.md,
    marginLeft: 28,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  lowStockText: {
    color: colors.status.error,
    fontWeight: '700',
  }
})
