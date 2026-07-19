import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { BlurView } from 'expo-blur';
import { getEquipmentList } from '../services/api';

export const EquipmentListScreen = ({ onNavigateToDetail }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [equipmentList, setEquipmentList] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEquipment(equipmentList);
    } else {
      const filtered = equipmentList.filter(
        item =>
          item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEquipment(filtered);
    }
  }, [searchQuery, equipmentList]);

  const loadEquipment = async () => {
    setLoading(true);
    try {
      const response = await getEquipmentList();
      setEquipmentList(response.data || []);
      setFilteredEquipment(response.data || []);
      setIsOffline(response.isOffline || false);
    } catch (err) {
      console.error('Failed to load equipment:', err);
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

  const getStatusIcon = (status) => {
    if (!status) return '○';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('operational') || statusLower.includes('normal')) return '✓';
    if (statusLower.includes('maintenance') || statusLower.includes('warning')) return '⚙';
    if (statusLower.includes('critical') || statusLower.includes('failure')) return '⚠';
    return '○';
  };

  const renderEquipmentCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onNavigateToDetail && onNavigateToDetail(item.tag)}
    >
      <BlurView intensity={30} tint="dark" style={styles.equipmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.tagContainer}>
            <Text style={styles.equipmentTag}>{item.tag}</Text>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
              <Text style={[styles.statusIcon, { color: getStatusColor(item.status) }]}>
                {getStatusIcon(item.status)}
              </Text>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status || 'unknown'}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.equipmentName}>{item.name}</Text>
        <Text style={styles.equipmentType}>Type: {item.type}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetails}>View Details →</Text>
        </View>
      </BlurView>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyText}>
        {searchQuery ? 'No equipment found matching your search' : 'No equipment available'}
      </Text>
      {searchQuery && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>Equipment</Text> Registry
        </Text>
        <Text style={styles.subtitle}>
          {filteredEquipment.length} asset{filteredEquipment.length !== 1 ? 's' : ''} available
          {isOffline && ' • [Offline]'}
        </Text>
      </View>

      <View style={styles.searchWrapper}>
        <BlurView intensity={60} tint="dark" style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by tag, name, or type..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearIcon}>
              <Text style={styles.clearIconText}>✕</Text>
            </TouchableOpacity>
          )}
        </BlurView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Loading equipment registry...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEquipment}
          renderItem={renderEquipmentCard}
          keyExtractor={item => item.tag || item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
  searchWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '500',
  },
  clearIcon: {
    padding: 4,
  },
  clearIconText: {
    color: '#94A3B8',
    fontSize: 18,
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
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  equipmentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  equipmentTag: {
    color: '#60A5FA',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  equipmentName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  equipmentType: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  cardFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  viewDetails: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 20,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 24,
  },
  clearButton: {
    marginTop: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  clearButtonText: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
  },
});
