import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

const CAFE_INFO = [
  { icon: 'location-outline', label: 'Location', value: 'Batkhela, KPK, Pakistan' },
  { icon: 'time-outline',     label: 'Hours',    value: 'Mon–Sun: 11 AM – 11 PM' },
  { icon: 'call-outline',     label: 'Phone',    value: '+92-301-1234567' },
  { icon: 'mail-outline',     label: 'Email',    value: 'info@bayanscafe.com' },
];

const SOCIAL = [
  { icon: 'logo-facebook',  label: 'Facebook',  color: '#1877F2' },
  { icon: 'logo-instagram', label: 'Instagram', color: '#E4405F' },
  { icon: 'logo-whatsapp',  label: 'WhatsApp',  color: '#25D366' },
];

function Row({ icon, label, value, onPress, danger }: {
  icon: string; label: string; value?: string;
  onPress?: () => void; danger?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, danger && styles.rowIconDanger]}>
        <Ionicons name={icon as any} size={18} color={danger ? '#FC8181' : COLORS.primary} />
      </View>
      <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      {value ? (
        <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
      ) : (
        onPress && <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { currentOrder } = useOrderStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout(); // synchronous — clears isAuthenticated instantly
            // <Redirect href="/login" /> in _layout.tsx fires on next render
          },
        },
      ]
    );
  };

  // First letter of name for avatar
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <SafeAreaView>
        <LinearGradient colors={['#0D0D0D', '#111']} style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* User identity card (if logged in) */}
        {isAuthenticated && user ? (
          <LinearGradient colors={['#1A1200', '#221800']} style={styles.brandCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{user.name}</Text>
              <Text style={styles.brandTagline}>{user.email}</Text>
              {user.phone ? <Text style={[styles.brandTagline, { marginTop: 2 }]}>{user.phone}</Text> : null}
              <View style={styles.brandBadge}>
                <Ionicons name="checkmark-circle" size={12} color="#D4A017" />
                <Text style={styles.brandBadgeText}>Verified Member</Text>
              </View>
            </View>
          </LinearGradient>
        ) : (
          /* Cafe branding card (guest) */
          <LinearGradient colors={['#1A1200', '#221800']} style={styles.brandCard}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <View style={styles.brandLogo}>
              <Text style={styles.brandLogoText}>🍔</Text>
            </View>
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>Bayan's Cafe</Text>
              <Text style={styles.brandTagline}>Taste the Difference</Text>
              <View style={styles.brandBadge}>
                <Ionicons name="star" size={12} color="#D4A017" />
                <Text style={styles.brandBadgeText}>Premium Quality Food</Text>
              </View>
            </View>
          </LinearGradient>
        )}

        {/* Active order shortcut */}
        {currentOrder && (
          <TouchableOpacity
            style={styles.activeOrderCard}
            onPress={() => router.push('/(tabs)/tracking')}
            activeOpacity={0.85}
          >
            <View style={styles.activeOrderLeft}>
              <View style={styles.activeDot} />
              <View>
                <Text style={styles.activeOrderLabel}>Active Order</Text>
                <Text style={styles.activeOrderNum}>{currentOrder.order_number}</Text>
              </View>
            </View>
            <View style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track</Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Sign in / out */}
        {isAuthenticated ? (
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/login')} activeOpacity={0.85}>
            <Ionicons name="log-in-outline" size={18} color={COLORS.primary} />
            <Text style={styles.signInText}>Sign In / Create Account</Text>
          </TouchableOpacity>
        )}

        {/* My Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Account</Text>
          <View style={styles.card}>
            <Row icon="receipt-outline"  label="My Orders"    onPress={() => router.push('/(tabs)/tracking')} />
            <View style={styles.divider} />
            <Row icon="heart-outline"    label="Favorites"    onPress={() => router.push('/(tabs)/favorites')} />
            <View style={styles.divider} />
            <Row icon="pricetag-outline" label="Deals"        onPress={() => router.push('/(tabs)/deals')} />
            <View style={styles.divider} />
            <Row icon="star-outline"     label="Write Review" onPress={() => router.push('/review')} />
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowIcon}>
                <Ionicons name="notifications-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.rowLabel}>Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#333', true: COLORS.primary + '80' }}
                thumbColor={notifications ? COLORS.primary : '#666'}
              />
            </View>
          </View>
        </View>

        {/* Cafe Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Bayan's Cafe</Text>
          <View style={styles.card}>
            {CAFE_INFO.map((item, i) => (
              <React.Fragment key={item.label}>
                <Row icon={item.icon as any} label={item.label} value={item.value} />
                {i < CAFE_INFO.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialRow}>
            {SOCIAL.map((s) => (
              <TouchableOpacity key={s.label} style={[styles.socialBtn, { backgroundColor: s.color + '18', borderColor: s.color + '40' }]} activeOpacity={0.8}>
                <Ionicons name={s.icon as any} size={22} color={s.color} />
                <Text style={[styles.socialLabel, { color: s.color }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bayan's Cafe App v1.0.0</Text>
          <Text style={styles.footerPowered}>Powered by Digital Hujra</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },

  header: {
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20,
    borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#fff' },

  scroll: { padding: 16, gap: 16, paddingBottom: 40 },

  brandCard: {
    borderRadius: 18, padding: 20,
    flexDirection: 'row', gap: 16, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  brandLogo: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.primary + '40',
  },
  brandLogoText: { fontSize: 34 },
  avatarCircle: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: COLORS.primary + '60',
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#fff' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    backgroundColor: '#2A1A1A', borderWidth: 1, borderColor: COLORS.error + '40',
  },
  logoutText: { fontSize: 15, fontWeight: '700', color: COLORS.error },
  signInBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
    backgroundColor: COLORS.primary + '18', borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  signInText: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  brandInfo: { flex: 1 },
  brandName: { fontSize: 20, fontWeight: '900', color: '#fff' },
  brandTagline: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, marginBottom: 8 },
  brandBadge: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    backgroundColor: COLORS.primary + '18', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  brandBadgeText: { color: COLORS.primary, fontSize: 11, fontWeight: '700' },

  activeOrderCard: {
    backgroundColor: '#0D1A0D', borderRadius: 14, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#22C55E40',
  },
  activeOrderLeft: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  activeDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  activeOrderLabel: { fontSize: 11, color: '#22C55E', fontWeight: '600', marginBottom: 2 },
  activeOrderNum: { fontSize: 14, fontWeight: '800', color: '#fff', fontFamily: 'monospace' },
  trackBtn: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  trackBtnText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

  section: { gap: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 },

  card: { backgroundColor: '#161616', borderRadius: 16, borderWidth: 1, borderColor: '#1E1E1E', overflow: 'hidden' },
  divider: { height: 1, backgroundColor: '#1E1E1E', marginLeft: 52 },

  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  rowIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  rowIconDanger: { backgroundColor: '#2A1A1A' },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#fff' },
  rowLabelDanger: { color: '#FC8181' },
  rowValue: { fontSize: 12, color: COLORS.textMuted, maxWidth: 160, textAlign: 'right' },

  socialRow: { flexDirection: 'row', gap: 10 },
  socialBtn: {
    flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
    gap: 6, borderWidth: 1,
  },
  socialLabel: { fontSize: 11, fontWeight: '700' },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 12, color: COLORS.textMuted },
  footerPowered: { fontSize: 11, color: '#2A2A2A', marginTop: 4 },
});
