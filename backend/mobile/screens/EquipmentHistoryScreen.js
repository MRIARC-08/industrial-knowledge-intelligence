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
import { getEquipmentHistory } from '../services/api';

export const EquipmentHistoryScreen = ({ tag, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistory();
  }, [tag]);

  const loadHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const history = await getEquipmentHistory(tag);
      setHistoryData(history);
    } catch (err) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type) => {
    if (!type) return '📌';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('failure') || typeLower.includes('fault')) return '⚠️';
    if (typeLower.includes('maintenance') || typeLower.includes('repair')) return '🔧';
    if (typeLower.includes('inspection')) return '🔍';
    if (typeLower.includes('document')) return '📄';
    return '📌';
  };

  const getEventColor = (type) => {
    if (!type) return '#64748B';
    const typeLower = type.toLowerCase();
    if (typeLower.includes('failure') || typeLower.includes('fault')) return '#EF4444';
    if (typeLower.includes('maintenance') || typeLower.includes('repair')) return '#F59E0B';
    if (typeLower.includes('inspection')) return '#60A5FA';
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
            <Text style={styles.titleHighlight}>History</Text> Timeline
          </Text>
        </View>
        <Text style={styles.assetTag}>{tag}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHistory}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {historyData?.isOffline && (
            <BlurView intensity={40} tint="dark" style={styles.offlineBanner}>
              <Text style={styles.offlineIcon}>📶</Text>
              <Text style={styles.offlineText}>Offline Mode - Cached Data</Text>
            </BlurView>
          )}

          {/* Timeline */}
          <Text style={styles.sectionTitle}>COMPLETE TIMELINE</Text>
          
          {historyData?.failures && historyData.failures.length > 0 ? (
            <View style={styles.timeline}>
              {historyData.failures.map((event, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineLine}>
                    <View 
                      style={[
                        styles.timelineDot, 
                        { backgroundColor: getEventColor(event.type) }
                      ]} 
                    />
                    {index < historyData.failures.length - 1 && (
                      <View style={styles.timelineConnector} />
                    )}
                  </View>
                  
                  <BlurView intensity={30} tint="dark" style={styles.eventCard}>
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventIcon}>
                        {getEventIcon(event.type)}
                      </Text>
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventTitle}>
                          {event.description || event.type || 'Event'}
                        </Text>
                        <Text style={styles.eventDate}>
                          {event.date || 'Date unknown'}
                        </Text>
                      </View>
                    </View>
                    {event.severity && (
                      <View 
                        style={[
                          styles.severityBadge,
                          { backgroundColor: `${getEventColor(event.severity)}20` }
                        ]}
                      >
                        <Text 
                          style={[
                            styles.severityText,
                            { color: getEventColor(event.severity) }
                          ]}
                        >
                          {event.severity}
                        </Text>
                      </View>
                    )}
                  </BlurView>
                </View>
              ))}
            </View>
          ) : (
            <BlurView intensity={20} tint="dark" style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>No history records found</Text>
            </BlurView>
          )}

          {/* Related Documents */}
          {historyData?.documents && historyData.documents.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>RELATED DOCUMENTS</Text>
              {historyData.documents.map((doc, index) => (
                <BlurView key={index} intensity={30} tint="dark" style={styles.docCard}>
                  <Text style={styles.docIcon}>📄</Text>
                  <Text style={styles.docText} numberOfLines={1}>
                    {doc.name || doc.title || `Document ${index + 1}`}
                  </Text>
                </BlurView>
              ))}
            </>
          )}
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
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  timeline: {
    marginBottom: 24,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLine: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 4,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    marginTop: 4,
  },
  eventCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  eventDate: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
  },
  severityBadge: {
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
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
});
