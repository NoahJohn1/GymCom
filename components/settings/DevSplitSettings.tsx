import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { todayString } from '../../utils/dateUtils';

/** Parses a YYYY-MM-DD string into a local-midnight Date. */
function parseLocalDate(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Formats a Date to YYYY-MM-DD using local time. */
function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** DEV ONLY — renders nothing in production builds. */
export function DevSplitSettings() {
  if (!__DEV__) return null;

  const colors = useColors();
  const { preferences, splits, dispatch } = useApp();

  const activeSplit = splits.find((s) => s.id === preferences.activeSplitId);
  const splitLength = activeSplit?.workoutIds.length ?? 0;
  const currentIndex = preferences.splitCurrentIndex ?? 0;

  const activeOverride = preferences.devDateOverride;
  const pickerDate = activeOverride ? parseLocalDate(activeOverride) : new Date();

  // Android: picker is shown inline only when visible flag is true
  const [showPicker, setShowPicker] = useState(false);

  function onDateChange(_: unknown, selected?: Date) {
    // On Android the picker dismisses itself; on iOS it stays open
    if (Platform.OS === 'android') setShowPicker(false);
    if (!selected) return;

    const dateStr = toLocalDateString(selected);
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: { devDateOverride: dateStr },
    });
  }

  function clearDateOverride() {
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: { devDateOverride: undefined },
    });
  }

  function stepIndex(delta: number) {
    if (splitLength === 0) return;
    const next = ((currentIndex + delta) + splitLength) % splitLength;
    dispatch({ type: 'SET_PREFERENCES', preferences: { splitCurrentIndex: next } });
  }

  function resetTodayStatus() {
    const today = preferences.devDateOverride ?? todayString();
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: { splitTodayStatus: 'pending', splitLastDate: today },
    });
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>
        DEV — SPLIT TRACKING
      </Text>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

        {/* ── Date override ── */}
        <Text style={[Typography.small, styles.rowLabel, { color: colors.textSecondary }]}>
          Simulated date
        </Text>

        {/* iOS: inline picker always visible */}
        {Platform.OS === 'ios' && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="compact"
            onChange={onDateChange}
            style={styles.iosPicker}
          />
        )}

        {/* Android: button that opens the native dialog */}
        {Platform.OS === 'android' && (
          <TouchableOpacity
            style={[styles.androidPickerBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={[Typography.body, { color: activeOverride ? colors.text : colors.textSecondary, flex: 1, marginLeft: Spacing.xs }]}>
              {activeOverride ?? todayString()}
            </Text>
            <Ionicons name="chevron-down-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {showPicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={pickerDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Active override badge + clear */}
        {activeOverride && (
          <View style={styles.overrideRow}>
            <Text style={[Typography.small, { color: colors.primary, flex: 1 }]}>
              Overriding to {activeOverride}
            </Text>
            <TouchableOpacity
              onPress={clearDateOverride}
              hitSlop={8}
              accessibilityLabel="Clear date override"
            >
              <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Day index stepper ── */}
        <Text style={[Typography.small, styles.rowLabel, { color: colors.textSecondary }]}>
          Current day in split
        </Text>
        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.border }]}
            onPress={() => stepIndex(-1)}
            disabled={splitLength === 0}
            accessibilityLabel="Previous day"
          >
            <Ionicons name="remove-outline" size={20} color={splitLength === 0 ? colors.textSecondary : colors.text} />
          </TouchableOpacity>
          <Text style={[Typography.h3, styles.stepValue, { color: colors.text }]}>
            {splitLength === 0 ? '—' : `Day ${currentIndex + 1} of ${splitLength}`}
          </Text>
          <TouchableOpacity
            style={[styles.stepBtn, { borderColor: colors.border }]}
            onPress={() => stepIndex(1)}
            disabled={splitLength === 0}
            accessibilityLabel="Next day"
          >
            <Ionicons name="add-outline" size={20} color={splitLength === 0 ? colors.textSecondary : colors.text} />
          </TouchableOpacity>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* ── Reset today's status ── */}
        <TouchableOpacity
          style={[styles.resetBtn, { borderColor: colors.danger }]}
          onPress={resetTodayStatus}
        >
          <Ionicons name="refresh-outline" size={16} color={colors.danger} />
          <Text style={[Typography.body, { color: colors.danger, fontWeight: '600', marginLeft: Spacing.xs }]}>
            Reset today's choice
          </Text>
        </TouchableOpacity>
        <Text style={[Typography.small, styles.resetHint, { color: colors.textSecondary }]}>
          Clears confirmed / skipped so the buttons reappear
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
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },

  // ── iOS picker ──
  iosPicker: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },

  // ── Android picker button ──
  androidPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },

  // ── Override badge ──
  overrideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  // ── Stepper ──
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

  // ── Reset ──
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  resetHint: {
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
