import React from 'react'
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { colors, spacing } from '@/lib/theme'
import { Card } from '@/components/Card'
import { Ionicons } from '@expo/vector-icons'

export default function PersonnelScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['personnel'],
    queryFn: () => api.personnel.list(),
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
        <Text style={styles.errorText}>Failed to load personnel data.</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data?.personnel}
        keyExtractor={item => item.emp_id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={24} color={colors.brand.primary} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.role}>{item.role}</Text>
              </View>
            </View>
            <View style={styles.details}>
              <View style={styles.detailRow}>
                <Ionicons name="call-outline" size={16} color={colors.text.muted} />
                <Text style={styles.detailText}>{item.phone || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="mail-outline" size={16} color={colors.text.muted} />
                <Text style={styles.detailText}>{item.email || 'N/A'}</Text>
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
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.bg.hover,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  role: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  details: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
})
