import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

type Variant = 'heading' | 'subheading' | 'body' | 'caption' | 'price';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
  color?: string;
  style?: TextStyle;
}

export function ThemedText({ children, variant = 'body', color, style }: Props) {
  return (
    <Text style={[styles[variant], color ? { color } : undefined, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
