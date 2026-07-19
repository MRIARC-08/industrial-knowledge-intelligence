import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { getEquipmentDetail } from '../services/api';

export const EquipmentDetailScreen = ({ tag, onNavigateToHistory, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [equipmentData, setEquipmentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadEquipmentData();
  }, [tag]);

  const loadEquipmentData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getEquipmentDetail(tag);
      setEquipmentData(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load equipment data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return '#64748B';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('operational') || statusLower.includes('normal')) return '#10B981';
    if (statusLower.includes('maintenance') || statusLower.includes('warning')) return '#F59E0B';
    if (statusLower.includes('critical') || statusLower.includes('failure')) return '#EF4444';
    return '#64748B';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>
            <Text style={styles.titleHighlight}>Equipment</Text> Details
          </Text>
        </View>
        <Text style={styles.assetTag}>{tag}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading equipment data...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadEquipmentData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {equipmentData?.isOffline && (
            <BlurView intensity={40} tint="dark" style={styles.offlineBanner}>
              <Text style={styles.offlineIcon}>📶</Text>
              <Text style={styles.offlineText}>Offline Mode - Cached Data</Text>
            </BlurView>
          )}

          {/* Status Overview Card */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>📊 Status Overview</Text>
              {equipmentData?.status && (
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(equipmentData.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(equipmentData.status) }]}>
                    {equipmentData.status}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{equipmentData?.type || 'Unknown'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{equipmentData?.location || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Inspected:</Text>
              <Text style={styles.infoValue}>
                {equipmentData?.last_inspection || 'No records'}
              </Text>
            </View>
          </BlurView>

          {/* Maintenance History Summary */}
          <BlurView intensity={40} tint="dark" style={styles.card}>
            <Text style={styles.cardTitle}>🔧 Maintenance Summary</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {equipmentData?.failures?.length || 0}
                </Text>
                <Text style={styles.summaryLabel}>Failures Recorded</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {equipmentData?.documents?.length || 0}
                </Text>
                <Text style={styles.summaryLabel}>Documents Linked</Text>
              </View>
            </View>
          </BlurView>

          {/* Recent Failures */}
          {equipmentData?.failures && equipmentData.failures.length > 0 && (
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <Text style={styles.cardTitle}>⚠️ Recent Failures</Text>
              {equipmentData.failures.slice(0, 3).map((failure, index) => (
                <View key={index} style={styles.failureItem}>
                  <View style={styles.failureDot} />
                  <View style={styles.failureContent}>
                    <Text style={styles.failureText}>
                      {failure.description || failure.type || 'Failure recorded'}
                    </Text>
                    <Text style={styles.failureDate}>
                      {failure.date || 'Date unknown'}
                    </Text>
                  </View>
                </View>
              ))}
              {equipmentData.failures.length > 3 && (
                <Text style={styles.moreText}>
                  +{equipmentData.failures.length - 3} more failures
                </Text>
              )}
            </BlurView>
          )}

          {/* Documents */}
          {equipmentData?.documents && equipmentData.documents.length > 0 && (
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <Text style={styles.cardTitle}>📄 Related Documents</Text>
              {equipmentData.documents.slice(0, 3).map((doc, index) => (
                <View key={index} style={styles.docItem}>
                  <Text style={styles.docIcon}>📄</Text>
                  <Text style={styles.docText} numberOfLines={1}>
                    {doc.name || doc.title || `Document ${index + 1}`}
                  </Text>
                </View>
              ))}
              {equipmentData.documents.length > 3 && (
                <Text style={styles.moreText}>
                  +{equipmentData.documents.length - 3} more documents
                </Text>
              )}
            </BlurView>
          )}

          {/* View Full History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => onNavigateToHistory && onNavigateToHistory(tag)}
            activeOpacity={0.8}
          >
            <BlurView intensity={60} tint="dark" style={styles.historyButtonContent}>
              <Text style={styles.historyButtonText}>View Complete History</Text>
              <Text style={styles.historyButtonIcon}>→</Text>
            </BlurView>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    marginRight: 12,
    padding: 8,
  },
  backIcon: {
    color: '#60A5FA',
    fontSize: 28,
    fontWeight: '600',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: '#60A5FA',
  },
  assetTag: {
    color: '#60A5FA',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
    marginLeft: 48,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 100,
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  retryButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    overflow: 'hidden',
  },
  offlineIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  offlineText: {
    color: '#FCD34D',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '500',
  },
  infoValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#60A5FA',
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  failureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  failureDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    marginTop: 6,
    marginRight: 12,
  },
  failureContent: {
    flex: 1,
  },
  failureText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  failureDate: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  moreText: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    padding: 12,
    borderRadius: 10,
  },
  docIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  docText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  historyButton: {
    marginTop: 8,
    marginBottom: 20,
  },
  historyButtonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    overflow: 'hidden',
  },
  historyButtonText: {
    color: '#60A5FA',
    fontSize: 18,
    fontWeight: '700',
  },
  historyButtonIcon: {
    color: '#60A5FA',
    fontSize: 24,
    fontWeight: '600',
  },
});
