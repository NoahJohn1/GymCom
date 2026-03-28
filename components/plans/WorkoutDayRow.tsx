import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors, Typography, Spacing, Radius } from '../../constants/theme';
import { Workout } from '../../types';

interface WorkoutDayRowProps {
  workout: Workout;
  drag: () => void;
  isActive: boolean;
  onPress: () => void;
  onDelete: () => void;
}

export function WorkoutDayRow({ workout, drag, isActive, onPress, onDelete }: WorkoutDayRowProps) {
  const colors = useColors();
  const count = workout.exerciseSlots.length;

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: isActive ? colors.primaryLight : colors.card,
          borderColor: isActive ? colors.primary : colors.border,
        },
      ]}
    >
      <TouchableOpacity onLongPress={drag} style={styles.dragHandle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="reorder-two-outline" size={22} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.content} onPress={onPress} activeOpacity={0.7}>
        <Text style={[Typography.body, { color: colors.text, fontWeight: '600' }]}>{workout.name}</Text>
        <Text style={[Typography.small, { color: colors.textSecondary }]}>
          {count} {count === 1 ? 'exercise' : 'exercises'}
        </Text>
      </TouchableOpacity>

      <View style={styles.right}>
        <TouchableOpacity
          onPress={onDelete}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={18} color={colors.danger} />
        </TouchableOpacity>
        <Ionicons name="chevron-forward-outline" size={18} color={colors.textSecondary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  dragHandle: { padding: Spacing.xs },
  content: { flex: 1, gap: Spacing.xs },
  right: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconBtn: { padding: Spacing.xs },
});
