// mobile/src/screens/LoginScreen.tsx
import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, StatusBar, KeyboardAvoidingView, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { colors, spacing, radius, typography } from '@/lib/theme'

export default function LoginScreen() {
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('password')
  const insets = useSafeAreaInsets()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const setAuth = useAuthStore(state => state.setAuth)

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter both username and password')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await api.auth.login({ username, password })
      setAuth(response.access_token, response.role)
    } catch (err: any) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.bg.page} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Top brand bar */}
        <View style={styles.brandBar}>
          <View style={styles.logoBox}>
            <Ionicons name="hardware-chip" size={22} color={colors.text.onBlue} />
          </View>
          <Text style={styles.brandName}>Industrial KI</Text>
        </View>

        <View style={styles.body}>
          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Welcome Back</Text>
            <Text style={styles.heroSub}>Sign in to access the knowledge platform</Text>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={16} color={colors.status.dangerText} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form card */}
          <View style={styles.formCard}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={16} color={colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="e.g. admin, engineer, tech"
                placeholderTextColor={colors.text.muted}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.text.muted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.text.muted}
                secureTextEntry={!showPass}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPass(v => !v)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={16} color={colors.text.muted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color={colors.text.onBlue} size="small" />
                : <Text style={styles.loginBtnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Quick access hint */}
          <View style={styles.hintCard}>
            <Text style={styles.hintTitle}>Demo Accounts</Text>
            {[
              ['admin', 'admin123', 'Full access'],
              ['engineer', 'eng123', 'View + Query + Upload'],
              ['tech', 'tech123', 'View + Query'],
            ].map(([u, p, role]) => (
              <TouchableOpacity
                key={u}
                style={styles.hintRow}
                onPress={() => { setUsername(u); setPassword(p) }}
                activeOpacity={0.7}
              >
                <View style={styles.hintLeft}>
                  <Text style={styles.hintUser}>{u}</Text>
                  <Text style={styles.hintRole}>{role}</Text>
                </View>
                <Text style={styles.hintPass}>{p}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.brand.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.page },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.bg.border,
  },
  logoBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  hero: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  heroSub: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 6,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.status.dangerBg,
    borderWidth: 1,
    borderColor: colors.status.dangerBorder,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.status.dangerText,
    fontWeight: typography.weights.medium,
  },
  formCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.bg.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.bg.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
  },
  loginBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  loginBtnDisabled: { backgroundColor: colors.text.muted },
  loginBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.onBlue,
  },
  hintCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.bg.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  hintTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.xs,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.bg.border,
    gap: spacing.sm,
  },
  hintLeft: { flex: 1 },
  hintUser: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  hintRole: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  hintPass: {
    fontSize: typography.sizes.sm,
    color: colors.brand.primary,
    fontWeight: typography.weights.medium,
  },
})
