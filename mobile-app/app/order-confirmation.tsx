import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withDelay, FadeInUp,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useOrderStore } from '../store/orderStore';
import { sendLocalNotification } from '../services/notifications';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const { currentOrder } = useOrderStore();
  const ring = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    ring.value = withDelay(100, withSpring(1, { damping: 10 }));
    checkScale.value = withDelay(350, withSpring(1, { damping: 8 }));
    sendLocalNotification('✅ Order Confirmed!', `Order ${currentOrder?.order_number} placed!`);
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ring.value }], opacity: ring.value }));
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: checkScale.value }] }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <LinearGradient colors={['#0D0D0D', '#111', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      {/* Decorative bg circles */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <View style={styles.content}>

        {/* ── CHECK ANIMATION ── */}
        <Animated.View style={[styles.ringOuter, ringStyle]}>
          <View style={styles.ringInner}>
            <Animated.View style={checkStyle}>
              <LinearGradient
                colors={['#D4A017', '#FF6B00']}
                style={styles.checkCircle}
              >
                <Ionicons name="checkmark" size={46} color="#0D0D0D" />
              </LinearGradient>
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── TEXT ── */}
        <Animated.View entering={FadeInUp.delay(400).springify()}>
          <Text style={styles.title}>Order Placed! 🎉</Text>
          <Text style={styles.subtitle}>
            Your delicious food is being prepared.{'\n'}
            Sit back and relax!
          </Text>
        </Animated.View>

        {/* ── ORDER CARD ── */}
        {currentOrder && (
          <Animated.View entering={FadeInUp.delay(550).springify()} style={styles.orderCard}>
            <LinearGradient
              colors={['#1A1A1A', '#222']}
              style={styles.orderCardInner}
            >
              <View style={styles.orderCardTop}>
                <Text style={styles.orderCardLabel}>Order Number</Text>
                <View style={styles.orderNumChip}>
                  <Text style={styles.orderNumChipText}>{currentOrder.order_number}</Text>
                </View>
              </View>

              <View style={styles.orderCardDivider} />

              <View style={styles.orderCardRow}>
                <View style={styles.orderCardItem}>
                  <Ionicons name="person-outline" size={14} color="#555" />
                  <Text style={styles.orderCardItemText}>{currentOrder.customer_name}</Text>
                </View>
                <View style={styles.orderCardItem}>
                  <Ionicons
                    name={currentOrder.order_type === 'dine_in' ? 'restaurant-outline' : 'bicycle-outline'}
                    size={14} color="#555"
                  />
                  <Text style={styles.orderCardItemText}>
                    {currentOrder.order_type === 'dine_in' ? `Table ${currentOrder.table_number}` : 'Delivery'}
                  </Text>
                </View>
              </View>

              <View style={[styles.orderCardRow, { marginTop: 4 }]}>
                <Text style={styles.orderCardHint}>Use this number to track your order</Text>
                <Text style={styles.orderCardTotal}>PKR {currentOrder.total?.toLocaleString()}</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ── BUTTONS ── */}
        <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.buttons}>
          <TouchableOpacity
            style={styles.trackBtn}
            onPress={() => router.replace('/(tabs)/tracking')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#D4A017', '#FF6B00']}
              style={styles.trackBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="location" size={18} color="#0D0D0D" />
              <Text style={styles.trackBtnText}>Track My Order</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reviewBtn}
            onPress={() => router.push('/review')}
            activeOpacity={0.85}
          >
            <Ionicons name="star-outline" size={17} color={COLORS.primary} />
            <Text style={styles.reviewBtnText}>Leave a Review</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.85}
          >
            <Text style={styles.menuBtnText}>Back to Menu</Text>
          </TouchableOpacity>
        </Animated.View>

      </View>

      <Text style={styles.poweredBy}>Powered by Digital Hujra</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.primary + '08', top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#FF6B0008', bottom: 80, left: -60,
  },

  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },

  // Check
  ringOuter: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: COLORS.primary + '10',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 32,
  },
  ringInner: {
    width: 128, height: 128, borderRadius: 64,
    backgroundColor: COLORS.primary + '18',
    alignItems: 'center', justifyContent: 'center',
  },
  checkCircle: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
  },

  title: {
    fontSize: 30, fontWeight: '900', color: '#fff',
    textAlign: 'center', marginBottom: 10,
  },
  subtitle: {
    fontSize: 14, color: '#555', textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },

  // Order card
  orderCard: {
    width: '100%', borderRadius: 20, overflow: 'hidden',
    marginBottom: 32, borderWidth: 1, borderColor: '#2A2A2A',
  },
  orderCardInner: { padding: 18 },
  orderCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCardLabel: { fontSize: 11, color: '#555', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  orderNumChip: {
    backgroundColor: COLORS.primary + '20', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  orderNumChipText: { color: COLORS.primary, fontWeight: '800', fontSize: 14, letterSpacing: 0.5 },
  orderCardDivider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 14 },
  orderCardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCardItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  orderCardItemText: { fontSize: 12, color: '#888' },
  orderCardHint: { fontSize: 11, color: '#444' },
  orderCardTotal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },

  // Buttons
  buttons: { width: '100%', gap: 12 },
  trackBtn: { borderRadius: 16, overflow: 'hidden' },
  trackBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  trackBtnText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },
  reviewBtn: {
    paddingVertical: 14, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.primary + '50',
    alignItems: 'center', flexDirection: 'row',
    justifyContent: 'center', gap: 8,
    backgroundColor: COLORS.primary + '10',
  },
  reviewBtnText: { color: COLORS.primary, fontSize: 15, fontWeight: '700' },

  menuBtn: {
    paddingVertical: 15, borderRadius: 16,
    borderWidth: 1.5, borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  menuBtnText: { color: '#555', fontSize: 15, fontWeight: '600' },

  poweredBy: { textAlign: 'center', color: '#1E1E1E', fontSize: 11, paddingBottom: 20 },
});
