import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { WeightUnit } from '../../types';

export function ProfileSection() {
  const colors = useColors();
  const { preferences, dispatch } = useApp();

  function setUnit(unit: WeightUnit) {
    dispatch({ type: 'SET_PREFERENCES', preferences: { unit } });
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>PREFERENCES</Text>

      {/* Weight unit */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[Typography.body, { color: colors.text }]}>Weight Unit</Text>
        <View style={styles.toggle}>
          {(['lbs', 'kg'] as WeightUnit[]).map((u) => (
            <TouchableOpacity
              key={u}
              style={[
                styles.toggleOption,
                {
                  backgroundColor: preferences.unit === u ? colors.primary : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setUnit(u)}
            >
              <Text
                style={[
                  Typography.small,
                  { color: preferences.unit === u ? colors.white : colors.text, fontWeight: '600' },
                ]}
              >
                {u.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: { flexDirection: 'row', gap: Spacing.xs },
  toggleOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
});
