import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { todayString } from '../../utils/dateUtils';

export function SplitDaySettings() {
  const colors = useColors();
  const { preferences, splits, dispatch } = useApp();

  const activeSplit = splits.find((s) => s.id === preferences.activeSplitId);
  const splitLength = activeSplit?.workoutIds.length ?? 0;
  const currentIndex = preferences.splitCurrentIndex ?? 0;

  if (!activeSplit) return null;

  function stepIndex(delta: number) {
    if (splitLength === 0) return;
    const next = ((currentIndex + delta) + splitLength) % splitLength;
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: {
        splitCurrentIndex: next,
        splitTodayStatus: 'pending',
        splitLastDate: todayString(),
      },
    });
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        SPLIT
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[Typography.small, styles.rowLabel, { color: colors.textSecondary }]}>
          Current day in split
        </Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.border }]}
            onPress={() => stepIndex(-1)}
            accessibilityLabel="Previous day"
          >
            <Ionicons name="remove-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[Typography.h3, styles.stepValue, { color: colors.text }]}>
            {`Day ${currentIndex + 1} of ${splitLength}`}
          </Text>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.border }]}
            onPress={() => stepIndex(1)}
            accessibilityLabel="Next day"
          >
            <Ionicons name="add-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={[Typography.small, styles.hint, { color: colors.textSecondary }]}>
          Adjusts which workout is up next
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginBottom: Spacing.lg },
  sectionHeader: {
    ...Typography.small,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  rowLabel: {
    marginBottom: Spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepValue: {
    flex: 1,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
