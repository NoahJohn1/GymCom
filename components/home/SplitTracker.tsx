import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../context/AppContext';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { advanceSplitIfNeeded } from '../../utils/splitTracking';
import { todayString } from '../../utils/dateUtils';

// Animates in from slightly below with a fade — used for state result cards
function SlideInCard({ style, children }: { style: object; children: React.ReactNode }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 10,
      speed: 16,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [{
            translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }),
          }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// Returns a spring-pop animated value and a trigger function
function useButtonSpring() {
  const scale = useRef(new Animated.Value(1)).current;
  function pop(callback: () => void) {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.72, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 14, speed: 18 }),
    ]).start();
    // Dispatch after a short delay so the compress is visible before unmount
    setTimeout(callback, 90);
  }
  return { scale, pop };
}

export function SplitTracker() {
  const colors = useColors();
  const router = useRouter();
  const { splits, workouts, preferences, dispatch } = useApp();

  // Button spring animations — must be declared before any conditional returns
  const startSpring = useButtonSpring();
  const cardioSpring = useButtonSpring();
  const skipSpring = useButtonSpring();

  const activeSplit = splits.find((s) => s.id === preferences.activeSplitId);
  const todayEffective = preferences.devDateOverride ?? todayString();

  useEffect(() => {
    if (!activeSplit) return;
    const update = advanceSplitIfNeeded(preferences, activeSplit.workoutIds.length, todayEffective);
    if (update) dispatch({ type: 'SET_PREFERENCES', preferences: update });
  }, [activeSplit?.id, preferences.splitLastDate, todayEffective]);

  // ── No active split ──────────────────────────────────────────────────────────

  if (!activeSplit) {
    return (
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={[Typography.small, styles.label, { color: colors.textSecondary }]}>
              TODAY'S WORKOUT
            </Text>
            <Text style={[Typography.h3, { color: colors.text }]}>No active split</Text>
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              Set a plan to track your days
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.circleBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push('/(tabs)/plans')}
            accessibilityLabel="Browse training plans"
          >
            <Ionicons name="barbell-outline" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Resolve current workout ──────────────────────────────────────────────────

  const splitLength = activeSplit.workoutIds.length;
  const currentIndex = (preferences.splitCurrentIndex ?? 0) % Math.max(splitLength, 1);
  const currentWorkoutId = activeSplit.workoutIds[currentIndex];
  const currentWorkout = workouts.find((w) => w.id === currentWorkoutId);
  const todayStatus = preferences.splitTodayStatus ?? 'pending';
  const today = todayEffective;

  const nextIndex = (currentIndex + 1) % splitLength;
  const nextWorkoutId = activeSplit.workoutIds[nextIndex];
  const nextWorkout = workouts.find((w) => w.id === nextWorkoutId);

  function handleUndo() {
    dispatch({
      type: 'SET_PREFERENCES',
      preferences: { splitTodayStatus: 'pending', splitLastDate: today },
    });
  }

  // ── Confirmed state ──────────────────────────────────────────────────────────

  if (todayStatus === 'confirmed') {
    return (
      <SlideInCard style={[styles.card, { backgroundColor: colors.successLight, borderColor: colors.successLight }]}>
        <View style={styles.row}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.success} style={styles.stateIcon} />
          <TouchableOpacity style={styles.info} onPress={() => currentWorkoutId && router.push(`/workout/${currentWorkoutId}`)} activeOpacity={0.6}>
            <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>
              {currentWorkout?.name ?? 'Workout'}
            </Text>
            {nextWorkout && splitLength > 1 && (
              <Text style={[Typography.small, { color: colors.textSecondary }]}>
                Up next: {nextWorkout.name}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUndo} hitSlop={8} accessibilityLabel="Undo today's choice">
            <Ionicons name="arrow-undo-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SlideInCard>
    );
  }

  // ── Skipped state ────────────────────────────────────────────────────────────

  if (todayStatus === 'skipped') {
    return (
      <SlideInCard style={[styles.card, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}>
        <View style={styles.row}>
          <Ionicons name="bed-outline" size={22} color={colors.primary} style={styles.stateIcon} />
          <TouchableOpacity style={styles.info} onPress={() => currentWorkoutId && router.push(`/workout/${currentWorkoutId}`)} activeOpacity={0.6}>
            <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Rest day</Text>
            {currentWorkout && (
              <Text style={[Typography.small, { color: colors.textSecondary }]}>
                Up next: {currentWorkout.name}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUndo} hitSlop={8} accessibilityLabel="Undo today's choice">
            <Ionicons name="arrow-undo-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SlideInCard>
    );
  }

  // ── Cardio state ─────────────────────────────────────────────────────────────

  if (todayStatus === 'cardio') {
    return (
      <SlideInCard style={[styles.card, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}>
        <View style={styles.row}>
          <Ionicons name="walk-outline" size={22} color={colors.primary} style={styles.stateIcon} />
          <TouchableOpacity style={styles.info} onPress={() => currentWorkoutId && router.push(`/workout/${currentWorkoutId}`)} activeOpacity={0.6}>
            <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>Cardio day</Text>
            {currentWorkout && (
              <Text style={[Typography.small, { color: colors.textSecondary }]}>
                Up next: {currentWorkout.name}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUndo} hitSlop={8} accessibilityLabel="Undo today's choice">
            <Ionicons name="arrow-undo-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </SlideInCard>
    );
  }

  // ── Pending state ────────────────────────────────────────────────────────────

  function handleStart() {
    startSpring.pop(() => {
      dispatch({
        type: 'SET_PREFERENCES',
        preferences: { splitTodayStatus: 'confirmed', splitLastDate: today },
      });
      AccessibilityInfo.announceForAccessibility(
        `${currentWorkout?.name ?? 'Workout'} confirmed for today.`,
      );
    });
  }

  function handleCardio() {
    cardioSpring.pop(() => {
      dispatch({
        type: 'SET_PREFERENCES',
        preferences: { splitTodayStatus: 'cardio', splitLastDate: today },
      });
    });
  }

  function handleSkip() {
    skipSpring.pop(() => {
      dispatch({
        type: 'SET_PREFERENCES',
        preferences: { splitTodayStatus: 'skipped', splitLastDate: today },
      });
    });
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        {/* Left: workout info */}
        <TouchableOpacity
          style={styles.info}
          onPress={() => currentWorkoutId && router.push(`/workout/${currentWorkoutId}`)}
          activeOpacity={0.6}
        >
          <Text style={[Typography.small, styles.label, { color: colors.textSecondary }]}>
            TODAY'S WORKOUT
          </Text>
          <Text style={[Typography.h3, { color: colors.text }]}>
            {currentWorkout?.name ?? '—'}
          </Text>
          <Text style={[Typography.small, { color: colors.textSecondary }]}>
            Day {currentIndex + 1} of {splitLength}
          </Text>
        </TouchableOpacity>

        {/* Right: animated action buttons */}
        <View style={styles.buttons}>
          <Animated.View style={{ transform: [{ scale: startSpring.scale }] }}>
            <TouchableOpacity
              style={[styles.circleBtn, { backgroundColor: colors.primary }]}
              onPress={handleStart}
              activeOpacity={1}
              accessibilityLabel={`Start ${currentWorkout?.name ?? 'workout'}`}
            >
              <Ionicons name="play" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: cardioSpring.scale }] }}>
            <TouchableOpacity
              style={[styles.circleBtn, { backgroundColor: colors.primaryLight }]}
              onPress={handleCardio}
              activeOpacity={1}
              accessibilityLabel="Log cardio day"
            >
              <Ionicons name="walk-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: skipSpring.scale }] }}>
            <TouchableOpacity
              style={[styles.circleBtn, { borderWidth: 1, borderColor: colors.border }]}
              onPress={handleSkip}
              activeOpacity={1}
              accessibilityLabel="Skip today — rest day"
            >
              <Ionicons name="moon-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  stateIcon: {
    marginRight: Spacing.sm,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginLeft: Spacing.md,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    borderRadius: Radius.sm,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    minHeight: 30,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
