import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import { getDocumentsList } from '../services/api';

export const DocumentsListScreen = ({ onNavigateToDetail }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [statusFilter]);

  const loadDocuments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await getDocumentsList(filters);
      setDocuments(response.data || []);
      setIsOffline(response.isOffline || false);
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => loadDocuments(true);

  const getStatusColor = (status) => {
    if (!status) return '#64748B';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('processed')) return '#10B981';
    if (statusLower.includes('processing') || statusLower.includes('pending')) return '#F59E0B';
    if (statusLower.includes('failed') || statusLower.includes('error')) return '#EF4444';
    return '#60A5FA';
  };

  const getStatusIcon = (status) => {
    if (!status) return '📄';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('processed')) return '✓';
    if (statusLower.includes('processing') || statusLower.includes('pending')) return '⏳';
    if (statusLower.includes('failed') || statusLower.includes('error')) return '✕';
    return '📄';
  };

  const renderFilterChip = (label, value) => (
    <TouchableOpacity
      style={[styles.filterChip, statusFilter === value && styles.filterChipActive]}
      onPress={() => setStatusFilter(value)}
    >
      <Text style={[styles.filterChipText, statusFilter === value && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderDocumentCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onNavigateToDetail && onNavigateToDetail(item.id)}
    >
      <BlurView intensity={30} tint="dark" style={styles.documentCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.documentIcon}>📄</Text>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle} numberOfLines={1}>
              {item.title || item.name || 'Untitled Document'}
            </Text>
            <Text style={styles.documentMeta}>
              {item.category || 'general'} • {item.created_at || 'Recent'}
            </Text>
          </View>
        </View>
        
        {item.status && (
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusIcon, { color: getStatusColor(item.status) }]}>
              {getStatusIcon(item.status)}
            </Text>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        )}
        
        {item.equipment_tags && item.equipment_tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.equipment_tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.equipment_tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{item.equipment_tags.length - 3}</Text>
            )}
          </View>
        )}
      </BlurView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📄</Text>
      <Text style={styles.emptyText}>No documents found</Text>
      <Text style={styles.emptyHint}>Upload a document to get started</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>Documents</Text> Library
        </Text>
        <Text style={styles.subtitle}>
          {documents.length} document{documents.length !== 1 ? 's' : ''} available
          {isOffline && ' • [Offline]'}
        </Text>
      </View>

      <View style={styles.filtersContainer}>
        <BlurView intensity={60} tint="dark" style={styles.filtersRow}>
          {renderFilterChip('All', 'all')}
          {renderFilterChip('Processed', 'processed')}
          {renderFilterChip('Processing', 'processing')}
          {renderFilterChip('Failed', 'failed')}
        </BlurView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocumentCard}
          keyExtractor={item => item.id || item.document_id || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { paddingHorizontal: 20, marginBottom: 16 },
  title: { color: '#F8FAFC', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  titleHighlight: { color: '#60A5FA' },
  subtitle: { color: '#94A3B8', fontSize: 16, marginTop: 6, fontWeight: '500' },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filtersRow: { flexDirection: 'row', borderRadius: 12, padding: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChip: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  filterChipActive: { backgroundColor: 'rgba(96, 165, 250, 0.2)' },
  filterChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#60A5FA', fontWeight: '700' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 100 },
  loadingText: { color: '#94A3B8', marginTop: 20, fontSize: 15, fontWeight: '500' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  documentCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  documentIcon: { fontSize: 28, marginRight: 12 },
  documentInfo: { flex: 1 },
  documentTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  documentMeta: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 8 },
  statusIcon: { fontSize: 12, marginRight: 4 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { backgroundColor: 'rgba(96, 165, 250, 0.1)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { color: '#60A5FA', fontSize: 11, fontWeight: '600' },
  moreTagsText: { color: '#60A5FA', fontSize: 11, fontWeight: '600', paddingHorizontal: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, paddingTop: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 20 },
  emptyText: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptyHint: { color: '#94A3B8', fontSize: 14, textAlign: 'center' },
});
