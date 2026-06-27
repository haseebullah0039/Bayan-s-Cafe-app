import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'primary' | 'outline';
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
  style,
  variant = 'primary',
}: Props) {
  if (variant === 'outline') {
    return (
      <TouchableOpacity
        style={[styles.outline, style]}
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        <Text style={styles.outlineText}>{title}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.wrapper, (disabled || loading) && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={['#D4A017', '#B8860B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#1A1A2E" size="small" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 14, overflow: 'hidden' },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#1A1A2E',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  disabled: { opacity: 0.5 },
  outline: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  outlineText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
