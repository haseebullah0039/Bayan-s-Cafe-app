import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants';

const DEALS = [
  {
    id: '1',
    tag: '🔥 Best Seller',
    title: 'Double Smash Burger Combo',
    desc: 'Double Smash Burger + Large Fries + 500ml Drink',
    original: 950,
    price: 699,
    emoji: '🍔',
    color1: '#FF4500',
    color2: '#FF8C00',
    badge: '26% OFF',
  },
  {
    id: '2',
    tag: '👨‍👩‍👧‍👦 Family Deal',
    title: 'Family Feast Combo',
    desc: '4 Burgers + 2 Large Fries + 4 Drinks + Coleslaw',
    original: 3200,
    price: 2499,
    emoji: '🎉',
    color1: '#7B2FBE',
    color2: '#C850C0',
    badge: '22% OFF',
  },
  {
    id: '3',
    tag: '🌯 New Arrival',
    title: 'Shawarma Roll + Drink',
    desc: 'Spicy Chicken Shawarma Roll with any Cold Drink',
    original: 420,
    price: 320,
    emoji: '🌯',
    color1: '#0EA5E9',
    color2: '#6366F1',
    badge: '24% OFF',
  },
  {
    id: '4',
    tag: '⭐ Student Special',
    title: 'Student Saver',
    desc: 'Any Burger + Regular Fries + Drink — Show student card',
    original: 700,
    price: 499,
    emoji: '🎓',
    color1: '#059669',
    color2: '#10B981',
    badge: '29% OFF',
  },
  {
    id: '5',
    tag: '🌙 Night Owl',
    title: 'Late Night Combo',
    desc: '2 Burgers + 2 Fries — Available after 9 PM',
    original: 1100,
    price: 799,
    emoji: '🌙',
    color1: '#1E40AF',
    color2: '#7C3AED',
    badge: '27% OFF',
  },
];

export default function DealsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <SafeAreaView>
        <LinearGradient colors={['#0D0D0D', '#111']} style={styles.header}>
          <Text style={styles.headerTitle}>Today's Deals 🏷️</Text>
          <Text style={styles.headerSub}>Limited time offers — grab them now!</Text>
        </LinearGradient>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Banner */}
        <LinearGradient colors={['#D4A017', '#FF6B00']} style={styles.banner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View>
            <Text style={styles.bannerLabel}>🎁 Special Offer</Text>
            <Text style={styles.bannerTitle}>Free Delivery</Text>
            <Text style={styles.bannerSub}>On orders above PKR 800</Text>
          </View>
          <Text style={styles.bannerEmoji}>🛵</Text>
        </LinearGradient>

        {/* Deal cards */}
        {DEALS.map((deal) => (
          <View key={deal.id} style={styles.dealCard}>
            <LinearGradient colors={[deal.color1 + '22', deal.color2 + '11']} style={styles.dealGrad}>
              <View style={styles.dealTop}>
                <View style={styles.dealEmojiWrap}>
                  <Text style={styles.dealEmoji}>{deal.emoji}</Text>
                </View>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealBadgeText}>{deal.badge}</Text>
                </View>
              </View>

              <Text style={styles.dealTag}>{deal.tag}</Text>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealDesc}>{deal.desc}</Text>

              <View style={styles.dealBottom}>
                <View>
                  <Text style={styles.dealOriginal}>PKR {deal.original.toLocaleString()}</Text>
                  <Text style={styles.dealPrice}>PKR {deal.price.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)')}
                  activeOpacity={0.85}
                  style={styles.orderBtn}
                >
                  <LinearGradient colors={[deal.color1, deal.color2]} style={styles.orderBtnGrad}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                    <Ionicons name="cart" size={15} color="#fff" />
                    <Text style={styles.orderBtnText}>Order Now</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        ))}

        {/* Info note */}
        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.noteText}>
            Deals are subject to availability. Prices may vary.
          </Text>
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
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  scroll: { padding: 16, gap: 14, paddingBottom: 32 },

  banner: {
    borderRadius: 18, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  bannerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700', marginBottom: 4 },
  bannerTitle: { fontSize: 22, fontWeight: '900', color: '#fff' },
  bannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  bannerEmoji: { fontSize: 48 },

  dealCard: { borderRadius: 18, overflow: 'hidden', borderWidth: 1, borderColor: '#222' },
  dealGrad: { padding: 18 },
  dealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dealEmojiWrap: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  dealEmoji: { fontSize: 28 },
  dealBadge: {
    backgroundColor: '#D4A017', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  dealBadgeText: { color: '#0D0D0D', fontSize: 11, fontWeight: '800' },
  dealTag: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', marginBottom: 4 },
  dealTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 4 },
  dealDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 16 },
  dealBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  dealOriginal: { fontSize: 12, color: COLORS.textMuted, textDecorationLine: 'line-through' },
  dealPrice: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  orderBtn: { borderRadius: 12, overflow: 'hidden' },
  orderBtnGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  orderBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  note: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#111', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  noteText: { fontSize: 12, color: COLORS.textMuted, flex: 1, lineHeight: 18 },
});
