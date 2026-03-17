/**
 * RestTimer
 *
 * Standalone circular countdown timer. SVG ring arc shrinks clockwise
 * starting from 3 o'clock (right side). Preset chips in a 4×2 grid let
 * the user choose a duration. Tap the ring to start/pause/resume.
 * Reset returns to the current duration without auto-starting.
 *
 * TODO: Integrate expo-audio for background audio session & lock screen controls.
 *       See: https://docs.expo.dev/versions/latest/sdk/audio/
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { formatDuration } from '../../utils/dateUtils';
import { formatPresetLabel } from '../../utils/formatPresetLabel';
import { loadTimerPresets, saveTimerPresets } from '../../storage/storage';
import { PresetManager } from './PresetManager';
import { TimerPreset } from '../../types';

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: 'preset-60',  seconds: 60  },
  { id: 'preset-90',  seconds: 90  },
  { id: 'preset-120', seconds: 120 },
];

const INITIAL_DURATION = 90;
const CHIP_SIZE = 60;

const SIZE = 220;
const STROKE_W = 14;
const RADIUS = SIZE / 2 - STROKE_W / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function RestTimer() {
  const colors = useColors();
  const [presets, setPresets] = useState<TimerPreset[]>(DEFAULT_PRESETS);
  const [presetsLoaded, setPresetsLoaded] = useState(false);
  const [showManager, setShowManager] = useState(false);

  const [total, setTotal] = useState(INITIAL_DURATION);
  const [remaining, setRemaining] = useState(INITIAL_DURATION);
  const [isRunning, setIsRunning] = useState(false);   // does NOT auto-start
  const [hasStarted, setHasStarted] = useState(false); // tracks if user has ever tapped start
  const [isDone, setIsDone] = useState(false);
  // Incrementing forces the interval effect to restart even if isRunning stays true
  const [timerKey, setTimerKey] = useState(0);

  // Load persisted presets on mount
  useEffect(() => {
    loadTimerPresets().then((stored) => {
      if (stored) setPresets(stored);
      setPresetsLoaded(true);
    });
  }, []);

  // Persist presets whenever they change (skip initial mount load)
  useEffect(() => {
    if (!presetsLoaded) return;
    saveTimerPresets(presets);
  }, [presets, presetsLoaded]);

  // Countdown interval — restarts when isRunning or timerKey changes
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setRemaining((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [isRunning, timerKey]);

  // Completion: fires when remaining hits 0
  useEffect(() => {
    if (remaining === 0) {
      setIsRunning(false);
      setIsDone(true);
      setRemaining(total); // restore full ring immediately
    }
  }, [remaining]);

  function restartFrom(seconds: number) {
    setTotal(seconds);
    setRemaining(seconds);
    setIsDone(false);
    setHasStarted(true);
    setIsRunning(true);
    setTimerKey((k) => k + 1);
  }

  function togglePause() {
    if (isDone) {
      // Restart from current total (remaining already = total from completion handler)
      setIsDone(false);
      setIsRunning(true);
      setHasStarted(true);
    } else {
      setIsRunning((r) => !r);
      setHasStarted(true);
    }
  }

  function reset() {
    // Setting isRunning=false triggers effect cleanup → clears interval
    setIsRunning(false);
    setHasStarted(false);
    setIsDone(false);
    setRemaining(total);
  }

  function addTime() {
    const newRemaining = remaining + 30;
    setRemaining(newRemaining);
    if (newRemaining > total) setTotal(newRemaining);
    if (isDone) {
      setIsDone(false);
      setIsRunning(true);
      setHasStarted(true);
      setTimerKey((k) => k + 1);
    }
  }

  // Arc math — fraction clamped to [0,1], no rotation (starts at 3 o'clock, drains clockwise)
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const arcColor = isDone ? colors.success : colors.primary;
  const trackColor = isDone ? colors.successLight : colors.border;

  // Center state labels
  const statusLabel = isDone ? 'DONE' : (hasStarted && !isRunning ? 'PAUSED' : 'REST');
  const tapHintIcon: React.ComponentProps<typeof Ionicons>['name'] =
    isDone ? 'refresh' : (!hasStarted || !isRunning ? 'play' : 'pause');
  const tapHintText = isDone ? 'Restart' : (!hasStarted ? 'Start' : isRunning ? 'Pause' : 'Resume');
  const tapHintColor = isDone ? colors.success : colors.primary;
  const tapHintBg = isDone ? colors.successLight : colors.primaryLight;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Preset manager button — top-right corner */}
      <TouchableOpacity
        style={styles.managerBtn}
        onPress={() => setShowManager(true)}
        hitSlop={8}
      >
        <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Ring + center — tap to start/pause/resume */}
      <TouchableOpacity
        style={styles.circleArea}
        onPress={togglePause}
        activeOpacity={0.85}
      >
        <Svg width={SIZE} height={SIZE}>
          {/* Track ring */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={trackColor}
            strokeWidth={STROKE_W}
            fill="none"
          />
          {/* Progress arc — no rotation, starts at 3 o'clock, drains clockwise */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={arcColor}
            strokeWidth={STROKE_W}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </Svg>

        {/* Center overlay */}
        <View style={styles.centerOverlay} pointerEvents="none">
          <Text
            style={[
              Typography.small,
              { color: isDone ? colors.success : colors.textSecondary, fontWeight: '600' },
            ]}
          >
            {statusLabel}
          </Text>

          {isDone ? (
            <Ionicons name="checkmark" size={52} color={colors.success} />
          ) : (
            <Text style={[styles.timerText, { color: colors.text }]}>
              {formatDuration(remaining)}
            </Text>
          )}

          {/* Tap hint pill */}
          <View style={[styles.tapHint, { backgroundColor: tapHintBg }]}>
            <Ionicons name={tapHintIcon} size={13} color={tapHintColor} />
            <Text style={[Typography.small, { color: tapHintColor, fontWeight: '600' }]}>
              {tapHintText}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Reset + +30s row */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger }]}
          onPress={reset}
        >
          <Ionicons name="refresh-outline" size={14} color={colors.danger} />
          <Text style={[Typography.small, { color: colors.danger, fontWeight: '600' }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}
          onPress={addTime}
        >
          <Ionicons name="add" size={14} color={colors.primary} />
          <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>30s</Text>
        </TouchableOpacity>
      </View>

      {/* Preset grid — up to 8 presets in a 4×2 grid */}
      <View style={styles.presetsGrid}>
        {presets.map((p) => {
          const active = p.seconds === total;
          return (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.primaryLight,
                  borderColor: active ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => restartFrom(p.seconds)}
            >
              <Text
                style={[styles.chipText, { color: active ? colors.white : colors.primary }]}
                numberOfLines={2}
                adjustsFontSizeToFit
              >
                {formatPresetLabel(p.seconds)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Preset manager bottom sheet */}
      <PresetManager
        visible={showManager}
        presets={presets}
        onChange={setPresets}
        onClose={() => setShowManager(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingBottom: Spacing.lg,
  },
  managerBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    padding: Spacing.xs,
  },
  circleArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    width: SIZE,
    height: SIZE,
    alignSelf: 'center',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    lineHeight: 56,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  controlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 15,
  },
});
