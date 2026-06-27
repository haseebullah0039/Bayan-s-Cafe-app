import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useCartStore } from '../../store/cartStore';
import type { Product } from '../../types';

function FavoriteCard({ product }: { product: Product }) {
  const toggle  = useFavoritesStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  return (
    <View style={styles.card}>
      <View style={styles.cardEmoji}>
        <Text style={styles.emoji}>
          {product.name.includes('Burger') ? '🍔'
            : product.name.includes('Pizza') ? '🍕'
            : product.name.includes('Shawarma') ? '🌯'
            : product.name.includes('Fries') ? '🍟'
            : product.name.includes('Sandwich') ? '🥪'
            : product.name.includes('Drink') || product.name.includes('Cola') ? '🥤'
            : '🍽️'}
        </Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{product.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={1}>{product.description}</Text>
        <Text style={styles.cardPrice}>PKR {product.price.toLocaleString()}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => toggle(product)} style={styles.heartBtn}>
          <Ionicons name="heart" size={20} color="#FC8181" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => addItem(product)}
          activeOpacity={0.8}
        >
          <LinearGradient colors={['#D4A017', '#FF6B00']} style={styles.addBtnGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Ionicons name="add" size={18} color="#0D0D0D" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function FavoritesScreen() {
  const products = useFavoritesStore((s) => s.products);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />
      <SafeAreaView>
        <LinearGradient colors={['#0D0D0D', '#111']} style={styles.header}>
          <Text style={styles.headerTitle}>My Favorites</Text>
          <Text style={styles.headerSub}>{products.length} saved item{products.length !== 1 ? 's' : ''}</Text>
        </LinearGradient>
      </SafeAreaView>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySub}>
            Tap the heart icon on any item{'\n'}to save it here
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FavoriteCard product={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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

  list: { padding: 16, gap: 12 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#161616', borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: '#1E1E1E',
  },
  cardEmoji: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 2 },
  cardDesc: { fontSize: 12, color: COLORS.textMuted, marginBottom: 4 },
  cardPrice: { fontSize: 14, fontWeight: '800', color: COLORS.primary },

  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heartBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#2A1A1A', alignItems: 'center', justifyContent: 'center',
  },
  addBtn: { width: 36, height: 36, borderRadius: 10, overflow: 'hidden' },
  addBtnGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 8 },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 22 },
});
