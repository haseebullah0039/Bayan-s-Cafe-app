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

export default function SignupScreen() {
  const router  = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [name,     setName]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
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
      Alert.alert('Google Sign-Up Failed', response.error?.message || 'Please try again.');
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
      Alert.alert('Google Sign-Up Failed', err?.response?.data?.message || 'Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

  // ── Email signup ───────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.register({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        password,
      });
      await setAuth(user, token);
      router.replace('/(tabs)');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Sign Up Failed', msg);
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
          {/* Back */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <LinearGradient colors={['#D4A017', '#B8860B']} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🍔</Text>
            </LinearGradient>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Bayan's Cafe for exclusive deals</Text>
          </View>

          <View style={styles.card}>
            {/* Google button */}
            <TouchableOpacity
              style={styles.googleBtn}
              onPress={handleGoogleSignUp}
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
              <Text style={styles.dividerText}>OR SIGN UP WITH EMAIL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Full Name */}
            <Field label="Full Name *"       icon="person-outline"   placeholder="Ahmad Khan"       value={name}  onChangeText={setName} />
            <Field label="Phone Number"      icon="call-outline"     placeholder="03XX-XXXXXXX"     value={phone} onChangeText={setPhone} keyboardType="phone-pad" autoCapitalize="none" />
            <Field label="Email Address *"   icon="mail-outline"     placeholder="you@example.com"  value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.inputRow}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={[
                styles.inputRow,
                confirm.length > 0 && confirm !== password && { borderColor: COLORS.error },
              ]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Repeat your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                {confirm.length > 0 && (
                  <Ionicons
                    name={confirm === password ? 'checkmark-circle' : 'close-circle'}
                    size={18}
                    color={confirm === password ? COLORS.success : COLORS.error}
                  />
                )}
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#D4A017', '#B8860B']} style={styles.btnGrad}>
                {loading
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.primaryBtnText}>Create Account</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, placeholder, value, onChangeText, keyboardType, autoCapitalize }: any) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name={icon} size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'words'}
          autoCorrect={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

  backBtn: {
    marginTop: 16, width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },

  header: { alignItems: 'center', paddingTop: 24, paddingBottom: 28 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 0 14px rgba(212,160,23,0.5)' } as any
      : { shadowColor: '#D4A017', shadowOpacity: 0.5, shadowRadius: 14, elevation: 6 }),
  },
  logoEmoji: { fontSize: 34 },
  title:     { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle:  { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: COLORS.border,
  },

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
  googleG:        { fontSize: 17, fontWeight: '900', color: '#4285F4' },
  googleBtnText:  { fontSize: 15, fontWeight: '700', color: '#1A1A1A' },

  divider:     { flexDirection: 'row', alignItems: 'center', marginVertical: 18 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: 10, color: COLORS.textMuted, fontSize: 10, letterSpacing: 0.5 },

  fieldGroup: { marginBottom: 14 },
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
  input:     { flex: 1, color: COLORS.text, fontSize: 15 },
  eyeBtn:    { padding: 4 },

  primaryBtn:     { marginTop: 8, borderRadius: 14, overflow: 'hidden' },
  btnDisabled:    { opacity: 0.6 },
  btnGrad:        { height: 52, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  loginRow:  { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginHint: { color: COLORS.textSecondary, fontSize: 14 },
  loginLink: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
});
