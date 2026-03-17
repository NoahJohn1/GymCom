import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useApp } from '../../context/AppContext';
import { useColors, ACCENT_PRESETS, Typography, Spacing, Radius } from '../../constants/theme';

export function ThemeColorPicker() {
  const colors = useColors();
  const { preferences, dispatch } = useApp();

  function setThemeColor(color: string) {
    dispatch({ type: 'SET_PREFERENCES', preferences: { themeColor: color } });
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>ACCENT COLOR</Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.swatches}>
          {ACCENT_PRESETS.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={[
                styles.swatch,
                { backgroundColor: preset.primary },
                preferences.themeColor === preset.primary && styles.swatchSelected,
              ]}
              onPress={() => setThemeColor(preset.primary)}
            />
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
  },
  swatches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
});
