import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { useOrderStore } from '../store/orderStore';
import { menuApi } from '../services/api';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'];
const STAR_COLORS = ['', '#FC8181', '#F6AD55', '#F6E05E', '#68D391', '#48BB78'];

export default function ReviewScreen() {
  const router = useRouter();
  const { currentOrder } = useOrderStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Please Rate', 'Tap a star to rate your experience.');
      return;
    }
    setLoading(true);
    try {
      await menuApi.submitReview({
        order_number:  currentOrder?.order_number ?? '',
        customer_name: currentOrder?.customer_name ?? 'Guest',
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
    } catch {
      // Still show success even if server is down
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#0D0D0D', '#111', '#0D0D0D']} style={StyleSheet.absoluteFill} />
        <View style={styles.thankYouWrap}>
          <Animated.View entering={FadeInUp.springify()} style={styles.thankYouCard}>
            <Text style={styles.thankYouEmoji}>🌟</Text>
            <Text style={styles.thankYouTitle}>Thank You!</Text>
            <Text style={styles.thankYouSub}>
              Your feedback helps us serve you better.{'\n'}We appreciate your review!
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)')}
              activeOpacity={0.88}
            >
              <LinearGradient colors={['#D4A017', '#FF6B00']} style={styles.doneBtnGrad}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.doneBtnText}>Back to Menu</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
        <Text style={styles.powered}>Powered by Digital Hujra</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <LinearGradient colors={['#0D0D0D', '#111', '#0D0D0D']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leave a Review</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.card}>

          {/* Order info */}
          {currentOrder && (
            <View style={styles.orderBadge}>
              <Ionicons name="receipt-outline" size={14} color={COLORS.primary} />
              <Text style={styles.orderBadgeText}>{currentOrder.order_number}</Text>
            </View>
          )}

          <Text style={styles.prompt}>How was your experience?</Text>
          <Text style={styles.promptSub}>Your honest feedback means a lot to us</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                activeOpacity={0.7}
                style={styles.starBtn}
              >
                <Animated.Text style={[
                  styles.star,
                  rating >= star && { color: STAR_COLORS[rating] },
                ]}>
                  {rating >= star ? '★' : '☆'}
                </Animated.Text>
              </TouchableOpacity>
            ))}
          </View>

          {rating > 0 && (
            <Animated.Text entering={FadeInUp.springify()}
              style={[styles.ratingLabel, { color: STAR_COLORS[rating] }]}>
              {STAR_LABELS[rating]}
            </Animated.Text>
          )}

          {/* Comment */}
          <Text style={styles.commentLabel}>Tell us more (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Great food, fast service, loved the ambiance..."
            placeholderTextColor={COLORS.textMuted}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, (loading || rating === 0) && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading || rating === 0}
            activeOpacity={0.88}
          >
            <LinearGradient colors={['#D4A017', '#FF6B00']} style={styles.submitGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Ionicons name="star" size={18} color="#0D0D0D" />
              <Text style={styles.submitText}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>

        </Animated.View>
      </ScrollView>

      <Text style={styles.powered}>Powered by Digital Hujra</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0D' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  scroll: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.card, borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: COLORS.border,
  },

  orderBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
    backgroundColor: COLORS.primary + '18', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: COLORS.primary + '30',
    marginBottom: 20,
  },
  orderBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },

  prompt: {
    fontSize: 22, fontWeight: '800', color: COLORS.text,
    textAlign: 'center', marginBottom: 6,
  },
  promptSub: {
    fontSize: 13, color: COLORS.textMuted, textAlign: 'center', marginBottom: 28,
  },

  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 10 },
  starBtn: { padding: 4 },
  star: { fontSize: 44, color: COLORS.border },

  ratingLabel: {
    textAlign: 'center', fontSize: 16, fontWeight: '700',
    marginBottom: 24, letterSpacing: 0.3,
  },

  commentLabel: {
    fontSize: 13, fontWeight: '600', color: COLORS.textSecondary,
    marginBottom: 8, marginTop: 8,
  },
  commentInput: {
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    color: COLORS.text, fontSize: 14,
    borderWidth: 1, borderColor: COLORS.border,
    height: 100, textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right', fontSize: 11, color: COLORS.textMuted, marginTop: 4, marginBottom: 20,
  },

  submitBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  submitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  submitText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },

  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { color: COLORS.textMuted, fontSize: 14 },

  // Thank you state
  thankYouWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  thankYouCard: {
    width: '100%', backgroundColor: COLORS.card,
    borderRadius: 24, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
  },
  thankYouEmoji: { fontSize: 64, marginBottom: 16 },
  thankYouTitle: { fontSize: 28, fontWeight: '900', color: COLORS.text, marginBottom: 10 },
  thankYouSub: {
    fontSize: 14, color: COLORS.textMuted, textAlign: 'center',
    lineHeight: 22, marginBottom: 28,
  },
  doneBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  doneBtnGrad: {
    alignItems: 'center', justifyContent: 'center', paddingVertical: 16,
  },
  doneBtnText: { color: '#0D0D0D', fontSize: 16, fontWeight: '800' },

  powered: { textAlign: 'center', color: '#1E1E1E', fontSize: 11, paddingBottom: 20 },
});
