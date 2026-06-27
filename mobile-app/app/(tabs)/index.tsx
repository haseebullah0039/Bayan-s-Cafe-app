import React, { useState } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, CATEGORIES } from '../../constants';
import { MOCK_PRODUCTS } from '../../constants/mockData';
import { ProductCard } from '../../components/menu/ProductCard';
import { CartDrawer } from '../../components/cart/CartDrawer';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types';

const { width } = Dimensions.get('window');

const FEATURED = [
  { id: '1', label: '🔥 Best Seller', title: 'Double Smash\nBurger', price: 'PKR 650', color1: '#FF4500', color2: '#FF8C00', emoji: '🍔' },
  { id: '2', label: '⭐ Family Deal', title: 'Family Feast\nCombo', price: 'PKR 2,499', color1: '#7B2FBE', color2: '#C850C0', emoji: '🎉' },
  { id: '3', label: '🌯 New Arrival', title: 'Spicy Shawarma\nRoll', price: 'PKR 300', color1: '#0EA5E9', color2: '#6366F1', emoji: '🌯' },
];

export default function MenuScreen() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(CATEGORIES[0].id);
  const [cartVisible, setCartVisible] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const itemCount = useCartStore((s) => s.itemCount());
  const cartTotal = useCartStore((s) => s.total());

  const products: Product[] = MOCK_PRODUCTS.filter(
    (p) => p.category_id === activeCategoryId
  );
  const activeCategory = CATEGORIES.find((c) => c.id === activeCategoryId);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}

        ListHeaderComponent={
          <>
            {/* ── TOP BAR ── */}
            <LinearGradient colors={['#0D0D0D', '#111111']} style={styles.topBar}>
              <SafeAreaView>
                <View style={styles.topRow}>
                  {/* Logo — replace View with Image once logo.png is in assets/images/ */}
                  <View style={styles.logo}>
                    <Text style={styles.logoEmoji}>🍔</Text>
                  </View>

                  <View style={styles.locationRow}>
                    <Ionicons name="location" size={16} color={COLORS.primary} />
                    <View>
                      <Text style={styles.deliverTo}>Deliver to</Text>
                      <Text style={styles.locationText}>Batkhela, KPK</Text>
                    </View>
                    <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
                  </View>

                  <TouchableOpacity
                    style={styles.cartIconBtn}
                    onPress={() => setCartVisible(true)}
                  >
                    <Ionicons name="cart" size={22} color="#0D0D0D" />
                    {itemCount > 0 && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{itemCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Greeting */}
                <View style={styles.greetRow}>
                  <Text style={styles.greetMain}>
                    What would you like{'\n'}to <Text style={styles.greetAccent}>eat today?</Text> 🍽️
                  </Text>
                </View>

                {/* Search bar */}
                <View style={styles.searchBar}>
                  <Ionicons name="search" size={18} color="#555" />
                  <Text style={styles.searchPlaceholder}>Search burgers, pizza, shawarma...</Text>
                  <View style={styles.filterBtn}>
                    <Ionicons name="options" size={16} color={COLORS.primary} />
                  </View>
                </View>
              </SafeAreaView>
            </LinearGradient>

            {/* ── FEATURED BANNERS ── */}
            <View style={styles.featuredSection}>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const idx = Math.round(e.nativeEvent.contentOffset.x / (width - 32));
                  setFeaturedIndex(idx);
                }}
                decelerationRate="fast"
                snapToInterval={width - 32}
              >
                {FEATURED.map((item) => (
                  <LinearGradient
                    key={item.id}
                    colors={[item.color1, item.color2]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.featuredCard}
                  >
                    {/* Decorative circles */}
                    <View style={[styles.featCircle1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
                    <View style={[styles.featCircle2, { backgroundColor: 'rgba(255,255,255,0.05)' }]} />

                    <View style={styles.featContent}>
                      <View style={styles.featLabelPill}>
                        <Text style={styles.featLabelText}>{item.label}</Text>
                      </View>
                      <Text style={styles.featTitle}>{item.title}</Text>
                      <View style={styles.featPriceRow}>
                        <Text style={styles.featPrice}>{item.price}</Text>
                        <TouchableOpacity style={styles.featOrderBtn}>
                          <Text style={styles.featOrderText}>Order</Text>
                          <Ionicons name="arrow-forward" size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.featEmoji}>{item.emoji}</Text>
                  </LinearGradient>
                ))}
              </ScrollView>

              {/* Dots */}
              <View style={styles.dotsRow}>
                {FEATURED.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, i === featuredIndex && styles.dotActive]}
                  />
                ))}
              </View>
            </View>

            {/* ── CATEGORIES ── */}
            <View style={styles.catSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Categories</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.catScroll}
              >
                {CATEGORIES.map((cat) => {
                  const isActive = cat.id === activeCategoryId;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setActiveCategoryId(cat.id)}
                      activeOpacity={0.8}
                      style={styles.catItem}
                    >
                      <View style={[styles.catCircle, isActive && styles.catCircleActive]}>
                        {isActive && (
                          <LinearGradient
                            colors={['#D4A017', '#FF6B00']}
                            style={StyleSheet.absoluteFill}
                          />
                        )}
                        <Text style={styles.catEmoji}>{cat.icon}</Text>
                      </View>
                      <Text style={[styles.catLabel, isActive && styles.catLabelActive]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── SECTION HEADER ── */}
            <View style={styles.menuHeader}>
              <View style={styles.menuHeaderLeft}>
                <Text style={styles.menuCatEmoji}>{activeCategory?.icon}</Text>
                <Text style={styles.menuCatName}>{activeCategory?.name}</Text>
              </View>
              <Text style={styles.menuCount}>{products.length} items</Text>
            </View>
          </>
        }

        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyText}>No items available</Text>
          </View>
        }

        ListFooterComponent={
          <Text style={styles.poweredBy}>Powered by Digital Hujra</Text>
        }
      />

      {/* ── STICKY CART BAR ── */}
      <View style={styles.cartBar}>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => setCartVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={itemCount > 0 ? ['#D4A017', '#FF6B00'] : ['#1E1E1E', '#2A2A2A']}
            style={styles.cartBtnInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.cartBtnLeft}>
              {itemCount > 0 ? (
                <View style={styles.cartCount}>
                  <Text style={styles.cartCountText}>{itemCount}</Text>
                </View>
              ) : (
                <Ionicons name="cart-outline" size={20} color="#555" />
              )}
              <Text style={[styles.cartBtnLabel, itemCount > 0 && styles.cartBtnLabelActive]}>
                {itemCount > 0 ? 'View Cart' : 'Your cart is empty'}
              </Text>
            </View>
            <Text style={[styles.cartBtnTotal, itemCount > 0 && styles.cartBtnTotalActive]}>
              {itemCount > 0 ? `PKR ${cartTotal.toLocaleString()}` : 'PKR 0'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <CartDrawer visible={cartVisible} onClose={() => setCartVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },
  listContent: { paddingBottom: 24 },

  // Top bar
  topBar: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 },
  logo: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1.5, borderColor: COLORS.primary + '40',
    alignItems: 'center', justifyContent: 'center',
  },
  logoEmoji: { fontSize: 26 },
  locationRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  deliverTo: { fontSize: 10, color: '#555', fontWeight: '500' },
  locationText: { fontSize: 13, color: '#fff', fontWeight: '700' },
  cartIconBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#FF4500',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#0D0D0D',
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  greetRow: { marginBottom: 16 },
  greetMain: { fontSize: 24, fontWeight: '800', color: '#fff', lineHeight: 32 },
  greetAccent: { color: COLORS.primary },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#1A1A1A',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13,
    borderWidth: 1, borderColor: '#2A2A2A',
  },
  searchPlaceholder: { flex: 1, fontSize: 13, color: '#444' },
  filterBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: COLORS.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.primary + '44',
  },

  // Featured
  featuredSection: { paddingTop: 24, paddingBottom: 8 },
  featuredCard: {
    width: width - 32,
    height: 160,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    position: 'relative',
  },
  featCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    top: -60, right: -30,
  },
  featCircle2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    bottom: -30, right: 60,
  },
  featContent: { flex: 1, zIndex: 1 },
  featLabelPill: {
    backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start', marginBottom: 8,
  },
  featLabelText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  featTitle: { fontSize: 20, fontWeight: '900', color: '#fff', lineHeight: 26, marginBottom: 14 },
  featPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featPrice: { fontSize: 16, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  featOrderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  featOrderText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  featEmoji: { fontSize: 64, zIndex: 1 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#333' },
  dotActive: { width: 20, backgroundColor: COLORS.primary },

  // Categories
  catSection: { paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  seeAll: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  catScroll: { paddingHorizontal: 16, gap: 8 },
  catItem: { alignItems: 'center', marginRight: 14 },
  catCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#1A1A1A',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#2A2A2A',
  },
  catCircleActive: { borderColor: COLORS.primary },
  catEmoji: { fontSize: 28, zIndex: 1 },
  catLabel: { fontSize: 11, fontWeight: '500', color: '#555', textAlign: 'center' },
  catLabelActive: { color: COLORS.primary, fontWeight: '700' },

  // Menu header
  menuHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 28, paddingBottom: 16,
  },
  menuHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuCatEmoji: { fontSize: 22 },
  menuCatName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  menuCount: { fontSize: 12, color: '#444', fontWeight: '500' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#444' },

  poweredBy: { textAlign: 'center', color: '#2A2A2A', fontSize: 11, paddingVertical: 16 },

  // Cart bar
  cartBar: {
    paddingHorizontal: 16, paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    backgroundColor: '#0D0D0D',
    borderTopWidth: 1, borderTopColor: '#1A1A1A',
  },
  cartBtn: {
    borderRadius: 18, overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: `0 6px 16px rgba(212,160,23,0.5)` } as any
      : { elevation: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 16 }),
  },
  cartBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  cartBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCount: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  cartCountText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  cartBtnLabel: { fontSize: 15, fontWeight: '700', color: '#555' },
  cartBtnLabelActive: { color: '#0D0D0D' },
  cartBtnTotal: { fontSize: 16, fontWeight: '800', color: '#555' },
  cartBtnTotalActive: { color: '#0D0D0D' },
});
