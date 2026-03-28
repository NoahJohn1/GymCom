import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  const detail =
    exercise.type === 'time'
      ? buildTimeDetail(defaults)
      : buildWeightDetail(defaults, unit);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity style={styles.content} onPress={onEdit} activeOpacity={0.7}>
        <View style={styles.nameRow}>
          <Text style={[Typography.body, { color: colors.text, fontWeight: '600', flex: 1 }]}>
            {exercise.name}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[Typography.small, { color: colors.primary, fontWeight: '600' }]}>
              {exercise.type === 'time' ? 'Time' : 'Weight'}
            </Text>
          </View>
        </View>
        <Text style={[Typography.small, { color: colors.textSecondary }]}>
          {detail}
        </Text>
      </TouchableOpacity>

      {/* 44×44 touch target for delete, separated from content area */}
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={onDelete}
      >
        <Ionicons name="trash-outline" size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

export function buildWeightDetail(defaults: ExerciseDefaults, unit: WeightUnit): string {
  const sets = defaults.sets != null ? `${defaults.sets} sets` : 'No sets';
  const reps = defaults.reps ? ` × ${defaults.reps}` : '';
  const weight = defaults.workingWeight != null ? ` · ${defaults.workingWeight} ${unit}` : ' · Tap to set weight';
  return sets + reps + weight;
}

export function buildTimeDetail(defaults: ExerciseDefaults): string {
  const sets = defaults.sets != null ? `${defaults.sets} sets` : 'No sets';
  const duration = defaults.duration ? ` × ${defaults.duration}` : '';
  const pb = defaults.personalBest != null ? ` · PB: ${defaults.personalBest}s` : '';
  return sets + duration + pb;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingLeft: Spacing.md,
    marginBottom: Spacing.sm,
    minHeight: 64,
  },
  content: { flex: 1, gap: Spacing.xs, paddingVertical: Spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  deleteBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
