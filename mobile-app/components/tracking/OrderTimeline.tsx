import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ORDER_STATUSES, COLORS } from '../../constants';
import type { OrderStatus } from '../../types';

interface Props {
  currentStatus: OrderStatus;
}

const STATUS_KEYS = ORDER_STATUSES.map((s) => s.key);

export function OrderTimeline({ currentStatus }: Props) {
  const currentIndex = STATUS_KEYS.indexOf(currentStatus);
  const progress = ((currentIndex + 1) / STATUS_KEYS.length) * 100;

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {ORDER_STATUSES.map((status, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <View key={status.key} style={styles.step}>
              {/* Connector line */}
              {idx > 0 && (
                <View style={[styles.connector, isDone && styles.connectorDone]} />
              )}

              {/* Icon Circle */}
              <View
                style={[
                  styles.iconCircle,
                  isDone && styles.iconCircleDone,
                  isCurrent && styles.iconCircleCurrent,
                ]}
              >
                <Text style={styles.icon}>{status.icon}</Text>
              </View>

              {/* Label */}
              <Text
                style={[
                  styles.label,
                  isDone && styles.labelDone,
                  isCurrent && styles.labelCurrent,
                ]}
                numberOfLines={2}
              >
                {status.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 24 },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: 24,
    marginHorizontal: 20,
  },
  progressFill: {
    height: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
  },
  step: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  connector: {
    position: 'absolute',
    top: 18,
    right: '50%',
    width: '100%',
    height: 2,
    backgroundColor: COLORS.border,
    zIndex: 0,
  },
  connectorDone: {
    backgroundColor: COLORS.primary,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    marginBottom: 8,
  },
  iconCircleDone: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
  iconCircleCurrent: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  icon: { fontSize: 18 },
  label: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 14,
  },
  labelDone: { color: COLORS.textSecondary },
  labelCurrent: { color: COLORS.primary, fontWeight: '700' },
});
