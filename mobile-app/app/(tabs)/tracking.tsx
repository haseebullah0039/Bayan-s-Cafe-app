import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  RefreshControl, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, ORDER_STATUSES } from '../../constants';
import { menuApi } from '../../services/api';
import { useOrderStore } from '../../store/orderStore';
import type { Order, OrderStatus } from '../../types';

const STATUS_COLORS: Record<string, string[]> = {
  placed:    ['#F59E0B', '#D97706'],
  preparing: ['#F97316', '#EA580C'],
  ready:     ['#10B981', '#059669'],
  on_the_way:['#3B82F6', '#2563EB'],
  delivered: ['#8B5CF6', '#7C3AED'],
  received:  ['#10B981', '#059669'],
};

export default function TrackingScreen() {
  const { currentOrder } = useOrderStore();
  const [orderNumber, setOrderNumber] = useState(currentOrder?.order_number ?? '');
  const [order, setOrder] = useState<Order | null>(currentOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async (num?: string) => {
    const target = (num ?? orderNumber).trim();
    if (!target) return;
    setLoading(true); setError('');
    try {
      const data = await menuApi.trackOrder(target);
      setOrder(data);
    } catch {
      setError('Order not found. Check your order number.');
    } finally { setLoading(false); }
  };

  const onRefresh = async () => { setRefreshing(true); await fetchOrder(); setRefreshing(false); };

  useEffect(() => {
    if (!currentOrder) return;
    const interval = setInterval(() => fetchOrder(currentOrder.order_number), 15000);
    return () => clearInterval(interval);
  }, [currentOrder]);

  const statusIndex = order ? ORDER_STATUSES.findIndex((s) => s.key === order.status) : -1;
  const progress = order ? ((statusIndex + 1) / ORDER_STATUSES.length) * 100 : 0;
  const currentStatus = order ? ORDER_STATUSES[statusIndex] : null;
  const statusColors = order ? (STATUS_COLORS[order.status] ?? ['#D4A017', '#FF6B00']) : ['#D4A017', '#FF6B00'];

  const STATUS_MSG: Record<string, string> = {
    placed:    'Order received! We\'re on it 🎉',
    preparing: 'Chefs are cooking your order 👨‍🍳',
    ready:     'Your order is ready! 🔔',
    on_the_way:'Rider is heading your way 🛵',
    delivered: 'Enjoy your meal! 📦',
    received:  'Thank you for dining with us ❤️',
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Header */}
      <LinearGradient colors={['#0D0D0D', '#111']} style={styles.header}>
        <SafeAreaView>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Track Order</Text>
              <Text style={styles.headerSub}>Real-time order updates</Text>
            </View>
            {order && (
              <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
                <Ionicons name="refresh" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Search */}
          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter order number e.g. BC-123456"
              placeholderTextColor="#333"
              value={orderNumber}
              onChangeText={setOrderNumber}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={() => fetchOrder()}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient colors={['#D4A017', '#FF6B00']} style={styles.searchBtnGrad}>
                {loading
                  ? <ActivityIndicator size="small" color="#0D0D0D" />
                  : <Ionicons name="search" size={18} color="#0D0D0D" />}
              </LinearGradient>
            </TouchableOpacity>
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {order ? (
          <>
            {/* Status Hero Card */}
            <LinearGradient
              colors={statusColors as [string, string]}
              style={styles.statusHero}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.heroCircle} />
              <View style={styles.heroCircle2} />
              <Text style={styles.statusEmoji}>{currentStatus?.icon ?? '📋'}</Text>
              <Text style={styles.statusLabel}>{currentStatus?.label ?? order.status}</Text>
              <Text style={styles.statusMsg}>{STATUS_MSG[order.status] ?? 'Processing...'}</Text>
              <View style={styles.orderNumBadge}>
                <Text style={styles.orderNumText}>#{order.order_number}</Text>
              </View>
            </LinearGradient>

            {/* Progress bar */}
            <View style={styles.progressCard}>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={statusColors as [string, string]}
                  style={[styles.progressFill, { width: `${progress}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}% Complete</Text>
            </View>

            {/* Timeline */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Timeline</Text>
              <View style={styles.timeline}>
                {ORDER_STATUSES.map((s, idx) => {
                  const done = idx <= statusIndex;
                  const current = idx === statusIndex;
                  const tColors = (STATUS_COLORS[s.key] ?? [COLORS.primary, COLORS.primaryDark]) as [string, string];
                  return (
                    <View key={s.key} style={styles.timelineRow}>
                      {/* Connector */}
                      {idx > 0 && (
                        <View style={[styles.connector, done && styles.connectorDone, { borderColor: done ? tColors[0] : '#222' }]} />
                      )}
                      {/* Step */}
                      <View style={styles.timelineLeft}>
                        {current ? (
                          <LinearGradient colors={tColors} style={styles.stepCircle}>
                            <Text style={styles.stepEmoji}>{s.icon}</Text>
                          </LinearGradient>
                        ) : (
                          <View style={[styles.stepCircle, done ? styles.stepDone : styles.stepPending, done && { backgroundColor: tColors[0] + '22', borderColor: tColors[0] }]}>
                            <Text style={[styles.stepEmoji, !done && { opacity: 0.3 }]}>{s.icon}</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.timelineRight}>
                        <Text style={[styles.stepLabel, done && { color: '#fff' }, current && { color: tColors[0] }]}>
                          {s.label}
                        </Text>
                        {current && <Text style={[styles.stepCurrent, { color: tColors[0] }]}>● In progress</Text>}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Order Details */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Order Details</Text>
              <View style={styles.detailGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Customer</Text>
                  <Text style={styles.detailValue}>{order.customer_name}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>{order.customer_phone}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Type</Text>
                  <Text style={styles.detailValue}>
                    {order.order_type === 'dine_in' ? `🍽️ Table ${order.table_number}` : `🛵 Delivery`}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={[styles.detailValue, { color: COLORS.primary }]}>
                    PKR {order.total?.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Items */}
            {order.items?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Items Ordered</Text>
                {order.items.map((item, idx) => (
                  <View key={idx} style={styles.orderItemRow}>
                    <View style={styles.orderItemQty}>
                      <Text style={styles.orderItemQtyText}>{item.quantity}x</Text>
                    </View>
                    <Text style={styles.orderItemName}>{item.product_name}</Text>
                    <Text style={styles.orderItemPrice}>PKR {item.subtotal?.toLocaleString()}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          !loading && (
            <View style={styles.placeholder}>
              <LinearGradient colors={['#1A1A1A', '#222']} style={styles.placeholderCard}>
                <Text style={styles.placeholderEmoji}>📦</Text>
                <Text style={styles.placeholderTitle}>Track Your Order</Text>
                <Text style={styles.placeholderSub}>
                  Enter your order number above to see live status updates and delivery tracking
                </Text>
              </LinearGradient>
            </View>
          )
        )}

        <Text style={styles.poweredBy}>Powered by Digital Hujra</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },

  header: {
    paddingHorizontal: 20, paddingBottom: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  headerTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: '#555', marginTop: 3 },
  refreshBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.primary + '40',
  },
  searchRow: { flexDirection: 'row', gap: 10 },
  input: {
    flex: 1, backgroundColor: '#1A1A1A',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13,
    color: '#fff', fontSize: 14, fontWeight: '600',
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  searchBtn: { borderRadius: 14, overflow: 'hidden' },
  searchBtnGrad: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  error: { color: '#FF4444', fontSize: 12, marginTop: 8 },

  scroll: { padding: 16, paddingBottom: 40 },

  statusHero: {
    borderRadius: 24, padding: 28, alignItems: 'center',
    marginBottom: 14, overflow: 'hidden', position: 'relative',
  },
  heroCircle: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  heroCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -20,
  },
  statusEmoji: { fontSize: 48, marginBottom: 8 },
  statusLabel: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  statusMsg: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 20 },
  orderNumBadge: {
    marginTop: 14, backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20,
  },
  orderNumText: { color: '#fff', fontWeight: '700', fontSize: 13, letterSpacing: 1 },

  progressCard: {
    backgroundColor: '#151515', borderRadius: 16, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#222',
  },
  progressTrack: {
    height: 8, backgroundColor: '#222', borderRadius: 4, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 11, color: '#555', textAlign: 'right', fontWeight: '600' },

  card: {
    backgroundColor: '#151515', borderRadius: 20, padding: 16,
    marginBottom: 14, borderWidth: 1, borderColor: '#222',
  },
  cardTitle: { fontSize: 15, fontWeight: '800', color: '#fff', marginBottom: 16 },

  // Timeline
  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 6, position: 'relative' },
  connector: {
    position: 'absolute', left: 19, top: -6, width: 2, height: 12,
    borderLeftWidth: 2, borderStyle: 'dashed', borderColor: '#222',
  },
  connectorDone: { borderStyle: 'solid' },
  timelineLeft: {},
  timelineRight: { flex: 1 },
  stepCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  stepDone: { borderWidth: 1.5 },
  stepPending: { backgroundColor: '#1A1A1A' },
  stepEmoji: { fontSize: 18 },
  stepLabel: { fontSize: 13, fontWeight: '600', color: '#444' },
  stepCurrent: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  // Details grid
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '47%' },
  detailLabel: { fontSize: 10, color: '#444', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4, fontWeight: '600' },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#ccc' },

  // Order items
  orderItemRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  orderItemQty: {
    backgroundColor: COLORS.primary + '20', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  orderItemQtyText: { color: COLORS.primary, fontWeight: '800', fontSize: 11 },
  orderItemName: { flex: 1, fontSize: 13, color: '#888' },
  orderItemPrice: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  placeholder: { paddingVertical: 20 },
  placeholderCard: {
    borderRadius: 24, padding: 40, alignItems: 'center',
    borderWidth: 1, borderColor: '#222',
  },
  placeholderEmoji: { fontSize: 56, marginBottom: 16 },
  placeholderTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10 },
  placeholderSub: {
    fontSize: 13, color: '#444', textAlign: 'center', lineHeight: 22,
  },

  poweredBy: { textAlign: 'center', color: '#222', fontSize: 11, marginTop: 16 },
});
