import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { TimerPreset } from '../../types';
import { formatPresetLabel } from '../../utils/formatPresetLabel';

const MAX_PRESETS = 8;
// Sheet occupies top 25% → 75% of screen height, sitting higher on screen
const SHEET_HEIGHT = Dimensions.get('window').height * 0.75;

// Seconds picker uses 15-second increments (0, 15, 30, 45)
const SEC_OPTIONS = [0, 15, 30, 45];

type Screen =
  | { type: 'list' }
  | { type: 'edit'; id: string | null; minutes: number; seconds: number };

interface Props {
  visible: boolean;
  presets: TimerPreset[];
  onChange: (presets: TimerPreset[]) => void;
  onClose: () => void;
}

export function PresetManager({ visible, presets, onChange, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<Screen>({ type: 'list' });

  function handleBackdropPress() {
    if (screen.type === 'edit') {
      setScreen({ type: 'list' });
    } else {
      onClose();
    }
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...presets];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next);
  }

  function moveDown(index: number) {
    if (index === presets.length - 1) return;
    const next = [...presets];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next);
  }

  function deletePreset(id: string) {
    onChange(presets.filter((p) => p.id !== id));
  }

  function startEdit(preset: TimerPreset) {
    const rawSecs = preset.seconds % 60;
    const snapped = SEC_OPTIONS.includes(rawSecs) ? rawSecs : snapTo15(rawSecs);
    setScreen({
      type: 'edit',
      id: preset.id,
      minutes: Math.floor(preset.seconds / 60),
      seconds: snapped,
    });
  }

  function startAdd() {
    setScreen({ type: 'edit', id: null, minutes: 1, seconds: 30 });
  }

  function adjustMins(delta: number) {
    if (screen.type !== 'edit') return;
    setScreen({ ...screen, minutes: Math.max(0, Math.min(59, screen.minutes + delta)) });
  }

  function adjustSecs(delta: number) {
    if (screen.type !== 'edit') return;
    const idx = SEC_OPTIONS.indexOf(screen.seconds);
    const newIdx = idx + delta;
    if (newIdx >= SEC_OPTIONS.length) {
      setScreen({ ...screen, minutes: Math.min(59, screen.minutes + 1), seconds: 0 });
    } else if (newIdx < 0) {
      if (screen.minutes > 0) {
        setScreen({ ...screen, minutes: screen.minutes - 1, seconds: 45 });
      }
    } else {
      setScreen({ ...screen, seconds: SEC_OPTIONS[newIdx] });
    }
  }

  function saveEdit() {
    if (screen.type !== 'edit') return;
    const totalSeconds = screen.minutes * 60 + screen.seconds;
    if (totalSeconds < 15) return;

    if (screen.id === null) {
      const newPreset: TimerPreset = { id: `preset-${Date.now()}`, seconds: totalSeconds };
      onChange([...presets, newPreset]);
    } else {
      onChange(presets.map((p) => (p.id === screen.id ? { ...p, seconds: totalSeconds } : p)));
    }
    setScreen({ type: 'list' });
  }

  const isEditing = screen.type === 'edit';
  const totalSecs = isEditing ? screen.minutes * 60 + screen.seconds : 0;
  const canSave = totalSecs >= 15;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => setScreen({ type: 'list' })}
    >
      <View style={styles.overlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />

        {/* Sheet — fixed height so it sits high on screen */}
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
            {isEditing ? (
              <TouchableOpacity onPress={() => setScreen({ type: 'list' })} hitSlop={12}>
                <Ionicons name="chevron-back" size={22} color={colors.primary} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 22 }} />
            )}
            <Text style={[Typography.h3, { color: colors.text }]}>
              {isEditing
                ? screen.id === null
                  ? 'New Preset'
                  : 'Edit Preset'
                : 'Timer Presets'}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* ── List screen ───────────────────────────────────────────── */}
          {!isEditing && (
            <View style={styles.listWrapper}>
              <ScrollView
                style={styles.listArea}
                contentContainerStyle={styles.listContent}
                bounces={false}
                showsVerticalScrollIndicator={false}
              >
                {presets.length === 0 && (
                  <Text
                    style={[
                      Typography.body,
                      {
                        color: colors.textSecondary,
                        textAlign: 'center',
                        marginTop: Spacing.xl,
                      },
                    ]}
                  >
                    No presets yet. Add one below.
                  </Text>
                )}
                {presets.map((preset, idx) => (
                  <View
                    key={preset.id}
                    style={[styles.presetRow, { borderBottomColor: colors.border }]}
                  >
                    <Text style={[Typography.body, { color: colors.text, flex: 1 }]}>
                      {formatPresetLabel(preset.seconds)}
                    </Text>
                    <View style={styles.rowActions}>
                      <TouchableOpacity
                        style={[styles.iconBtn, { opacity: idx === 0 ? 0.25 : 1 }]}
                        onPress={() => moveUp(idx)}
                        disabled={idx === 0}
                        hitSlop={8}
                      >
                        <Ionicons name="chevron-up" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.iconBtn,
                          { opacity: idx === presets.length - 1 ? 0.25 : 1 },
                        ]}
                        onPress={() => moveDown(idx)}
                        disabled={idx === presets.length - 1}
                        hitSlop={8}
                      >
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => startEdit(preset)}
                        hitSlop={8}
                      >
                        <Ionicons name="pencil-outline" size={20} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => deletePreset(preset.id)}
                        hitSlop={8}
                      >
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {presets.length < MAX_PRESETS && (
                <TouchableOpacity
                  style={[styles.addButton, { borderColor: colors.primary }]}
                  onPress={startAdd}
                >
                  <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
                  <Text style={[Typography.body, { color: colors.primary, fontWeight: '600' }]}>
                    Add Preset
                  </Text>
                </TouchableOpacity>
              )}

              {presets.length >= MAX_PRESETS && (
                <Text
                  style={[
                    Typography.small,
                    {
                      color: colors.textSecondary,
                      textAlign: 'center',
                      margin: Spacing.md,
                    },
                  ]}
                >
                  Maximum of {MAX_PRESETS} presets reached
                </Text>
              )}
            </View>
          )}

          {/* ── Edit / Add screen ─────────────────────────────────────── */}
          {isEditing && (
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
                    {screen.minutes}
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
                    {String(screen.seconds).padStart(2, '0')}
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
                {canSave ? formatPresetLabel(totalSecs) : 'Minimum 15 seconds'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: canSave ? colors.primary : colors.border },
                ]}
                onPress={saveEdit}
                disabled={!canSave}
              >
                <Text style={[Typography.body, { color: colors.white, fontWeight: '700' }]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          )}
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
  listWrapper: {
    flex: 1,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconBtn: {
    padding: Spacing.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    margin: Spacing.md,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
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
  saveButton: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
});
