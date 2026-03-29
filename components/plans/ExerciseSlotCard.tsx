import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { ExerciseDefaults, Exercise, WeightUnit } from '../../types';

interface ExerciseSlotCardProps {
  defaults: ExerciseDefaults;
  exercise: Exercise;
  unit: WeightUnit;
  onEdit: () => void;
  onDelete: () => void;
}

export function ExerciseSlotCard({ defaults, exercise, unit, onEdit, onDelete }: ExerciseSlotCardProps) {
  const colors = useColors();

  const pillText =
    exercise.type === 'time'
      ? buildTimePill(defaults)
      : buildWeightPill(defaults, unit);

  const setsReps = buildSetsRepsOnly(defaults, exercise.type);

  return (
    <View style={[styles.container, { borderColor: colors.border }]}>
      <ReanimatedSwipeable
        renderRightActions={() => (
          <TouchableOpacity
            style={[styles.deleteAction, { backgroundColor: colors.danger }]}
            onPress={onDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
          </TouchableOpacity>
        )}
        friction={2}
        overshootRight={false}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.content} onPress={onEdit} activeOpacity={1}>
            <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>
              {exercise.name}
            </Text>
            <Text style={[Typography.small, { color: colors.textSecondary }]}>
              {setsReps}
            </Text>
          </TouchableOpacity>

          {(exercise.type !== 'weight' || defaults.workingWeight != null || defaults.bodyWeight) && (
            <View style={[styles.rightCol, { paddingRight: Spacing.md }]}>
              <View style={[styles.pill, { backgroundColor: colors.primaryLight }]}>
                <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>
                  {pillText}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ReanimatedSwipeable>
    </View>
  );
}

/** Pill text for a weight exercise — shows working weight, "Body Weight", or a placeholder. */
export function buildWeightPill(defaults: ExerciseDefaults, unit: WeightUnit): string {
  if (defaults.bodyWeight) return 'Body Weight';
  return defaults.workingWeight != null ? `${defaults.workingWeight} ${unit}` : 'Set';
}

/** Pill text for a time exercise — shows duration or a placeholder. */
export function buildTimePill(defaults: ExerciseDefaults): string {
  return defaults.duration ?? 'Set';
}

/** Sub-text showing only sets × reps (no weight/duration — those live in the pill). */
export function buildSetsRepsOnly(defaults: ExerciseDefaults, type: Exercise['type']): string {
  const sets = defaults.sets != null ? `${defaults.sets} sets` : 'No sets';
  if (type === 'weight') {
    return sets + (defaults.reps ? ` × ${defaults.reps}` : '');
  }
  return sets;
}

/** @deprecated Use buildWeightPill + buildSetsRepsOnly instead. */
export function buildWeightDetail(defaults: ExerciseDefaults, unit: WeightUnit): string {
  const sets = defaults.sets != null ? `${defaults.sets} sets` : 'No sets';
  const reps = defaults.reps ? ` × ${defaults.reps}` : '';
  const weight = defaults.workingWeight != null ? ` · ${defaults.workingWeight} ${unit}` : ' · Tap to set weight';
  return sets + reps + weight;
}

/** @deprecated Use buildTimePill + buildSetsRepsOnly instead. */
export function buildTimeDetail(defaults: ExerciseDefaults): string {
  const sets = defaults.sets != null ? `${defaults.sets} sets` : 'No sets';
  const duration = defaults.duration ? ` × ${defaults.duration}` : '';
  const pb = defaults.personalBest != null ? ` · PB: ${defaults.personalBest}s` : '';
  return sets + duration + pb;
}

const styles = StyleSheet.create({
  // Outer view: owns the border, radius, and overflow clipping
  container: {
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: Spacing.md,
    minHeight: 64,
  },
  content: { flex: 1, gap: Spacing.xs, paddingVertical: Spacing.md },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  deleteAction: {
    width: 72,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
