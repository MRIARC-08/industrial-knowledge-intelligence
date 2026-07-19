// mobile/src/screens/AskScreen.tsx
import React, { useState, useRef, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, StatusBar
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { MotiView } from 'moti'
import { useMutation } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import * as Haptics from 'expo-haptics'
import { api } from '@/lib/api'
import { colors, spacing, radius, typography } from '@/lib/theme'
import { confidencePercent, confidenceColor } from '@/lib/utils'
import { QueryResponse } from '@iki/shared'

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
  const insets = useSafeAreaInsets()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [equipmentCtx, setEquipmentCtx] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.setValue(1)
    }
  }, [isRecording])

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
        content: `Error: ${err.message}. Please try again.`,
      }])
    },
  })

  const transcribeMutation = useMutation({
    mutationFn: async (uri: string) => {
      const file = { uri, type: 'audio/m4a', name: 'recording.m4a' } as unknown as File
      return api.transcribe(file)
    },
    onSuccess: (data) => {
      if (data.text) setInput(data.text)
    },
  })

  const sendQuery = (queryText: string) => {
    const trimmed = queryText.trim()
    if (!trimmed) return
    setMessages(prev => [...prev, { id: Date.now().toString() + '-user', role: 'user', content: trimmed }])
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
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()
      recordingRef.current = recording
      setIsRecording(true)
    } catch (err) {
      console.error('Recording start failed:', err)
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
      if (uri) transcribeMutation.mutate(uri)
    } catch (err) {
      console.error('Recording stop failed:', err)
      setIsRecording(false)
    }
  }

  const isLoading = queryMutation.isPending || transcribeMutation.isPending

  return (
    <View style={[styles.safe, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.card} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        {/* Equipment context strip */}
        <View style={styles.contextStrip}>
          <Ionicons name="hardware-chip-outline" size={14} color={colors.text.muted} />
          <TextInput
            value={equipmentCtx}
            onChangeText={setEquipmentCtx}
            placeholder="Equipment tag context (e.g. P-101A)"
            placeholderTextColor={colors.text.muted}
            style={styles.contextInput}
            autoCapitalize="characters"
          />
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="hardware-chip" size={28} color={colors.brand.primary} />
              </View>
              <Text style={styles.emptyTitle}>Ask Anything</Text>
              <Text style={styles.emptySub}>
                Voice or text queries about equipment, procedures, and compliance
              </Text>
              <View style={styles.suggestions}>
                {SUGGESTIONS.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.chip}
                    onPress={() => sendQuery(s)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chipText}>{s}</Text>
                    <Ionicons name="arrow-forward" size={12} color={colors.brand.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bubbles */}
          {messages.map((msg, i) => (
            <MotiView
              key={msg.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 250 }}
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.aiBubble
              ]}
            >
              {msg.role === 'assistant' && (
                <View style={styles.aiTag}>
                  <Ionicons name="hardware-chip" size={11} color={colors.brand.primary} />
                  <Text style={styles.aiTagText}>AI</Text>
                </View>
              )}

              <Text style={[styles.bubbleText, msg.role === 'user' && styles.userBubbleText]}>
                {msg.content}
              </Text>

              {msg.role === 'assistant' && msg.response && (
                <View style={styles.meta}>
                  {/* Confidence */}
                  <View style={styles.confRow}>
                    <Text style={styles.metaLabel}>Confidence</Text>
                    <View style={styles.confTrack}>
                      <View style={[styles.confFill, {
                        width: `${msg.response.confidence * 100}%` as any,
                        backgroundColor: confidenceColor(msg.response.confidence),
                      }]} />
                    </View>
                    <Text style={[styles.confPct, { color: confidenceColor(msg.response.confidence) }]}>
                      {confidencePercent(msg.response.confidence)}
                    </Text>
                  </View>

                  {/* Sources */}
                  {msg.response.sources.length > 0 && (
                    <View style={styles.sources}>
                      <Text style={styles.metaLabel}>Sources</Text>
                      {msg.response.sources.slice(0, 2).map((src, i) => (
                        <View key={i} style={styles.sourceRow}>
                          <Ionicons name="document-text" size={11} color={colors.brand.primary} />
                          <Text style={styles.sourceText} numberOfLines={1}>{src.doc_id}</Text>
                          <View style={styles.scoreChip}>
                            <Text style={styles.scoreText}>{src.score.toFixed(2)}</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={styles.respTime}>{msg.response.response_time_ms}ms</Text>
                </View>
              )}
            </MotiView>
          ))}

          {/* Loading */}
          {isLoading && (
            <MotiView 
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 250 }}
              style={styles.loadingBubble}
            >
              <View style={styles.aiTag}>
                <Ionicons name="hardware-chip" size={11} color={colors.brand.primary} />
                <Text style={styles.aiTagText}>AI</Text>
              </View>
              <View style={styles.typing}>
                {[0, 1, 2].map((i) => (
                  <MotiView 
                    key={i} 
                    from={{ opacity: 0.3, translateY: 0 }}
                    animate={{ opacity: 1, translateY: -4 }}
                    transition={{ 
                      type: 'timing', 
                      duration: 400, 
                      loop: true,
                      delay: i * 150 
                    }}
                    style={styles.typingDot} 
                  />
                ))}
              </View>
              {transcribeMutation.isPending && (
                <Text style={styles.transcribingText}>Transcribing audio...</Text>
              )}
            </MotiView>
          )}
        </ScrollView>

        {/* Recording Banner */}
        {isRecording && (
          <View style={styles.recordingBanner}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingText}>Recording — Release to send</Text>
          </View>
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
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

          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendQuery(input)}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color={colors.text.onBlue} size="small" />
              : <Ionicons name="send" size={16} color={colors.text.onBlue} />
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
          >
            <Animated.View style={[
              styles.voiceBtn,
              isRecording && styles.voiceBtnActive,
              { transform: [{ scale: pulseAnim }] }
            ]}>
              <Ionicons
                name={isRecording ? 'mic' : 'mic-outline'}
                size={20}
                color={isRecording ? colors.text.onBlue : colors.brand.primary}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.page },
  container: { flex: 1 },

  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
  },
  contextInput: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },

  messages: { flex: 1, backgroundColor: colors.bg.page },
  messagesContent: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.lg },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    backgroundColor: colors.brand.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  emptySub: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: typography.sizes.sm * 1.6,
  },
  suggestions: { gap: spacing.xs, width: '100%', marginTop: spacing.md },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
  },
  chipText: { fontSize: typography.sizes.sm, color: colors.text.secondary, flex: 1 },

  bubble: {
    maxWidth: '90%',
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand.primary,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.bg.border,
    width: '95%',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    width: '95%',
    paddingLeft: spacing.sm,
    paddingTop: spacing.xs,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  aiTagText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.brand.primary,
  },
  bubbleText: {
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    lineHeight: typography.sizes.base * 1.5,
  },
  userBubbleText: { color: colors.text.onBlue },

  meta: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    gap: spacing.xs,
  },
  metaLabel: { fontSize: typography.sizes.xs, color: colors.text.muted, marginBottom: 2 },
  confRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  confTrack: {
    flex: 1,
    height: 5,
    backgroundColor: colors.bg.section,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confFill: { height: '100%', borderRadius: 3 },
  confPct: { fontSize: typography.sizes.xs, fontWeight: typography.weights.semibold, width: 36, textAlign: 'right' },
  sources: { gap: 4 },
  sourceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sourceText: { flex: 1, fontSize: typography.sizes.xs, color: colors.brand.primary },
  scoreChip: {
    backgroundColor: colors.bg.section,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  scoreText: { fontSize: 10, color: colors.text.muted },
  respTime: { fontSize: typography.sizes.xs, color: colors.text.muted, textAlign: 'right' },

  typing: { flexDirection: 'row', gap: 5, paddingVertical: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.brand.primary },
  transcribingText: { fontSize: typography.sizes.xs, color: colors.brand.primary, fontStyle: 'italic' },

  recordingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm,
    backgroundColor: colors.status.dangerBg,
    borderTopWidth: 1,
    borderTopColor: colors.status.dangerBorder,
  },
  recordingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.semantic.critical },
  recordingText: {
    fontSize: typography.sizes.sm,
    color: colors.status.dangerText,
    fontWeight: typography.weights.semibold,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    backgroundColor: colors.bg.card,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.bg.border,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.bg.section },
  voiceBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.brand.light,
    borderWidth: 1.5,
    borderColor: colors.bg.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceBtnActive: {
    backgroundColor: colors.semantic.critical,
    borderColor: colors.semantic.critical,
  },
})
