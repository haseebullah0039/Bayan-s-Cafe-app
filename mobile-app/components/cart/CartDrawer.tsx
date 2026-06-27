import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, SafeAreaView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useCartStore } from '../../store/cartStore';

interface Props { visible: boolean; onClose: () => void; }

export function CartDrawer({ visible, onClose }: Props) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => { onClose(); router.push('/checkout'); };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <View style={styles.sheet}>

          {/* Handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>My Cart</Text>
              <Text style={styles.subtitle}>{itemCount()} items added</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🛒</Text>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Text style={styles.emptySub}>Add delicious items from the menu</Text>
              <TouchableOpacity style={styles.browseBtn} onPress={onClose}>
                <Text style={styles.browseBtnText}>Browse Menu</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                {items.map((item) => (
                  <View key={item.product.id} style={styles.item}>
                    <View style={styles.itemEmoji}>
                      <Text style={{ fontSize: 22 }}>🍽️</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                      <Text style={styles.itemPrice}>
                        PKR {item.product.price.toLocaleString()} each
                      </Text>
                    </View>
                    <View style={styles.itemControls}>
                      <TouchableOpacity
                        style={styles.ctrlBtn}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Ionicons name="remove" size={14} color={COLORS.primary} />
                      </TouchableOpacity>
                      <Text style={styles.ctrlQty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={[styles.ctrlBtn, styles.ctrlBtnAdd]}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Ionicons name="add" size={14} color="#0D0D0D" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.itemTotal}>
                      <Text style={styles.itemTotalText}>
                        PKR {(item.product.price * item.quantity).toLocaleString()}
                      </Text>
                      <TouchableOpacity onPress={() => removeItem(item.product.id)} style={styles.trashBtn}>
                        <Ionicons name="trash-outline" size={13} color="#FF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* Summary */}
              <View style={styles.summary}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>PKR {total().toLocaleString()}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>PKR {total().toLocaleString()}</Text>
                </View>

                <TouchableOpacity
                  style={styles.checkoutBtn}
                  onPress={handleCheckout}
                  activeOpacity={0.88}
                >
                  <LinearGradient
                    colors={['#D4A017', '#FF6B00']}
                    style={styles.checkoutGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.checkoutText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={18} color="#0D0D0D" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <SafeAreaView />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' },
  sheet: {
    backgroundColor: '#111',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    maxHeight: '88%',
    borderTopWidth: 1, borderColor: '#222',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: '#333',
    alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#1E1E1E',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  subtitle: { fontSize: 12, color: '#555', marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#1E1E1E', alignItems: 'center', justifyContent: 'center',
  },

  empty: { alignItems: 'center', paddingVertical: 56, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptySub: { fontSize: 13, color: '#555', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  browseBtn: {
    paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary,
  },
  browseBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },

  list: { paddingHorizontal: 16, paddingTop: 8, maxHeight: 320 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1A1A1A',
  },
  itemEmoji: {
    width: 46, height: 46, borderRadius: 12, backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 3 },
  itemPrice: { fontSize: 11, color: '#555' },
  itemControls: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1A1A1A', borderRadius: 10, overflow: 'hidden',
  },
  ctrlBtn: {
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#222',
  },
  ctrlBtnAdd: { backgroundColor: COLORS.primary + '33' },
  ctrlQty: {
    width: 28, textAlign: 'center',
    fontSize: 13, fontWeight: '800', color: '#fff',
  },
  itemTotal: { alignItems: 'flex-end', gap: 4 },
  itemTotalText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  trashBtn: { padding: 2 },

  summary: {
    padding: 20, borderTopWidth: 1, borderTopColor: '#1E1E1E',
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: 13, color: '#555' },
  summaryValue: { fontSize: 13, color: '#888', fontWeight: '500' },
  totalRow: {
    borderTopWidth: 1, borderTopColor: '#1E1E1E',
    paddingTop: 12, marginTop: 4, marginBottom: 16,
  },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#fff' },
  totalAmount: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  checkoutBtn: { borderRadius: 16, overflow: 'hidden' },
  checkoutGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  checkoutText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },
});
