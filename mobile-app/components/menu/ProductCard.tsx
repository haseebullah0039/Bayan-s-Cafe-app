import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types';

const { width } = Dimensions.get('window');

interface Props {
  product: Product;
}

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const { items, addItem, updateQuantity } = useCartStore();
  const cartItem = items.find((i) => i.product.id === product.id);
  const quantity = cartItem?.quantity ?? 0;

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleAdd = () => {
    scale.value = withSequence(withSpring(0.96), withSpring(1, { damping: 8 }));
    addItem(product);
  };

  const handleOrderNow = () => {
    addItem(product);
    router.push('/checkout');
  };

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* ── IMAGE ── */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.image_url }} style={styles.image} resizeMode="cover" />

        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.75)']}
          style={styles.imgGradient}
        />

        {/* Price badge — top left */}
        <LinearGradient
          colors={['#D4A017', '#FF6B00']}
          style={styles.pricePill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.priceText}>PKR {product.price.toLocaleString()}</Text>
        </LinearGradient>

        {/* Sold out */}
        {!product.is_available && (
          <View style={styles.soldOut}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}

        {/* Name on image — bottom */}
        <View style={styles.imgBottom}>
          <Text style={styles.imgName} numberOfLines={1}>{product.name}</Text>
        </View>
      </View>

      {/* ── BODY ── */}
      <View style={styles.body}>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>

        {/* ── ACTIONS ROW ── */}
        <View style={styles.actions}>

          {/* Add to Cart / Qty */}
          {quantity === 0 ? (
            <TouchableOpacity
              style={[styles.addBtn, !product.is_available && styles.btnDisabled]}
              onPress={handleAdd}
              disabled={!product.is_available}
              activeOpacity={0.8}
            >
              <Ionicons name="cart-outline" size={15} color={COLORS.primary} />
              <Text style={styles.addBtnText}>Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyWrap}>
              <TouchableOpacity
                style={styles.qtyCircle}
                onPress={() => updateQuantity(product.id, quantity - 1)}
              >
                <Ionicons name="remove" size={16} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{quantity}</Text>
              <TouchableOpacity
                style={[styles.qtyCircle, styles.qtyCircleAdd]}
                onPress={handleAdd}
              >
                <Ionicons name="add" size={16} color="#0D0D0D" />
              </TouchableOpacity>
            </View>
          )}

          {/* Order Now */}
          <TouchableOpacity
            style={[styles.orderBtn, !product.is_available && styles.btnDisabled]}
            onPress={handleOrderNow}
            disabled={!product.is_available}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#D4A017', '#FF6B00']}
              style={styles.orderBtnGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="flash" size={14} color="#0D0D0D" />
              <Text style={styles.orderBtnText}>Order Now</Text>
            </LinearGradient>
          </TouchableOpacity>

        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 22,
    backgroundColor: '#151515',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#222',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 10px rgba(0,0,0,0.4)' } as any
      : { elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10 }),
  },

  // Image
  imageWrap: { height: 200, position: 'relative' },
  image: { width: '100%', height: '100%' },
  imgGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
  },
  pricePill: {
    position: 'absolute', top: 14, left: 14,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 22,
  },
  priceText: { color: '#0D0D0D', fontWeight: '800', fontSize: 13 },
  soldOut: {
    position: 'absolute', top: 14, right: 14,
    backgroundColor: '#FF4444',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10,
  },
  soldOutText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  imgBottom: {
    position: 'absolute', bottom: 12, left: 14, right: 14,
  },
  imgName: {
    fontSize: 19, fontWeight: '800', color: '#fff',
    ...(Platform.OS === 'web'
      ? { textShadow: '0 1px 4px rgba(0,0,0,0.5)' } as any
      : { textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }),
  },

  // Body
  body: { padding: 14 },
  description: {
    fontSize: 12.5, color: '#555', lineHeight: 18, marginBottom: 14,
  },

  // Actions
  actions: { flexDirection: 'row', gap: 10, alignItems: 'center' },

  addBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 11, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.primary + '55',
    backgroundColor: COLORS.primary + '12',
  },
  addBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  qtyWrap: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 14, borderWidth: 1.5, borderColor: COLORS.primary + '55',
    overflow: 'hidden',
  },
  qtyCircle: {
    width: 40, height: 40, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#222',
  },
  qtyCircleAdd: { backgroundColor: COLORS.primary + '33' },
  qtyNum: {
    flex: 1, textAlign: 'center',
    fontSize: 16, fontWeight: '800', color: '#fff',
  },

  orderBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  orderBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, gap: 5,
  },
  orderBtnText: { color: '#0D0D0D', fontWeight: '800', fontSize: 13 },

  btnDisabled: { opacity: 0.35 },
});
