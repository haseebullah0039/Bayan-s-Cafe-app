export const COLORS = {
  primary: '#D4A017',
  primaryDark: '#B8860B',
  background: '#1A1A2E',
  card: '#16213E',
  cardLight: '#0F3460',
  surface: '#1E1E3F',
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textMuted: '#4A5568',
  border: '#2D3748',
  success: '#48BB78',
  error: '#FC8181',
  warning: '#F6AD55',
  accent: '#E8F5E9',
} as const;

export const FONTS = {
  heading: 'Poppins-Bold',
  subheading: 'Poppins-SemiBold',
  medium: 'Poppins-Medium',
  regular: 'Inter-Regular',
  light: 'Inter-Light',
} as const;

export const RESTAURANT_ID = '1';

// Shared local API server — run: node shared-api/server.js
export const API_BASE_URL = 'http://localhost:4000';

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Get these from: https://console.cloud.google.com → APIs & Services → Credentials
// Create "OAuth 2.0 Client IDs" for Web, Android (package: com.digitalholzera.bayanscafe),
// and iOS (bundle ID: com.digitalholzera.bayanscafe)
export const GOOGLE_WEB_CLIENT_ID     = '';   // paste your Web client ID here
export const GOOGLE_ANDROID_CLIENT_ID = '';   // paste your Android client ID here
export const GOOGLE_IOS_CLIENT_ID     = '';   // paste your iOS client ID here

export const CATEGORIES = [
  { id: '1', name: 'Burgers', icon: '🍔' },
  { id: '2', name: 'Pizza', icon: '🍕' },
  { id: '3', name: 'Shawarma', icon: '🌯' },
  { id: '4', name: 'Fries', icon: '🍟' },
  { id: '5', name: 'Sandwiches', icon: '🥪' },
  { id: '6', name: 'Cold Drinks', icon: '🥤' },
  { id: '7', name: 'Special Deals', icon: '⭐' },
] as const;

export const ORDER_STATUSES = [
  { key: 'placed', label: 'Order Placed', icon: '📋', color: '#D4A017' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳', color: '#F6AD55' },
  { key: 'ready', label: 'Ready', icon: '✅', color: '#48BB78' },
  { key: 'on_the_way', label: 'On The Way', icon: '🛵', color: '#4299E1' },
  { key: 'delivered', label: 'Delivered', icon: '📦', color: '#9F7AEA' },
  { key: 'received', label: 'Received', icon: '🎉', color: '#48BB78' },
] as const;
