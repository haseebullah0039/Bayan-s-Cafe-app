import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS } from '../../constants';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeId, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isActive = cat.id === activeId;
        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            activeOpacity={0.75}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={[styles.label, isActive && styles.labelActive]}>
              {cat.name}
            </Text>
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    minWidth: 80,
  },
  tabActive: {
    backgroundColor: COLORS.primary + '22',
    borderColor: COLORS.primary,
  },
  icon: { fontSize: 20, marginBottom: 2 },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: -1,
    width: 20,
    height: 2,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
});
