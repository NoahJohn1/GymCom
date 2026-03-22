import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { TimerPreset } from '../../types';
import { formatPresetLabel } from '../../utils/formatPresetLabel';

// Sheet occupies ~52% of screen height — just enough for the picker
const SHEET_HEIGHT = Dimensions.get('window').height * 0.52;

// Seconds picker uses 15-second increments (0, 15, 30, 45)
const SEC_OPTIONS = [0, 15, 30, 45];

interface Props {
  visible: boolean;
  editingPreset: TimerPreset | null; // null = add mode
  onSave: (seconds: number, id: string | null) => void;
  onClose: () => void;
}

export function PresetManager({ visible, editingPreset, onSave, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [minutes, setMinutes] = useState(1);
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (!visible) return;
    if (editingPreset) {
      const raw = editingPreset.seconds % 60;
      const snapped = SEC_OPTIONS.includes(raw) ? raw : snapTo15(raw);
      setMinutes(Math.floor(editingPreset.seconds / 60));
      setSeconds(snapped);
    } else {
      setMinutes(1);
      setSeconds(30);
    }
  }, [visible, editingPreset]);

  function adjustMins(delta: number) {
    setMinutes((prev) => Math.max(0, Math.min(59, prev + delta)));
  }

  function adjustSecs(delta: number) {
    const idx = SEC_OPTIONS.indexOf(seconds);
    const newIdx = idx + delta;
    if (newIdx >= SEC_OPTIONS.length) {
      setMinutes((prev) => Math.min(59, prev + 1));
      setSeconds(0);
    } else if (newIdx < 0) {
      if (minutes > 0) {
        setMinutes((prev) => prev - 1);
        setSeconds(45);
      }
    } else {
      setSeconds(SEC_OPTIONS[newIdx]);
    }
  }

  function handleSave() {
    const totalSeconds = minutes * 60 + seconds;
    if (totalSeconds < 1) return;
    onSave(totalSeconds, editingPreset?.id ?? null);
  }

  const totalSecs = minutes * 60 + seconds;
  const canSave = totalSecs >= 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sheet */}
        <View
          style={[
            styles.sheet,
            {
              height: SHEET_HEIGHT,
              backgroundColor: colors.card,
              paddingBottom: insets.bottom + Spacing.md,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={{ width: 22 }} />
            <Text style={[Typography.h3, { color: colors.text }]}>
              {editingPreset ? 'Edit Preset' : 'New Preset'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Picker */}
          <View style={styles.pickerArea}>
            <Text
              style={[
                Typography.small,
                {
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginBottom: Spacing.xl,
                },
              ]}
            >
              Set duration
            </Text>

            <View style={styles.pickerRow}>
              {/* Minutes */}
              <View style={styles.pickerUnit}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => adjustMins(1)}
                >
                  <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {minutes}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => adjustMins(-1)}
                >
                  <Ionicons name="remove" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text
                  style={[
                    Typography.small,
                    { color: colors.textSecondary, marginTop: Spacing.xs },
                  ]}
                >
                  min
                </Text>
              </View>

              <Text style={[styles.pickerColon, { color: colors.textSecondary }]}>:</Text>

              {/* Seconds */}
              <View style={styles.pickerUnit}>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => adjustSecs(1)}
                >
                  <Ionicons name="add" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.pickerValue, { color: colors.text }]}>
                  {String(seconds).padStart(2, '0')}
                </Text>
                <TouchableOpacity
                  style={[styles.stepBtn, { backgroundColor: colors.primaryLight }]}
                  onPress={() => adjustSecs(-1)}
                >
                  <Ionicons name="remove" size={22} color={colors.primary} />
                </TouchableOpacity>
                <Text
                  style={[
                    Typography.small,
                    { color: colors.textSecondary, marginTop: Spacing.xs },
                  ]}
                >
                  sec (±15s)
                </Text>
              </View>
            </View>

            {/* Quick picks */}
            <View style={styles.quickPicks}>
              {[1, 5, 10].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.quickBtn, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
                  onPress={() => { setMinutes(0); setSeconds(0); onSave(s, editingPreset?.id ?? null); }}
                >
                  <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>{s}s</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Live preview */}
            <Text
              style={[
                Typography.body,
                {
                  color: canSave ? colors.text : colors.danger,
                  textAlign: 'center',
                  marginTop: Spacing.lg,
                  fontWeight: '600',
                },
              ]}
            >
              {canSave ? formatPresetLabel(totalSecs) : 'Minimum 1 second'}
            </Text>

            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: canSave ? colors.primary : colors.border },
              ]}
              onPress={handleSave}
              disabled={!canSave}
            >
              <Text style={[Typography.body, { color: colors.white, fontWeight: '700' }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function snapTo15(secs: number): number {
  return (Math.round(secs / 15) * 15) % 60;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pickerArea: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    flex: 1,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  pickerUnit: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerValue: {
    fontSize: 40,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 48,
    width: 72,
    textAlign: 'center',
  },
  pickerColon: {
    fontSize: 36,
    fontWeight: '300',
    marginBottom: 24,
  },
  quickPicks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  quickBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});
