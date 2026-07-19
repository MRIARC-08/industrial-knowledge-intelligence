import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Audio } from 'expo-av';
import { queryKnowledgeBase, transcribeAudio } from '../services/api';
import { SourceCard } from '../components/SourceCard';

export const HomeScreen = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  const [recording, setRecording] = useState(null);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true })
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const handleVoicePress = async () => {
    if (isRecording && recording) {
      // Stop recording and process
      setIsRecording(false);
      setIsProcessingVoice(true);
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const text = await transcribeAudio(uri);
        setQuery(text);
        setRecording(null);
      } catch (err) {
        alert('Failed to transcribe audio.');
      } finally {
        setIsProcessingVoice(false);
      }
    } else {
      // Start recording
      try {
        await Audio.requestPermissionsAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: newRecording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(newRecording);
        setIsRecording(true);
      } catch (err) {
        alert('Failed to start camera/mic permissions');
      }
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResult(null);
    try {
      const response = await queryKnowledgeBase(query);
      setResult(response);
    } catch (error) {
      alert('Error connecting to the Industrial Brain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>
          <Text style={styles.titleHighlight}>AI</Text> Operational Brain
        </Text>
        <Text style={styles.subtitle}>Ask anything about your assets</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#60A5FA" />
          <Text style={styles.loadingText}>Analyzing industrial knowledge graph...</Text>
        </View>
      )}

      {result && (
        <ScrollView style={styles.resultsContainer} contentContainerStyle={{ paddingBottom: 120 }}>
          <BlurView intensity={40} tint="dark" style={styles.answerCard}>
            <View style={styles.answerHeader}>
              <Text style={styles.answerTitle}>✨ Expert Answer</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{(result.confidence * 100).toFixed(0)}% Confident</Text>
              </View>
            </View>
            <Text style={styles.answerText}>{result.answer}</Text>
            <Text style={styles.timeText}>
              Generated in {result.response_time_ms}ms 
              {result.isOffline ? ' • [Offline Cache]' : ''}
            </Text>
          </BlurView>

          <Text style={styles.sourcesTitle}>SOURCES & CITATIONS ({result.sources.length})</Text>
          {result.sources.map((source, idx) => (
            <SourceCard key={idx} source={source} />
          ))}
        </ScrollView>
      )}
      
      {!loading && !result && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤖</Text>
          <Text style={styles.emptyText}>I have analyzed standard operating procedures, maintenance logs, and compliance regulations.</Text>
          
          {isRecording && (
            <View style={styles.recordingState}>
              <Animated.View style={[styles.recordingDot, { transform: [{ scale: pulseAnim }] }]} />
              <Text style={styles.recordingText}>Listening...</Text>
            </View>
          )}
          {isProcessingVoice && (
            <View style={styles.recordingState}>
              <ActivityIndicator size="small" color="#F87171" />
              <Text style={styles.recordingText}>Transcribing...</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.searchWrapper}>
        <BlurView intensity={60} tint="dark" style={styles.searchContainer}>
          <TextInput
            style={styles.input}
            placeholder="e.g., What is the normal pressure for P-101A?"
            placeholderTextColor="#64748B"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
          />
          
          <TouchableOpacity 
            style={styles.micButton} 
            onPress={handleVoicePress}
          >
            <Animated.Text style={[styles.micIcon, isRecording && { color: '#EF4444' }, { transform: [{ scale: pulseAnim }] }]}>
              🎤
            </Animated.Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, !query.trim() && styles.buttonDisabled]} 
            onPress={handleSearch} 
            disabled={loading || !query.trim()}
          >
            <Text style={styles.buttonText}>{loading ? '...' : 'Ask'}</Text>
          </TouchableOpacity>
        </BlurView>
      </View>
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
    fontWeight: '500'
  },
  searchWrapper: {
    position: 'absolute',
    bottom: 95, 
    left: 20,
    right: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 6,
  },
  input: {
    flex: 1,
    color: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
  },
  micButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5
  },
  micIcon: {
    fontSize: 22,
    color: '#94A3B8'
  },
  button: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 15,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.4)',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16
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
    fontWeight: '500'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginBottom: 150,
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
    marginBottom: 20,
  },
  recordingState: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 20,
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  recordingText: {
    color: '#FCA5A5',
    fontSize: 14,
    fontWeight: '600'
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  answerCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  answerTitle: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  confidenceBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)'
  },
  confidenceText: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700'
  },
  answerText: {
    color: '#F8FAFC',
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '400'
  },
  timeText: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 20,
    textAlign: 'right',
    fontWeight: '500'
  },
  sourcesTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: 1.5,
  }
});
