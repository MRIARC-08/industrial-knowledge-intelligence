import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

export const SourceCard = ({ source }) => {
  return (
    <BlurView intensity={20} tint="dark" style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.docId}>📄 {source.doc_id || 'Document'}</Text>
        <Text style={styles.score}>Match: {(source.score * 100).toFixed(0)}%</Text>
      </View>
      <Text style={styles.text} numberOfLines={4}>
        "{source.chunk_text || source.text || 'No preview available'}"
      </Text>
      {source.equipment_tags && source.equipment_tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {source.equipment_tags.slice(0, 3).map((tag, idx) => (
            <View key={idx} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center'
  },
  docId: {
    color: '#60A5FA',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5
  },
  score: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden'
  },
  text: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic'
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  tagText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '700'
  }
});
