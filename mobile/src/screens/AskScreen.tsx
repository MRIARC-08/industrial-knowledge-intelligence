// mobile/src/screens/AskScreen.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { api } from '@/lib/api'
import { Card } from '@/components/Card'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { confidencePercent, confidenceColor } from '@/lib/utils'
import { QueryResponse } from '../../shared/types'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  response?: QueryResponse
}

const SUGGESTIONS = [
  'First checks for high vibration on P-101A?',
  'What caused the last P-101A failure?',
  'Safe startup pressure for the feed pump?',
  'Is V-301 certificate still valid?',
]

export default function AskScreen() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [equipmentCtx, setEquipmentCtx] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  // Pulse animation for recording
  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

  // Query mutation
  const queryMutation = useMutation({
    mutationFn: api.query,
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.answer,
        response: data,
      }])
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)
    },
    onError: (err: Error) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
      }])
    },
  })

  // Transcribe mutation
  const transcribeMutation = useMutation({
    mutationFn: async (uri: string) => {
      const blob = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      })
      // Create a blob-like object for the API
      const file = {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as unknown as File
      return api.transcribe(file)
    },
    onSuccess: (data) => {
      if (data.text) {
        setInput(data.text)
      }
    },
  })

  const sendQuery = (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed) return

    setMessages(prev => [...prev, {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: trimmed,
    }])
    setInput('')
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100)

    queryMutation.mutate({
      query: trimmed,
      user_id: 'field_tech_mobile',
      user_role: 'technician',
      equipment_context: equipmentCtx || undefined,
    })
  }

  const startRecording = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') return

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      )
      await recording.startAsync()
      recordingRef.current = recording
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
    }
  }

  const stopRecording = async () => {
    if (!recordingRef.current) return
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      await recordingRef.current.stopAndUnloadAsync()
      const uri = recordingRef.current.getURI()
      recordingRef.current = null
      setIsRecording(false)

      if (uri) {
        transcribeMutation.mutate(uri)
      }
    } catch (err) {
      console.error('Failed to stop recording:', err)
      setIsRecording(false)
    }
  }

  const isLoading = queryMutation.isPending || transcribeMutation.isPending

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Context selector */}
        <View style={styles.contextBar}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.text.muted} />
          <TextInput
            value={equipmentCtx}
            onChangeText={setEquipmentCtx}
            placeholder="Equipment tag (e.g. P-101A)"
            placeholderTextColor={colors.text.muted}
            style={styles.contextInput}
            autoCapitalize="characters"
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty state */}
          {messages.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.botIcon}>
                <Ionicons name="hardware-chip-outline" size={32} color={colors.accent.blue} />
              </View>
              <Text style={styles.emptyTitle}>Ask Anything</Text>
              <Text style={styles.emptySub}>
                Voice or text queries about equipment, procedures, and compliance
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.suggestionChip}
                    onPress={() => sendQuery(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.suggestionText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Message bubbles */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiLabel}>
                  <Ionicons name="hardware-chip" size={12} color={colors.accent.blue} />
                  <Text style={styles.aiLabelText}>AI</Text>
                </View>
              )}

              <Text style={[
                styles.messageText,
                msg.role === 'user' && styles.userMessageText
              ]}>
                {msg.content}
              </Text>

              {/* AI response metadata */}
              {msg.role === 'assistant' && msg.response && (
                <View style={styles.responseMeta}>
                  {/* Confidence bar */}
                  <View style={styles.confidenceRow}>
                    <Text style={styles.metaLabel}>Confidence</Text>
                    <View style={styles.confidenceBar}>
                      <View style={[
                        styles.confidenceFill,
                        {
                          width: `${msg.response.confidence * 100}%` as any,
                          backgroundColor: confidenceColor(msg.response.confidence),
                        }
                      ]} />
                    </View>
                    <Text style={[
                      styles.confidenceValue,
                      { color: confidenceColor(msg.response.confidence) }
                    ]}>
                      {confidencePercent(msg.response.confidence)}
                    </Text>
                  </View>

                  {/* Sources */}
                  {msg.response.sources.length > 0 && (
                    <View style={styles.sources}>
                      <Text style={styles.metaLabel}>Sources:</Text>
                      {msg.response.sources.slice(0, 2).map((src, i) => (
                        <View key={i} style={styles.sourceItem}>
                          <Ionicons name="document-text-outline" size={11} color={colors.accent.blue} />
                          <Text style={styles.sourceText} numberOfLines={1}>
                            {src.doc_id}
                          </Text>
                          <Text style={styles.sourceScore}>
                            {src.score.toFixed(2)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={styles.responseTime}>
                    {msg.response.response_time_ms}ms
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <View style={styles.aiBubble}>
              <View style={styles.aiLabel}>
                <Ionicons name="hardware-chip" size={12} color={colors.accent.blue} />
                <Text style={styles.aiLabelText}>AI</Text>
              </View>
              <View style={styles.typingIndicator}>
                {[0, 1, 2].map((i) => (
                  <View
                    key={i}
                    style={[styles.dot, { opacity: isLoading ? 1 : 0.3 }]}
                  />
                ))}
              </View>
              {transcribeMutation.isPending && (
                <Text style={styles.transcribingText}>Transcribing audio...</Text>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input area */}
        <View style={styles.inputArea}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Type your question..."
            placeholderTextColor={colors.text.muted}
            style={styles.textInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendQuery(input)}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled
            ]}
            onPress={() => sendQuery(input)}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Voice button */}
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
            style={styles.voiceButtonWrapper}
          >
            <Animated.View style={[
              styles.voiceButton,
              isRecording && styles.voiceButtonActive,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={22}
                color={isRecording ? '#fff' : colors.accent.blue}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording... Release to send</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  container: { flex: 1 },
  contextBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
    backgroundColor: colors.bg.secondary,
  },
  contextInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  messagesList: { flex: 1 },
  messagesContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },
  emptyState: { alignItems: 'center', paddingTop: spacing.xxl },
  botIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: typography.sizes.sm * 1.6,
    marginBottom: spacing.lg,
  },
  suggestions: { gap: spacing.xs, width: '100%' },
  suggestionChip: {
    backgroundColor: colors.bg.secondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.sm + 4,
  },
  suggestionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  messageBubble: {
    maxWidth: '90%',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent.blue,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.secondary,
    borderWidth: 1,
    borderColor: colors.bg.border,
    width: '95%',
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.accent.blue,
  },
  messageText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * 1.5,
  },
  userMessageText: { color: '#fff' },
  responseMeta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    gap: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginBottom: 2,
  },
  confidenceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.bg.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: 2 },
  confidenceValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    width: 36,
    textAlign: 'right',
  },
  sources: { gap: 4 },
  sourceItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sourceText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    color: colors.accent.blue,
  },
  sourceScore: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  responseTime: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
  },
  typingIndicator: { flexDirection: 'row', gap: 4, paddingVertical: 4 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.blue,
  },
  transcribingText: {
    fontSize: typography.sizes.xs,
    color: colors.accent.blue,
    fontStyle: 'italic',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    backgroundColor: colors.bg.secondary,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bg.tertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.bg.tertiary },
  voiceButtonWrapper: {},
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent.blue + '20',
    borderWidth: 1,
    borderColor: colors.accent.blue + '40',
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.accent.red,
    borderColor: colors.accent.red,
  },
  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent.red + '20',
    borderTopWidth: 1,
    borderTopColor: colors.accent.red + '40',
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent.red,
  },
  recordingText: {
    fontSize: typography.sizes.sm,
    color: colors.accent.red,
    fontWeight: typography.weights.medium,
  },
})
