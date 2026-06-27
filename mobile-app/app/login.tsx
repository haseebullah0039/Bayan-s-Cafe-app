import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, KeyboardAvoidingView,
  Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { COLORS, GOOGLE_WEB_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID, GOOGLE_IOS_CLIENT_ID } from '../constants';
import { authApi } from '../services/api';
import { useAuthStore } from '../store/authStore';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPass,    setShowPass]    = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     GOOGLE_WEB_CLIENT_ID     || undefined,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || undefined,
    iosClientId:     GOOGLE_IOS_CLIENT_ID     || undefined,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      handleGoogleSuccess(response.authentication?.accessToken);
    } else if (response?.type === 'error') {
      setGoogleLoading(false);
      Alert.alert('Google Sign-In Failed', response.error?.message || 'Please try again.');
    } else if (response?.type === 'dismiss') {
      setGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleSuccess = async (accessToken?: string) => {
    if (!accessToken) { setGoogleLoading(false); return; }
    try {
      const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const googleUser = await res.json();
      const { token, user } = await authApi.googleAuth({
        google_id: googleUser.id,
        name:      googleUser.name,
        email:     googleUser.email,
        photo_url: googleUser.picture,
      });
      await setAuth(user, token);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Google Sign-In Failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        'Not Configured',
        'Google Sign-In requires a Client ID.\n\nAdd your GOOGLE_WEB_CLIENT_ID in constants/index.ts from Google Cloud Console.',
        [{ text: 'OK' }]
      );
      return;
    }
    setGoogleLoading(true);
    await promptAsync();
  };

  // ── Email login ────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.login({ email: email.trim(), password });
      await setAuth(user, token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Please try again.';
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand */}
          <View style={styles.header}>
            <LinearGradient colors={['#D4A017', '#B8860B']} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </LinearGradient>
            <Text style={styles.brand}>Bayan's Cafe</Text>
            <Text style={styles.tagline}>Order fresh, eat happy</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            {/* Google button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignIn}
              activeOpacity={0.85}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator color={COLORS.text} size="small" />
              ) : (
                <>
                  <View style={styles.googleIcon}>
                    <Text style={styles.googleG}>G</Text>
                  </View>
                  <Text style={styles.googleBtnText}>Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR SIGN IN WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sign In button */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#D4A017', '#B8860B']} style={styles.btnGrad}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Sign In</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Sign up link */}
            <View style={styles.signupRow}>
              <Text style={styles.signupHint}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Guest */}
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.guestBtn}>
            <Text style={styles.guestText}>Continue as Guest</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 56, paddingBottom: 32 },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 16px rgba(212,160,23,0.5)' } as any
      : { shadowColor: '#D4A017', shadowOpacity: 0.5, shadowRadius: 16, elevation: 8 }),
  },
  logoEmoji: { fontSize: 42 },
  brand:    { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  tagline:  { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: COLORS.border,
  },
  title:    { fontSize: 22, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20 },

  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, height: 52, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd',
    marginBottom: 4,
  },
  googleIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#eee',
  },
  googleG: {
    fontSize: 17, fontWeight: '900',
    color: '#4285F4',  // Google blue
  },
  googleBtnText: { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 10, color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.5 },

  fieldGroup: { marginBottom: 16 },
  label: {
    fontSize: 11, fontWeight: '700', color: COLORS.textSecondary,
    marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 12,
    borderWidth: 1, borderColor: COLORS.border,
    paddingHorizontal: 12, height: 50,
  },
  inputIcon: { marginRight: 8 },
  input:    { flex: 1, color: COLORS.text, fontSize: 15 },
  eyeBtn:   { padding: 4 },

  primaryBtn:     { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  btnDisabled:    { opacity: 0.6 },
  btnGrad:        { height: 52, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  signupRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupHint: { color: COLORS.textSecondary, fontSize: 14 },
  signupLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  guestBtn:  { alignItems: 'center', marginTop: 24 },
  guestText: { color: COLORS.textMuted, fontSize: 13, textDecorationLine: 'underline' },
});
