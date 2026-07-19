import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as ws from '../services/webSocketClient';

export const LiveMetricsScreen = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [metrics, setMetrics] = useState({
    queriesPerMinute: 0,
    avgResponseTime: 0,
    accuracy: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const metricsPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    connectToWebSocket();

    return () => {
      ws.disconnect();
    };
  }, []);

  useEffect(() => {
    if (connectionStatus === 'connected') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [connectionStatus]);

  const triggerMetricsAnimation = () => {
    Animated.sequence([
      Animated.timing(metricsPulse, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(metricsPulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const connectToWebSocket = async () => {
    setLoading(true);
    
    const unsubStatus = ws.onStatusChange((status) => {
      setConnectionStatus(status);
      if (status === 'connected') {
        setLoading(false);
      }
    });

    const unsubMetrics = ws.subscribe('metrics', (data) => {
      setMetrics({
        queriesPerMinute: data.queriesPerMinute || 0,
        avgResponseTime: data.avgResponseTime || 0,
        accuracy: data.accuracy || 0,
      });
      setLastUpdate(new Date());
      triggerMetricsAnimation();
    });

    const unsubActivity = ws.subscribe('activity', (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 50));
    });

    ws.connect();

    // Mock data for development
    setTimeout(() => {
      if (ws.getStatus() !== 'connected') {
        setConnectionStatus('connected');
        setLoading(false);
        startMockData();
      }
    }, 2000);
  };

  const startMockData = () => {
    setInterval(() => {
      const mockMetrics = {
        queriesPerMinute: Math.floor(Math.random() * 50) + 10,
        avgResponseTime: Math.floor(Math.random() * 300) + 100,
        accuracy: Math.random() * 0.15 + 0.85,
      };
      
      setMetrics(mockMetrics);
      setLastUpdate(new Date());
      triggerMetricsAnimation();

      if (Math.random() > 0.7) {
        const messages = [
          'Query processed: "What is the pressure for P-101A?"',
          'Equipment scanned: P-101A',
          'Maintenance log updated',
          'Knowledge graph updated',
          'User query answered with 95% confidence',
        ];
        
        setActivities(prev => [{
          id: Date.now(),
          type: ['query', 'equipment_scan', 'maintenance_log'][Math.floor(Math.random() * 3)],
          message: messages[Math.floor(Math.random() * messages.length)],
          timestamp: new Date(),
          status: ['success', 'warning', 'info'][Math.floor(Math.random() * 3)],
        }, ...prev].slice(0, 50));
      }
    }, 3000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connected': return '#10B981';
      case 'connecting': return '#F59E0B';
      case 'reconnecting': return '#F59E0B';
      case 'disconnected': return '#64748B';
      default: return '#64748B';
    }
  };

  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live';
      case 'connecting': return 'Connecting...';
      case 'reconnecting': return 'Reconnecting...';
      case 'disconnected': return 'Offline';
      default: return 'Offline';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'query': return '💬';
      case 'equipment_scan': return '📷';
      case 'maintenance_log': return '🔧';
      default: return '📊';
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'success': return '#10B981';
      case 'warning': return '#F59E0B';
      case 'info': return '#60A5FA';
      default: return '#64748B';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(timestamp)) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Connecting to live metrics...</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>Live</Text> Metrics
        </Text>
        <Text style={styles.subtitle}>Real-time system monitoring</Text>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#60A5FA" />
        }
      >
        <BlurView intensity={50} tint="dark" style={styles.connectionCard}>
          <View style={styles.connectionHeader}>
            <View style={styles.connectionInfo}>
              <Animated.View
                style={[
                  styles.connectionDot,
                  {
                    backgroundColor: getConnectionColor(),
                    transform: [{ scale: connectionStatus === 'connected' ? pulseAnim : 1 }],
                  },
                ]}
              />
              <Text style={styles.connectionText}>{getConnectionText()}</Text>
            </View>
            {lastUpdate && (
              <Text style={styles.lastUpdateText}>
                Updated {formatTimestamp(lastUpdate)}
              </Text>
            )}
          </View>
        </BlurView>

        <Text style={styles.sectionTitle}>PERFORMANCE METRICS</Text>
        <Animated.View style={{ transform: [{ scale: metricsPulse }] }}>
          <View style={styles.metricsGrid}>
            <BlurView intensity={40} tint="dark" style={styles.metricCard}>
              <LinearGradient
                colors={['rgba(96, 165, 250, 0.1)', 'rgba(96, 165, 250, 0.05)']}
                style={styles.metricGradient}
              >
                <Text style={styles.metricIcon}>📊</Text>
                <Text style={styles.metricValue}>{metrics.queriesPerMinute}</Text>
                <Text style={styles.metricLabel}>Queries/min</Text>
                <View style={styles.metricBadge}>
                  <Text style={styles.metricBadgeText}>
                    {metrics.queriesPerMinute > 20 ? '↑ High' : '→ Normal'}
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>

            <BlurView intensity={40} tint="dark" style={styles.metricCard}>
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.05)']}
                style={styles.metricGradient}
              >
                <Text style={styles.metricIcon}>⚡</Text>
                <Text style={styles.metricValue}>{metrics.avgResponseTime}ms</Text>
                <Text style={styles.metricLabel}>Response Time</Text>
                <View style={[styles.metricBadge, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.metricBadgeText, { color: '#34D399' }]}>
                    {metrics.avgResponseTime < 200 ? '✓ Fast' : '→ OK'}
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>

            <BlurView intensity={40} tint="dark" style={styles.metricCard}>
              <LinearGradient
                colors={['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.05)']}
                style={styles.metricGradient}
              >
                <Text style={styles.metricIcon}>🎯</Text>
                <Text style={styles.metricValue}>{(metrics.accuracy * 100).toFixed(0)}%</Text>
                <Text style={styles.metricLabel}>Accuracy</Text>
                <View style={[styles.metricBadge, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                  <Text style={[styles.metricBadgeText, { color: '#FCD34D' }]}>
                    {metrics.accuracy > 0.9 ? '✓ High' : '→ Good'}
                  </Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>
        </Animated.View>

        <Text style={styles.sectionTitle}>LIVE ACTIVITY FEED</Text>
        <View style={styles.activityContainer}>
          {activities.length === 0 ? (
            <BlurView intensity={20} tint="dark" style={styles.emptyActivity}>
              <Text style={styles.emptyActivityIcon}>📡</Text>
              <Text style={styles.emptyActivityText}>Waiting for activity...</Text>
            </BlurView>
          ) : (
            activities.map((activity, index) => (
              <BlurView
                key={activity.id}
                intensity={30}
                tint="dark"
                style={[styles.activityCard, index === 0 && styles.activityCardLatest]}
              >
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityMessage} numberOfLines={2}>
                      {activity.message}
                    </Text>
                    <View style={styles.activityFooter}>
                      <View
                        style={[
                          styles.activityStatusDot,
                          { backgroundColor: getActivityStatusColor(activity.status) },
                        ]}
                      />
                      <Text style={styles.activityTime}>
                        {formatTimestamp(activity.timestamp)}
                      </Text>
                    </View>
                  </View>
                </View>
              </BlurView>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Animated.View>
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
  title: {
    color: '#F8FAFC',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleHighlight: {
    color: '#60A5FA',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    marginTop: 6,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  connectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  connectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connectionText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  lastUpdateText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricGradient: {
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  metricBadge: {
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  metricBadgeText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
  },
  activityContainer: {
    marginBottom: 20,
  },
  activityCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  activityCardLatest: {
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderWidth: 1.5,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  activityIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(96, 165, 250, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityIcon: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityMessage: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 6,
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  activityTime: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyActivity: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  emptyActivityIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyActivityText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});
