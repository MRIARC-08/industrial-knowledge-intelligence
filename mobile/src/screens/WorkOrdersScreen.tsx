import React from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { colors, spacing } from '@/lib/theme'
import { Card } from '@/components/Card'
import { Ionicons } from '@expo/vector-icons'
import { Badge } from '@/components/Badge'

export default function WorkOrdersScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['workOrders'],
    queryFn: () => api.workOrders.list(),
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
        <Text style={styles.errorText}>Failed to load work orders.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.work_orders}
        keyExtractor={item => item.wo_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.header}>
              <View style={styles.titleRow}>
                <Ionicons name="construct" size={20} color={colors.brand.primary} />
                <Text style={styles.title}>{item.wo_id}</Text>
              </View>
              <Badge 
                label={item.type || 'Job'} 
                variant={item.type === 'PM' ? 'info' : 'warning'} 
              />
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons name="hardware-chip-outline" size={16} color={colors.text.muted} />
                <Text style={styles.detailText}>{item.equipment_tag || 'General'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="time-outline" size={16} color={colors.text.muted} />
                <Text style={styles.detailText}>
                  {item.duration_hours ? `${item.duration_hours} hrs` : 'N/A'}
                </Text>
              </View>
            </View>
          </Card>
        )}
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
    marginBottom: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
})
