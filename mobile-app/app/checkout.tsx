import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants';
import { useCartStore } from '../store/cartStore';
import { useOrderStore } from '../store/orderStore';
import { useAuthStore } from '../store/authStore';
import { menuApi } from '../services/api';
import type { CheckoutFormData, OrderType } from '../types';

type PaymentMethod = 'cash' | 'jazzcash' | 'easypaisa' | 'card';

const PAYMENT_OPTIONS: {
  key: PaymentMethod;
  label: string;
  icon: string;
  color: string;
  desc: string;
}[] = [
  {
    key: 'cash',
    label: 'Cash on Delivery',
    icon: '💵',
    color: '#48BB78',
    desc: 'Pay when your order arrives',
  },
  {
    key: 'jazzcash',
    label: 'JazzCash',
    icon: '📱',
    color: '#E53E3E',
    desc: 'Pay via JazzCash mobile wallet',
  },
  {
    key: 'easypaisa',
    label: 'Easypaisa',
    icon: '💳',
    color: '#38A169',
    desc: 'Pay via Easypaisa mobile wallet',
  },
  {
    key: 'card',
    label: 'Debit / Credit Card',
    icon: '🏦',
    color: '#4299E1',
    desc: 'Visa, Mastercard accepted',
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, total, clearCart } = useCartStore();
  const { setCurrentOrder } = useOrderStore();
  const authUser = useAuthStore((s) => s.user);

  const [form, setForm] = useState<CheckoutFormData>({
    name: authUser?.name || '',
    phone: authUser?.phone || '',
    orderType: 'dine_in',
    tableNumber: '',
    deliveryAddress: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);

  const update = (key: keyof CheckoutFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name';
    if (!form.phone.trim() || form.phone.length < 10) return 'Please enter a valid phone number';
    if (form.orderType === 'dine_in' && !form.tableNumber.trim()) return 'Please enter your table number';
    if (form.orderType === 'delivery' && !form.deliveryAddress.trim()) return 'Please enter your delivery address';
    return null;
  };

  const handlePlaceOrder = async () => {
    const err = validate();
    if (err) { Alert.alert('Missing Info', err); return; }

    setLoading(true);
    try {
      const formWithPayment = { ...form, paymentMethod };
      let order;
      try {
        // Send to shared API server → appears in admin panel instantly
        order = await menuApi.placeOrder(formWithPayment, items, grandTotal);
      } catch {
        // Fallback if server isn't running
        order = {
          id: Date.now().toString(),
          order_number: `BC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.floor(Math.random()*9000)+1000)}`,
          customer_name: form.name,
          customer_phone: form.phone,
          order_type: form.orderType,
          table_number: form.tableNumber,
          delivery_address: form.deliveryAddress,
          payment_method: paymentMethod,
          status: 'placed' as const,
          items: items.map((i, idx) => ({
            id: idx.toString(),
            product_name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            subtotal: i.product.price * i.quantity,
          })),
          subtotal: total(),
          total: grandTotal,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      }

      setCurrentOrder(order);
      clearCart();
      router.replace('/order-confirmation');
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = total();
  const deliveryFee = form.orderType === 'delivery' ? 100 : 0;
  const grandTotal = subtotal + deliveryFee;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* ── ORDER TYPE ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNum}>1</Text>
              <Text style={styles.sectionTitle}>Order Type</Text>
            </View>
            <View style={styles.typeRow}>
              {(['dine_in', 'delivery'] as OrderType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, form.orderType === type && styles.typeBtnActive]}
                  onPress={() => update('orderType', type)}
                >
                  <Text style={styles.typeIcon}>{type === 'dine_in' ? '🍽️' : '🛵'}</Text>
                  <Text style={[styles.typeBtnText, form.orderType === type && styles.typeBtnTextActive]}>
                    {type === 'dine_in' ? 'Dine In' : 'Delivery'}
                  </Text>
                  {form.orderType === type && (
                    <View style={styles.typeCheck}>
                      <Ionicons name="checkmark" size={12} color="#1A1A2E" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── CUSTOMER INFO ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNum}>2</Text>
              <Text style={styles.sectionTitle}>Your Information</Text>
            </View>

            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              placeholderTextColor={COLORS.textMuted}
              value={form.name}
              onChangeText={(v) => update('name', v)}
            />

            <Text style={styles.label}>Mobile Number *</Text>
            <View style={styles.phoneRow}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixText}>🇵🇰 +92</Text>
              </View>
              <TextInput
                style={[styles.input, styles.phoneInput]}
                placeholder="3XX-XXXXXXX"
                placeholderTextColor={COLORS.textMuted}
                value={form.phone}
                onChangeText={(v) => update('phone', v)}
                keyboardType="phone-pad"
              />
            </View>

            {form.orderType === 'dine_in' ? (
              <>
                <Text style={styles.label}>Table Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 5"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.tableNumber}
                  onChangeText={(v) => update('tableNumber', v)}
                  keyboardType="number-pad"
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Delivery Address *</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  placeholder="Street, Area, City"
                  placeholderTextColor={COLORS.textMuted}
                  value={form.deliveryAddress}
                  onChangeText={(v) => update('deliveryAddress', v)}
                  multiline
                  numberOfLines={3}
                />
              </>
            )}
          </View>

          {/* ── PAYMENT METHOD ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNum}>3</Text>
              <Text style={styles.sectionTitle}>Payment Method</Text>
            </View>

            <View style={styles.paymentGrid}>
              {PAYMENT_OPTIONS.map((option) => {
                const active = paymentMethod === option.key;
                return (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.paymentCard,
                      active && styles.paymentCardActive,
                      active && { borderColor: option.color },
                    ]}
                    onPress={() => setPaymentMethod(option.key)}
                    activeOpacity={0.8}
                  >
                    {/* Active glow */}
                    {active && (
                      <View style={[styles.paymentGlow, { backgroundColor: option.color + '18' }]} />
                    )}

                    <View style={styles.paymentTop}>
                      <Text style={styles.paymentIcon}>{option.icon}</Text>
                      {active && (
                        <View style={[styles.paymentCheck, { backgroundColor: option.color }]}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </View>

                    <Text style={[styles.paymentLabel, active && { color: option.color }]}>
                      {option.label}
                    </Text>
                    <Text style={styles.paymentDesc} numberOfLines={2}>
                      {option.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* JazzCash / Easypaisa account info */}
            {(paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') && (
              <View style={styles.walletInfo}>
                <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                <Text style={styles.walletInfoText}>
                  Send payment to:{' '}
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                    {paymentMethod === 'jazzcash' ? '0301-1234567' : '0311-7654321'}
                  </Text>
                  {'\n'}Account: <Text style={{ color: COLORS.text }}>Bayans Cafe</Text>
                  {'\n'}Then attach screenshot when confirming order.
                </Text>
              </View>
            )}
          </View>

          {/* ── ORDER SUMMARY ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionNum}>4</Text>
              <Text style={styles.sectionTitle}>Order Summary</Text>
            </View>

            {items.map((item) => (
              <View key={item.product.id} style={styles.summaryRow}>
                <View style={styles.summaryLeft}>
                  <View style={styles.summaryQtyBadge}>
                    <Text style={styles.summaryQty}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.summaryName}>{item.product.name}</Text>
                </View>
                <Text style={styles.summaryPrice}>
                  PKR {(item.product.price * item.quantity).toLocaleString()}
                </Text>
              </View>
            ))}

            <View style={styles.divider} />

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>PKR {subtotal.toLocaleString()}</Text>
            </View>

            {deliveryFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee</Text>
                <Text style={styles.totalValue}>PKR {deliveryFee.toLocaleString()}</Text>
              </View>
            )}

            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>Grand Total</Text>
              <Text style={styles.grandTotalAmount}>PKR {grandTotal.toLocaleString()}</Text>
            </View>

            {/* Payment badge */}
            <View style={styles.paymentBadgeRow}>
              <Text style={styles.payingVia}>Paying via:</Text>
              <View style={styles.payingBadge}>
                <Text style={styles.payingBadgeText}>
                  {PAYMENT_OPTIONS.find((p) => p.key === paymentMethod)?.icon}{' '}
                  {PAYMENT_OPTIONS.find((p) => p.key === paymentMethod)?.label}
                </Text>
              </View>
            </View>
          </View>

          {/* ── PLACE ORDER BUTTON ── */}
          <TouchableOpacity
            style={[styles.placeOrderBtn, loading && styles.disabled]}
            onPress={handlePlaceOrder}
            disabled={loading}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#D4A017', '#B8860B']}
              style={styles.placeOrderGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <Text style={styles.placeOrderText}>Placing Order...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="#1A1A2E" />
                  <Text style={styles.placeOrderText}>Place Order — PKR {grandTotal.toLocaleString()}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.poweredBy}>Powered by Digital Hujra</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  scroll: { padding: 16, paddingBottom: 40 },

  section: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  sectionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    color: '#1A1A2E',
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Order Type
  typeRow: { flexDirection: 'row', gap: 12 },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 6,
    position: 'relative',
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '18',
  },
  typeIcon: { fontSize: 26 },
  typeBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeBtnTextActive: { color: COLORS.primary },
  typeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Inputs
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  phoneRow: { flexDirection: 'row', gap: 8 },
  phonePrefix: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  phonePrefixText: { color: COLORS.text, fontSize: 13, fontWeight: '600' },
  phoneInput: { flex: 1 },

  // Payment
  paymentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentCard: {
    width: '47.5%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  paymentCardActive: {
    borderWidth: 2,
  },
  paymentGlow: {
    ...StyleSheet.absoluteFillObject,
  },
  paymentTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentIcon: { fontSize: 28 },
  paymentCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 3,
  },
  paymentDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
  },
  walletInfo: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.warning + '14',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.warning + '40',
    alignItems: 'flex-start',
  },
  walletInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  // Order Summary
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  summaryQtyBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: COLORS.primary + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryQty: { color: COLORS.primary, fontSize: 11, fontWeight: '800' },
  summaryName: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  summaryPrice: { fontSize: 13, color: COLORS.text, fontWeight: '600' },

  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 10 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  totalLabel: { fontSize: 13, color: COLORS.textMuted },
  totalValue: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },

  grandTotalRow: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  grandTotalLabel: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  grandTotalAmount: { fontSize: 20, fontWeight: '900', color: COLORS.primary },

  paymentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  payingVia: { fontSize: 12, color: COLORS.textMuted },
  payingBadge: {
    backgroundColor: COLORS.primary + '20',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  payingBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },

  // Place Order
  placeOrderBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(212,160,23,0.4)' } as any
      : { elevation: 8, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 }),
  },
  placeOrderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 17,
    gap: 8,
  },
  placeOrderText: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disabled: { opacity: 0.6 },

  poweredBy: {
    textAlign: 'center',
    color: COLORS.textMuted,
    fontSize: 11,
    marginBottom: 8,
  },
});
