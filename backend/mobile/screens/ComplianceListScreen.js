import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import { getCertificatesList } from '../services/api';

export const ComplianceListScreen = ({ onNavigateToCertificate }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getCertificatesList();
      setCertificates(response.data || []);
      setIsOffline(response.isOffline || false);
    } catch (err) {
      console.error('Failed to load certificates:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => loadCertificates(true);

  const getRiskColor = (status) => {
    if (!status) return '#64748B';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('valid') || statusLower.includes('active')) return '#10B981';
    if (statusLower.includes('expiring') || statusLower.includes('warning')) return '#F59E0B';
    if (statusLower.includes('expired') || statusLower.includes('critical')) return '#EF4444';
    return '#64748B';
  };

  const getFilteredCertificates = () => {
    if (filter === 'all') return certificates;
    return certificates.filter(cert => {
      const status = (cert.status || '').toLowerCase();
      if (filter === 'active') return status.includes('valid') || status.includes('active');
      if (filter === 'expiring') return status.includes('expiring') || status.includes('warning');
      if (filter === 'expired') return status.includes('expired');
      return true;
    });
  };

  const filteredCerts = getFilteredCertificates();
  const activeCerts = certificates.filter(c => (c.status || '').toLowerCase().includes('valid')).length;
  const expiringCerts = certificates.filter(c => (c.status || '').toLowerCase().includes('expiring')).length;
  const expiredCerts = certificates.filter(c => (c.status || '').toLowerCase().includes('expired')).length;

  const renderFilterChip = (label, value) => (
    <TouchableOpacity
      style={[styles.filterChip, filter === value && styles.filterChipActive]}
      onPress={() => setFilter(value)}
    >
      <Text style={[styles.filterChipText, filter === value && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>Compliance</Text> Dashboard
        </Text>
        <Text style={styles.subtitle}>
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
          {isOffline && ' • [Offline]'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading compliance data...</Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryGrid}>
            <BlurView intensity={40} tint="dark" style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#10B981' }]}>{activeCerts}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </BlurView>
            
            <BlurView intensity={40} tint="dark" style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{expiringCerts}</Text>
              <Text style={styles.summaryLabel}>Expiring</Text>
            </BlurView>
            
            <BlurView intensity={40} tint="dark" style={styles.summaryCard}>
              <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>{expiredCerts}</Text>
              <Text style={styles.summaryLabel}>Expired</Text>
            </BlurView>
          </View>

          <View style={styles.filtersContainer}>
            <BlurView intensity={60} tint="dark" style={styles.filtersRow}>
              {renderFilterChip('All', 'all')}
              {renderFilterChip('Active', 'active')}
              {renderFilterChip('Expiring', 'expiring')}
              {renderFilterChip('Expired', 'expired')}
            </BlurView>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
            }
          >
            {filteredCerts.length > 0 ? (
              filteredCerts.map((cert, index) => (
                <TouchableOpacity
                  key={cert.id || index}
                  activeOpacity={0.7}
                  onPress={() => onNavigateToCertificate && onNavigateToCertificate(cert.id)}
                >
                  <BlurView intensity={30} tint="dark" style={styles.certCard}>
                    <View style={styles.certHeader}>
                      <View style={styles.certInfo}>
                        <Text style={styles.certName}>{cert.name || 'Certificate'}</Text>
                        <Text style={styles.certType}>{cert.type || 'Unknown type'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: `${getRiskColor(cert.status)}20` }]}>
                        <Text style={[styles.statusText, { color: getRiskColor(cert.status) }]}>
                          {cert.status || 'unknown'}
                        </Text>
                      </View>
                    </View>
                    {cert.expiry_date && (
                      <Text style={styles.certExpiry}>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</Text>
                    )}
                  </BlurView>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📄</Text>
                <Text style={styles.emptyText}>No certificates found</Text>
              </View>
            )}
          </ScrollView>
        </>
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
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 100 },
  loadingText: { color: '#94A3B8', marginTop: 20, fontSize: 15, fontWeight: '500' },
  summaryGrid: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16, gap: 12 },
  summaryCard: { flex: 1, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', alignItems: 'center' },
  summaryNumber: { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  summaryLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 16 },
  filtersRow: { flexDirection: 'row', borderRadius: 12, padding: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChip: { flex: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center' },
  filterChipActive: { backgroundColor: 'rgba(96, 165, 250, 0.2)' },
  filterChipText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  filterChipTextActive: { color: '#60A5FA', fontWeight: '700' },
  scrollView: { flex: 1 },
  contentContainer: { paddingHorizontal: 20, paddingBottom: 120 },
  certCard: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  certHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  certInfo: { flex: 1 },
  certName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  certType: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  certExpiry: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 50, marginBottom: 20 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
