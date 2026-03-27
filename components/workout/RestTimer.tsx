/**
 * RestTimer
 *
 * Standalone circular countdown timer. SVG ring arc shrinks clockwise
 * starting from 3 o'clock (right side). Preset chips in a 4×2 grid let
 * the user choose a duration. Tap the ring to start/pause/resume.
 * Reset returns to the current duration without auto-starting.
 *
 * Long-press any chip → wiggle edit mode (tap-to-swap reordering,
 * ❌ delete badge, pencil edit badge). Sound toggle persists to AsyncStorage.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// expo-notifications is unavailable in Expo Go (SDK 53+). Load it optionally
// so the app still runs — notifications just won't fire until a dev build is used.
let Notifications: typeof import('expo-notifications') | null = null;
try { Notifications = require('expo-notifications'); } catch {}
import Svg, { Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { formatDuration } from '../../utils/dateUtils';
import { loadTimerPresets, saveTimerPresets } from '../../storage/storage';
import { PresetManager } from './PresetManager';
import { WiggleChip } from './WiggleChip';
import { useTimerSound } from '../../hooks/useTimerSound';
import { TimerPreset } from '../../types';

const DEFAULT_PRESETS: TimerPreset[] = [
  { id: 'preset-60',  seconds: 60  },
  { id: 'preset-90',  seconds: 90  },
  { id: 'preset-120', seconds: 120 },
];

const INITIAL_DURATION = 90;
const MAX_PRESETS = 8;
const CHIP_SIZE = 60;

const SIZE = 220;
const STROKE_W = 14;
const RADIUS = SIZE / 2 - STROKE_W / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Slot = { type: 'preset'; preset: TimerPreset } | { type: 'add' };

export function RestTimer() {
  const colors = useColors();
  const [presets, setPresets] = useState<TimerPreset[]>(DEFAULT_PRESETS);
  const [presetsLoaded, setPresetsLoaded] = useState(false);

  const [total, setTotal] = useState(INITIAL_DURATION);
  const [remaining, setRemaining] = useState(INITIAL_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  const [isWiggling, setIsWiggling] = useState(false);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPreset, setEditingPreset] = useState<TimerPreset | null>(null);

  const { soundEnabled, toggleSound, playDoneSound } = useTimerSound();

  // Refs for background timestamp reconciliation
  const backgroundTimeRef = useRef<number | null>(null);
  const remainingRef = useRef(remaining);
  useEffect(() => { remainingRef.current = remaining; }, [remaining]);

  // Schedule a local notification so the done sound fires even when backgrounded
  const notificationIdRef = useRef<string | null>(null);

  const scheduleTimerNotification = useCallback(async (seconds: number) => {
    if (!soundEnabled || !Notifications) return;
    await cancelTimerNotification();
    notificationIdRef.current = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Rest Timer',
        body: 'Time is up!',
        sound: 'timer_done.mp3',
        ...(Notifications.AndroidNotificationPriority && { priority: Notifications.AndroidNotificationPriority.MAX }),
        // iOS: bypass mute switch (requires critical-alerts entitlement)
        ios: { critical: true, criticalSoundVolume: 1.0 },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds,
        repeats: false,
        channelId: 'timer-alerts',
      },
    });
  }, [soundEnabled]);

  const cancelTimerNotification = useCallback(async () => {
    if (notificationIdRef.current && Notifications) {
      await Notifications.cancelScheduledNotificationAsync(notificationIdRef.current);
      notificationIdRef.current = null;
    }
  }, []);

  // Set up notification channel (Android) and permissions on mount
  useEffect(() => {
    if (!Notifications) return;
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    Notifications.setNotificationChannelAsync('timer-alerts', {
      name: 'Timer Alerts',
      importance: Notifications.AndroidImportance.MAX,
      sound: 'timer_done.mp3',
      bypassDnd: true,
      // Route through alarm stream so it plays on silent/vibrate
      audioAttributes: {
        usage: 4, // AudioUsage.ALARM
        contentType: 4, // AudioContentType.SONIFICATION
        flags: { enforceAudibility: true, requestHardwareAudioVideoSynchronization: false },
      },
    });
    Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowCriticalAlerts: true } });
  }, []);

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

  // AppState listener — reconcile elapsed time when returning from background
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        if (isRunning && backgroundTimeRef.current === null) {
          backgroundTimeRef.current = Date.now();
        }
      } else if (nextState === 'active') {
        if (backgroundTimeRef.current !== null && isRunning) {
          const elapsed = Math.floor((Date.now() - backgroundTimeRef.current) / 1000);
          backgroundTimeRef.current = null;
          const newRemaining = remainingRef.current - elapsed;
          if (newRemaining <= 0) {
            setIsRunning(false);
            setIsDone(true);
            setRemaining(total);
            cancelTimerNotification();
          } else {
            setRemaining(newRemaining);
          }
        } else {
          backgroundTimeRef.current = null;
        }
      }
    });
    return () => sub.remove();
  }, [isRunning, total, playDoneSound]);

  // Completion: fires when remaining hits 0
  useEffect(() => {
    if (remaining === 0) {
      setIsRunning(false);
      setIsDone(true);
      setRemaining(total);
      cancelTimerNotification();
      playDoneSound();
    }
  }, [remaining]);

  function restartFrom(seconds: number) {
    setTotal(seconds);
    setRemaining(seconds);
    setIsDone(false);
    setHasStarted(true);
    setIsRunning(true);
    setTimerKey((k) => k + 1);
    scheduleTimerNotification(seconds);
  }

  function togglePause() {
    if (isDone) {
      setIsDone(false);
      setIsRunning(true);
      setHasStarted(true);
      scheduleTimerNotification(remaining);
    } else {
      const willRun = !isRunning;
      setIsRunning(willRun);
      setHasStarted(true);
      if (willRun) {
        scheduleTimerNotification(remaining);
      } else {
        cancelTimerNotification();
      }
    }
  }

  function reset() {
    setIsRunning(false);
    setHasStarted(false);
    setIsDone(false);
    setRemaining(total);
    cancelTimerNotification();
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
    if (isRunning || isDone) scheduleTimerNotification(newRemaining);
  }

  function exitWiggle() {
    setIsWiggling(false);
    setSelectedChipId(null);
  }

  function handleChipPress(preset: TimerPreset) {
    if (!isWiggling) {
      restartFrom(preset.seconds);
      return;
    }
    if (selectedChipId === null) {
      setSelectedChipId(preset.id);
      return;
    }
    if (selectedChipId === preset.id) {
      setSelectedChipId(null);
      return;
    }
    // Swap the two chips
    const a = presets.findIndex((p) => p.id === selectedChipId);
    const b = presets.findIndex((p) => p.id === preset.id);
    const next = [...presets];
    [next[a], next[b]] = [next[b], next[a]];
    setPresets(next);
    setSelectedChipId(null);
  }

  function handleDeleteChip(id: string) {
    setPresets((prev) => prev.filter((p) => p.id !== id));
    if (selectedChipId === id) setSelectedChipId(null);
  }

  function handleModalSave(seconds: number, id: string | null) {
    if (id === null) {
      setPresets((prev) => [...prev, { id: `preset-${Date.now()}`, seconds }]);
    } else {
      setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, seconds } : p)));
    }
    setShowAddModal(false);
    setEditingPreset(null);
  }

  // Slot-based grid: real presets + virtual add slot (if room)
  const slots: Slot[] = [
    ...presets.map((p): Slot => ({ type: 'preset', preset: p })),
    ...(presets.length < MAX_PRESETS && !isWiggling ? [{ type: 'add' } as Slot] : []),
  ];
  const rows = Array.from({ length: Math.ceil(slots.length / 4) }, (_, i) =>
    slots.slice(i * 4, i * 4 + 4)
  );

  // Arc math
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 1;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const arcColor = isDone ? colors.success : colors.primary;
  const trackColor = isDone ? colors.successLight : colors.border;

  const statusLabel = isDone ? 'DONE' : (hasStarted && !isRunning ? 'PAUSED' : 'REST');
  const tapHintIcon: React.ComponentProps<typeof Ionicons>['name'] =
    isDone ? 'refresh' : (!hasStarted || !isRunning ? 'play' : 'pause');
  const tapHintText = isDone ? 'Restart' : (!hasStarted ? 'Start' : isRunning ? 'Pause' : 'Resume');
  const tapHintColor = isDone ? colors.success : colors.primary;
  const tapHintBg = isDone ? colors.successLight : colors.primaryLight;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Sound toggle — top-left */}
      <TouchableOpacity style={styles.soundBtn} onPress={toggleSound} hitSlop={8}>
        <Ionicons
          name={soundEnabled ? 'volume-high-outline' : 'volume-mute-outline'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {/* Edit/Done — top-right */}
      <TouchableOpacity
        style={styles.editBtn}
        onPress={isWiggling ? exitWiggle : () => setIsWiggling(true)}
        hitSlop={8}
      >
        <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>
          {isWiggling ? 'Done' : 'Edit'}
        </Text>
      </TouchableOpacity>

      {/* Ring + center — tap to start/pause/resume */}
      <TouchableOpacity
        style={styles.circleArea}
        onPress={togglePause}
        activeOpacity={0.85}
      >
        <Svg width={SIZE} height={SIZE} style={{ transform: [{ scaleX: -1 }] }}>
          {/* Track ring */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={trackColor}
            strokeWidth={STROKE_W}
            fill="none"
          />
          {/* Progress arc */}
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
            rotation="-90"
            origin={`${SIZE / 2},${SIZE / 2}`}
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

      {/* Preset grid */}
      <View style={styles.presetsGrid}>
        {rows.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.presetsRow}>
            {row.map((slot, colIdx) => {
              if (slot.type === 'add') {
                return (
                  <TouchableOpacity
                    key="add"
                    style={[
                      styles.addChip,
                      { borderColor: colors.border, backgroundColor: colors.card },
                    ]}
                    onPress={() => {
                      setEditingPreset(null);
                      setShowAddModal(true);
                    }}
                  >
                    <Ionicons name="add" size={22} color={colors.textSecondary} />
                  </TouchableOpacity>
                );
              }
              return (
                <WiggleChip
                  key={slot.preset.id}
                  preset={slot.preset}
                  isWiggling={isWiggling}
                  isSelected={selectedChipId === slot.preset.id}
                  onPress={() => handleChipPress(slot.preset)}
                  onLongPress={() => setIsWiggling(true)}
                  onDelete={() => handleDeleteChip(slot.preset.id)}
                  onEdit={() => {
                    setEditingPreset(slot.preset);
                    setShowAddModal(true);
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Swap hint label */}
      {isWiggling && (
        <Text style={[styles.swapHint, { color: colors.textSecondary }]}>
          {selectedChipId
            ? 'Tap another chip to swap'
            : 'Tap a chip to select, then tap another to swap'}
        </Text>
      )}

      {/* Add / Edit preset modal */}
      <PresetManager
        visible={showAddModal}
        editingPreset={editingPreset}
        onSave={handleModalSave}
        onClose={() => {
          setShowAddModal(false);
          setEditingPreset(null);
        }}
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
  soundBtn: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    zIndex: 10,
    padding: Spacing.xs,
  },
  editBtn: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    zIndex: 10,
    padding: Spacing.xs,
    minHeight: 44,
    justifyContent: 'center',
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
    flexDirection: 'column',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addChip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: CHIP_SIZE / 2,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swapHint: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
});
